import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import BookingTunnel from './pages/BookingTunnel';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import OrderDetails from './pages/OrderDetails';
import PaymentResult from './pages/PaymentResult';
import VerificationRequired from './pages/VerificationRequired';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import VerifiedRoute from './components/layout/VerifiedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-900 text-white">
        <Navbar />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verification-required" element={<VerificationRequired />} />
            
            {/* Protected Routes (Clients) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking" 
              element={
                <VerifiedRoute>
                  <BookingTunnel />
                </VerifiedRoute>
              } 
            />
            <Route 
              path="/order/:id" 
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentResult mode="success" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/cancel"
              element={
                <ProtectedRoute>
                  <PaymentResult mode="cancel" />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/services" 
              element={
                <AdminRoute>
                  <AdminServices />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
