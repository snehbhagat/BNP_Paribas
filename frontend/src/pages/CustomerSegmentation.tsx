import { Eye, TrendingDown, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import MetricCard from '../components/MetricCard';
import type { Customer, CustomerSegment } from '../types';
import { apiService } from '../utils/api';

const CustomerSegmentation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [segmentCustomers, setSegmentCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    const fetchSegmentData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCustomerSegments();
        setSegments(response.data.segments);
        setOverview(response.data.overview);
      } catch (error) {
        console.error('Error fetching customer segments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentData();
  }, []);

  const handleSegmentClick = async (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setLoadingCustomers(true);
    try {
      const response = await apiService.getSegmentCustomers(segment.segmentId);
      setSegmentCustomers(response.data.customers);
    } catch (error) {
      console.error('Error fetching segment customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading customer segments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Segmentation</h1>
            <p className="mt-2 text-gray-600">
              Analyze customer groups based on behavior and churn likelihood
            </p>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Customers"
          value={overview?.totalCustomers?.toLocaleString() || '0'}
          icon={<Users className="h-6 w-6 text-blue-600" />}
        />
        <MetricCard
          title="Total Segments"
          value={overview?.totalSegments || 0}
          icon={<Users className="h-6 w-6 text-green-600" />}
        />
        <MetricCard
          title="Avg Churn Rate"
          value={`${((overview?.averageChurnRate || 0) * 100).toFixed(1)}%`}
          icon={<TrendingDown className="h-6 w-6 text-red-600" />}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
        />
      </div>

      {/* Segments Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, customerCount }: any) => `${name}: ${customerCount}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="customerCount"
              >
                {segments.map((segment, index) => (
                  <Cell key={`cell-${index}`} fill={segment.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Spending by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segments as any}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Avg Spending']} />
              <Bar dataKey="averageSpending" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {segments.map((segment) => (
          <div
            key={segment.segmentId}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSegmentClick(segment)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Customers:</span>
                    <span className="font-medium">{segment.customerCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg Spending:</span>
                    <span className="font-medium">{formatCurrency(segment.averageSpending)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Churn Rate:</span>
                    <span className={`font-medium ${
                      segment.churnRate > 0.3 ? 'text-red-600' : 
                      segment.churnRate > 0.15 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {(segment.churnRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Key Characteristics:</h4>
                  <div className="flex flex-wrap gap-1">
                    {segment.characteristics.slice(0, 2).map((char, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {char}
                      </span>
                    ))}
                    {segment.characteristics.length > 2 && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        +{segment.characteristics.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedSegment(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: selectedSegment.color }}
                    ></div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedSegment.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedSegment(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600">{selectedSegment.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedSegment.customerCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Customers</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedSegment.averageSpending)}
                    </div>
                    <div className="text-sm text-gray-500">Avg Spending</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className={`text-2xl font-bold ${
                      selectedSegment.churnRate > 0.3 ? 'text-red-600' : 
                      selectedSegment.churnRate > 0.15 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {(selectedSegment.churnRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Churn Rate</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedSegment.averageSpending * selectedSegment.customerCount)}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Characteristics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSegment.characteristics.map((char, index) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                {loadingCustomers ? (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Loading customers...</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Sample Customers ({segmentCustomers.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Spent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Churn Risk
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Activity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {segmentCustomers.slice(0, 10).map((customer) => (
                            <tr key={customer.customerId}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(customer.totalSpent)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  customer.churnProbability > 0.7 ? 'bg-red-100 text-red-800' : 
                                  customer.churnProbability > 0.4 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {(customer.churnProbability * 100).toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {customer.lastPurchase}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSegmentation;