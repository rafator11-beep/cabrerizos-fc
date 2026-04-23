import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Dumbbell, PenTool, Users, LayoutGrid, Target, Star, ChevronRight, Activity, Trophy } from 'lucide-react';
import NextSession from '../components/NextSession';

export default function Home() {
  const { profile, isAdmin, user } = useAuth();
  const today = new Date().toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  
  // Use profile name, fallback to metadata, fallback to "Mister" or "Jugador"
  const displayName = profile?.name || user?.user_metadata?.name || (isAdmin ? "Míster" : "Jugador");

  const [playerCount, setPlayerCount] = useState(0);
  const [trainingCount, setTrainingCount] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [recentTraining, setRecentTraining] = useState(null);
  const [myScores, setMyScores] = useState([]);
  const [myRosterId, setMyRosterId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [{ count: pc }, { count: tc }, { count: plc }, { data: rt }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'player'),
        supabase.from('trainings').select('*', { count: 'exact', head: true }),
        supabase.from('plays').select('*', { count: 'exact', head: true }),
        supabase.from('trainings').select('*').order('date', { ascending: false }).limit(1),
      ]);
      setPlayerCount(pc || 0);
      setTrainingCount(tc || 0);
      setPlayCount(plc || 0);
      if (rt?.length > 0) setRecentTraining(rt[0]);

      if (!isAdmin && user?.id) {
        try {
          const { data: scores } = await supabase.from('training_scores')
            .select('*, trainings(*)')
            .eq('player_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);
          setMyScores(scores || []);
          
          const { data: roster, error: rosterError } = await supabase.from('roster').select('id').eq('auth_profile_id', user.id).maybeSingle();
          if (roster && !rosterError) setMyRosterId(roster.id);
        } catch (e) {
          console.warn('Roster fetch failed (likely RLS):', e);
        }
      }
    } catch { }
  };

  const stats = [
    { v: playerCount, l: "Plantilla", c: "text-accent", bg: "bg-accent/10", icon: <Users size={18} /> },
    { v: trainingCount, l: "Sesiones", c: "text-emerald-500", bg: "bg-emerald-500/10", icon: <Dumbbell size={18} /> },
    { v: playCount, l: "Tácticas", c: "text-amber-500", bg: "bg-amber-500/10", icon: <PenTool size={18} /> },
    { v: "J-B", l: "Equipo", c: "text-rose-500", bg: "bg-rose-500/10", icon: <Trophy size={18} /> }
  ];

  const quickLinks = [
    { to: '/entrenamientos', label: 'Sesiones', icon: <Dumbbell size={20} />, color: 'bg-emerald-500/10 text-emerald-500' },
    { to: '/tactica', label: 'Táctica', icon: <PenTool size={20} />, color: 'bg-amber-500/10 text-amber-500' },
    { to: '/plantilla', label: 'Plantilla', icon: <Users size={20} />, color: 'bg-indigo-500/10 text-indigo-500' },
    { to: '/alineacion', label: 'Once', icon: <LayoutGrid size={20} />, color: 'bg-rose-500/10 text-rose-500' },
  ];

  return (
<<<<<<< HEAD
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      
      {/* MINIMALIST HERO */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-[0.2em] opacity-80">
          <Calendar size={12} /> {today}
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
          ¡Hola, <span className="text-accent">{displayName}</span>!
        </h1>
        <p className="text-muted text-xs md:text-base font-medium max-w-md opacity-60">
          Central de mando del Juvenil B. Gestiona la pizarra y el equipo.
        </p>
=======
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(130deg,#0a1628,#0d2248 55%,#0a1628)", borderRadius: 13, padding: isMobile ? "16px 16px" : "22px 24px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,87,255,.18),transparent 70%)" }}/>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: .7, marginBottom: 3 }}>📅 {today}</div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "white", marginBottom: 2 }}>
          {isAdmin ? "Panel Entrenador" : `¡Hola, ${profile?.name || 'Jugador'}!`}
        </div>
        <div style={{ color: "rgba(255,255,255,.58)", fontSize: 12 }}>Temporada 2024/25 · Juveniles División Honor</div>
>>>>>>> origin/main
      </div>

      {/* STATS GRID - 2 COLUMNS ON MOBILE */}
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
<<<<<<< HEAD
=======
            <div style={{ fontSize: 10, color: "#334155", fontWeight: 650 }}>{x.l}</div>
>>>>>>> origin/main
          </div>
        ))}
      </div>

      {/* MAIN CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {!isAdmin ? (
          <NextSession training={recentTraining} myRosterId={myRosterId} />
        ) : (
          <div className="card !p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Último Entrenamiento</span>
              <Activity size={14} className="text-emerald-500" />
            </div>
            <div className="p-6 flex-1">
              {recentTraining ? (
<<<<<<< HEAD
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white leading-tight">{recentTraining.title}</h4>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-muted uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {recentTraining.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {recentTraining.duration}'</span>
                  </div>
                  <Link to="/entrenamientos" className="inline-flex items-center gap-2 text-accent text-[11px] font-black uppercase tracking-widest hover:gap-3 transition-all">
                    GESTIONAR <ChevronRight size={14} />
=======
                <>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{recentTraining.title}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span><Calendar size={11} /> {recentTraining.date}</span>
                    <span><Clock size={11} /> {recentTraining.duration} min</span>
                  </div>
                  {recentTraining.objective && (
                    <div style={{ fontSize: 11, color: "#334155" }}>🎯 {recentTraining.objective}</div>
                  )}
                  <Link to="/entrenamientos" style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 600, color: '#0057ff', textDecoration: 'none' }}>
                    Ver todos →
>>>>>>> origin/main
                  </Link>
                </div>
              ) : (
<<<<<<< HEAD
                <div className="py-8 text-center opacity-30 flex flex-col items-center gap-2">
                  <Dumbbell size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sin sesiones</p>
=======
                <div style={{ color: '#64748b', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                  No hay entrenamientos aún.
>>>>>>> origin/main
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Notas del Equipo</span>
            <Star size={14} className="text-amber-500" />
          </div>
          <div className="p-5">
            {myScores.length > 0 ? (
              <div className="space-y-3">
                {myScores.map(s => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                    <div className="text-2xl font-black text-accent">{s.score}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{s.trainings?.title}</div>
                      <div className="text-[9px] text-muted font-medium">{s.trainings?.date}</div>
                    </div>
<<<<<<< HEAD
                  </div>
                ))}
=======
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{s.trainings?.title || 'Entrenamiento'}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{s.trainings?.date}</div>
                    </div>
                    {s.comment && <div style={{ fontSize: 10, color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💬 {s.comment}</div>}
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                  Aún no tienes puntuaciones.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {isAdmin && (
          <div className="card">
            <div style={{ padding: "11px 14px", borderBottom: "1px solid #e2e6ed" }}>
              <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} color="#00b96b"/> Actividad reciente
              </span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ color: "#64748b", fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                Todo al día. Sin notificaciones nuevas.
>>>>>>> origin/main
              </div>
            ) : (
              <div className="py-8 text-center opacity-20 flex flex-col items-center gap-2">
                <Star size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest">Todo al día</p>
              </div>
            )}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* QUICK ACCESS GRID */}
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
=======
      {/* Quick links — 3 cols on mobile, 5 on desktop */}
      <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Acceso rápido</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 3 : 5}, 1fr)`, gap: 8 }}>
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: isMobile ? '12px 8px' : '14px 12px', textAlign: 'center', transition: 'all .15s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ color: link.color, marginBottom: 6 }}>{link.icon}</div>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 11 : 12, color: '#1e293b' }}>{link.label}</div>
              {!isMobile && <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{link.desc}</div>}
            </div>
          </Link>
        ))}
>>>>>>> origin/main
      </div>
    </div>
  );
}
