import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, Eye } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import MobilePlayerShell from '../components/MobilePlayerShell';

export default function DashboardLayout() {
  const { profile, isRealAdmin, viewAsPlayer, setViewAsPlayer, logout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPlayerMode = !isRealAdmin || viewAsPlayer;

  // Mobile-first shell for players: bottom nav + sheet menu, no sidebar compression.
  if (isMobile && isPlayerMode) {
    return <MobilePlayerShell />;
  }

  const switchToPlayer = () => {
    setViewAsPlayer(true);
    navigate('/mi-sesion');
  };

  const switchToAdmin = () => {
    setViewAsPlayer(false);
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 }} />
      )}

      <div style={isMobile ? {
        position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
      } : {}}>
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Top header ── */}
        <header style={{ height: 50, flexShrink: 0, background: 'white', borderBottom: '1px solid #e2e6ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                <Menu size={22} color="#334155" />
              </button>
            )}
            <span style={{ fontWeight: 800, fontSize: 15 }}>
              {isMobile ? 'Cabrerizos FC' : 'Cabrerizos F.C. Panel'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* ── Mode toggle (admin only) ── */}
            {isRealAdmin && (
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 22, padding: 3, gap: 2 }}>
                <button
                  onClick={switchToAdmin}
                  style={{
                    padding: isMobile ? '5px 10px' : '5px 13px',
                    borderRadius: 18, border: 'none', cursor: 'pointer',
                    background: !viewAsPlayer ? '#111827' : 'transparent',
                    color: !viewAsPlayer ? 'white' : '#64748b',
                    fontSize: 11, fontWeight: 700,
                    transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  🔑 {!isMobile && 'Entrenador'}
                </button>
                <button
                  onClick={switchToPlayer}
                  style={{
                    padding: isMobile ? '5px 10px' : '5px 13px',
                    borderRadius: 18, border: 'none', cursor: 'pointer',
                    background: viewAsPlayer ? '#f59e0b' : 'transparent',
                    color: viewAsPlayer ? 'white' : '#64748b',
                    fontSize: 11, fontWeight: 700,
                    transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  <Eye size={12} /> {!isMobile && 'Ver como Jugador'}
                </button>
              </div>
            )}

            {/* Role badge (for non-admin users) */}
            {!isRealAdmin && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                background: '#ecfdf5', color: '#059669'
              }}>
                ⚽ Jugador
              </span>
            )}

            {!isMobile && (
              <div style={{ fontWeight: 600, fontSize: 12, color: '#334155' }}>
                {profile?.name} {profile?.surname}
              </div>
            )}

            <button onClick={logout} className="btn btn-outline btn-sm" title="Cerrar sesión">
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* ── Vista Jugador banner ── */}
        {isRealAdmin && viewAsPlayer && (
          <div style={{
            background: 'linear-gradient(90deg,#fffbeb,#fef3c7)',
            borderBottom: '1.5px solid #fde68a',
            padding: '6px 16px',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <Eye size={13} color="#d97706" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', flex: 1 }}>
              Vista Jugador activa — Estás viendo la app exactamente como la ve un jugador
            </span>
            <button onClick={switchToAdmin}
              style={{ fontSize: 10, fontWeight: 700, color: '#d97706', background: 'white', border: '1px solid #fcd34d', borderRadius: 20, padding: '2px 10px', cursor: 'pointer' }}>
              Volver a Entrenador
            </button>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 18 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
