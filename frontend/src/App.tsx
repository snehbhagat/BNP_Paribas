import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import ChurnAnalysis from './pages/ChurnAnalysis'
import CustomerSegmentation from './pages/CustomerSegmentation'
import Dashboard from './pages/Dashboard'
import HighRiskCustomers from './pages/HighRiskCustomers'
import InventoryManagement from './pages/InventoryManagement'
import SalesForecasting from './pages/SalesForecasting'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/high-risk-customers" element={<HighRiskCustomers />} />
          <Route path="/churn-analysis" element={<ChurnAnalysis />} />
          <Route path="/customer-segmentation" element={<CustomerSegmentation />} />
          <Route path="/sales-forecasting" element={<SalesForecasting />} />
          <Route path="/inventory-management" element={<InventoryManagement />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
