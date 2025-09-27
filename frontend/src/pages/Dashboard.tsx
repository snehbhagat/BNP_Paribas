import {
    AlertTriangle,
    DollarSign,
    Package,
    TrendingDown,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import MetricCard from '../components/MetricCard';
import { apiService } from '../utils/api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from multiple endpoints
        const [churnTrends, salesForecast, highRiskCustomers, segments] = await Promise.all([
          apiService.getChurnTrends(),
          apiService.getSalesForecast(),
          apiService.getHighRiskCustomers(),
          apiService.getCustomerSegments()
        ]);

        setDashboardData({
          churnTrends: churnTrends.data,
          salesForecast: salesForecast.data,
          highRiskCustomers: highRiskCustomers.data,
          segments: segments.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Customer churn prediction and sales forecasting insights
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Customers"
          value={dashboardData?.segments?.overview?.totalCustomers?.toLocaleString() || '0'}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Churn Rate"
          value={`${((dashboardData?.churnTrends?.currentChurnRate || 0) * 100).toFixed(1)}%`}
          icon={<TrendingDown className="h-6 w-6 text-red-600" />}
          trend={{ value: -2.1, isPositive: true }}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${(dashboardData?.salesForecast?.totalRevenue || 0).toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="High Risk Customers"
          value={dashboardData?.highRiskCustomers?.length || 0}
          icon={<AlertTriangle className="h-6 w-6 text-orange-600" />}
          trend={{ value: -5.3, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Churn Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Rate Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData?.churnTrends?.monthlyTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Churn Rate']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="churnRate" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Churn Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.churnTrends?.riskDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }: any) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(dashboardData?.churnTrends?.riskDistribution || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/high-risk-customers"
          className="bg-red-50 border border-red-200 rounded-lg p-6 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-900">High Risk Customers</h3>
              <p className="text-sm text-red-700">View customers likely to churn</p>
            </div>
          </div>
        </Link>

        <Link
          to="/customer-segmentation"
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">Customer Segments</h3>
              <p className="text-sm text-blue-700">Analyze customer groups</p>
            </div>
          </div>
        </Link>

        <Link
          to="/sales-forecasting"
          className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-900">Sales Forecast</h3>
              <p className="text-sm text-green-700">Predict future sales</p>
            </div>
          </div>
        </Link>

        <Link
          to="/inventory-management"
          className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-purple-900">Inventory</h3>
              <p className="text-sm text-purple-700">Optimize stock levels</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">High churn risk detected</p>
              <p className="text-sm text-gray-600">
                {dashboardData?.highRiskCustomers?.length || 0} customers show high churn probability
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sales forecast updated</p>
              <p className="text-sm text-gray-600">
                Q4 revenue projection: ${(dashboardData?.salesForecast?.quarterly?.Q4?.sales || 0).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Customer segments analyzed</p>
              <p className="text-sm text-gray-600">
                {dashboardData?.segments?.segments?.length || 0} distinct customer segments identified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;