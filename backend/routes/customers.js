const express = require('express');
const router = express.Router();

// Generate mock customer segmentation data
const generateCustomerSegments = () => {
  return [
    {
      segmentId: 'premium',
      name: 'Premium Customers',
      description: 'High-value customers with low churn risk',
      customerCount: 150,
      averageSpending: 2500,
      churnRate: 0.05,
      characteristics: ['High purchase frequency', 'Premium product preference', 'Excellent ratings'],
      color: '#10B981'
    },
    {
      segmentId: 'loyal',
      name: 'Loyal Customers',
      description: 'Long-term customers with moderate spending',
      customerCount: 320,
      averageSpending: 1200,
      churnRate: 0.08,
      characteristics: ['Consistent purchases', 'Brand loyalty', 'Good ratings'],
      color: '#3B82F6'
    },
    {
      segmentId: 'new',
      name: 'New Customers',
      description: 'Recently acquired customers',
      customerCount: 180,
      averageSpending: 450,
      churnRate: 0.25,
      characteristics: ['Recent registration', 'Exploring products', 'Variable engagement'],
      color: '#F59E0B'
    },
    {
      segmentId: 'at-risk',
      name: 'At-Risk Customers',
      description: 'Customers showing signs of potential churn',
      customerCount: 95,
      averageSpending: 800,
      churnRate: 0.45,
      characteristics: ['Declining purchases', 'Lower ratings', 'Reduced engagement'],
      color: '#EF4444'
    },
    {
      segmentId: 'dormant',
      name: 'Dormant Customers',
      description: 'Inactive customers with high churn probability',
      customerCount: 65,
      averageSpending: 200,
      churnRate: 0.75,
      characteristics: ['No recent purchases', 'Low engagement', 'Potential to reactivate'],
      color: '#6B7280'
    }
  ];
};

// Get customer segmentation overview
router.get('/segments', async (req, res) => {
  try {
    const segments = generateCustomerSegments();
    
    const totalCustomers = segments.reduce((sum, segment) => sum + segment.customerCount, 0);
    const weightedChurnRate = segments.reduce((sum, segment) => 
      sum + (segment.churnRate * segment.customerCount), 0) / totalCustomers;
    
    res.json({
      success: true,
      data: {
        segments,
        overview: {
          totalCustomers,
          totalSegments: segments.length,
          averageChurnRate: weightedChurnRate,
          totalRevenue: segments.reduce((sum, segment) => 
            sum + (segment.averageSpending * segment.customerCount), 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer segments',
      message: error.message
    });
  }
});

// Get customers by segment
router.get('/segments/:segmentId', async (req, res) => {
  try {
    const { segmentId } = req.params;
    const segments = generateCustomerSegments();
    const segment = segments.find(s => s.segmentId === segmentId);
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        error: 'Segment not found'
      });
    }
    
    // Generate mock customers for this segment
    const customers = [];
    for (let i = 1; i <= segment.customerCount; i++) {
      customers.push({
        customerId: `${segmentId.toUpperCase()}${String(i).padStart(3, '0')}`,
        name: `${segment.name.split(' ')[0]} Customer ${i}`,
        email: `customer${i}@${segmentId}.com`,
        totalSpent: Math.floor(segment.averageSpending * (0.5 + Math.random())),
        churnProbability: segment.churnRate * (0.5 + Math.random()),
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rating: Math.floor(Math.random() * 5) + 1
      });
    }
    
    res.json({
      success: true,
      data: {
        segment,
        customers: customers.slice(0, 20) // Return first 20 for pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch segment customers',
      message: error.message
    });
  }
});

// Get customer profile
router.get('/profile/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Mock customer profile
    const profile = {
      customerId,
      name: `Customer ${customerId.slice(-3)}`,
      email: `${customerId.toLowerCase()}@example.com`,
      demographics: {
        age: Math.floor(Math.random() * 50) + 20,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        location: ['New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 4)],
        income: Math.floor(Math.random() * 100000) + 30000
      },
      behavior: {
        totalSpent: Math.floor(Math.random() * 5000) + 500,
        transactionCount: Math.floor(Math.random() * 100) + 10,
        averageOrderValue: Math.floor(Math.random() * 200) + 50,
        lastPurchase: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      engagement: {
        rating: Math.floor(Math.random() * 5) + 1,
        feedbackCount: Math.floor(Math.random() * 20) + 1,
        loginFrequency: Math.floor(Math.random() * 30) + 1,
        supportTickets: Math.floor(Math.random() * 5)
      },
      churnAnalysis: {
        probability: Math.random(),
        riskLevel: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
        keyFactors: ['Purchase frequency', 'Rating trends', 'Support interactions']
      }
    };
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer profile',
      message: error.message
    });
  }
});

module.exports = router;