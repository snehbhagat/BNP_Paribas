const express = require('express');
const router = express.Router();

// Generate realistic churn data based on notebook analysis
const generateMockChurnData = () => {
  const customers = [];
  const riskLevels = ['High', 'Medium', 'Low'];
  const segments = ['Premium', 'Standard', 'Basic'];
  const genders = ['Male', 'Female'];
  const countries = ['USA', 'UK', 'Germany', 'France', 'Canada'];
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'];
  
  // Generate customers based on notebook patterns
  for (let i = 1; i <= 1000; i++) {
    const frequency = Math.floor(Math.random() * 50) + 1;
    const monetarySum = Math.random() * 5000 + 100;
    const recencyDays = Math.floor(Math.random() * 365);
    const age = Math.floor(Math.random() * 50) + 18;
    
    // Calculate churn probability based on RFM features (similar to notebook)
    let churnProbability = 0;
    if (recencyDays > 90) churnProbability += 0.3;
    if (frequency < 3) churnProbability += 0.2;
    if (monetarySum < 200) churnProbability += 0.2;
    if (age > 60) churnProbability += 0.1;
    
    // Add some randomness
    churnProbability += (Math.random() - 0.5) * 0.4;
    churnProbability = Math.max(0, Math.min(1, churnProbability));
    
    const riskLevel = churnProbability > 0.7 ? 'High' : churnProbability > 0.4 ? 'Medium' : 'Low';
    
    customers.push({
      customerId: `CUST${String(i).padStart(4, '0')}`,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      age: age,
      gender: genders[Math.floor(Math.random() * genders.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      location: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      churnProbability: churnProbability,
      riskLevel: riskLevel,
      segment: segments[Math.floor(Math.random() * 3)],
      totalSpent: monetarySum,
      frequency: frequency,
      recencyDays: recencyDays,
      lastPurchase: new Date(Date.now() - recencyDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rating: Math.floor(Math.random() * 5) + 1,
      transactionCount: frequency,
      subscriptionStatus: Math.random() > 0.3 ? 'Active' : 'Inactive',
      preferredCategory: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  
  return customers.sort((a, b) => b.churnProbability - a.churnProbability);
};

// Get high-risk customers (filterable and searchable)
router.get('/high-risk', async (req, res) => {
  try {
    const { limit = 10, search = '' } = req.query;
    const limitNum = parseInt(limit);
    
    let customers = generateMockChurnData();
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.customerId.toLowerCase().includes(searchLower) ||
        customer.location.toLowerCase().includes(searchLower)
      );
    }
    
    const highRiskCustomers = customers.slice(0, limitNum);
    
    res.json({
      success: true,
      data: highRiskCustomers,
      metadata: {
        total: highRiskCustomers.length,
        totalBeforeLimit: customers.length,
        limit: limitNum,
        search: search || null,
        averageChurnProbability: highRiskCustomers.length > 0 
          ? highRiskCustomers.reduce((sum, c) => sum + c.churnProbability, 0) / highRiskCustomers.length
          : 0
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

// Get churn trends and analytics (based on notebook analysis)
router.get('/trends', async (req, res) => {
  try {
    const customers = generateMockChurnData();
    
    // Monthly churn trends based on realistic patterns
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const churnTrends = months.map((month, index) => {
      // Seasonal churn patterns (higher in Jan, July, lower in Nov-Dec)
      let baseChurnRate = 0.08;
      if (index === 0 || index === 6) baseChurnRate += 0.05; // Jan, July higher
      if (index >= 10) baseChurnRate -= 0.03; // Nov, Dec lower
      
      const monthlyCustomers = Math.floor(Math.random() * 200) + 800;
      const churned = Math.floor(monthlyCustomers * baseChurnRate);
      
      return {
        month,
        churnRate: baseChurnRate,
        customersLost: churned,
        totalCustomers: monthlyCustomers,
        retainedCustomers: monthlyCustomers - churned,
        newCustomers: Math.floor(Math.random() * 100) + 50
      };
    });

    // Risk distribution based on actual churn probabilities
    const highRisk = customers.filter(c => c.churnProbability > 0.7).length;
    const mediumRisk = customers.filter(c => c.churnProbability > 0.4 && c.churnProbability <= 0.7).length;
    const lowRisk = customers.filter(c => c.churnProbability <= 0.4).length;
    const total = customers.length;

    const riskDistribution = [
      { risk: 'High', count: highRisk, percentage: (highRisk / total * 100).toFixed(1) },
      { risk: 'Medium', count: mediumRisk, percentage: (mediumRisk / total * 100).toFixed(1) },
      { risk: 'Low', count: lowRisk, percentage: (lowRisk / total * 100).toFixed(1) }
    ];

    // Feature importance (based on notebook analysis)
    const featureImportance = [
      { feature: 'Recency_days', importance: 0.42 },
      { feature: 'Frequency', importance: 0.28 },
      { feature: 'Monetary_sum', importance: 0.15 },
      { feature: 'Age', importance: 0.08 },
      { feature: 'Gender', importance: 0.04 },
      { feature: 'Country', importance: 0.03 }
    ];

    // Model performance metrics (from notebook)
    const modelMetrics = {
      accuracy: 0.87,
      rocAuc: 0.91,
      precision: 0.84,
      recall: 0.79,
      f1Score: 0.81
    };

    res.json({
      success: true,
      data: {
        monthlyTrends: churnTrends,
        riskDistribution,
        featureImportance,
        modelMetrics,
        totalCustomers: total,
        currentChurnRate: customers.reduce((sum, c) => sum + c.churnProbability, 0) / total,
        averageRecencyDays: customers.reduce((sum, c) => sum + c.recencyDays, 0) / total,
        averageFrequency: customers.reduce((sum, c) => sum + c.frequency, 0) / total
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