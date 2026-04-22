import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { profile, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 50, flexShrink: 0, background: 'white', borderBottom: '1px solid #e2e6ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Cabrerizos F.C. Panel</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: isAdmin ? '#eef3ff' : '#ecfdf5',
              color: isAdmin ? '#0057ff' : '#059669'
            }}>
              {isAdmin ? '🔑 Entrenador' : '⚽ Jugador'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{profile?.name} {profile?.surname}</div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Cerrar sesión">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>
        
        <main style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
