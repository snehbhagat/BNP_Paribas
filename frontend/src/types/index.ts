export interface Customer {
  customerId: string;
  name: string;
  email: string;
  age?: number;
  location?: string;
  churnProbability: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  segment?: string;
  totalSpent: number;
  lastPurchase: string;
  rating?: number;
  transactionCount?: number;
}

export interface CustomerSegment {
  segmentId: string;
  name: string;
  description: string;
  customerCount: number;
  averageSpending: number;
  churnRate: number;
  characteristics: string[];
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
  currentStock: number;
  category: string;
  price: number;
  salesGrowth: number;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata?: any;
  error?: string;
  message?: string;
}