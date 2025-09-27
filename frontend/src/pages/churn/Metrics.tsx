import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ErrorBox from '../../components/Error'
import Loading from '../../components/Loading'
import { ChurnMetricsResponse, getChurnMetrics } from '../../lib/api'

export default function Metrics() {
  const [data, setData] = useState<ChurnMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await getChurnMetrics()
        if (!res.success) throw new Error('Failed to fetch metrics')
        setData(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load metrics')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const rocData = useMemo(() => {
    if (!data) return [] as { fpr: number; tpr: number }[]
    return data.roc_curve.fpr.map((fpr, i) => ({ fpr, tpr: data.roc_curve.tpr[i] }))
  }, [data])

  if (loading) return <Loading label="Loading metrics..." />
  if (error) return <ErrorBox message={error} />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI label="Accuracy" value={`${(data.accuracy * 100).toFixed(2)}%`} />
        <KPI label="ROC AUC" value={data.roc_auc.toFixed(3)} />
        <KPI label="ROC AUC (curve)" value={data.roc_curve.auc.toFixed(3)} />
      </div>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">ROC Curve</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fpr" tickFormatter={(v) => (v * 100).toFixed(0) + '%'} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(v) => (v * 100).toFixed(0) + '%'} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v: any) => `${(v * 100).toFixed(1)}%`} labelFormatter={(l) => `FPR ${(l * 100).toFixed(1)}%`} />
              <Line type="monotone" dataKey="tpr" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">Confusion Matrix</h2>
        <ConfusionMatrix matrix={data.confusion_matrix} />
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
