import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Home from './pages/Home';
import Pizarra from './pages/Pizarra';
import Feedback from './pages/Feedback';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#111827', color: 'white' }}>
        Cargando Cabrerizos FC...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="pizarra" element={<Pizarra />} />
        <Route path="feedback" element={<Feedback />} />
        {/* Placeholder for other routes like sessions, physical, players */}
      </Route>
    </Routes>
  );
}
