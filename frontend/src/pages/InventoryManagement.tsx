import { AlertTriangle, BarChart3, Package, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import MetricCard from '../components/MetricCard';
import type { DemandForecast, InventoryProduct } from '../types';
import { apiService } from '../utils/api';

const InventoryManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [demandForecast, setDemandForecast] = useState<DemandForecast | null>(null);
  const [optimization, setOptimization] = useState<any>(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        
        const [forecastResponse, optimizationResponse] = await Promise.all([
          apiService.getDemandForecast(),
          apiService.getInventoryOptimization()
        ]);

        setDemandForecast(forecastResponse.data);
        setOptimization(optimizationResponse.data);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatusColor = (product: InventoryProduct) => {
    if (product.currentStock < product.reorderPoint) return 'bg-red-100 text-red-800';
    if (product.currentStock > product.optimalStock * 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = (product: InventoryProduct) => {
    if (product.currentStock < product.reorderPoint) return 'Low Stock';
    if (product.currentStock > product.optimalStock * 1.5) return 'Overstock';
    return 'Optimal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading inventory management data...</p>
        </div>
      </div>
    );
  }

  const demandByCategory = demandForecast?.demandByCategory 
    ? Object.entries(demandForecast.demandByCategory).map(([category, demand]) => ({
        category,
        demand
      }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-2 text-gray-600">
              Demand forecasting and inventory optimization
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Products"
          value={demandForecast?.overview?.totalProducts || 0}
          icon={<Package className="h-6 w-6 text-blue-600" />}
        />
        <MetricCard
          title="Low Stock Products"
          value={demandForecast?.overview?.lowStockProducts || 0}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          subtitle="Require immediate attention"
        />
        <MetricCard
          title="Inventory Turnover"
          value={`${demandForecast?.overview?.inventoryTurnover?.toFixed(1) || 0}x`}
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          subtitle="Annual turnover rate"
        />
        <MetricCard
          title="Fill Rate"
          value={`${((demandForecast?.overview?.fillRate || 0) * 100).toFixed(1)}%`}
          icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
          subtitle="Order fulfillment rate"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Demand Forecast */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">6-Month Demand Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandForecast?.monthlyForecast || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any, name: string) => {
                if (name === 'totalDemand') return [value.toLocaleString(), 'Total Demand'];
                if (name === 'estimatedRevenue') return [formatCurrency(value), 'Est. Revenue'];
                return [value, name];
              }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalDemand" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Total Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Demand by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={demandByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, demand }: any) => `${category}: ${demand}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="demand"
              >
                {demandByCategory.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Optimization Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Actionable insights to optimize inventory levels and reduce costs
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-red-900">Potential Savings</h4>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(optimization?.costSavings?.potentialSavings || 0)}
              </p>
              <p className="text-sm text-red-700">Inventory optimization</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Storage Optimization</h4>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(optimization?.costSavings?.storageOptimization || 0)}
              </p>
              <p className="text-sm text-blue-700">Reduced storage costs</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-900">Stockout Prevention</h4>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(optimization?.costSavings?.stockoutPrevention || 0)}
              </p>
              <p className="text-sm text-green-700">Avoided lost sales</p>
            </div>
          </div>

          <div className="space-y-4">
            {optimization?.recommendations?.map((rec: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} Priority
                    </span>
                    <h4 className="text-md font-medium text-gray-900">{rec.message}</h4>
                  </div>
                  <span className="text-sm text-gray-500">
                    {rec.products?.length || 0} products
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rec.products?.slice(0, 6).map((product: InventoryProduct) => (
                    <div key={product.productId} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStockStatusColor(product)}`}>
                          {getStockStatus(product)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Current: {product.currentStock} units</div>
                        <div>Optimal: {product.optimalStock} units</div>
                        <div>Reorder Point: {product.reorderPoint} units</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Demand Products */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Products by Predicted Demand</h3>
          <p className="text-sm text-gray-600 mt-1">
            Products with highest forecasted demand
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demand Forecast
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stockout Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnover Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demandForecast?.topDemandProducts?.slice(0, 10).map((product: InventoryProduct, index: number) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.productId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.currentStock} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.demandForecast} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            product.stockoutRisk > 0.7 ? 'bg-red-500' : 
                            product.stockoutRisk > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${product.stockoutRisk * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {(product.stockoutRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.turnoverRate.toFixed(1)}x/year
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product)}`}>
                      {getStockStatus(product)}
                    </span>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;