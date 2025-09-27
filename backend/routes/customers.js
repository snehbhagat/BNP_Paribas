const express = require('express');
const router = express.Router();

// Generate customer segmentation based on RFM analysis (from notebook)
const generateCustomerSegments = () => {
  // Segments based on RFM (Recency, Frequency, Monetary) analysis from notebook
  return [
    {
      segmentId: 'premium',
      name: 'Premium Customers',
      description: 'High frequency, high monetary, low recency - VIP customers',
      customerCount: 125,
      averageSpending: 2850,
      averageFrequency: 42,
      averageRecency: 8,
      churnRate: 0.03,
      characteristics: ['Frequency > 30', 'Monetary > $2000', 'Recency < 15 days'],
      rfmProfile: { recency: 'Low', frequency: 'High', monetary: 'High' },
      color: '#10B981'
    },
    {
      segmentId: 'loyal',
      name: 'Loyal Customers', 
      description: 'Medium-high frequency and monetary, consistent engagement',
      customerCount: 280,
      averageSpending: 1450,
      averageFrequency: 18,
      averageRecency: 25,
      churnRate: 0.12,
      characteristics: ['Frequency 10-30', 'Monetary $800-2000', 'Recency 15-45 days'],
      rfmProfile: { recency: 'Medium', frequency: 'High', monetary: 'Medium' },
      color: '#3B82F6'
    },
    {
      segmentId: 'new',
      name: 'New Customers',
      description: 'Low frequency but recent engagement - growth potential',
      customerCount: 195,
      averageSpending: 380,
      averageFrequency: 3,
      averageRecency: 12,
      churnRate: 0.28,
      characteristics: ['Frequency < 5', 'Recent purchases', 'Low total spend'],
      rfmProfile: { recency: 'Low', frequency: 'Low', monetary: 'Low' },
      color: '#F59E0B'
    },
    {
      segmentId: 'at-risk',
      name: 'At-Risk Customers',
      description: 'Previously active but showing declining engagement',
      customerCount: 145,
      averageSpending: 920,
      averageFrequency: 8,
      averageRecency: 75,
      churnRate: 0.52,
      characteristics: ['Frequency 5-15', 'Recency > 60 days', 'Declining activity'],
      rfmProfile: { recency: 'High', frequency: 'Medium', monetary: 'Medium' },
      color: '#EF4444'
    },
    {
      segmentId: 'dormant',
      name: 'Dormant Customers',
      description: 'High recency, low recent activity - reactivation needed',
      customerCount: 85,
      averageSpending: 165,
      averageFrequency: 2,
      averageRecency: 185,
      churnRate: 0.89,
      characteristics: ['Recency > 120 days', 'Low frequency', 'Minimal spend'],
      rfmProfile: { recency: 'High', frequency: 'Low', monetary: 'Low' },
      color: '#6B7280'
    },
    {
      segmentId: 'champions',
      name: 'Champions',
      description: 'Best customers - high value across all RFM dimensions',
      customerCount: 65,
      averageSpending: 4200,
      averageFrequency: 55,
      averageRecency: 5,
      churnRate: 0.01,
      characteristics: ['Top 10% in all metrics', 'Highly engaged', 'Maximum lifetime value'],
      rfmProfile: { recency: 'Low', frequency: 'High', monetary: 'High' },
      color: '#8B5CF6'
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

// Get customers by segment (filterable and searchable)
router.get('/segments/:segmentId', async (req, res) => {
  try {
    const { segmentId } = req.params;
    const { limit = 20, search = '' } = req.query;
    const limitNum = parseInt(limit);
    
    const segments = generateCustomerSegments();
    const segment = segments.find(s => s.segmentId === segmentId);
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        error: 'Segment not found'
      });
    }
    
    // Generate mock customers for this segment
    let customers = [];
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
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.customerId.toLowerCase().includes(searchLower)
      );
    }
    
    const paginatedCustomers = customers.slice(0, limitNum);
    
    res.json({
      success: true,
      data: {
        segment,
        customers: paginatedCustomers,
        metadata: {
          total: paginatedCustomers.length,
          totalBeforeLimit: customers.length,
          limit: limitNum,
          search: search || null
        }
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