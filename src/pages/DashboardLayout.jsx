import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, Eye, User, ShieldCheck, Home as HomeIcon, PenTool, Dumbbell, Users, X, ChevronRight } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

export default function DashboardLayout() {
  const { profile, isRealAdmin, viewAsPlayer, setViewAsPlayer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const switchToPlayer = () => {
    setViewAsPlayer(true);
    navigate('/');
  };

  const switchToAdmin = () => {
    setViewAsPlayer(false);
    navigate('/');
  };

  const bottomNav = [
    { to: '/', icon: <HomeIcon size={20} />, label: 'Inicio' },
    { to: '/entrenamientos', icon: <Dumbbell size={20} />, label: 'Entrenos' },
    { to: '/tactica', icon: <PenTool size={20} />, label: 'Táctica' },
    { to: '/plantilla', icon: <Users size={20} />, label: 'Plantilla' },
  ];

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-main select-none text-text">
      
      {/* SIDEBAR - Hidden on mobile, fixed on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-[280px] bg-bg border-r border-white/5 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={true} />
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-300"
        />
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* HEADER */}
        <header className="h-[60px] md:h-[70px] flex-shrink-0 glass border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-surface-2 rounded-xl active:scale-90 transition-transform border border-white/5"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">CFC · Juvenil B</span>
              <h1 className="text-sm font-bold text-white/90">
                {isPlayerMode ? 'Portal Jugador' : 'Panel Técnico'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Mode Switcher */}
            {isRealAdmin && (
              <div className="hidden md:flex bg-surface-2/50 p-1 rounded-full border border-white/5 mr-2">
                <button
                  onClick={switchToAdmin}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
                    !viewAsPlayer ? 'bg-accent text-bg shadow-lg' : 'text-muted hover:text-white'
                  }`}
                >
                  ADMIN
                </button>
                <button
                  onClick={switchToPlayer}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
                    viewAsPlayer ? 'bg-accent text-bg shadow-lg' : 'text-muted hover:text-white'
                  }`}
                >
                  VISTA JUGADOR
                </button>
              </div>
            )}
            
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{profile?.name || 'Usuario'}</span>
              <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">{profile?.role || 'Visitante'}</span>
            </div>
            
            <button onClick={logout} className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-[70px] md:pb-0 bg-bg">
          <Outlet />
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-bg/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 z-50">
          {bottomNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1.5 w-16 transition-all duration-300
                ${isActive ? 'text-accent' : 'text-muted opacity-60'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    p-2 rounded-2xl transition-all duration-300
                    ${isActive ? 'bg-accent/15 scale-110 shadow-[0_0_20px_rgba(0,255,135,0.1)]' : 'bg-transparent'}
                  `}>
                    {item.icon}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-80'}`}>
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
