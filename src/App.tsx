import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Customers from "./pages/Customers";
import Pending from "./pages/Pending";
import FinancialReport from "./pages/FinancialReport";
import Settings from "./pages/Settings";
import Login from "./components/Login";
import { DeliveryProvider, useDeliveries } from "./context/DeliveryContext";

const AppRoutes = () => {
  const { user, loading } = useDeliveries();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <Layout currentPageName="Dashboard">
            <Dashboard />
          </Layout>
        } />
        
        <Route path="/deliveries" element={
          <Layout currentPageName="Deliveries">
            <Deliveries />
          </Layout>
        } />
        
        <Route path="/customers" element={
          <Layout currentPageName="Customers">
            <Customers />
          </Layout>
        } />
        
        <Route path="/pending" element={
          <Layout currentPageName="Pending">
            <Pending />
          </Layout>
        } />
        
        <Route path="/financialreport" element={
          <Layout currentPageName="FinancialReport">
            <FinancialReport />
          </Layout>
        } />
        
        <Route path="/settings" element={
          <Layout currentPageName="Settings">
            <Settings />
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <DeliveryProvider>
      <AppRoutes />
    </DeliveryProvider>
  );
}
