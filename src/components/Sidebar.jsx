import { NavLink } from 'react-router-dom';
import { Home, PenTool, Dumbbell, Target, Users, LayoutGrid, MessageSquare, X, CalendarCheck, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onClose, isMobile }) {
  const { isAdmin } = useAuth();

  const NAV = [
    { id: '', icon: <Home size={18} />, label: 'Inicio', show: true },
    { id: 'mi-sesion', icon: <CalendarCheck size={18} />, label: 'Mi Sesión', show: !isAdmin },
    { id: 'entrenamientos', icon: <Dumbbell size={18} />, label: 'Entrenamientos', show: true },
    { id: 'tactica', icon: <PenTool size={18} />, label: 'Táctica', show: true },
    { id: 'tecnica', icon: <Target size={18} />, label: 'Técnica', show: true },
    { id: 'plantilla', icon: <Users size={18} />, label: 'Plantilla', show: true },
    { id: 'alineacion', icon: <LayoutGrid size={18} />, label: 'Alineación', show: true },
    { id: 'feedback', icon: <MessageSquare size={18} />, label: 'Feedback', show: true },
  ];

  return (
    <aside className="w-full h-full bg-[#0a0e14] border-r border-white/5 flex flex-col overflow-hidden">
      {/* Brand Section */}
      <div className="p-6 pb-2 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 p-1.5 border border-white/10 flex items-center justify-center shadow-lg">
            <img 
              src={import.meta.env.BASE_URL + 'escudo.png'} 
              alt="Escudo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-white truncate tracking-tight">CABRERIZOS F.C.</h2>
            <p className="text-[9px] font-bold text-accent uppercase tracking-widest truncate">JUVENIL B · 24/25</p>
          </div>
          {isMobile && (
            <button onClick={onClose} className="p-2 text-muted hover:text-white">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
        <div className="px-6 mb-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] opacity-50">
          Menú Principal
        </div>
        
        <nav className="px-3 space-y-1">
          {NAV.filter(item => item.show).map(item => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              end={item.id === ''}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-accent/10 text-accent shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] border-l-2 border-accent ml-1' 
                  : 'text-muted hover:text-white hover:bg-white/[0.03]'}
              `}
            >
              <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User Badge */}
      <div className="p-4 mt-auto">
        <div className={`
          flex items-center gap-3 p-3 rounded-2xl border bg-white/[0.02]
          ${isAdmin ? 'border-accent/20' : 'border-emerald-500/20'}
        `}>
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${isAdmin ? 'bg-accent/10 text-accent' : 'bg-emerald-500/10 text-emerald-500'}
          `}>
            {isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/90">
              {isAdmin ? 'Entrenador' : 'Jugador'}
            </div>
            <div className="text-[9px] font-bold text-muted truncate">Sesión Activa</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
