# BNP Analytics - Customer Churn Prediction & Sales Forecasting

A comprehensive analytics dashboard for customer churn prediction and sales forecasting, built with React, TypeScript, Node.js, and Express.

## 🚀 Features

### Customer Churn Prediction
- **High Risk Customers**: Identify the top 10 customers most likely to churn
- **Churn Rate Trends**: Visualize churn rate patterns over time
- **Customer Segmentation**: Group customers based on churn likelihood and behavior
- **Risk Distribution**: Understand the distribution of customers across risk levels

### Sales Forecasting
- **Revenue Predictions**: Quarterly and yearly sales forecasts
- **Top Products**: Identify products with highest predicted sales
- **Sales Trends**: Analyze historical and seasonal sales patterns
- **Performance Metrics**: Track key business performance indicators

### Inventory Management
- **Demand Forecasting**: Predict product demand for optimal inventory levels
- **Stock Optimization**: Get recommendations to reduce costs and prevent stockouts
- **Category Analysis**: Understand demand patterns across product categories
- **Inventory Insights**: Monitor turnover rates and fill rates

## 🏗️ Architecture

### Frontend (React + TypeScript + Tailwind CSS)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for navigation
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios for API communication
- **Build Tool**: Vite for fast development

### Backend (Node.js + Express)
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Design**: RESTful API endpoints
- **CORS**: Cross-origin resource sharing enabled
- **Environment**: Environment variables with dotenv

### API Endpoints

#### Churn Prediction
- `GET /api/churn/high-risk` - Top 10 high-risk customers
- `GET /api/churn/trends` - Churn trends and analytics
- `GET /api/churn/predict/:customerId` - Individual churn prediction

#### Customer Management
- `GET /api/customers/segments` - Customer segmentation overview
- `GET /api/customers/segments/:segmentId` - Customers in specific segment
- `GET /api/customers/profile/:customerId` - Customer profile details

#### Sales Forecasting
- `GET /api/sales/forecast` - Sales forecasts (quarterly/yearly)
- `GET /api/sales/top-products` - Top 10 products by predicted sales
- `GET /api/sales/trends` - Sales trends and performance metrics

#### Inventory Management
- `GET /api/inventory/demand-forecast` - Demand forecasting data
- `GET /api/inventory/optimization` - Inventory optimization recommendations
- `GET /api/inventory/product/:productId/forecast` - Product-specific forecast

## 📁 Project Structure

```
BNP/
├── backend/
│   ├── routes/
│   │   ├── churn.js          # Churn prediction endpoints
│   │   ├── customers.js      # Customer segmentation endpoints
│   │   ├── sales.js          # Sales forecasting endpoints
│   │   └── inventory.js      # Inventory management endpoints
│   ├── server.js             # Express server setup
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Layout.tsx    # Main application layout
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── MetricCard.tsx
│   │   ├── pages/           # Main application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HighRiskCustomers.tsx
│   │   │   ├── CustomerSegmentation.tsx
│   │   │   ├── SalesForecasting.tsx
│   │   │   └── InventoryManagement.tsx
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/           # Utility functions
│   │   │   └── api.ts       # API service layer
│   │   ├── App.tsx          # Main React component
│   │   └── main.tsx         # Application entry point
│   └── package.json         # Frontend dependencies
└── start-servers.bat        # Script to start both servers
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the Application**
   
   **Option 1: Using the batch script (Windows)**
   ```bash
   # From the root BNP directory
   start-servers.bat
   ```

   **Option 2: Manual startup**
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server.js
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000
   - **API Health Check**: http://localhost:5000/api/health

## 📊 Dashboard Features

### Main Dashboard
- Overview of key metrics (total customers, churn rate, revenue, high-risk customers)
- Interactive charts showing churn trends and risk distribution
- Quick access to all major features
- Recent insights and notifications

### High-Risk Customers Page
- List of customers with highest churn probability
- Detailed customer information and risk factors
- Recommended retention strategies
- Interactive customer details modal

### Customer Segmentation Page
- Visual representation of customer segments
- Pie charts and bar charts for segment analysis
- Detailed segment information with customer samples
- Segment-specific metrics and characteristics

### Sales Forecasting Page
- Quarterly and yearly revenue forecasts
- Monthly sales trends visualization
- Top-performing products analysis
- Seasonal performance insights

### Inventory Management Page
- 6-month demand forecasting
- Inventory optimization recommendations
- Stock level monitoring and alerts
- Category-wise demand analysis

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
ML_API_BASE_URL=http://localhost:8000
```

### API Integration
The current implementation uses mock data for demonstration. To integrate with real ML models:

1. Deploy your ML models (e.g., using Flask or FastAPI)
2. Update the `ML_API_BASE_URL` in the `.env` file
3. Modify the API routes to call your ML endpoints instead of returning mock data

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Charts**: Hover effects, tooltips, and clickable elements
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Loading States**: Smooth loading animations and spinners
- **Error Handling**: Graceful error handling with user feedback
- **Navigation**: Intuitive sidebar navigation with active states

## 🔮 Future Enhancements

### Planned Features
- **Real-time Data**: WebSocket integration for live updates
- **Advanced Filters**: Date ranges, customer segments, product categories
- **Export Functionality**: PDF reports, CSV downloads
- **User Authentication**: Role-based access control
- **Notifications**: Email alerts for high-risk customers
- **Mobile App**: React Native mobile application

### ML Model Integration
- **Churn Prediction Model**: Integrate with scikit-learn or TensorFlow model
- **Sales Forecasting Model**: Time series forecasting with ARIMA or Prophet
- **Demand Forecasting**: Inventory optimization models
- **Customer Segmentation**: Clustering algorithms (K-means, DBSCAN)

## 📈 Performance

- **Frontend**: Optimized React components with lazy loading
- **Backend**: Efficient API responses with data pagination
- **Caching**: Future implementation of Redis for API caching
- **Database**: Ready for integration with MongoDB or PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Frontend Development**: React, TypeScript, Tailwind CSS
- **Backend Development**: Node.js, Express.js, RESTful APIs
- **Data Visualization**: Recharts, Interactive Dashboards
- **ML Integration**: Ready for Flask/FastAPI model endpoints

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.