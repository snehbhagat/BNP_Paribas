import os
import pandas as pd
import numpy as np
from fastapi import FastAPI, Query
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score, roc_curve, confusion_matrix, accuracy_score, auc
import xgboost as xgb

app = FastAPI(title="Churn Prediction API 🚀")

# -----------------------------
# Utility: Convert classification report to dict
# -----------------------------
def classification_report_to_dict(report):
    report_dict = {}
    for label, metrics in report.items():
        if isinstance(metrics, dict):
            report_dict[label] = {k: float(v) for k, v in metrics.items()}
    return report_dict


# -----------------------------
# Main function to run pipeline
# -----------------------------
def train_churn_model():
    df = pd.read_csv("E-Commerce Customer Insights and Churn Dataset3938d09.csv")
    data = df.copy()

    # Normalize col names
    data.columns = [c.strip() for c in data.columns]

    # Detect date columns
    date_cols = [c for c in data.columns if 'date' in c.lower()]
    date_col = None
    if 'last_purchase_date' in [c.lower() for c in data.columns]:
        date_col = [c for c in data.columns if c.lower() == 'last_purchase_date'][0]
    elif len(date_cols) > 0:
        date_col = date_cols[0]
    if date_col:
        data[date_col] = pd.to_datetime(data[date_col], errors='coerce')

    # Detect customer id
    cust_col = None
    for c in data.columns:
        if 'customer' in c.lower() or 'cust' in c.lower():
            cust_col = c
            break
    if cust_col is None:
        data['customer_id'] = data.index.astype(str)
        cust_col = 'customer_id'

    # LineTotal
    price_col = next((c for c in data.columns if 'price' in c.lower()), None)
    qty_col = next((c for c in data.columns if 'quantity' in c.lower()), None)
    if price_col and qty_col:
        data['LineTotal'] = pd.to_numeric(data[price_col], errors='coerce') * pd.to_numeric(data[qty_col], errors='coerce')
    else:
        data['LineTotal'] = 0

    # Aggregate RFM
    snapshot_date = data[date_col].max() + pd.Timedelta(days=1)
    agg = data.groupby(cust_col).agg(
        Frequency=(date_col, 'count'),
        LastPurchaseDate=(date_col, 'max'),
        Monetary_sum=('LineTotal', 'sum'),
        Monetary_avg=('LineTotal', 'mean')
    ).reset_index().rename(columns={cust_col: 'CustomerID'})
    agg['Recency_days'] = (snapshot_date - agg['LastPurchaseDate']).dt.days

    churn_days = 15
    agg['churn'] = (agg['Recency_days'] > churn_days).astype(int)

    # Merge demographics
    possible_demo_cols = ['age', 'gender', 'country', 'signup_date',
                          'subscription_status', 'Ratings', 'cancellations_count',
                          'quantity', 'purchase_frequency', 'unit_price']
    found_cols = [c for c in data.columns if c in possible_demo_cols]
    if found_cols:
        demogs = data[[cust_col] + found_cols].drop_duplicates(subset=[cust_col]).rename(columns={cust_col: 'CustomerID'})
        df_model = agg.merge(demogs, on='CustomerID', how='left')
    else:
        df_model = agg.copy()

    y = df_model['churn']
    X = df_model.drop(columns=['churn', 'CustomerID', 'LastPurchaseDate'], errors='ignore')

    # Preprocessing
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()

    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
        ('ohe', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer([
        ('num', num_pipeline, num_cols),
        ('cat', cat_pipeline, cat_cols)
    ], remainder='drop')

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    # Transform
    X_train_pre = preprocessor.fit_transform(X_train)
    X_test_pre = preprocessor.transform(X_test)

    # Model
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X_train_pre, y_train)

    return model, preprocessor, X, y, df_model


# -----------------------------
# Endpoints
# -----------------------------
@app.get("/")
def root():
    return {"message": "Churn API is running 🚀"}


@app.get("/metrics")
def churn_metrics():
    model, preprocessor, X, y, df_model = train_churn_model()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    X_test_pre = preprocessor.transform(X_test)

    y_pred = model.predict(X_test_pre)
    y_proba = model.predict_proba(X_test_pre)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()
    fpr, tpr, _ = roc_curve(y_test, y_proba)

    return {
        "accuracy": float(accuracy),
        "roc_auc": float(roc_auc),
        "classification_report": classification_report_to_dict(report),
        "confusion_matrix": cm,
        "roc_curve": {"fpr": fpr.tolist(), "tpr": tpr.tolist(), "auc": float(auc(fpr, tpr))}
    }


@app.get("/importance")
def churn_feature_importance():
    model, preprocessor, X, y, df_model = train_churn_model()

    feature_names = preprocessor.get_feature_names_out()
    importance = sorted(
        [{"feature": feature_names[i], "importance": float(val)} for i, val in enumerate(model.feature_importances_)],
        key=lambda x: x["importance"], reverse=True
    )[:20]

    return {"feature_importance": importance}


@app.get("/top_churners")
def top_churners(limit: int = Query(10, description="Number of top churners to return")):
    model, preprocessor, X, y, df_model = train_churn_model()

    X_pre = preprocessor.transform(X)
    churn_probs = model.predict_proba(X_pre)[:, 1]

    churn_df = pd.DataFrame({
        "CustomerID": df_model["CustomerID"],
        "Churn_Probability": churn_probs
    }).sort_values("Churn_Probability", ascending=False).head(limit)

    return {
        "requested_limit": limit,
        "top_churners": churn_df.to_dict(orient="records")
    }