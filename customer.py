from fastapi import FastAPI
import pandas as pd
import numpy as np
import os
from sklearn.cluster import KMeans

app = FastAPI(title="Customer Segmentation & Churn API 🚀")

@app.get("/")
def root():
    # ----------------------
    # Load and preprocess data
    # ----------------------
    df = pd.read_csv('E-Commerce Customer Insights and Churn Dataset3938d09.csv')

    # Robust datetime parsing (handles mixed formats like 2020-10-19 and 10/19/2020)
    def _to_datetime_mixed(s: pd.Series) -> pd.Series:
        try:
            # pandas >= 2.0 supports format='mixed'
            return pd.to_datetime(s, format='mixed', errors='coerce')
        except TypeError:
            # Fallback for older pandas
            parsed = pd.to_datetime(s, errors='coerce', infer_datetime_format=True)
            if parsed.isna().mean() > 0.5:
                # Try day-first as a second attempt
                alt = pd.to_datetime(s, errors='coerce', dayfirst=True)
                parsed = parsed.fillna(alt)
            return parsed

    df['signup_date'] = _to_datetime_mixed(df['signup_date'])
    df['last_purchase_date'] = _to_datetime_mixed(df['last_purchase_date'])

    # Drop rows with invalid/missing dates to stabilize downstream calculations
    df = df.dropna(subset=['signup_date', 'last_purchase_date'])
    if df.empty:
        return {"error": "No valid dates found after parsing. Please verify input date formats."}

    reference_date = df['last_purchase_date'].max()

    # Compute RFM
    rfm = df.groupby('customer_id').agg({
        'last_purchase_date': lambda x: (reference_date - x.max()).days,
        'purchase_frequency': 'mean',
        'unit_price': lambda x: np.sum(x * df.loc[x.index, 'quantity'])
    }).rename(columns={
        'last_purchase_date': 'Recency',
        'purchase_frequency': 'Frequency',
        'unit_price': 'Monetary'
    })

    rfm = rfm.dropna()
    rfm_nonzero_std = rfm.loc[:, rfm.std() != 0]
    rfm_norm = (rfm_nonzero_std - rfm_nonzero_std.mean()) / rfm_nonzero_std.std()
    rfm_norm = rfm_norm.dropna()
    rfm = rfm.loc[rfm_norm.index]

    if len(rfm_norm) > 0:
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        rfm['Segment'] = kmeans.fit_predict(rfm_norm)
    else:
        return {"error": "No data available for clustering"}

    # ----------------------
    # Integrate Predicted Churn
    # ----------------------
    predictions_file = 'churn_predictions1_inverted.csv'
    if not os.path.exists(predictions_file):
        return {"error": "Predicted churn file missing"}

    predictions_df = pd.read_csv(predictions_file)

    # Restrict to top 416 rows
    df = df.head(416)
    unique_customer_ids = df['customer_id'].unique()
    id_map = {old_id: f'CUST{1000 + i}' for i, old_id in enumerate(unique_customer_ids)}
    df['customer_id'] = df['customer_id'].map(id_map)

    predictions_df['customer_id'] = predictions_df['customer_id'].map(id_map)
    predictions_df.dropna(subset=['customer_id'], inplace=True)
    predictions_df['Predicted_Churn'] = predictions_df['Predicted_Churn'].astype(int)

    rfm = rfm.reset_index()
    rfm['customer_id'] = rfm['customer_id'].astype(str)
    predictions_df['customer_id'] = predictions_df['customer_id'].astype(str)

    rfm = rfm.merge(predictions_df[['customer_id', 'Predicted_Churn']], on='customer_id', how='left')
    rfm.dropna(subset=['Predicted_Churn'], inplace=True)
    rfm['Predicted_Churn'] = rfm['Predicted_Churn'].astype(int)

    # ----------------------
    # Aggregation for JSON (chart values only)
    # ----------------------
    predicted_churn_by_segment = rfm.groupby(['Segment', 'Predicted_Churn']).size().unstack(fill_value=0)
    predicted_segment_churn_rate = (rfm.groupby('Segment')['Predicted_Churn'].mean() * 100).round(2)

    # Convert chart values to JSON-friendly structure
    chart_data = []
    for seg in predicted_churn_by_segment.index:
        chart_data.append({
            "segment": int(seg),
            "not_churned": int(predicted_churn_by_segment.loc[seg].get(0, 0)),
            "churned": int(predicted_churn_by_segment.loc[seg].get(1, 0)),
            "total": int(predicted_churn_by_segment.loc[seg].sum()),
            "churn_rate_percent": float(predicted_segment_churn_rate.loc[seg])
        })

    # ----------------------
    # Final JSON Response (only chart data)
    # ----------------------
    return {"chart_data": chart_data}