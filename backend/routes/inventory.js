const express = require('express');
const router = express.Router();

// Generate mock inventory data
const generateInventoryData = () => {
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'];
  const products = [];
  
  for (let i = 1; i <= 50; i++) {
    products.push({
      productId: `PRD${String(i).padStart(3, '0')}`,
      name: `Product ${i}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      currentStock: Math.floor(Math.random() * 500) + 10,
      optimalStock: Math.floor(Math.random() * 300) + 100,
      reorderPoint: Math.floor(Math.random() * 50) + 20,
      price: Math.floor(Math.random() * 500) + 20,
      demandForecast: Math.floor(Math.random() * 200) + 50,
      leadTime: Math.floor(Math.random() * 14) + 3,
      stockoutRisk: Math.random(),
      turnoverRate: Math.random() * 12 + 2
    });
  }
  
  return products;
};

// Get demand forecasting overview
router.get('/demand-forecast', async (req, res) => {
  try {
    const products = generateInventoryData();
    
    // Calculate inventory metrics
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.currentStock < p.reorderPoint).length;
    const overStockProducts = products.filter(p => p.currentStock > p.optimalStock * 1.5).length;
    const stockoutRiskProducts = products.filter(p => p.stockoutRisk > 0.7).length;
    
    const demandByCategory = {};
    products.forEach(product => {
      if (!demandByCategory[product.category]) {
        demandByCategory[product.category] = 0;
      }
      demandByCategory[product.category] += product.demandForecast;
    });
    
    // Generate monthly demand forecast
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyForecast = months.map(month => ({
      month,
      totalDemand: Math.floor(Math.random() * 5000) + 2000,
      stockRequirement: Math.floor(Math.random() * 4000) + 1500,
      estimatedRevenue: Math.floor(Math.random() * 500000) + 200000
    }));
    
    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          lowStockProducts,
          overStockProducts,
          stockoutRiskProducts,
          inventoryTurnover: 8.5,
          fillRate: 0.94
        },
        demandByCategory,
        monthlyForecast,
        topDemandProducts: products
          .sort((a, b) => b.demandForecast - a.demandForecast)
          .slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demand forecast',
      message: error.message
    });
  }
});

// Get inventory optimization recommendations
router.get('/optimization', async (req, res) => {
  try {
    const products = generateInventoryData();
    
    const recommendations = [
      {
        type: 'reorder',
        priority: 'High',
        products: products.filter(p => p.currentStock < p.reorderPoint).slice(0, 5),
        message: 'Products requiring immediate reorder'
      },
      {
        type: 'reduce',
        priority: 'Medium',
        products: products.filter(p => p.currentStock > p.optimalStock * 1.5).slice(0, 3),
        message: 'Overstocked products - consider promotion'
      },
      {
        type: 'monitor',
        priority: 'Low',
        products: products.filter(p => p.stockoutRisk > 0.6 && p.stockoutRisk < 0.8).slice(0, 4),
        message: 'Products to monitor closely'
      }
    ];
    
    const costSavings = {
      potentialSavings: Math.floor(Math.random() * 50000) + 20000,
      storageOptimization: Math.floor(Math.random() * 15000) + 5000,
      stockoutPrevention: Math.floor(Math.random() * 30000) + 10000
    };
    
    res.json({
      success: true,
      data: {
        recommendations,
        costSavings,
        optimalInventoryValue: Math.floor(Math.random() * 1000000) + 500000,
        currentInventoryValue: Math.floor(Math.random() * 1200000) + 600000
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch optimization data',
      message: error.message
    });
  }
});

// Get product-specific demand forecast
router.get('/product/:productId/forecast', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Generate forecast for next 12 weeks
    const weeklyForecast = [];
    for (let week = 1; week <= 12; week++) {
      weeklyForecast.push({
        week: `Week ${week}`,
        demandForecast: Math.floor(Math.random() * 50) + 20,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        factors: [
          { name: 'Seasonal trend', impact: Math.random() * 0.4 },
          { name: 'Price change', impact: Math.random() * 0.3 },
          { name: 'Marketing campaign', impact: Math.random() * 0.2 }
        ]
      });
    }
    
    const productDetails = {
      productId,
      name: `Product ${productId.slice(-3)}`,
      category: ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'][Math.floor(Math.random() * 5)],
      currentStock: Math.floor(Math.random() * 200) + 50,
      averageDemand: Math.floor(Math.random() * 30) + 15,
      seasonality: Math.random() > 0.5 ? 'High' : 'Low',
      elasticity: Math.random() * 2 + 0.5
    };
    
    res.json({
      success: true,
      data: {
        product: productDetails,
        weeklyForecast,
        recommendedActions: [
          'Increase stock by 15% for upcoming promotion',
          'Monitor competitor pricing',
          'Prepare for seasonal demand spike'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product forecast',
      message: error.message
    });
  }
});

module.exports = router;