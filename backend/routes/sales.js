const express = require('express');
const axios = require('axios');
const router = express.Router();

// FastAPI configuration
const FASTAPI_BASE_URL = 'http://127.0.0.1:8000';
const API_KEY = 'mysecretapikey';

// Helper function to call FastAPI
const callFastAPI = async (endpoint) => {
  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}${endpoint}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      // SARIMAX training can take longer on first run; allow up to 30s
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    const details = error.response?.data || error.message || 'Unknown error';
    console.error(`FastAPI Error for ${endpoint}:`, details);
    // Bubble up more details so frontend can show a helpful message
    throw new Error(
      typeof details === 'string'
        ? `Failed to fetch data from ML model: ${details}`
        : `Failed to fetch data from ML model: ${JSON.stringify(details)}`
    );
  }
};

// GET /api/sales/forecast - Maps directly to FastAPI /forecast
router.get('/forecast', async (req, res) => {
  try {
    const fastApiData = await callFastAPI('/forecast');
    
    if (fastApiData && fastApiData.success) {
      res.json({
        success: true,
        data: fastApiData.data,
        source: 'FastAPI ML Model'
      });
    } else {
      throw new Error('FastAPI returned unsuccessful response');
    }
  } catch (error) {
    console.error('Sales forecast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales forecast from ML model',
      message: error.message
    });
  }
});

// GET /api/sales/top-products - Maps directly to FastAPI /top-products  
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10, search = '', category = '' } = req.query;
    
    const fastApiData = await callFastAPI('/top-products');
    
    if (fastApiData && fastApiData.success) {
      let products = fastApiData.data;
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchLower) ||
          product.productId.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply category filter
      if (category) {
        products = products.filter(product => 
          product.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Apply limit
      const limitNum = parseInt(limit);
      const limitedProducts = products.slice(0, limitNum);
      
      res.json({
        success: true,
        data: limitedProducts,
        metadata: {
          total: limitedProducts.length,
          totalBeforeLimit: products.length,
          limit: limitNum,
          search: search || null,
          category: category || null,
          totalPredictedRevenue: fastApiData.metadata?.totalPredictedRevenue || 0
        },
        source: 'FastAPI ML Model'
      });
    } else {
      throw new Error('FastAPI returned unsuccessful response');
    }
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top products from ML model',
      message: error.message
    });
  }
});

// GET /api/sales/trends - Maps directly to FastAPI /trends
router.get('/trends', async (req, res) => {
  try {
    const fastApiData = await callFastAPI('/trends');
    
    if (fastApiData && fastApiData.success) {
      res.json({
        success: true,
        data: fastApiData.data,
        source: 'FastAPI ML Model'
      });
    } else {
      throw new Error('FastAPI returned unsuccessful response');
    }
  } catch (error) {
    console.error('Sales trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales trends from ML model',
      message: error.message
    });
  }
});

module.exports = router;