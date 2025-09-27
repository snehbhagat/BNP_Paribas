import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ErrorBox from '../components/Error'
import Loading from '../components/Loading'
import { ForecastResponse, getForecast } from '../lib/api'

export default function Forecast() {
  const [data, setData] = useState<ForecastResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await getForecast()
        if (!res.success) throw new Error('Backend returned unsuccessful response')
        setData(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load forecast')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const quarterlyData = useMemo(() => {
    if (!data) return [] as { quarter: string; sales: number; growth: number }[]
    return Object.entries(data.quarterly).map(([quarter, v]) => {
      const val = v as { sales: number; growth: number; confidence: number }
      return { quarter, sales: val.sales, growth: val.growth }
    })
  }, [data])

  if (loading) return <Loading label="Loading forecast..." />
  if (error) return <ErrorBox message={error} />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Revenue" value={data.totalRevenue} format="currency" />
        <MetricCard label="Forecast Accuracy" value={data.forecastAccuracy} format="percent" />
        <MetricCard label="Months in Trend" value={data.monthlyTrends.length} />
      </div>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Quarterly Forecast</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip formatter={(v: any, n: string) => n === 'growth' ? `${(v * 100).toFixed(1)}%` : currency(v)} />
              <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Monthly Trends</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: any) => currency(v)} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

function MetricCard({ label, value, format }: { label: string; value: number; format?: 'currency' | 'percent' }) {
  const display = format === 'currency' ? currency(value) : format === 'percent' ? `${(value * 100).toFixed(1)}%` : value.toLocaleString()
  return (
    <div className="bg-white p-4 rounded border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{display}</div>
    </div>
  )
}

function currency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
