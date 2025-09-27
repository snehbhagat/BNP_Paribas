const express = require('express');
const axios = require('axios');
const router = express.Router();

// Churn FastAPI configuration
// Prefer CHURN_FASTAPI_BASE_URL, then fallback to FASTAPI_BASE_URL, then default localhost:8000
const CHURN_FASTAPI_BASE_URL = process.env.CHURN_FASTAPI_BASE_URL || process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8000';
const API_KEY = process.env.API_KEY || 'mysecretapikey';

// Helper to call FastAPI churn endpoints
async function callChurn(endpoint, params) {
  try {
    const response = await axios.get(`${CHURN_FASTAPI_BASE_URL}${endpoint}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      params,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    const details = error.response?.data || error.message || 'Unknown error';
    throw new Error(typeof details === 'string' ? details : JSON.stringify(details));
  }
}

// GET /churn/metrics -> FastAPI /metrics
router.get('/metrics', async (req, res) => {
  try {
    const data = await callChurn('/metrics');
    res.json({ success: true, data, source: 'FastAPI Churn Model' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch churn metrics', message: err.message });
  }
});

// GET /churn/importance -> FastAPI /importance
router.get('/importance', async (req, res) => {
  try {
    const fast = await callChurn('/importance');
    // Normalize key to a friendly name
    const importance = fast.feature_importance || fast.featureImportance || fast.data || fast;
    res.json({ success: true, data: importance, source: 'FastAPI Churn Model' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch feature importance', message: err.message });
  }
});

// GET /churn/top-churners?limit=10 -> FastAPI /top_churners
router.get('/top-churners', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit ?? '10', 10);
    const fast = await callChurn('/top_churners', { limit });
    const list = fast.top_churners || fast.data || [];
    res.json({ success: true, data: list, metadata: { requestedLimit: limit }, source: 'FastAPI Churn Model' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch top churners', message: err.message });
  }
});

module.exports = router;
