import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ErrorBox from '../components/Error'
import Loading from '../components/Loading'
import { CustomerSegmentRow, getCustomerSegments } from '../lib/api'

export default function CustomerSegments() {
  const [rows, setRows] = useState<CustomerSegmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await getCustomerSegments()
        if (!res.success) throw new Error('Failed to fetch segments')
        setRows(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load segments')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const totals = useMemo(() => {
    const totalCustomers = rows.reduce((acc, r) => acc + r.total, 0)
    const churned = rows.reduce((acc, r) => acc + r.churned, 0)
    const notChurned = rows.reduce((acc, r) => acc + r.not_churned, 0)
    const churnRate = totalCustomers ? (churned / totalCustomers) * 100 : 0
    return { totalCustomers, churned, notChurned, churnRate }
  }, [rows])

  if (loading) return <Loading label="Loading customer segments..." />
  if (error) return <ErrorBox message={error} />

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Customer Segments</h1>
        <p className="text-sm text-gray-500">Distribution of churned vs. non-churned customers by segment</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI label="Total Customers" value={totals.totalCustomers.toLocaleString()} />
        <KPI label="Churned" value={totals.churned.toLocaleString()} />
        <KPI label="Not Churned" value={totals.notChurned.toLocaleString()} />
        <KPI label="Overall Churn Rate" value={`${totals.churnRate.toFixed(2)}%`} />
      </div>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Churn vs. Not Churned (by Segment)</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" tickFormatter={(v) => `S${v}`} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="not_churned" stackId="a" fill="#10b981" name="Not Churned" />
              <Bar dataKey="churned" stackId="a" fill="#ef4444" name="Churned" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Segment Detail</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Segment</Th>
                <Th className="text-right">Not Churned</Th>
                <Th className="text-right">Churned</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right">Churn Rate</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.segment} className="border-t">
                  <Td>S{r.segment}</Td>
                  <Td align="right">{r.not_churned.toLocaleString()}</Td>
                  <Td align="right">{r.churned.toLocaleString()}</Td>
                  <Td align="right">{r.total.toLocaleString()}</Td>
                  <Td align="right">{r.churn_rate_percent.toFixed(2)}%</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Th({ children, className = '' }: { children: any; className?: string }) {
  return <th className={`text-left px-3 py-2 font-medium text-gray-700 ${className}`}>{children}</th>
}
function Td({ children, align = 'left' as 'left' | 'right' | 'center', className = '' }: { children: any; align?: 'left' | 'right' | 'center'; className?: string }) {
  return <td className={`px-3 py-2 ${className}`} style={{ textAlign: align }}>{children}</td>
}
