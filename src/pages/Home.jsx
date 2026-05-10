import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, Dumbbell, PenTool, Users, LayoutGrid,
  Star, ChevronRight, Activity, Trophy, MessageSquare, Plus
} from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import NextSession from '../components/NextSession';
import SeasonCalendar from '../components/SeasonCalendar';
import QuickNotes from '../components/QuickNotes';
import StatsOverview from '../components/StatsOverview';
import AdminDashboard from '../components/AdminDashboard';

export default function Home() {
  const { profile, isRealAdmin, user } = useAuth();
  const isMobile = useIsMobile();
  const isAdmin = isRealAdmin;
  const isAdminMobile = isAdmin && isMobile;
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  const displayName = profile?.name || (isAdmin ? 'Míster' : 'Jugador');

  const [playerCount, setPlayerCount] = useState(0);
  const [trainingCount, setTrainingCount] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [recentTraining, setRecentTraining] = useState(null);
  const [upcomingTraining, setUpcomingTraining] = useState(null);
  const [myScores, setMyScores] = useState([]);
  const [myRosterId, setMyRosterId] = useState(null);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const [rosterRes, trainingsRes, playsRes, recentRes, upcomingRes] = await Promise.all([
        supabase.from('roster').select('id'),
        supabase.from('trainings').select('id'),
        supabase.from('plays').select('id'),
        supabase.from('trainings').select('*').order('date', { ascending: false }).limit(1),
        supabase.from('trainings').select('*').gte('date', todayStr).order('date', { ascending: true }).limit(1),
      ]);
      setPlayerCount((rosterRes.data || []).length);
      setTrainingCount((trainingsRes.data || []).length);
      setPlayCount((playsRes.data || []).length);
      if (recentRes.data?.[0]) setRecentTraining(recentRes.data[0]);
      if (upcomingRes.data?.[0]) setUpcomingTraining(upcomingRes.data[0]);

      if (!isAdmin && user?.id) {
        try {
          const [scoresRes, rosterIdRes] = await Promise.all([
            supabase.from('training_scores').select('*, trainings(*)').eq('player_id', user.id).order('created_at', { ascending: false }).limit(3),
            supabase.from('roster').select('id').eq('auth_profile_id', user.id).maybeSingle(),
          ]);
          setMyScores(scoresRes.data || []);
          if (rosterIdRes.data) setMyRosterId(rosterIdRes.data.id);
        } catch (e) {
          console.warn('Roster fetch failed (RLS):', e);
        }
      }
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    }
  };

  const stats = [
    { v: playerCount,   l: 'Plantilla', c: 'text-accent',       bg: 'bg-accent/10',       icon: <Users size={18} /> },
    { v: trainingCount, l: 'Sesiones',  c: 'text-emerald-500',  bg: 'bg-emerald-500/10',  icon: <Dumbbell size={18} /> },
    { v: playCount,     l: 'Tácticas',  c: 'text-amber-500',    bg: 'bg-amber-500/10',    icon: <PenTool size={18} /> },
    { v: 'J-B',        l: 'Equipo',    c: 'text-rose-500',     bg: 'bg-rose-500/10',     icon: <Trophy size={18} /> },
  ];

  const quickLinks = [
    { to: '/entrenamientos', label: 'Sesiones',  icon: <Dumbbell size={20} />, color: 'bg-emerald-500/10 text-emerald-500' },
    { to: '/tactica',        label: 'Táctica',   icon: <PenTool size={20} />,  color: 'bg-amber-500/10 text-amber-500'    },
    { to: '/plantilla',      label: 'Plantilla', icon: <Users size={20} />,    color: 'bg-indigo-500/10 text-indigo-500'  },
    { to: '/alineacion',     label: 'Once',      icon: <LayoutGrid size={20} />,color: 'bg-rose-500/10 text-rose-500'    },
  ];

  const fieldSession = upcomingTraining || recentTraining;

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in p-4 md:p-10">

      {/* ── HERO ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-[0.2em] opacity-80">
          <Calendar size={12} /> {today}
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">
          ¡Hola, <span className="text-accent">{displayName}</span>!
        </h1>
        <p className="text-muted text-xs font-medium max-w-md opacity-60">
          {isAdmin ? 'Panel técnico del Juvenil B.' : 'Portal del jugador · Juvenil B.'}
        </p>
      </div>

      {/* ── ADMIN DESKTOP ── */}
      {isAdmin && <AdminDashboard />}

      {/* ── ADMIN MÓVIL — Modo Campo ── */}
      {isAdminMobile && (
        <div className="space-y-4">
          {/* Sesión del día */}
          <div className="bg-surface rounded-3xl border border-white/5 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
              <Dumbbell size={72} />
            </div>
            <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">
              {upcomingTraining ? 'Próxima Sesión' : 'Última Sesión'}
            </div>
            {fieldSession ? (
              <>
                <h2 className="text-lg font-black text-white mb-1">{fieldSession.title}</h2>
                <div className="flex items-center gap-3 text-muted text-[10px] font-bold mb-4">
                  <span className="flex items-center gap-1"><Calendar size={11} />{fieldSession.date}</span>
                  {fieldSession.duration && <span className="flex items-center gap-1"><Clock size={11} />{fieldSession.duration}'</span>}
                </div>
                <Link
                  to="/entrenamientos"
                  className="w-full py-3 rounded-2xl bg-accent text-bg font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
                >
                  <Dumbbell size={15} /> Gestionar Sesión
                </Link>
              </>
            ) : (
              <Link
                to="/entrenamientos"
                className="mt-2 w-full py-3 rounded-2xl bg-accent text-bg font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Nueva Sesión
              </Link>
            )}
          </div>

          {/* Atajos campo */}
          <div className="grid grid-cols-3 gap-3">
            <Link to="/tactica" className="bg-surface rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <PenTool size={18} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">Táctica</span>
            </Link>
            <Link to="/plantilla" className="bg-surface rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Users size={18} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">Plantilla</span>
            </Link>
            <Link to="/feedback" className="bg-surface rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <MessageSquare size={18} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">Feedback</span>
            </Link>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: playerCount,   l: 'Jugadores', c: 'text-accent' },
              { v: trainingCount, l: 'Sesiones',  c: 'text-emerald-400' },
              { v: playCount,     l: 'Jugadas',   c: 'text-amber-400' },
            ].map(s => (
              <div key={s.l} className="bg-surface rounded-2xl border border-white/5 p-3 text-center">
                <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                <div className="text-[9px] font-bold text-muted/50 uppercase tracking-widest mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL (jugadores + admin desktop) ── */}
      <div className={isAdmin ? 'hidden md:block space-y-8' : 'space-y-6'}>
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(x => (
            <div key={x.l} className="card !p-5 flex flex-col items-start justify-between min-h-[120px] md:min-h-[160px] active:scale-95 transition-all">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${x.bg} ${x.c} rounded-2xl flex items-center justify-center`}>
                {x.icon}
              </div>
              <div>
                <div className="text-2xl md:text-4xl font-black text-white leading-none">{x.v}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted/50 mt-1">{x.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {!isAdmin ? (
            /* Jugador: próxima sesión con grupo asignado */
            <NextSession training={upcomingTraining || recentTraining} myRosterId={myRosterId} />
          ) : (
            /* Admin desktop: último entreno */
            <div className="card !p-0 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Última Sesión</span>
                <Activity size={14} className="text-emerald-500" />
              </div>
              <div className="p-6 flex-1">
                {recentTraining ? (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white leading-tight">{recentTraining.title}</h4>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-muted uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {recentTraining.date}</span>
                      {recentTraining.duration && <span className="flex items-center gap-1.5"><Clock size={14} /> {recentTraining.duration}'</span>}
                    </div>
                    <Link to="/entrenamientos" className="inline-flex items-center gap-2 text-accent text-[11px] font-black uppercase tracking-widest hover:gap-3 transition-all">
                      GESTIONAR <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="py-8 text-center opacity-30 flex flex-col items-center gap-2">
                    <Dumbbell size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin sesiones</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evaluaciones (jugador) */}
          {!isAdmin && (
            <div className="card !p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Mis Valoraciones</span>
                <Star size={14} className="text-amber-500" />
              </div>
              <div className="p-5">
                {myScores.length > 0 ? (
                  <div className="space-y-3">
                    {myScores.map(s => (
                      <div key={s.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="text-2xl font-black text-accent">{s.score}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{s.trainings?.title}</div>
                          <div className="text-[9px] text-muted font-medium">{s.trainings?.date}</div>
                        </div>
                        {s.comment && <div className="text-[10px] text-muted truncate max-w-[100px]">💬 {s.comment}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center opacity-20 flex flex-col items-center gap-2">
                    <Star size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin valoraciones aún</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Atajos rápidos */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted/40 ml-1">Atajos Rápidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map(link => (
              <Link key={link.to} to={link.to} className="group">
                <div className="card !p-6 flex flex-col items-center justify-center text-center gap-3 group-hover:border-accent/40 group-active:scale-95 transition-all">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${link.color} transition-transform group-hover:scale-110`}>
                    {link.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">
                    {link.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SeasonCalendar />
          {isAdmin && <QuickNotes />}
        </div>
      </div>
    </div>
  );
}
