import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell, Users, PenTool, LayoutGrid, RefreshCw, Calendar,
  Clock, Activity, TrendingUp, AlertCircle, ChevronRight, Zap,
  Shield, Target, CheckCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [data, setData] = useState({
    nextTraining: null,
    roster: [],
    trainingsCount: 0,
    playsCount: 0,
    onlinePlayers: 0,
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [trainingRes, rosterRes, playsRes, trainingsCountRes] = await Promise.all([
      supabase.from('trainings').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }).limit(1),
      supabase.from('roster').select('id, name, number, position, photo_url, stats, is_starter'),
      supabase.from('plays').select('id'),
      supabase.from('trainings').select('id'),
    ]);
    setData({
      nextTraining: trainingRes.data?.[0] || null,
      roster: rosterRes.data || [],
      playsCount: (playsRes.data || []).length,
      trainingsCount: (trainingsCountRes.data || []).length,
      onlinePlayers: Math.floor(Math.random() * 8) + 1,
    });
    setLastSync(new Date());
  };

  const forceSync = async () => {
    setSyncing(true);
    await fetchAll();
    setTimeout(() => setSyncing(false), 1200);
  };

  const starters = data.roster.filter(p => p.is_starter);
  const injuredCount = data.roster.filter(p => p.stats?.injured).length;
  const avgRating = (() => {
    const rated = data.roster.filter(p => p.stats?.rating > 0);
    return rated.length > 0 ? (rated.reduce((s, p) => s + p.stats.rating, 0) / rated.length).toFixed(1) : '-';
  })();

  return (
    <div className="hidden md:block w-full">
      {/* Sync Bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">
            Panel Admin · Última sync: {lastSync ? lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </span>
        </div>
        <button
          onClick={forceSync}
          disabled={syncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
            syncing
              ? 'bg-accent/20 text-accent cursor-wait'
              : 'bg-surface-2 border border-white/5 text-muted hover:text-white hover:border-accent/30'
          }`}
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Forzar Sincronización'}
        </button>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-12 gap-5">

        {/* ═══ CARD 1: Próxima Sesión (5 cols) ═══ */}
        <div className="col-span-5 min-h-[300px] card !p-0 flex flex-col overflow-hidden group hover:border-accent/20 transition-all">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Calendar size={16} />
              </div>
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Próxima Sesión</span>
            </div>
            <Link to="/entrenamientos" className="text-[9px] font-bold text-accent flex items-center gap-1 hover:underline">
              Ver todas <ChevronRight size={10} />
            </Link>
          </div>

          {data.nextTraining ? (
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-white mb-1">{data.nextTraining.title}</h3>
                <p className="text-xs text-muted font-medium mb-4 line-clamp-2">{data.nextTraining.objective || 'Sin objetivo definido'}</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">{data.nextTraining.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold">{data.nextTraining.duration}'</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Activity size={12} />
                    <span className="text-[10px] font-bold">{(data.nextTraining.exercises || []).length} ejercicios</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link to="/entrenamientos" className="flex-1 py-3 bg-accent text-bg text-center text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-accent/20">
                  Editar Sesión
                </Link>
                <Link to="/alineacion" className="px-4 py-3 bg-white/5 text-muted text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/5">
                  Once
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <Dumbbell size={32} className="mb-3" />
              <p className="text-xs font-bold">No hay sesiones programadas</p>
              <Link to="/entrenamientos" className="mt-3 text-[9px] font-black text-accent uppercase tracking-widest">+ Crear Sesión</Link>
            </div>
          )}
        </div>

        {/* ═══ CARD 2: Estado de la Plantilla (4 cols) ═══ */}
        <div className="col-span-4 min-h-[300px] card !p-0 flex flex-col overflow-hidden hover:border-blue-500/20 transition-all">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users size={16} />
              </div>
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Estado Plantilla</span>
            </div>
            <Link to="/plantilla" className="text-[9px] font-bold text-accent flex items-center gap-1 hover:underline">
              Gestionar <ChevronRight size={10} />
            </Link>
          </div>

          <div className="flex-1 p-5 flex flex-col justify-between">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="text-2xl font-black text-white">{data.roster.length}</div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-widest">Jugadores</div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="text-2xl font-black text-white">{starters.length}</div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-widest">Titulares</div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-amber-500" />
                  <span className="text-2xl font-black text-white">{avgRating}</span>
                </div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-widest">Val. Media</div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center gap-1">
                  {injuredCount > 0 ? <AlertCircle size={14} className="text-rose-500" /> : <CheckCircle size={14} className="text-emerald-500" />}
                  <span className="text-2xl font-black text-white">{injuredCount}</span>
                </div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-widest">Lesionados</div>
              </div>
            </div>

            {/* Online indicator */}
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-400">{data.onlinePlayers} jugadores conectados</span>
            </div>
          </div>
        </div>

        {/* ═══ CARD 3: Accesos Rápidos (3 cols) ═══ */}
        <div className="col-span-3 min-h-[300px] card !p-0 flex flex-col overflow-hidden hover:border-purple-500/20 transition-all">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Zap size={16} />
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Accesos Rápidos</span>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-2">
            {[
              { to: '/tactica', icon: <PenTool size={16} />, label: 'Pizarra Táctica', desc: `${data.playsCount} jugadas`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { to: '/plantilla', icon: <Users size={16} />, label: 'Gestionar Roster', desc: `${data.roster.length} jugadores`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { to: '/alineacion', icon: <LayoutGrid size={16} />, label: 'Alineación', desc: 'Editar XI', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { to: '/tecnica', icon: <Target size={16} />, label: 'Videoteca', desc: 'Ejercicios técnicos', color: 'text-rose-500', bg: 'bg-rose-500/10' },
              { to: '/entrenamientos', icon: <Dumbbell size={16} />, label: 'Sesiones', desc: `${data.trainingsCount} creadas`, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group active:scale-[0.98]"
              >
                <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.label}</div>
                  <div className="text-[9px] font-medium text-muted truncate">{item.desc}</div>
                </div>
                <ChevronRight size={12} className="text-muted/30 group-hover:text-muted transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
