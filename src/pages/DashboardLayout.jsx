import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

export default function DashboardLayout() {
  const { profile, isAdmin, isRealAdmin, viewAsPlayer, setViewAsPlayer, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Backdrop for mobile drawer */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 }}
        />
      )}

      {/* Sidebar: fixed column on desktop, slide-out drawer on mobile */}
      <div style={isMobile ? {
        position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
      } : {}}>
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ height: 50, flexShrink: 0, background: 'white', borderBottom: '1px solid #e2e6ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                <Menu size={22} color="#334155" />
              </button>
            )}
            <span style={{ fontWeight: 800, fontSize: 15 }}>
              {isMobile ? 'Cabrerizos FC' : 'Cabrerizos F.C. Panel'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isRealAdmin && (
              <button 
                onClick={() => setViewAsPlayer(!viewAsPlayer)} 
                className="btn btn-outline btn-sm" 
                title={viewAsPlayer ? "Volver a vista Entrenador" : "Ver como Jugador"}
                style={{ 
                  borderColor: viewAsPlayer ? '#f59e0b' : '#e2e6ed', 
                  color: viewAsPlayer ? '#d97706' : '#4a5568', 
                  background: viewAsPlayer ? '#fffbeb' : 'transparent',
                  fontWeight: 700
                }}
              >
                {viewAsPlayer ? '👁️ Admin' : '👁️ Jugador'}
              </button>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: isAdmin ? '#eef3ff' : '#ecfdf5',
              color: isAdmin ? '#0057ff' : '#059669'
            }}>
              {isAdmin ? '🔑' : '⚽'}{!isMobile && ` ${isAdmin ? 'Entrenador' : 'Jugador'}`}
            </span>
            {!isMobile && (
              <div style={{ fontWeight: 600, fontSize: 12 }}>{profile?.name} {profile?.surname}</div>
            )}
            <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Cerrar sesión">
              <LogOut size={14} />
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 18 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
