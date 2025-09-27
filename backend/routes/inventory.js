const express = require('express');
const router = express.Router();

// Generate realistic inventory data based on notebook forecasting
const generateInventoryData = () => {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'];
  const productNames = [
    'Wireless Bluetooth Headphones', 'Smart LED TV', 'Laptop Computer', 
    'Smartphone Pro', 'Coffee Maker', 'Running Shoes', 'Digital Camera', 
    'Gaming Console', 'Tablet Device', 'Smartwatch', 'Wireless Speaker',
    'Home Router', 'External Drive', 'Keyboard', 'Fitness Tracker',
    'Power Bank', 'Wireless Charger', 'Mouse', 'USB Hub', 'Webcam',
    'Winter Jacket', 'Summer Dress', 'Casual Shirt', 'Jeans', 'Sneakers',
    'Garden Tools', 'Kitchen Set', 'Bed Sheets', 'Curtains', 'Lamp',
    'Fiction Book', 'Tech Manual', 'Cook Book', 'Art Book', 'Magazine',
    'Tennis Racket', 'Soccer Ball', 'Yoga Mat', 'Dumbbells', 'Bike Helmet',
    'Phone Case', 'Screen Protector', 'Cable Organizer', 'Desk Chair', 'Monitor',
    'Backpack', 'Water Bottle', 'Sunglasses', 'Wall Clock', 'Picture Frame'
  ];
  
  return productNames.map((name, i) => {
    const category = categories[Math.floor(i / 10)];
    
    // 30-day demand forecast (similar to notebook output)
    const predicted30DayQuantity = Math.floor(Math.random() * 200) + 20;
    const currentStock = Math.floor(Math.random() * 500) + 50;
    const optimalStock = Math.floor(predicted30DayQuantity * 2.5);
    const reorderPoint = Math.floor(predicted30DayQuantity * 0.75);
    
    // Calculate stockout risk based on current stock vs predicted demand
    let stockoutRisk = 0;
    if (currentStock < reorderPoint) stockoutRisk += 0.4;
    if (currentStock < predicted30DayQuantity) stockoutRisk += 0.3;
    stockoutRisk += Math.random() * 0.3;
    stockoutRisk = Math.min(1, stockoutRisk);
    
    return {
      productId: `PRD${String(i + 1).padStart(3, '0')}`,
      name: name,
      category: category,
      currentStock: currentStock,
      optimalStock: optimalStock,
      reorderPoint: reorderPoint,
      price: Math.floor(Math.random() * 800) + 20,
      demandForecast: predicted30DayQuantity,
      predicted7Days: Math.floor(predicted30DayQuantity * 0.25),
      predicted30Days: predicted30DayQuantity,
      predicted90Days: Math.floor(predicted30DayQuantity * 3.2),
      leadTime: Math.floor(Math.random() * 21) + 3,
      stockoutRisk: stockoutRisk,
      turnoverRate: (predicted30DayQuantity * 12) / Math.max(currentStock, 1),
      seasonalityFactor: 1 + 0.3 * Math.sin((i * 2 * Math.PI) / 12),
      confidence: 0.65 + Math.random() * 0.3
    };
  });
};

// Get demand forecasting overview (filterable and searchable)
router.get('/demand-forecast', async (req, res) => {
  try {
    const { limit = 10, search = '', category = '' } = req.query;
    const limitNum = parseInt(limit);
    
    let products = generateInventoryData();
    
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
    
    const topDemandProducts = products
      .sort((a, b) => b.demandForecast - a.demandForecast)
      .slice(0, limitNum);
    
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
        topDemandProducts,
        metadata: {
          limit: limitNum,
          search: search || null,
          category: category || null,
          totalProductsBeforeFilters: generateInventoryData().length
        }
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

// Get category-wise inventory forecast (based on notebook analysis)
router.get('/category-forecast', async (req, res) => {
  try {
    const products = generateInventoryData();
    
    // Group by category and calculate forecasts
    const categoryForecasts = {};
    
    products.forEach(product => {
      if (!categoryForecasts[product.category]) {
        categoryForecasts[product.category] = {
          category: product.category,
          totalProducts: 0,
          predicted7Days: 0,
          predicted30Days: 0,
          predicted90Days: 0,
          averageConfidence: 0,
          totalCurrentStock: 0,
          productsAtRisk: 0
        };
      }
      
      const cat = categoryForecasts[product.category];
      cat.totalProducts++;
      cat.predicted7Days += product.predicted7Days;
      cat.predicted30Days += product.predicted30Days;
      cat.predicted90Days += product.predicted90Days;
      cat.averageConfidence += product.confidence;
      cat.totalCurrentStock += product.currentStock;
      if (product.stockoutRisk > 0.6) cat.productsAtRisk++;
    });
    
    // Calculate averages
    Object.values(categoryForecasts).forEach(cat => {
      cat.averageConfidence = cat.averageConfidence / cat.totalProducts;
    });
    
    const sortedCategories = Object.values(categoryForecasts)
      .sort((a, b) => b.predicted30Days - a.predicted30Days);
    
    res.json({
      success: true,
      data: {
        categoryForecasts: sortedCategories,
        summary: {
          totalCategories: Object.keys(categoryForecasts).length,
          totalProducts: products.length,
          overallConfidence: sortedCategories.reduce((sum, cat) => sum + cat.averageConfidence, 0) / sortedCategories.length,
          highRiskProducts: products.filter(p => p.stockoutRisk > 0.7).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category forecast',
      message: error.message
    });
  }
});

module.exports = router;