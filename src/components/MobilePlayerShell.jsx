import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, LayoutGrid, Target, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MobileBottomNav from './MobileBottomNav';
import MobileSheet from './MobileSheet';

export default function MobilePlayerShell() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0b1220' }}>
      {/* App bar */}
      <header
        style={{
          flexShrink: 0,
          padding: '14px 14px 12px',
          color: 'white',
          background: 'linear-gradient(130deg,#0a1628,#0d2248 55%,#0a1628)',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={import.meta.env.BASE_URL + 'escudo.png'}
            alt="Escudo"
            style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.06)', padding: 4, objectFit: 'contain' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.1 }}>Cabrerizos F.C.</div>
            <div style={{ fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.name} {profile?.surname}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            style={{
              border: '1px solid rgba(255,255,255,.12)',
              background: 'rgba(255,255,255,.06)',
              color: 'white',
              borderRadius: 12,
              padding: '8px 10px',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Menú
          </button>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 14px calc(86px + env(safe-area-inset-bottom))',
        }}
      >
        <Outlet />
      </main>

      <MobileBottomNav onMore={() => setMoreOpen(true)} />

      <MobileSheet open={moreOpen} title="Más" onClose={() => setMoreOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => { setMoreOpen(false); navigate('/alineacion'); }}>
            <LayoutGrid size={16} /> Alineación
          </button>
          <button className="btn btn-outline" onClick={() => { setMoreOpen(false); navigate('/tecnica'); }}>
            <Target size={16} /> Técnica
          </button>
          <button className="btn btn-outline" onClick={() => { setMoreOpen(false); navigate('/plantilla'); }}>
            <Users size={16} /> Plantilla
          </button>
          <button className="btn btn-outline" onClick={() => { setMoreOpen(false); navigate('/feedback'); }}>
            <MessageSquare size={16} /> Feedback
          </button>
          <button
            className="btn btn-outline"
            onClick={async () => { setMoreOpen(false); await logout(); }}
            style={{ color: '#ef4444' }}
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </MobileSheet>
    </div>
  );
}

