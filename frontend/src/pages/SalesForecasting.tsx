import { DollarSign, ShoppingCart, Target, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import MetricCard from '../components/MetricCard';
import type { ProductSales, SalesForecast } from '../types';
import { apiService } from '../utils/api';

const SalesForecasting: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<SalesForecast | null>(null);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [salesTrends, setSalesTrends] = useState<any>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        
        const [forecastResponse, productsResponse, trendsResponse] = await Promise.all([
          apiService.getSalesForecast(),
          apiService.getTopProducts(),
          apiService.getSalesTrends()
        ]);

        setForecast(forecastResponse.data);
        setTopProducts(productsResponse.data);
        setSalesTrends(trendsResponse.data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading sales forecasting data...</p>
        </div>
      </div>
    );
  }

  const quarterlyData = forecast?.quarterly ? Object.entries(forecast.quarterly).map(([quarter, data]) => ({
    quarter,
    sales: data.sales,
    growth: data.growth * 100,
    confidence: data.confidence * 100
  })) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Forecasting</h1>
            <p className="mt-2 text-gray-600">
              Revenue predictions and sales performance analytics
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Annual Revenue"
          value={formatCurrency(forecast?.totalRevenue || 0)}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          trend={{ value: 16.7, isPositive: true }}
        />
        <MetricCard
          title="Q4 Forecast"
          value={formatCurrency(forecast?.quarterly?.Q4?.sales || 0)}
          icon={<Target className="h-6 w-6 text-blue-600" />}
          subtitle={`${formatPercentage(forecast?.quarterly?.Q4?.growth || 0)} growth`}
        />
        <MetricCard
          title="Forecast Accuracy"
          value={formatPercentage(forecast?.forecastAccuracy || 0)}
          icon={<Target className="h-6 w-6 text-purple-600" />}
          subtitle="Historical accuracy"
        />
        <MetricCard
          title="Top Product Revenue"
          value={formatCurrency((topProducts[0]?.predictedSales || 0) * (topProducts[0]?.price || 0))}
          icon={<ShoppingCart className="h-6 w-6 text-orange-600" />}
          subtitle={topProducts[0]?.name || 'N/A'}
        />
      </div>

      {/* Quarterly Forecast Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Sales Forecast</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'sales') return [formatCurrency(value), 'Sales'];
                if (name === 'growth') return [`${value.toFixed(1)}%`, 'Growth'];
                if (name === 'confidence') return [`${value.toFixed(1)}%`, 'Confidence'];
                return [value, name];
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
              name="Sales"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrends?.monthlySales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Sales']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Seasonal Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesTrends?.seasonalTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Avg Sales']} />
              <Bar dataKey="avgSales" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Products by Predicted Sales</h3>
          <p className="text-sm text-gray-600 mt-1">
            Products with highest forecasted sales volume
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
                  Predicted Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Predicted Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
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
                    {product.predictedSales.toLocaleString()} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(product.predictedSales * product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.salesGrowth > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.salesGrowth > 0 ? '+' : ''}{formatPercentage(product.salesGrowth)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mr-2 ${
                        product.currentStock > 100 ? 'bg-green-400' : 
                        product.currentStock > 50 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {product.currentStock} units
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesTrends?.performanceMetrics?.totalTransactions?.toLocaleString() || '0'}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesTrends?.performanceMetrics?.averageOrderValue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(salesTrends?.performanceMetrics?.conversionRate || 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesForecasting;