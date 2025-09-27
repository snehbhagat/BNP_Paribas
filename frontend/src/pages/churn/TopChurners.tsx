import { useEffect, useState } from 'react'
import ErrorBox from '../../components/Error'
import Loading from '../../components/Loading'
import { TopChurner, getTopChurners } from '../../lib/api'

export default function TopChurners() {
  const [data, setData] = useState<TopChurner[]>([])
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await getTopChurners(limit)
        if (!res.success) throw new Error('Failed to fetch top churners')
        setData(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load top churners')
      } finally {
        setLoading(false)
      }
    })()
  }, [limit])

  if (loading) return <Loading label="Loading top churners..." />
  if (error) return <ErrorBox message={error} />

  return (
    <section className="bg-white p-4 rounded border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Top Churners</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Limit</label>
          <select className="border rounded px-2 py-1" value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))}>
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Customer ID</Th>
              <Th className="text-right">Churn Probability</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={String(c.CustomerID)} className="border-t">
                <Td>{String(c.CustomerID)}</Td>
                <Td align="right">{(c.Churn_Probability * 100).toFixed(2)}%</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Th({ children, className = '' }: { children: any; className?: string }) {
  return <th className={`text-left px-3 py-2 font-medium text-gray-700 ${className}`}>{children}</th>
}
function Td({ children, align = 'left' as 'left' | 'right' | 'center', className = '' }: { children: any; align?: 'left' | 'right' | 'center'; className?: string }) {
  return <td className={`px-3 py-2 ${className}`} style={{ textAlign: align }}>{children}</td>
}
