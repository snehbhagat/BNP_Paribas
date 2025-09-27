import axios from 'axios';
import type {
    ApiResponse,
    ChurnPrediction,
    ChurnTrend,
    Customer,
    CustomerSegment,
    DemandForecast,
    InventoryProduct,
    ProductSales,
    SalesForecast
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: async (): Promise<ApiResponse<{ status: string; message: string }>> => {
    const response = await api.get('/health');
    return response.data;
  },

  // Churn endpoints
  getHighRiskCustomers: async (): Promise<ApiResponse<Customer[]>> => {
    const response = await api.get('/churn/high-risk');
    return response.data;
  },

  getChurnTrends: async (): Promise<ApiResponse<{
    monthlyTrends: ChurnTrend[];
    riskDistribution: Array<{ risk: string; count: number; percentage: number }>;
    totalCustomers: number;
    currentChurnRate: number;
  }>> => {
    const response = await api.get('/churn/trends');
    return response.data;
  },

  getChurnPrediction: async (customerId: string): Promise<ApiResponse<ChurnPrediction>> => {
    const response = await api.get(`/churn/predict/${customerId}`);
    return response.data;
  },

  // Customer segmentation endpoints
  getCustomerSegments: async (): Promise<ApiResponse<{
    segments: CustomerSegment[];
    overview: {
      totalCustomers: number;
      totalSegments: number;
      averageChurnRate: number;
      totalRevenue: number;
    };
  }>> => {
    const response = await api.get('/customers/segments');
    return response.data;
  },

  getSegmentCustomers: async (segmentId: string): Promise<ApiResponse<{
    segment: CustomerSegment;
    customers: Customer[];
  }>> => {
    const response = await api.get(`/customers/segments/${segmentId}`);
    return response.data;
  },

  getCustomerProfile: async (customerId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/customers/profile/${customerId}`);
    return response.data;
  },

  // Sales forecasting endpoints
  getSalesForecast: async (period?: string): Promise<ApiResponse<SalesForecast>> => {
    const response = await api.get('/sales/forecast', { params: { period } });
    return response.data;
  },

  getTopProducts: async (): Promise<ApiResponse<ProductSales[]>> => {
    const response = await api.get('/sales/top-products');
    return response.data;
  },

  getSalesTrends: async (): Promise<ApiResponse<{
    monthlySales: Array<{ month: string; sales: number; transactions: number; avgOrderValue: number }>;
    seasonalTrends: Array<{ season: string; avgSales: number; growth: number }>;
    performanceMetrics: {
      totalRevenue: number;
      totalTransactions: number;
      averageOrderValue: number;
      conversionRate: number;
      customerRetentionRate: number;
    };
    topPerformingPeriods: string[];
  }>> => {
    const response = await api.get('/sales/trends');
    return response.data;
  },

  // Inventory management endpoints
  getDemandForecast: async (): Promise<ApiResponse<DemandForecast>> => {
    const response = await api.get('/inventory/demand-forecast');
    return response.data;
  },

  getInventoryOptimization: async (): Promise<ApiResponse<{
    recommendations: Array<{
      type: string;
      priority: string;
      products: InventoryProduct[];
      message: string;
    }>;
    costSavings: {
      potentialSavings: number;
      storageOptimization: number;
      stockoutPrevention: number;
    };
    optimalInventoryValue: number;
    currentInventoryValue: number;
  }>> => {
    const response = await api.get('/inventory/optimization');
    return response.data;
  },

  getProductForecast: async (productId: string): Promise<ApiResponse<{
    product: InventoryProduct;
    weeklyForecast: Array<{
      week: string;
      demandForecast: number;
      confidence: number;
      factors: Array<{ name: string; impact: number }>;
    }>;
    recommendedActions: string[];
  }>> => {
    const response = await api.get(`/inventory/product/${productId}/forecast`);
    return response.data;
  },
};