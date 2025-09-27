const express = require('express');
const router = express.Router();

// Mock data for customer churn predictions
const generateMockChurnData = () => {
  const customers = [];
  const riskLevels = ['High', 'Medium', 'Low'];
  const segments = ['Premium', 'Standard', 'Basic'];
  
  for (let i = 1; i <= 50; i++) {
    customers.push({
      customerId: `CUST${String(i).padStart(4, '0')}`,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      age: Math.floor(Math.random() * 50) + 20,
      location: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      churnProbability: Math.random(),
      riskLevel: riskLevels[Math.floor(Math.random() * 3)],
      segment: segments[Math.floor(Math.random() * 3)],
      totalSpent: Math.floor(Math.random() * 10000) + 500,
      lastPurchase: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rating: Math.floor(Math.random() * 5) + 1,
      transactionCount: Math.floor(Math.random() * 100) + 1
    });
  }
  
  return customers.sort((a, b) => b.churnProbability - a.churnProbability);
};

// Get high-risk customers (top 10 most likely to churn)
router.get('/high-risk', async (req, res) => {
  try {
    const customers = generateMockChurnData();
    const highRiskCustomers = customers.slice(0, 10);
    
    res.json({
      success: true,
      data: highRiskCustomers,
      metadata: {
        total: highRiskCustomers.length,
        averageChurnProbability: highRiskCustomers.reduce((sum, c) => sum + c.churnProbability, 0) / highRiskCustomers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch high-risk customers',
      message: error.message
    });
  }
});

// Get churn trends and analytics
router.get('/trends', async (req, res) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const churnTrends = months.map(month => ({
      month,
      churnRate: Math.random() * 0.15 + 0.05, // 5-20% churn rate
      customersLost: Math.floor(Math.random() * 50) + 10,
      totalCustomers: Math.floor(Math.random() * 1000) + 500
    }));

    const riskDistribution = [
      { risk: 'High', count: Math.floor(Math.random() * 100) + 50, percentage: 15 },
      { risk: 'Medium', count: Math.floor(Math.random() * 200) + 100, percentage: 35 },
      { risk: 'Low', count: Math.floor(Math.random() * 300) + 200, percentage: 50 }
    ];

    res.json({
      success: true,
      data: {
        monthlyTrends: churnTrends,
        riskDistribution,
        totalCustomers: 1250,
        currentChurnRate: 0.12
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch churn trends',
      message: error.message
    });
  }
});

// Get churn prediction for specific customer
router.get('/predict/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Mock prediction - in real scenario, this would call ML model API
    const prediction = {
      customerId,
      churnProbability: Math.random(),
      riskLevel: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
      factors: [
        { factor: 'Purchase Frequency', impact: Math.random() * 0.4 + 0.1 },
        { factor: 'Customer Rating', impact: Math.random() * 0.3 + 0.1 },
        { factor: 'Total Spending', impact: Math.random() * 0.3 + 0.1 },
        { factor: 'Last Purchase Date', impact: Math.random() * 0.2 + 0.1 }
      ],
      recommendations: [
        'Offer personalized discount',
        'Improve customer support interaction',
        'Send targeted product recommendations'
      ]
    };
    
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to predict churn',
      message: error.message
    });
  }
});

module.exports = router;