import { NavLink, Outlet } from 'react-router-dom'

export default function ChurnLayout() {
  const tabs = [
    { to: '/churn/metrics', label: 'Metrics' },
    { to: '/churn/importance', label: 'Feature Importance' },
    { to: '/churn/top-churners', label: 'Top Churners' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Churn Analysis</h1>
          <p className="text-sm text-gray-500">Model performance, explainability, and high-risk customers</p>
        </div>
      </div>
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `px-1 pb-2 border-b-2 text-sm ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
