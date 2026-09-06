import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ፔጆችን ኢምፖርት ማድረግ
import AdminDashboard from './pages/AdminDashboard';
import CashierDashboard from './pages/CashierDashboard';
import SalesDashboard from './pages/SalesDashboard';
import Login from './pages/Login';
import CustomerStorefront from './pages/CustomerStorefront'; // 👈 አዲሱ የደንበኛ ፋይል

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // የተለያዩ ሮሎችን መለየት
  const isAdminOrManager = currentUser?.role_code === 'admin' || currentUser?.role_code === 'manager';
  const isCashier = currentUser?.role_code === 'cashier_sales';
  const isSales = currentUser?.role_code === 'sales' || currentUser?.role_code === 'store_loader';

  return (
    <Router>
      <Routes>
        
        {/* 🚀 1. የደንበኛ ማሳያ (Public Storefront) - ሎግ-ኢን አይጠይቅም */}
        <Route path="/" element={<CustomerStorefront />} />

        {/* 🔒 2. የሰራተኞች መግቢያ (Login Page) */}
        <Route 
          path="/login" 
          element={
            !currentUser ? (
              <Login onLogin={setCurrentUser} />
            ) : isAdminOrManager ? (
              <Navigate to="/dashboard" replace />
            ) : isCashier ? (
              <Navigate to="/cashier" replace />
            ) : (
              <Navigate to="/sales" replace />
            )
          } 
        />
        
        {/* 3. የአድሚን/ማናጀር ዳሽቦርድ */}
        <Route 
          path="/dashboard" 
          element={currentUser && isAdminOrManager ? <AdminDashboard user={currentUser} onLogout={() => setCurrentUser(null)} /> : <Navigate to="/login" replace />} 
        />

        {/* 4. የካሽር (POS) ዳሽቦርድ */}
        <Route 
          path="/cashier" 
          element={currentUser && isCashier ? <CashierDashboard user={currentUser} onLogout={() => setCurrentUser(null)} /> : <Navigate to="/login" replace />} 
        />

        {/* 5. የሻጭ (Sales Counter) ዳሽቦርድ */}
        <Route 
          path="/sales" 
          element={currentUser ? <SalesDashboard user={currentUser} onLogout={() => setCurrentUser(null)} /> : <Navigate to="/login" replace />} 
        />

      </Routes>
    </Router>
  );
}

export default App;