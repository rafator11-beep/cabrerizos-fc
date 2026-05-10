import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FloatingTimer from '../components/FloatingTimer';
import FloatingChat from '../components/FloatingChat';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, Home as HomeIcon, PenTool, Dumbbell, Users, User, Search, MessageSquare } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

export default function DashboardLayout() {
  const { profile, isRealAdmin, viewAsPlayer, setViewAsPlayer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ── FEATURE 1: Global Keyboard Shortcuts (Ctrl+K = command palette, 1-6 = nav) ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
      if (cmdOpen && e.key === 'Escape') { setCmdOpen(false); }
      // Number keys navigate (only when not typing)
      if (!cmdOpen && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        const routes = ['/', '/entrenamientos', '/tactica', '/tecnica', '/plantilla', '/alineacion'];
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < routes.length) navigate(routes[idx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cmdOpen, navigate]);

  const switchToPlayer = () => { setViewAsPlayer(true); navigate('/'); };
  const switchToAdmin = () => { setViewAsPlayer(false); navigate('/'); };

  // Admin en campo (móvil): 4 ítems orientados al campo
  const adminMobileNav = [
    { to: '/', icon: <HomeIcon size={22} />, label: 'Campo' },
    { to: '/entrenamientos', icon: <Dumbbell size={22} />, label: 'Sesión' },
    { to: '/tactica', icon: <PenTool size={22} />, label: 'Táctica' },
    { to: '/plantilla', icon: <Users size={22} />, label: 'Plantilla' },
  ];

  // Jugador (y admin en modo jugador): 5 ítems centrados en el jugador
  const playerNav = [
    { to: '/', icon: <HomeIcon size={22} />, label: 'Inicio' },
    { to: '/mi-sesion', icon: <User size={22} />, label: 'Mi Sesión' },
    { to: '/tactica', icon: <PenTool size={22} />, label: 'Táctica' },
    { to: '/feedback', icon: <MessageSquare size={22} />, label: 'Feedback' },
    { to: '/entrenamientos', icon: <Dumbbell size={22} />, label: 'Entrenos' },
  ];

  const bottomNav = isPlayerMode ? playerNav : adminMobileNav;

  // ── FEATURE 2: Command Palette ──
  const CMD_ITEMS = [
    { label: 'Inicio', path: '/', shortcut: '1', icon: '🏠' },
    { label: 'Entrenamientos', path: '/entrenamientos', shortcut: '2', icon: '💪' },
    { label: 'Táctica', path: '/tactica', shortcut: '3', icon: '✏️' },
    { label: 'Técnica', path: '/tecnica', shortcut: '4', icon: '🎯' },
    { label: 'Plantilla', path: '/plantilla', shortcut: '5', icon: '👥' },
    { label: 'Alineación', path: '/alineacion', shortcut: '6', icon: '📋' },
    { label: 'Feedback', path: '/feedback', shortcut: '', icon: '💬' },
  ];
  const filteredCmds = cmdQuery ? CMD_ITEMS.filter(c => c.label.toLowerCase().includes(cmdQuery.toLowerCase())) : CMD_ITEMS;

  // ── FEATURE 3: Breadcrumb (current section name for desktop) ──
  const pageName = () => {
    const path = location.pathname.replace(/^\//, '');
    const map = { '': 'Inicio', 'entrenamientos': 'Entrenamientos', 'tactica': 'Pizarra Táctica', 'tecnica': 'Técnica Individual', 'plantilla': 'Plantilla', 'alineacion': 'Alineación', 'feedback': 'Feedback', 'mi-sesion': 'Mi Sesión' };
    return map[path] || path;
  };

  return (
    <div className={`${isRealAdmin && !isMobile ? 'grid grid-cols-[260px_1fr] h-screen w-screen overflow-hidden' : 'flex h-screen'} bg-bg font-main select-none text-text`}>
      
      {/* SIDEBAR */}
      <aside className={`
        ${isRealAdmin && !isMobile ? 'relative' : `
          fixed inset-y-0 left-0 z-[100] w-[260px] bg-bg border-r border-white/5 
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          md:relative md:translate-x-0 md:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && !isRealAdmin && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] md:hidden animate-fade-in"
        />
      )}

      {/* COMMAND PALETTE */}
      {cmdOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setCmdOpen(false)}>
          <div className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
              <Search size={18} className="text-muted" />
              <input className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-muted/50" placeholder="Buscar sección..." value={cmdQuery} onChange={e => setCmdQuery(e.target.value)} autoFocus />
              <kbd className="text-[9px] font-mono text-muted bg-white/5 px-2 py-1 rounded">ESC</kbd>
            </div>
            <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
              {filteredCmds.map(c => (
                <button key={c.path} onClick={() => { navigate(c.path); setCmdOpen(false); setCmdQuery(''); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/5 transition-colors">
                  <span className="text-lg">{c.icon}</span>
                  <span className="flex-1 text-sm font-bold text-white">{c.label}</span>
                  {c.shortcut && <kbd className="text-[9px] font-mono text-muted bg-white/5 px-2 py-1 rounded">{c.shortcut}</kbd>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className={`${isRealAdmin && !isMobile ? 'flex flex-col h-full overflow-hidden' : 'flex-1 flex flex-col min-w-0 relative h-full'}`}>
        
        {/* HEADER — Desktop-optimized with breadcrumb + command trigger */}
        <header className="flex-shrink-0 glass border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-40" style={{ height: 'var(--header-h)' }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className={`${isRealAdmin && !isMobile ? 'hidden' : 'md:hidden'} w-9 h-9 flex items-center justify-center bg-surface-2 rounded-xl active:scale-90 transition-transform border border-white/5`}
            >
              <Menu size={18} />
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-accent uppercase tracking-widest leading-none mb-0.5">CFC · Juvenil B</span>
              <h1 className="text-xs font-bold text-white/90">
                {isPlayerMode ? 'Portal Jugador' : 'Panel Técnico'}
              </h1>
            </div>
            {/* Desktop Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
              <span className="text-sm font-black text-white/80">{pageName()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Command Palette Trigger */}
            <button onClick={() => setCmdOpen(true)} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
              <Search size={14} className="text-muted group-hover:text-white transition-colors" />
              <span className="text-[10px] text-muted/60 font-medium">Buscar...</span>
              <kbd className="text-[8px] font-mono text-muted bg-white/5 px-1.5 py-0.5 rounded ml-2">⌘K</kbd>
            </button>

            {/* Desktop Mode Switcher */}
            {isRealAdmin && (
              <div className="hidden md:flex bg-surface-2/50 p-0.5 rounded-full border border-white/5 mr-1">
                <button
                  onClick={switchToAdmin}
                  className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${
                    !viewAsPlayer ? 'bg-accent text-bg shadow-lg' : 'text-muted hover:text-white'
                  }`}
                >
                  ADMIN
                </button>
                <button
                  onClick={switchToPlayer}
                  className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${
                    viewAsPlayer ? 'bg-accent text-bg shadow-lg' : 'text-muted hover:text-white'
                  }`}
                >
                  JUGADOR
                </button>
              </div>
            )}
            
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{profile?.name || 'Usuario'}</span>
              <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">{profile?.role || 'Visitante'}</span>
            </div>
            
            <button onClick={logout} className="w-9 h-9 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className={`${isRealAdmin && !isMobile ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto no-scrollbar'} bg-bg`} style={{ paddingBottom: isMobile ? 'calc(var(--nav-h) + var(--safe-bottom, 0px))' : '0' }}>
          <Outlet />
        </main>

        {/* Floating Training Timer & Chat */}
        <FloatingTimer />
        <FloatingChat />

        {/* MOBILE BOTTOM NAV */}
        <nav 
          className={`${isRealAdmin && !isMobile ? 'hidden' : 'md:hidden'} fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-1 z-50`}
          style={{ height: 'var(--nav-h)', paddingBottom: 'var(--safe-bottom, 0px)' }}
        >
          {bottomNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 transition-all duration-200
                ${isActive ? 'text-accent' : 'text-muted/50'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    p-2 rounded-xl transition-all duration-200
                    ${isActive ? 'bg-accent/15 shadow-[0_0_14px_rgba(0,255,135,0.1)]' : ''}
                  `}>
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
