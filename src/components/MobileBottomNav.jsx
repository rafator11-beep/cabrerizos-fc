import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, PenTool, CalendarCheck, MoreHorizontal } from 'lucide-react';

const navItemStyle = (isActive) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  padding: '8px 6px',
  borderRadius: 14,
  textDecoration: 'none',
  color: isActive ? '#0b63ff' : '#64748b',
  background: isActive ? 'rgba(11,99,255,.10)' : 'transparent',
  fontWeight: 800,
  fontSize: 11,
});

export default function MobileBottomNav({ onMore }) {
  const NAV = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/mi-sesion', label: 'Mi sesión', icon: CalendarCheck },
    { to: '/entrenamientos', label: 'Entrenos', icon: Dumbbell },
    { to: '/tactica', label: 'Táctica', icon: PenTool },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        padding: '10px 12px calc(10px + env(safe-area-inset-bottom))',
        background: 'rgba(255,255,255,.86)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(15,23,42,.10)',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            style={({ isActive }) => navItemStyle(isActive)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onMore}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '8px 6px',
            borderRadius: 14,
            border: 'none',
            background: 'transparent',
            color: '#64748b',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: 11,
          }}
        >
          <MoreHorizontal size={18} />
          <span>Más</span>
        </button>
      </div>
    </nav>
  );
}

