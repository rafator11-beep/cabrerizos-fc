import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, Eye, User, ShieldCheck, Home as HomeIcon, PenTool, Dumbbell, Users, X, ChevronRight } from 'lucide-react';

export default function DashboardLayout() {
  const { profile, isRealAdmin, viewAsPlayer, setViewAsPlayer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const switchToPlayer = () => {
    setViewAsPlayer(true);
    navigate('/mi-sesion');
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
                {isRealAdmin ? 'Panel Técnico' : 'Portal Jugador'}
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
                    !viewAsPlayer ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'
                  }`}
                >
                  ADMIN
                </button>
                <button
                  onClick={switchToPlayer}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
                    viewAsPlayer ? 'bg-amber-500 text-white shadow-lg' : 'text-muted hover:text-white'
                  }`}
                >
                  JUGADOR
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 md:gap-3 pl-3 border-l border-white/10">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <User size={18} />
              </div>
              <button 
                onClick={logout}
                className="hidden md:flex w-10 h-10 items-center justify-center hover:bg-red-500/10 rounded-xl text-muted hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* ADMIN WARNING BANNER */}
        {isRealAdmin && viewAsPlayer && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Eye size={12} /> MODO VISTA JUGADOR
            </span>
            <button onClick={switchToAdmin} className="text-[8px] font-black bg-amber-500 text-black px-3 py-1 rounded-full">
              VOLVER
            </button>
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative">
          <div className="p-4 md:p-10 max-w-7xl mx-auto pb-[100px] md:pb-10 animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* BOTTOM NAV (Mobile Only) */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-[68px] glass rounded-[28px] border border-white/10 flex items-center justify-around px-2 z-[80] shadow-2xl">
          {bottomNav.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all
                  ${isActive ? 'text-accent' : 'text-muted/60'}
                `}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-accent rounded-full absolute bottom-2 animate-pulse" />
                )}
              </NavLink>
            );
          })}
          <button 
            onClick={logout}
            className="flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl text-red-500/60"
          >
            <LogOut size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Salir</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
