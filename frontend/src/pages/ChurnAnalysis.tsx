import { BarChart3, Brain, Target, TrendingDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import MetricCard from '../components/MetricCard';
import { apiService } from '../utils/api';

const ChurnAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<any>(null);

  useEffect(() => {
    const fetchChurnTrends = async () => {
      try {
        setLoading(true);
        const response = await apiService.getChurnTrends();
        setTrendsData(response.data);
      } catch (error) {
        console.error('Error fetching churn trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChurnTrends();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading churn analysis...</p>
        </div>
      </div>
    );
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Churn Analysis & Model Performance</h1>
            <p className="mt-2 text-gray-600">
              XGBoost model insights and feature importance analysis
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Model Accuracy"
          value={formatPercentage(trendsData?.modelMetrics?.accuracy || 0)}
          icon={<Target className="h-6 w-6 text-green-600" />}
          subtitle="XGBoost Performance"
        />
        <MetricCard
          title="ROC-AUC Score"
          value={trendsData?.modelMetrics?.rocAuc?.toFixed(2) || '0.00'}
          icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
          subtitle="Model Quality"
        />
        <MetricCard
          title="Precision"
          value={formatPercentage(trendsData?.modelMetrics?.precision || 0)}
          icon={<Target className="h-6 w-6 text-purple-600" />}
          subtitle="True Positive Rate"
        />
        <MetricCard
          title="F1 Score"
          value={trendsData?.modelMetrics?.f1Score?.toFixed(2) || '0.00'}
          icon={<Brain className="h-6 w-6 text-orange-600" />}
          subtitle="Harmonic Mean"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Feature Importance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Importance</h3>
          <p className="text-sm text-gray-600 mb-4">
            Key factors contributing to churn prediction (XGBoost model)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={trendsData?.featureImportance || []}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="feature" width={100} />
              <Tooltip 
                formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
              />
              <Bar dataKey="importance" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Churn Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Churn Rate Trends</h3>
          <p className="text-sm text-gray-600 mb-4">
            Seasonal patterns in customer churn behavior
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsData?.monthlyTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Churn Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="churnRate" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Risk Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendsData?.riskDistribution?.map((risk: any) => (
            <div 
              key={risk.risk}
              className={`p-4 rounded-lg border-2 ${
                risk.risk === 'High' ? 'border-red-200 bg-red-50' :
                risk.risk === 'Medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold ${
                  risk.risk === 'High' ? 'text-red-900' :
                  risk.risk === 'Medium' ? 'text-yellow-900' :
                  'text-green-900'
                }`}>
                  {risk.risk} Risk
                </h4>
                <TrendingDown className={`h-5 w-5 ${
                  risk.risk === 'High' ? 'text-red-600' :
                  risk.risk === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                risk.risk === 'High' ? 'text-red-900' :
                risk.risk === 'Medium' ? 'text-yellow-900' :
                'text-green-900'
              }`}>
                {risk.count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {risk.percentage}% of customers
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RFM Analysis Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">RFM Analysis Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-purple-900">Average Recency</h4>
              <div className="text-2xl font-bold text-purple-900">
                {trendsData?.averageRecencyDays?.toFixed(0) || '0'} days
              </div>
            </div>
            <p className="text-sm text-purple-700">
              Time since last purchase
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Average Frequency</h4>
              <div className="text-2xl font-bold text-blue-900">
                {trendsData?.averageFrequency?.toFixed(1) || '0.0'}
              </div>
            </div>
            <p className="text-sm text-blue-700">
              Number of purchases
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-900">Overall Churn Rate</h4>
              <div className="text-2xl font-bold text-green-900">
                {formatPercentage(trendsData?.currentChurnRate || 0)}
              </div>
            </div>
            <p className="text-sm text-green-700">
              Predicted churn probability
            </p>
          </div>
        </div>
      </div>

      {/* Model Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Implementation Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Algorithm</h4>
              <p className="text-sm text-gray-600">
                XGBoost (Extreme Gradient Boosting) with binary logistic objective
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features Used</h4>
              <p className="text-sm text-gray-600">
                RFM metrics (Recency, Frequency, Monetary), demographic data, and behavioral patterns
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Training Data</h4>
              <p className="text-sm text-gray-600">
                {trendsData?.totalCustomers || 0} customers with 80/20 train-test split
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Validation Method</h4>
              <p className="text-sm text-gray-600">
                Stratified sampling with cross-validation and ROC-AUC scoring
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Key Model Insights</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Recency</strong> is the strongest predictor (42% importance) - customers with recent purchases are less likely to churn</li>
              <li>• <strong>Frequency</strong> accounts for 28% - regular purchasers show higher loyalty</li>
              <li>• <strong>Monetary value</strong> contributes 15% - higher spending customers have lower churn risk</li>
              <li>• Model achieves {formatPercentage(trendsData?.modelMetrics?.accuracy || 0)} accuracy with excellent ROC-AUC of {trendsData?.modelMetrics?.rocAuc?.toFixed(2)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurnAnalysis;