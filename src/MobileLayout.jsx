import React, { Suspense, lazy } from 'react';
import { Users, Grid, Zap, Mic, Shield } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { Toast } from './components';

const ElXI = lazy(() => import('./tabs/ElXI'));
const Pizarra = lazy(() => import('./tabs/Pizarra'));
const Sesiones = lazy(() => import('./tabs/Sesiones'));
const TuVoz = lazy(() => import('./tabs/TuVoz'));
const ElEquipo = lazy(() => import('./tabs/ElEquipo'));

const MobileLayout = () => {
  const { tab, setTab, rol, setRol, online } = useAppContext();

  const tabs = [
    { id: 'elxi', icon: Users, label: 'El XI' },
    { id: 'pizarra', icon: Grid, label: 'Pizarra' },
    { id: 'sesiones', icon: Zap, label: 'Sesiones' },
    { id: 'tuvoz', icon: Mic, label: 'Tu Voz' },
    { id: 'elequipo', icon: Shield, label: 'El Equipo' }
  ];

  const renderContent = () => {
    switch (tab) {
      case 'elxi': return <ElXI />;
      case 'pizarra': return <Pizarra />;
      case 'sesiones': return <Sesiones />;
      case 'tuvoz': return <TuVoz />;
      case 'elequipo': return <ElEquipo />;
      default: return <ElXI />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-bg text-text">
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 bg-surface/90 backdrop-blur-xl border-b border-white/5"
        style={{ height: 'var(--header-h)' }}
      >
        <h1 className="font-display text-2xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          CABRERIZOS <span className="text-accent">F.C.</span>
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-accent shadow-[0_0_8px_#00ff87]' : 'bg-red-500'}`} />
            <span className="text-[10px] uppercase font-bold opacity-50">{online ? 'Online' : 'Offline'}</span>
          </div>
          
          <button 
            onClick={() => setRol(rol === 'coach' ? 'player' : 'coach')}
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform"
          >
            {rol === 'coach' ? 'Coach' : 'Jugador'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        className="flex-1 overflow-y-auto pt-[var(--header-h)] pb-[var(--nav-h)]"
        style={{ height: 'calc(100dvh - var(--header-h) - var(--nav-h))' }}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {renderContent()}
        </Suspense>
      </main>

      {/* Bottom Nav */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-surface border-t border-white/5"
        style={{ height: 'var(--nav-h)' }}
      >
        {tabs.map(({ id, icon: Icon, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 transition-all duration-150 ${active ? 'text-accent scale-110' : 'text-muted'}`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-bold uppercase">{label}</span>
            </button>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
};

export default MobileLayout;
