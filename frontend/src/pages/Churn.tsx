import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ErrorBox from '../components/Error'
import Loading from '../components/Loading'
import { ChurnMetricsResponse, FeatureImportanceItem, TopChurner, getChurnImportance, getChurnMetrics, getTopChurners } from '../lib/api'

export default function Churn() {
  const [metrics, setMetrics] = useState<ChurnMetricsResponse | null>(null)
  const [importance, setImportance] = useState<FeatureImportanceItem[]>([])
  const [churners, setChurners] = useState<TopChurner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const [m, imp, top] = await Promise.all([
          getChurnMetrics(),
          getChurnImportance(),
          getTopChurners(10)
        ])
        if (!m.success) throw new Error('Failed to get churn metrics')
        if (!imp.success) throw new Error('Failed to get feature importance')
        if (!top.success) throw new Error('Failed to get top churners')
        setMetrics(m.data)
        setImportance(imp.data)
        setChurners(top.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load churn insights')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const rocData = useMemo(() => {
    if (!metrics) return [] as { fpr: number; tpr: number }[]
    return metrics.roc_curve.fpr.map((fpr, i) => ({ fpr, tpr: metrics.roc_curve.tpr[i] }))
  }, [metrics])

  if (loading) return <Loading label="Loading churn insights..." />
  if (error) return <ErrorBox message={error} />
  if (!metrics) return null

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(2)}%`} />
        <KPI label="ROC AUC" value={metrics.roc_auc.toFixed(3)} />
        <KPI label="ROC AUC (curve)" value={metrics.roc_curve.auc.toFixed(3)} />
      </div>

      {/* ROC Curve */}
      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">ROC Curve</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fpr" tickFormatter={(v) => (v * 100).toFixed(0) + '%'} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(v) => (v * 100).toFixed(0) + '%'} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: any, n: string) => `${(v * 100).toFixed(1)}%`} labelFormatter={(l) => `FPR ${(l * 100).toFixed(1)}%`} />
              <Line type="monotone" dataKey="tpr" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Confusion Matrix */}
      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Confusion Matrix</h2>
        <ConfusionMatrix matrix={metrics.confusion_matrix} />
      </section>

      {/* Feature Importance */}
      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Top Features</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...importance].slice(0, 15).map((d) => ({ name: short(d.feature), importance: d.importance }))} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={200} />
              <Tooltip formatter={(v: any) => (v as number).toFixed(3)} />
              <Bar dataKey="importance" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top Churners */}
      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Top Churners</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Customer ID</Th>
                <Th className="text-right">Churn Probability</Th>
              </tr>
            </thead>
            <tbody>
              {churners.map((c) => (
                <tr key={String(c.CustomerID)} className="border-t">
                  <Td>{String(c.CustomerID)}</Td>
                  <Td align="right">{(c.Churn_Probability * 100).toFixed(2)}%</Td>
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

function ConfusionMatrix({ matrix }: { matrix: number[][] }) {
  const headers = ['Predicted 0', 'Predicted 1']
  const rows = ['Actual 0', 'Actual 1']
  return (
    <div className="overflow-auto">
      <table className="text-sm">
        <thead>
          <tr>
            <th></th>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2 font-medium text-gray-700">{rows[i]}</td>
              {row.map((val, j) => (
                <td key={j} className="px-3 py-2">{val.toLocaleString()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className = '' }: { children: any; className?: string }) {
  return <th className={`text-left px-3 py-2 font-medium text-gray-700 ${className}`}>{children}</th>
}
function Td({ children, align = 'left' as 'left' | 'right' | 'center', className = '' }: { children: any; align?: 'left' | 'right' | 'center'; className?: string }) {
  return <td className={`px-3 py-2 ${className}`} style={{ textAlign: align }}>{children}</td>
}

function short(s: string) {
  // Clean long feature names like 'num__Monetary_sum' or 'cat__gender_Male'
  return s
    .replace(/^num__/, '')
    .replace(/^cat__/, '')
    .replace(/[_]+/g, ' ')
}
