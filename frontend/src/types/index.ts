export interface Customer {
  customerId: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  country?: string;
  location?: string;
  churnProbability: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  segment?: string;
  totalSpent: number;
  frequency?: number;
  recencyDays?: number;
  lastPurchase: string;
  rating?: number;
  transactionCount?: number;
  subscriptionStatus?: string;
  preferredCategory?: string;
}

export interface CustomerSegment {
  segmentId: string;
  name: string;
  description: string;
  customerCount: number;
  averageSpending: number;
  averageFrequency?: number;
  averageRecency?: number;
  churnRate: number;
  characteristics: string[];
  rfmProfile?: {
    recency: 'Low' | 'Medium' | 'High';
    frequency: 'Low' | 'Medium' | 'High';
    monetary: 'Low' | 'Medium' | 'High';
  };
  color: string;
}

export interface ChurnTrend {
  month: string;
  churnRate: number;
  customersLost: number;
  totalCustomers: number;
}

export interface RiskDistribution {
  risk: 'High' | 'Medium' | 'Low';
  count: number;
  percentage: number;
}

export interface ChurnPrediction {
  customerId: string;
  churnProbability: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  factors: ChurnFactor[];
  recommendations: string[];
}

export interface ChurnFactor {
  factor: string;
  impact: number;
}

export interface SalesData {
  month: string;
  sales: number;
  transactions: number;
  avgOrderValue: number;
}

export interface ProductSales {
  productId: string;
  name: string;
  predictedSales: number;
  predictedRevenue?: number;
  historicalSales?: number;
  currentStock: number;
  category: string;
  price: number;
  salesGrowth: number;
  confidence?: number;
  weeklyTrend?: number[];
}

export interface SalesForecast {
  quarterly: Record<string, { sales: number; growth: number; confidence: number }>;
  yearly: Record<string, { sales: number; growth: number; confidence: number }>;
  monthlyTrends: SalesData[];
  totalRevenue: number;
  forecastAccuracy: number;
}

export interface InventoryProduct {
  productId: string;
  name: string;
  category: string;
  currentStock: number;
  optimalStock: number;
  reorderPoint: number;
  price: number;
  demandForecast: number;
  leadTime: number;
  stockoutRisk: number;
  turnoverRate: number;
}

export interface DemandForecast {
  overview: {
    totalProducts: number;
    lowStockProducts: number;
    overStockProducts: number;
    stockoutRiskProducts: number;
    inventoryTurnover: number;
    fillRate: number;
  };
  demandByCategory: Record<string, number>;
  monthlyForecast: Array<{
    month: string;
    totalDemand: number;
    stockRequirement: number;
    estimatedRevenue: number;
  }>;
  topDemandProducts: InventoryProduct[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ModelMetrics {
  accuracy: number;
  rocAuc: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface ChurnTrendsData {
  monthlyTrends: Array<{
    month: string;
    churnRate: number;
    customersLost: number;
    totalCustomers: number;
    retainedCustomers: number;
    newCustomers: number;
  }>;
  riskDistribution: Array<{
    risk: 'High' | 'Medium' | 'Low';
    count: number;
    percentage: string;
  }>;
  featureImportance: FeatureImportance[];
  modelMetrics: ModelMetrics;
  totalCustomers: number;
  currentChurnRate: number;
  averageRecencyDays: number;
  averageFrequency: number;
}

export interface EnhancedInventoryProduct extends InventoryProduct {
  predicted7Days: number;
  predicted30Days: number;
  predicted90Days: number;
  seasonalityFactor: number;
  confidence: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata?: any;
  error?: string;
  message?: string;
}