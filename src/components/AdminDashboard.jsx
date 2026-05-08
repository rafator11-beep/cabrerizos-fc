import { useState } from 'react';
import { Link } from 'react-router-dom';

function DashCard({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-surface-2 rounded-2xl border border-border p-6 flex flex-col gap-4 min-h-[300px] ${className}`}>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span className="text-xl">{icon}</span>
        <h2 className="text-base font-black text-text tracking-tight">{title}</h2>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function AdminDashboard({ nextSession, roster = [], syncStatus }) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="hidden md:block w-full bg-bg min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight">Panel de Control</h1>
          <p className="text-sm text-muted mt-0.5">Cabrerizos F.C. — Vista Entrenador</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all
            ${syncing
              ? 'bg-surface-2 text-muted border border-border cursor-not-allowed'
              : 'bg-accent text-bg hover:opacity-90 active:scale-95 shadow-lg'
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {syncing ? 'Sincronizando...' : 'Forzar Sincronización'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* Próxima Sesión — 5 cols */}
        <DashCard title="Próxima Sesión" icon="📅" className="col-span-5">
          {nextSession ? (
            <div className="flex flex-col gap-3">
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                <p className="text-xs font-black text-accent uppercase tracking-widest mb-1">Fecha</p>
                <p className="text-2xl font-black text-text">{nextSession.date}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted mb-0.5">Hora</p>
                  <p className="font-bold text-text">{nextSession.time}</p>
                </div>
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted mb-0.5">Lugar</p>
                  <p className="font-bold text-text">{nextSession.location}</p>
                </div>
              </div>
              {nextSession.notes && (
                <p className="text-sm text-muted italic px-1">"{nextSession.notes}"</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-muted">Sin sesión programada</p>
            </div>
          )}
        </DashCard>

        {/* Estado de la Plantilla — 4 cols */}
        <DashCard title="Estado de la Plantilla" icon="👥" className="col-span-4">
          {roster.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 flex-wrap">
                <span className="bg-green-500/15 text-green-400 text-xs font-black px-2.5 py-1 rounded-full border border-green-500/20">
                  {roster.filter(p => p.status === 'disponible').length} Disponibles
                </span>
                <span className="bg-yellow-500/15 text-yellow-400 text-xs font-black px-2.5 py-1 rounded-full border border-yellow-500/20">
                  {roster.filter(p => p.status === 'duda').length} Dudas
                </span>
                <span className="bg-red-500/15 text-red-400 text-xs font-black px-2.5 py-1 rounded-full border border-red-500/20">
                  {roster.filter(p => p.status === 'baja').length} Bajas
                </span>
              </div>
              <div className="overflow-y-auto max-h-48 flex flex-col gap-1.5 pr-1">
                {roster.map((player, i) => (
                  <div key={player.id ?? i}
                    className="flex items-center justify-between bg-bg rounded-lg px-3 py-2.5 border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-muted w-6">#{player.number ?? i + 1}</span>
                      <span className="text-sm font-semibold text-text">{player.name}</span>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      player.status === 'disponible' ? 'bg-green-500' :
                      player.status === 'duda'       ? 'bg-yellow-400' : 'bg-red-500'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-semibold text-muted">Plantilla vacía</p>
            </div>
          )}
        </DashCard>

        {/* Accesos Rápidos — 3 cols */}
        <DashCard title="Accesos Rápidos" icon="⚡" className="col-span-3">
          <div className="flex flex-col gap-3 h-full">
            <Link
              to="/tactica"
              className="flex items-center gap-3 p-4 bg-bg hover:bg-accent/10 rounded-xl border border-border hover:border-accent/40 transition-all group"
            >
              <div className="bg-accent/15 text-accent p-2.5 rounded-lg group-hover:bg-accent group-hover:text-bg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <p className="font-black text-text text-sm">Pizarra</p>
                <p className="text-xs text-muted">Editor táctico</p>
              </div>
            </Link>

            <Link
              to="/plantilla"
              className="flex items-center gap-3 p-4 bg-bg hover:bg-accent/10 rounded-xl border border-border hover:border-accent/40 transition-all group"
            >
              <div className="bg-accent/15 text-accent p-2.5 rounded-lg group-hover:bg-accent group-hover:text-bg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-black text-text text-sm">Roster</p>
                <p className="text-xs text-muted">Gestión de plantilla</p>
              </div>
            </Link>

            <div className="mt-auto pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${
                  syncStatus === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-xs text-muted">
                  {syncStatus === 'ok' ? 'Supabase conectado' : 'Sin conexión'}
                </span>
              </div>
            </div>
          </div>
        </DashCard>

      </div>
    </div>
  );
}
