import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Importance from './pages/churn/Importance'
import ChurnLayout from './pages/churn/Layout'
import Metrics from './pages/churn/Metrics'
import TopChurners from './pages/churn/TopChurners'
import CustomerSegments from './pages/CustomerSegments'
import Forecast from './pages/Forecast'
import TopProducts from './pages/TopProducts'
import Trends from './pages/Trends'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">BNP Analytics Dashboard</h1>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/forecast" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}>Forecast</NavLink>
            <NavLink to="/top-products" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}>Top Products</NavLink>
            <NavLink to="/trends" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}>Trends</NavLink>
            <NavLink to="/segments" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}>Segments</NavLink>
            <NavLink to="/churn" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}>Churn</NavLink>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/forecast" replace />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/top-products" element={<TopProducts />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/segments" element={<CustomerSegments />} />
          <Route path="/churn" element={<ChurnLayout />}>
            <Route index element={<Navigate to="metrics" replace />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="importance" element={<Importance />} />
            <Route path="top-churners" element={<TopChurners />} />
          </Route>
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </div>
  )
}
