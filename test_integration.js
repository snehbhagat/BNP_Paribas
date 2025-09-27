#!/usr/bin/env node
/**
 * Test script to validate Node.js backend integration with FastAPI
 * This tests the actual backend routes that call FastAPI
 */

const axios = require('axios');

const BACKEND_BASE_URL = 'http://localhost:5000/api';

const testEndpoint = async (endpoint, description) => {
  try {
    console.log(`🧪 Testing ${description}...`);
    const response = await axios.get(`${BACKEND_BASE_URL}${endpoint}`, {
      timeout: 15000 // 15 second timeout for ML model calls
    });
    
    if (response.data.success) {
      console.log(`✅ ${description} - SUCCESS`);
      console.log(`   Source: ${response.data.source || 'N/A'}`);
      
      // Log specific data points based on endpoint
      if (endpoint.includes('forecast')) {
        console.log(`   📊 Quarterly data: ${Object.keys(response.data.data.quarterly).length} quarters`);
        console.log(`   💰 Total Revenue: $${response.data.data.totalRevenue?.toLocaleString()}`);
        console.log(`   🎯 Accuracy: ${(response.data.data.forecastAccuracy * 100).toFixed(1)}%`);
      } else if (endpoint.includes('top-products')) {
        console.log(`   📦 Products returned: ${response.data.data.length}`);
        console.log(`   🔝 Top product: ${response.data.data[0]?.name}`);
        console.log(`   💵 Total predicted revenue: $${response.data.metadata?.totalPredictedRevenue?.toLocaleString()}`);
      } else if (endpoint.includes('trends')) {
        console.log(`   📈 Monthly data points: ${response.data.data.monthlySales?.length}`);
        console.log(`   💰 Total revenue: $${response.data.data.performanceMetrics?.totalRevenue?.toLocaleString()}`);
        console.log(`   📋 Transactions: ${response.data.data.performanceMetrics?.totalTransactions?.toLocaleString()}`);
      }
      
      return true;
    } else {
      console.log(`❌ ${description} - FAILED: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Details: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
};

const testBackendIntegration = async () => {
  console.log('🚀 Testing Node.js Backend → FastAPI Integration');
  console.log('=' * 60);
  console.log('This tests your backend routes that call the FastAPI ML models');
  console.log('');
  
  const tests = [
    ['/sales/forecast', 'Sales Forecasting (SARIMAX Model)'],
    ['/sales/top-products?limit=5', 'Top 5 Products Analysis'],
    ['/sales/trends', 'Sales Trends & Performance Metrics'],
    ['/inventory/demand-forecast?limit=5', 'Inventory Demand Forecast (using FastAPI products)'],
  ];
  
  const results = [];
  
  for (const [endpoint, description] of tests) {
    const success = await testEndpoint(endpoint, description);
    results.push(success);
    console.log(''); // Add spacing between tests
    
    // Wait a bit between requests to be nice to the ML models
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('=' * 60);
  console.log('📊 Test Results Summary:');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('');
    console.log('🎉 All tests passed!');
    console.log('🔗 Your Node.js backend is successfully integrated with FastAPI ML models');
    console.log('📱 Your React frontend can now display real ML predictions');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your React frontend: cd frontend && npm run dev');
    console.log('2. Visit http://localhost:5173 to see the integrated application');
    console.log('3. Check Sales Forecasting page for real SARIMAX predictions');
  } else {
    console.log('');
    console.log('⚠️  Some tests failed. Check the errors above and ensure:');
    console.log('1. FastAPI is running on http://127.0.0.1:8000');
    console.log('2. Node.js backend is running on http://localhost:5000');
    console.log('3. Both services can communicate with each other');
  }
};

// Run the tests
testBackendIntegration().catch(console.error);