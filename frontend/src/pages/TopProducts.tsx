import { useEffect, useMemo, useState } from 'react'
import ErrorBox from '../components/Error'
import Loading from '../components/Loading'
import { getTopProducts, Product } from '../lib/api'

export default function TopProducts() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await getTopProducts({ limit: 20 })
        if (!res.success) throw new Error('Backend returned unsuccessful response')
        setData(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const categories = useMemo(() => Array.from(new Set(data.map(d => d.category))).sort(), [data])

  const filtered = useMemo(() => {
    let list = data
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.productId.toLowerCase().includes(s) || p.category.toLowerCase().includes(s))
    }
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }
    return list
  }, [data, search, category])

  if (loading) return <Loading label="Loading products..." />
  if (error) return <ErrorBox message={error} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-medium">Top Products</h2>
          <p className="text-sm text-gray-500">From FastAPI ML Model</p>
        </div>
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="border rounded px-3 py-2" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Name</Th>
              <Th>Product ID</Th>
              <Th>Category</Th>
              <Th className="text-right">Predicted Sales</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">Current Stock</Th>
              <Th className="text-right">Sales Growth</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.productId} className="border-t">
                <Td>{p.name}</Td>
                <Td>{p.productId}</Td>
                <Td>{p.category}</Td>
                <Td align="right">{currency(p.predictedSales)}</Td>
                <Td align="right">{currency(p.price)}</Td>
                <Td align="right">{p.currentStock.toLocaleString()}</Td>
                <Td align="right" className={p.salesGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {(p.salesGrowth * 100).toFixed(1)}%
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, className = '' }: { children: any; className?: string }) {
  return <th className={`text-left px-3 py-2 font-medium text-gray-700 ${className}`}>{children}</th>
}
function Td({ children, align = 'left' as 'left' | 'right' | 'center', className = '' }: { children: any; align?: 'left' | 'right' | 'center'; className?: string }) {
  return <td className={`px-3 py-2 ${className}`} style={{ textAlign: align }}>{children}</td>
}
function currency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
