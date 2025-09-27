#!/usr/bin/env node
/**
 * Test script to verify FastAPI integration with Node.js backend
 */

const axios = require('axios');

// FastAPI configuration
const FASTAPI_BASE_URL = 'http://127.0.0.1:8000';
const API_KEY = 'mysecretapikey';

// Helper function to call FastAPI
const callFastAPI = async (endpoint) => {
  try {
    console.log(`🔄 Testing ${endpoint}...`);
    const response = await axios.get(`${FASTAPI_BASE_URL}${endpoint}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error(`❌ FastAPI Error for ${endpoint}:`, error.message);
    return null;
  }
};

async function testFastAPIIntegration() {
  console.log('🚀 Testing FastAPI Integration for BNP Paribas');
  console.log('=' * 50);
  
  // Test 1: Health Check
  console.log('\n📡 Testing FastAPI Health...');
  try {
    const healthResponse = await axios.get(`${FASTAPI_BASE_URL}/`);
    console.log('✅ FastAPI Health:', healthResponse.data);
  } catch (error) {
    console.error('❌ FastAPI is not running or unreachable:', error.message);
    return;
  }
  
  // Test 2: Forecast endpoint
  const forecastData = await callFastAPI('/forecast');
  if (forecastData && forecastData.success) {
    console.log('✅ Forecast endpoint working');
    console.log('   📊 Quarterly data:', Object.keys(forecastData.data.quarterly));
    console.log('   💰 Total Revenue:', forecastData.data.totalRevenue.toLocaleString());
  }
  
  // Test 3: Top Products endpoint  
  const productsData = await callFastAPI('/top-products');
  if (productsData && productsData.success) {
    console.log('✅ Top Products endpoint working');
    console.log('   📦 Products found:', productsData.data.length);
    console.log('   🔝 Top product:', productsData.data[0]?.name);
  }
  
  // Test 4: Trends endpoint
  const trendsData = await callFastAPI('/trends');
  if (trendsData && trendsData.success) {
    console.log('✅ Trends endpoint working');
    console.log('   📈 Monthly data points:', trendsData.data.monthlySales.length);
    console.log('   💵 Total Revenue:', trendsData.data.performanceMetrics.totalRevenue.toLocaleString());
  }
  
  console.log('\n🎉 FastAPI Integration Test Complete!');
  console.log('Your Node.js backend can now call the trained ML models.');
}

// Run the test
testFastAPIIntegration().catch(console.error);