const express = require('express');
const axios = require('axios');
const router = express.Router();

// Customer FastAPI configuration
// Prefer CUSTOMER_FASTAPI_BASE_URL, then other fallbacks, then default localhost:8000
const CUSTOMER_FASTAPI_BASE_URL =
  process.env.CUSTOMER_FASTAPI_BASE_URL ||
  process.env.CUSTOMER_API_BASE_URL ||
  process.env.FASTAPI_CUSTOMER_URL ||
  process.env.FASTAPI_BASE_URL ||
  'http://127.0.0.1:8000';

const API_KEY = process.env.API_KEY; // optional; customer.py may not enforce API key

async function callCustomer(endpoint, params) {
  try {
    const response = await axios.get(`${CUSTOMER_FASTAPI_BASE_URL}${endpoint}`, {
      headers: {
        ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
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

// GET /customer/segments -> FastAPI customer root "/" which returns { chart_data: [...] }
router.get('/segments', async (req, res) => {
  try {
    const fast = await callCustomer('/')
    const data = fast.chart_data || fast.data || fast;
    res.json({ success: true, data, source: 'FastAPI Customer Segmentation' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch customer segments', message: err.message });
  }
});

module.exports = router;
