import axios from 'axios'

// Backend routes are mounted at root ('/'), e.g., /forecast, /top-products, /trends
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Some ML endpoints (train + predict) can take longer on first hit
  timeout: 30000,
})

// Global error handler
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error.response?.data || { success: false, error: error.message })
  }
)

// Generic API response
export interface ApiResponse<T> {
  success: boolean
  data: T
  metadata?: Record<string, any>
  source?: string
  timestamp?: string
}

export async function getForecast() {
  const { data } = await api.get<ApiResponse<ForecastResponse>>('/forecast')
  return data
}

export async function getTopProducts(params?: TopProductsParams) {
  const { data } = await api.get<ApiResponse<Product[]>>('/top-products', { params })
  return data
}

export async function getTrends() {
  const { data } = await api.get<ApiResponse<TrendsResponse>>('/trends')
  return data
}

// Types
export type Quarterly = Record<string, { sales: number; growth: number; confidence: number }>

export interface ForecastResponse {
  quarterly: Quarterly
  yearly?: Record<string | number, { sales: number; growth: number; confidence: number }>
  monthlyTrends: { month: string; sales: number }[]
  totalRevenue: number
  forecastAccuracy: number
}

export interface Product {
  productId: string
  name: string
  predictedSales: number
  currentStock: number
  category: string
  price: number
  salesGrowth: number
}

export interface TrendsResponse {
  monthlySales: { month: string; sales: number }[]
  seasonalTrends: { season: string; avgSales: number; growth: number }[]
  performanceMetrics: {
    totalRevenue: number
    totalTransactions: number
    averageOrderValue: number
    conversionRate: number
    customerRetentionRate: number
  }
  topPerformingPeriods: string[]
}

export interface TopProductsParams {
  limit?: number
  search?: string
  category?: string
}

// =============================
// Churn endpoints
// =============================

export interface ChurnMetricsResponse {
  accuracy: number
  roc_auc: number
  classification_report: Record<string, { precision: number; recall: number; f1_score?: number; f1?: number; support: number }>
  confusion_matrix: number[][]
  roc_curve: { fpr: number[]; tpr: number[]; auc: number }
}

export interface FeatureImportanceItem { feature: string; importance: number }
export interface TopChurner { CustomerID: string | number; Churn_Probability: number }

export async function getChurnMetrics() {
  const { data } = await api.get<ApiResponse<ChurnMetricsResponse>>('/churn/metrics')
  return data
}

export async function getChurnImportance() {
  // API returns an array of {feature, importance}
  const { data } = await api.get<ApiResponse<FeatureImportanceItem[]>>('/churn/importance')
  return data
}

export async function getTopChurners(limit = 10) {
  const { data } = await api.get<ApiResponse<TopChurner[]>>('/churn/top-churners', { params: { limit } })
  return data
}

// =============================
// Customer Segmentation endpoints
// =============================

export interface CustomerSegmentRow {
  segment: number
  not_churned: number
  churned: number
  total: number
  churn_rate_percent: number
}

export async function getCustomerSegments() {
  const { data } = await api.get<ApiResponse<CustomerSegmentRow[]>>('/customer/segments')
  return data
}
