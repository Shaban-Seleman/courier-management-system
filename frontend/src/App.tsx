import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ShipmentDashboard from './components/dashboard/ShipmentDashboard';
import OrdersPage from './components/orders/OrdersPage';
import CouriersPage from './components/couriers/CouriersPage';
import BillingPage from './components/billing/BillingPage';
import SettingsPage from './components/settings/SettingsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ShipmentDashboard />} />
          <Route path="/shipments" element={<OrdersPage />} />
          <Route path="/couriers" element={<CouriersPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
