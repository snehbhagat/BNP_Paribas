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

// Generate realistic product sales based on notebook analysis
const generateProductSales = () => {
  const productNames = [
    'Wireless Bluetooth Headphones', 'Smart LED TV 55"', 'Laptop Computer', 
    'Smartphone Pro', 'Coffee Maker Deluxe', 'Running Shoes Premium', 
    'Digital Camera DSLR', 'Gaming Console', 'Tablet 10"', 'Smartwatch Series X',
    'Wireless Speaker', 'Home Router WiFi 6', 'External Hard Drive 2TB', 
    'Mechanical Keyboard', 'Fitness Tracker', 'Power Bank 20000mAh',
    'Wireless Charger', 'Bluetooth Mouse', 'USB-C Hub', 'Webcam HD'
  ];
  
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'];
  
  return productNames.map((product, index) => {
    // Historical sales pattern (similar to notebook top 10 products)
    const historicalSales = Math.floor(Math.random() * 50000) + 10000;
    
    // Predicted quarterly sales using SARIMAX-like pattern
    const seasonalFactor = 1 + 0.2 * Math.sin((index * 2 * Math.PI) / 12);
    const trendFactor = 1 + (Math.random() - 0.5) * 0.3;
    const predictedQuarterlySales = Math.floor(historicalSales * seasonalFactor * trendFactor * 0.25);
    
    const unitPrice = Math.floor(Math.random() * 800) + 50;
    const predictedQuantity = Math.floor(predictedQuarterlySales / unitPrice);
    
    return {
      productId: `PRD${String(index + 1).padStart(3, '0')}`,
      name: product,
      predictedSales: predictedQuantity,
      predictedRevenue: predictedQuarterlySales,
      historicalSales: Math.floor(historicalSales / unitPrice),
      currentStock: Math.floor(Math.random() * 1000) + 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: unitPrice,
      salesGrowth: (Math.random() - 0.3) * 0.6, // -30% to +30%
      confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
      weeklyTrend: Array.from({length: 12}, () => Math.floor(Math.random() * 1000) + 100)
    };
  }).sort((a, b) => b.predictedRevenue - a.predictedRevenue);
};

// Get sales forecasting data (based on SARIMAX model from notebook)
router.get('/forecast', async (req, res) => {
  try {
    const { period = 'quarter' } = req.query;
    
    // Generate daily sales data (similar to notebook's daily_sales)
    const dailySales = [];
    const startDate = new Date('2024-01-01');
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate seasonal and trend patterns
      const seasonalFactor = 1 + 0.3 * Math.sin((i * 2 * Math.PI) / 365);
      const weeklyPattern = 1 + 0.2 * Math.sin((i * 2 * Math.PI) / 7);
      const trendFactor = 1 + (i / 365) * 0.1; // 10% yearly growth
      const randomFactor = 1 + (Math.random() - 0.5) * 0.2;
      
      const baseSales = 15000;
      const dailySale = baseSales * seasonalFactor * weeklyPattern * trendFactor * randomFactor;
      
      dailySales.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(dailySale),
        forecast: i > 300 // Last 65 days are forecasted
      });
    }
    
    // Calculate quarterly forecasts based on daily data
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterlyForecast = {};
    
    quarters.forEach((quarter, qIndex) => {
      const startDay = qIndex * 90;
      const endDay = Math.min((qIndex + 1) * 90, 365);
      const quarterSales = dailySales.slice(startDay, endDay).reduce((sum, day) => sum + day.sales, 0);
      
      quarterlyForecast[quarter] = {
        sales: Math.floor(quarterSales),
        growth: 0.08 + (Math.random() - 0.5) * 0.1,
        confidence: 0.75 + Math.random() * 0.15,
        forecastDays: endDay > 300 ? endDay - 300 : 0
      };
    });
    
    // Weekly sales trends (like notebook's weekly_sales)
    const weeklySales = [];
    for (let week = 0; week < 52; week++) {
      const weekStart = week * 7;
      const weekEnd = Math.min(weekStart + 7, 365);
      const weeklyTotal = dailySales.slice(weekStart, weekEnd).reduce((sum, day) => sum + day.sales, 0);
      
      weeklySales.push({
        week: week + 1,
        sales: Math.floor(weeklyTotal),
        isHighSales: weeklyTotal > dailySales.slice(0, 365).reduce((sum, day) => sum + day.sales, 0) / 52 * 1.25,
        isLowSales: weeklyTotal < dailySales.slice(0, 365).reduce((sum, day) => sum + day.sales, 0) / 52 * 0.75
      });
    }
    
    // Future forecasts (next quarter and year)
    const futureForecast = {
      nextQuarter: {
        sales: Math.floor(quarterlyForecast.Q4.sales * 1.08),
        confidence: 0.72,
        days: 90
      },
      nextYear: {
        sales: Math.floor(Object.values(quarterlyForecast).reduce((sum, q) => sum + q.sales, 0) * 1.12),
        confidence: 0.68,
        days: 365
      }
    };
    
    const monthlyTrends = generateSalesData();
    const totalRevenue = Object.values(quarterlyForecast).reduce((sum, q) => sum + q.sales, 0);
    
    res.json({
      success: true,
      data: {
        quarterly: quarterlyForecast,
        daily: dailySales.slice(-30), // Last 30 days
        weekly: weeklySales.slice(-12), // Last 12 weeks
        monthlyTrends,
        futureForecast,
        totalRevenue: totalRevenue,
        forecastAccuracy: 0.87, // Model accuracy from notebook
        modelMetrics: {
          mape: 8.5, // Mean Absolute Percentage Error
          rmse: 1250, // Root Mean Square Error
          mae: 980 // Mean Absolute Error
        }
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

// Get top products with highest predicted sales (filterable and searchable)
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10, search = '', category = '' } = req.query;
    const limitNum = parseInt(limit);
    
    let products = generateProductSales();
    
    // Apply category filter
    if (category) {
      products = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.productId.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }
    
    const topProducts = products.slice(0, limitNum);
    
    res.json({
      success: true,
      data: topProducts,
      metadata: {
        total: topProducts.length,
        totalBeforeLimit: products.length,
        limit: limitNum,
        search: search || null,
        category: category || null,
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