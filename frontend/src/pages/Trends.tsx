import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ErrorBox from '../components/Error'
import Loading from '../components/Loading'
import { getTrends, TrendsResponse } from '../lib/api'

export default function Trends() {
  const [data, setData] = useState<TrendsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await getTrends()
        if (!res.success) throw new Error('Backend returned unsuccessful response')
        setData(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load trends')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <Loading label="Loading trends..." />
  if (error) return <ErrorBox message={error} />
  if (!data) return null

  const pm = data.performanceMetrics

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Total Revenue" value={pm.totalRevenue} type="currency" />
        <Metric label="Transactions" value={pm.totalTransactions} />
        <Metric label="Avg Order Value" value={pm.averageOrderValue} type="currency" />
        <Metric label="Conversion Rate" value={pm.conversionRate} type="percent" />
      </div>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Monthly Sales</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: any) => currency(v)} />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Seasonal Performance</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.seasonalTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip formatter={(v: any, n: string) => n === 'growth' ? `${(v * 100).toFixed(1)}%` : currency(v)} />
              <Bar dataKey="avgSales" fill="#f59e0b" name="Avg Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, type }: { label: string; value: number; type?: 'currency' | 'percent' }) {
  const display = type === 'currency' ? currency(value) : type === 'percent' ? `${(value * 100).toFixed(1)}%` : value.toLocaleString()
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
