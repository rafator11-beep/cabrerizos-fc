import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Home from './pages/Home';
import Tactica from './pages/Tactica';
import Entrenamientos from './pages/Entrenamientos';
import Tecnica from './pages/Tecnica';
import Plantilla from './pages/Plantilla';
import Alineacion from './pages/Alineacion';
import Feedback from './pages/Feedback';
import PlayerDashboard from './pages/PlayerDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg text-text animate-fade-in">
        <div className="w-20 h-20 bg-surface-2 rounded-3xl p-4 flex items-center justify-center mb-6 border border-border shadow-2xl animate-bounce">
          <img 
            src={import.meta.env.BASE_URL + 'escudo.png'} 
            alt="Escudo" 
            className="w-full h-full object-contain" 
          />
        </div>
        <div className="text-xl font-black tracking-tight mb-2">Cabrerizos F.C.</div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-[0.2em]">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Sincronizando Sistema
        </div>
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
        <Route path="entrenamientos" element={<Entrenamientos />} />
        <Route path="tactica" element={<Tactica />} />
        <Route path="tecnica" element={<Tecnica />} />
        <Route path="plantilla" element={<Plantilla />} />
        <Route path="alineacion" element={<Alineacion />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="mi-sesion" element={<PlayerDashboard />} />
        {/* Legacy route redirect */}
        <Route path="pizarra" element={<Navigate to="/tactica" replace />} />
      </Route>
      {/* Catch-all: redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
