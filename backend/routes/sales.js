const express = require('express');
const router = express.Router();

// Mock data generators
const generateSalesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    sales: Math.floor(Math.random() * 500000) + 100000,
    transactions: Math.floor(Math.random() * 1000) + 200,
    avgOrderValue: Math.floor(Math.random() * 200) + 50
  }));
};

const generateProductSales = () => {
  const products = [
    'Product A', 'Product B', 'Product C', 'Product D', 'Product E',
    'Product F', 'Product G', 'Product H', 'Product I', 'Product J',
    'Product K', 'Product L', 'Product M', 'Product N', 'Product O'
  ];
  
  return products.map(product => ({
    productId: `PRD${String(products.indexOf(product) + 1).padStart(3, '0')}`,
    name: product,
    predictedSales: Math.floor(Math.random() * 10000) + 1000,
    currentStock: Math.floor(Math.random() * 500) + 50,
    category: ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'][Math.floor(Math.random() * 5)],
    price: Math.floor(Math.random() * 500) + 20,
    salesGrowth: (Math.random() - 0.5) * 0.4 // -20% to +20%
  })).sort((a, b) => b.predictedSales - a.predictedSales);
};

// Get sales forecasting data
router.get('/forecast', async (req, res) => {
  try {
    const { period = 'quarter' } = req.query;
    
    const quarterlyForecast = {
      Q1: { sales: 1250000, growth: 0.15, confidence: 0.85 },
      Q2: { sales: 1380000, growth: 0.12, confidence: 0.82 },
      Q3: { sales: 1520000, growth: 0.18, confidence: 0.78 },
      Q4: { sales: 1680000, growth: 0.22, confidence: 0.80 }
    };
    
    const yearlyForecast = {
      2024: { sales: 5830000, growth: 0.167, confidence: 0.81 },
      2025: { sales: 6800000, growth: 0.166, confidence: 0.75 }
    };
    
    const monthlyTrends = generateSalesData();
    
    res.json({
      success: true,
      data: {
        quarterly: quarterlyForecast,
        yearly: yearlyForecast,
        monthlyTrends,
        totalRevenue: 5830000,
        forecastAccuracy: 0.87
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales forecast',
      message: error.message
    });
  }
});

// Get top products with highest predicted sales
router.get('/top-products', async (req, res) => {
  try {
    const products = generateProductSales();
    const topProducts = products.slice(0, 10);
    
    res.json({
      success: true,
      data: topProducts,
      metadata: {
        total: topProducts.length,
        totalPredictedRevenue: topProducts.reduce((sum, p) => sum + (p.predictedSales * p.price), 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top products',
      message: error.message
    });
  }
});

// Get sales trends and analytics
router.get('/trends', async (req, res) => {
  try {
    const salesData = generateSalesData();
    const seasonalTrends = [
      { season: 'Spring', avgSales: 320000, growth: 0.12 },
      { season: 'Summer', avgSales: 380000, growth: 0.18 },
      { season: 'Fall', avgSales: 420000, growth: 0.22 },
      { season: 'Winter', avgSales: 450000, growth: 0.25 }
    ];
    
    const performanceMetrics = {
      totalRevenue: 5830000,
      totalTransactions: 45600,
      averageOrderValue: 128,
      conversionRate: 0.034,
      customerRetentionRate: 0.76
    };
    
    res.json({
      success: true,
      data: {
        monthlySales: salesData,
        seasonalTrends,
        performanceMetrics,
        topPerformingPeriods: ['December', 'November', 'July']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales trends',
      message: error.message
    });
  }
});

module.exports = router;