import os
import pandas as pd
import numpy as np
from fastapi import FastAPI, Depends, Header, HTTPException
from typing import Optional
from statsmodels.tsa.statespace.sarimax import SARIMAX

app = FastAPI(title="E-Commerce Analytics API")

# Use the same default API key as the Node backend header to avoid 401s in dev
API_KEY = os.getenv("API_KEY", "mysecretapikey")

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return True


# -------------------------
# Your original functions
# -------------------------
def run_forecast():
    df = pd.read_csv("E-Commerce Customer Insights and Churn Dataset3938d09.csv")
    df["Sales"] = df["unit_price"] * df["quantity"]
    df["last_purchase_date"] = pd.to_datetime(df["last_purchase_date"], errors="coerce")
    df = df.dropna(subset=["last_purchase_date", "Sales"])

    daily_sales = df.groupby("last_purchase_date")["Sales"].sum().asfreq("D").fillna(0)

    train_size = int(len(daily_sales) * 0.8)
    train, test = daily_sales[:train_size], daily_sales[train_size:]

    model = SARIMAX(train, order=(1, 1, 1), seasonal_order=(1, 1, 1, 7))
    model_fit = model.fit(disp=False)

    future_quarter = model_fit.get_forecast(steps=90).predicted_mean
    future_year = model_fit.get_forecast(steps=365).predicted_mean

    quarterly_forecast = {
        "Q1": {"sales": float(future_quarter[:90].sum()), "growth": 0.15, "confidence": 0.85},
        "Q2": {"sales": float(future_year[90:180].sum()), "growth": 0.12, "confidence": 0.82},
        "Q3": {"sales": float(future_year[180:270].sum()), "growth": 0.18, "confidence": 0.78},
        "Q4": {"sales": float(future_year[270:365].sum()), "growth": 0.22, "confidence": 0.80},
    }

    yearly_forecast = {
        2024: {"sales": float(future_year[:365].sum()), "growth": 0.167, "confidence": 0.81},
        2025: {"sales": float(future_year[:365].sum() * 1.166), "growth": 0.166, "confidence": 0.75}
    }

    monthly_trends = (
        daily_sales.resample("M").sum()
        .reset_index()
        .rename(columns={"last_purchase_date": "month", "Sales": "sales"})
    )
    monthly_trends["month"] = monthly_trends["month"].dt.strftime("%b")
    monthly_trends = monthly_trends.to_dict(orient="records")

    return {
        "success": True,
        "data": {
            "quarterly": quarterly_forecast,
            "yearly": yearly_forecast,
            "monthlyTrends": monthly_trends,
            "totalRevenue": float(daily_sales.sum()),
            "forecastAccuracy": 0.87
        }
    }


def run_top_products():
    df = pd.read_csv("E-Commerce Customer Insights and Churn Dataset3938d09.csv")
    df["Sales"] = df["unit_price"] * df["quantity"]
    df["last_purchase_date"] = pd.to_datetime(df["last_purchase_date"], errors="coerce")
    df = df.dropna(subset=["last_purchase_date", "Sales"])

    product_sales = df.groupby("product_name")["Sales"].sum().sort_values(ascending=False).head(10)

    products = []
    for i, (product, sales) in enumerate(product_sales.items(), start=1):
        products.append({
            "productId": f"PRD{str(i).zfill(3)}",
            "name": product,
            "predictedSales": float(sales),
            "currentStock": int(df[df["product_name"] == product]["quantity"].sum()),
            "category": df[df["product_name"] == product]["category"].mode()[0],
            "price": float(df[df["product_name"] == product]["unit_price"].mean()),
            "salesGrowth": round(np.random.uniform(-0.2, 0.2), 3)
        })

    return {
        "success": True,
        "data": products,
        "metadata": {
            "total": len(products),
            "totalPredictedRevenue": sum(p["predictedSales"] * p["price"] for p in products)
        }
    }


def run_trends():
    df = pd.read_csv("E-Commerce Customer Insights and Churn Dataset3938d09.csv")
    df["Sales"] = df["unit_price"] * df["quantity"]
    df["last_purchase_date"] = pd.to_datetime(df["last_purchase_date"], errors="coerce")
    df = df.dropna(subset=["last_purchase_date", "Sales"])

    monthly_sales = (
        df.groupby(df["last_purchase_date"].dt.strftime("%b"))["Sales"].sum().reset_index()
    )
    monthly_sales.columns = ["month", "sales"]
    monthly_sales = monthly_sales.to_dict(orient="records")

    seasonal_trends = [
        {"season": "Spring", "avgSales": 320000, "growth": 0.12},
        {"season": "Summer", "avgSales": 380000, "growth": 0.18},
        {"season": "Fall", "avgSales": 420000, "growth": 0.22},
        {"season": "Winter", "avgSales": 450000, "growth": 0.25},
    ]

    performance_metrics = {
        "totalRevenue": float(df["Sales"].sum()),
        "totalTransactions": int(len(df)),
        "averageOrderValue": float(df["Sales"].mean()),
        "conversionRate": 0.034,
        "customerRetentionRate": 0.76
    }

    return {
        "success": True,
        "data": {
            "monthlySales": monthly_sales,
            "seasonalTrends": seasonal_trends,
            "performanceMetrics": performance_metrics,
            "topPerformingPeriods": ["December", "November", "July"]
        }
    }


# -------------------------
# FastAPI Routes
# -------------------------
@app.get("/")
def root():
    return {"status": "API is running 🚀"}


@app.get("/forecast")
def forecast(auth: bool = Depends(verify_api_key)):
    return run_forecast()


@app.get("/top-products")
def top_products(auth: bool = Depends(verify_api_key)):
    return run_top_products()


@app.get("/trends")
def trends(auth: bool = Depends(verify_api_key)):
    return run_trends()
