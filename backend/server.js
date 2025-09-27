const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Sales (FastAPI proxy)
app.use('/', require('./routes/sales'));
// Routes - Churn (FastAPI proxy)
app.use('/churn', require('./routes/churn'));
app.use('/api/churn', require('./routes/churn'));
// Routes - Customer Segmentation (FastAPI customer.py proxy)
app.use('/customer', require('./routes/customer'));
app.use('/api/customer', require('./routes/customer'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BNP Analytics API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route - helpful landing message
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BNP Backend is running',
    tips: 'This server exposes REST endpoints under /api. See /api/health for status.',
    endpoints: {
      health: '/health',
      sales: {
        forecast: '/forecast',
        topProducts: '/top-products',
        trends: '/trends'
      },
      churn: {
        metrics: '/churn/metrics',
        importance: '/churn/importance',
        topChurners: '/churn/top-churners'
      },
      customer: {
        segments: '/customer/segments'
      }
    },
    frontend: 'http://localhost:5173'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
});