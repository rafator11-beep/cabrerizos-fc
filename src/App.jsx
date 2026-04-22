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
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111827',
        color: 'white',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ fontSize: 40 }}>⚽</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Cargando Cabrerizos F.C...</div>
        <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>Conectando con el servidor</div>
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
      </Route>
      {/* Catch-all: redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
