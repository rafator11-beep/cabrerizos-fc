import { NavLink } from 'react-router-dom';
import { Home, PenTool, Dumbbell, Target, Users, LayoutGrid, MessageSquare, X, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onClose, isMobile }) {
  const { isAdmin } = useAuth();

  const NAV = [
    { id: '', icon: <Home size={16} />, label: 'Inicio', show: true },
    { id: 'mi-sesion', icon: <CalendarCheck size={16} />, label: 'Mi Sesión', show: !isAdmin },
    { id: 'entrenamientos', icon: <Dumbbell size={16} />, label: 'Entrenamientos', show: true },
    { id: 'tactica', icon: <PenTool size={16} />, label: 'Táctica', show: true },
    { id: 'tecnica', icon: <Target size={16} />, label: 'Técnica', show: true },
    { id: 'plantilla', icon: <Users size={16} />, label: 'Plantilla', show: true },
    { id: 'alineacion', icon: <LayoutGrid size={16} />, label: 'Alineación', show: true },
    { id: 'feedback', icon: <MessageSquare size={16} />, label: 'Feedback', show: true },
  ];

  return (
    <aside style={{ width: 210, flexShrink: 0, background: '#111827', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '14px 13px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src={import.meta.env.BASE_URL + 'escudo.png'} alt="Escudo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>Cabrerizos F.C.</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 8, textTransform: 'uppercase', letterSpacing: .5, lineHeight: 1.3 }}>Juvenil B · 2ª Juvenil G1<br/>Salamanca 24/25</div>
          </div>
          {isMobile && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '12px 13px 4px' }}>
        Menú
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.filter(item => item.show).map(item => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            end={item.id === ''}
            onClick={isMobile ? onClose : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 8,
              padding: isMobile ? '12px 9px' : '8px 9px',
              margin: '1px 6px', borderRadius: 7,
              cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all .12s', textDecoration: 'none',
              color: isActive ? 'white' : 'rgba(255,255,255,.42)',
              background: isActive ? 'rgba(0,87,255,.3)' : 'transparent'
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '12px 13px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 8px', borderRadius: 8,
          background: isAdmin ? 'rgba(0,87,255,.15)' : 'rgba(5,150,105,.15)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isAdmin ? '#0057ff' : '#059669',
          }} />
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: isAdmin ? '#60a5fa' : '#6ee7b7',
          }}>
            {isAdmin ? '🔑 Entrenador' : '⚽ Jugador'}
          </span>
        </div>
      </div>
    </aside>
  );
}
