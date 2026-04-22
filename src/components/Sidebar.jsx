import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PenTool, Dumbbell, Users, MessageSquare } from 'lucide-react';

export default function Sidebar() {
  const NAV = [
    { id: '', icon: <Home size={16} />, label: 'Inicio' },
    { id: 'pizarra', icon: <PenTool size={16} />, label: 'Pizarra Táctica' },
    { id: 'feedback', icon: <MessageSquare size={16} />, label: 'Feedback' },
  ];

  return (
    <aside style={{ width: 210, flexShrink: 0, background: '#111827', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '14px 13px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, background: '#0057ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 13 }}>
            CFC
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>Cabrerizos F.C.</div>
            <div style={{ color: 'rgba(255,255,255,.28)', fontSize: 9, textTransform: 'uppercase', letterSpacing: .6 }}>Juveniles · 24/25</div>
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '12px 13px 4px' }}>
        Menú
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => (
          <NavLink 
            key={item.id} 
            to={`/${item.id}`}
            end={item.id === ''}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', margin: '1px 6px', borderRadius: 7, 
              cursor: 'pointer', fontWeight: 600, fontSize: 12, transition: 'all .12s', textDecoration: 'none',
              color: isActive ? 'white' : 'rgba(255,255,255,.42)', 
              background: isActive ? 'rgba(0,87,255,.3)' : 'transparent'
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
