import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ErrorBox from '../../components/Error'
import Loading from '../../components/Loading'
import { FeatureImportanceItem, getChurnImportance } from '../../lib/api'

export default function Importance() {
  const [data, setData] = useState<FeatureImportanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await getChurnImportance()
        if (!res.success) throw new Error('Failed to fetch importance')
        setData(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load importance')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <Loading label="Loading importance..." />
  if (error) return <ErrorBox message={error} />

  return (
    <section className="bg-white p-4 rounded border">
      <h2 className="text-lg font-medium mb-2">Top Features</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...data].slice(0, 20).map((d) => ({ name: short(d.feature), importance: d.importance }))} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={220} />
            <Tooltip formatter={(v: any) => (v as number).toFixed(3)} />
            <Bar dataKey="importance" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function short(s: string) {
  return s.replace(/^num__/, '').replace(/^cat__/, '').replace(/[_]+/g, ' ')
}
