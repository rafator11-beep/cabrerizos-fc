import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Dumbbell, PenTool, Users, LayoutGrid, Target, Star, TrendingUp } from 'lucide-react';

export default function Home() {
  const { profile, isAdmin, user } = useAuth();
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const [playerCount, setPlayerCount] = useState(0);
  const [trainingCount, setTrainingCount] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [recentTraining, setRecentTraining] = useState(null);
  const [myScores, setMyScores] = useState([]);

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

      // If player, fetch my recent scores
      if (!isAdmin && user?.id) {
        const { data: scores } = await supabase.from('training_scores')
          .select('*, trainings(*)')
          .eq('player_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setMyScores(scores || []);
      }
    } catch { }
  };

  const stats = [
    { v: playerCount, l: "Jugadores", c: "#0057ff", icon: <Users size={16} /> },
    { v: trainingCount, l: "Entrenamientos", c: "#10b981", icon: <Dumbbell size={16} /> },
    { v: playCount, l: "Jugadas tácticas", c: "#f59e0b", icon: <PenTool size={16} /> },
    { v: "24/25", l: "Temporada", c: "#8b5cf6", icon: <Calendar size={16} /> }
  ];

  const quickLinks = [
    { to: '/entrenamientos', label: 'Entrenamientos', icon: <Dumbbell size={18} />, color: '#10b981', desc: 'Planifica y revisa sesiones' },
    { to: '/tactica', label: 'Táctica', icon: <PenTool size={18} />, color: '#f59e0b', desc: 'Pizarra y jugadas' },
    { to: '/tecnica', label: 'Técnica', icon: <Target size={18} />, color: '#3b82f6', desc: 'Ejercicios individuales' },
    { to: '/plantilla', label: 'Plantilla', icon: <Users size={18} />, color: '#8b5cf6', desc: 'Gestión de jugadores' },
    { to: '/alineacion', label: 'Alineación', icon: <LayoutGrid size={18} />, color: '#ef4444', desc: 'Onces y suplentes' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(130deg,#0a1628,#0d2248 55%,#0a1628)", borderRadius: 13, padding: "22px 24px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,87,255,.18),transparent 70%)" }}/>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: .7, marginBottom: 3 }}>📅 {today}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 2 }}>
          {isAdmin ? "Panel Entrenador" : `¡Hola, ${profile?.name || 'Jugador'}!`}
        </div>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>Temporada 2024/25 · Juveniles División Honor</div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {stats.map(x => (
          <div key={x.l} className="card" style={{ padding: "12px 14px" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ color: x.c }}>{x.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: x.c }}>{x.v}</div>
            </div>
            <div style={{ fontSize: 10, color: "#4a5568", fontWeight: 600 }}>{x.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 14 }}>
        {/* Recent training */}
        <div className="card">
          <div style={{ padding: "11px 14px", borderBottom: "1px solid #e2e6ed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dumbbell size={16} color="#10b981"/> Último entrenamiento
            </span>
          </div>
          <div style={{ padding: 14 }}>
            {recentTraining ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{recentTraining.title}</div>
                <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span><Calendar size={11} /> {recentTraining.date}</span>
                  <span><Clock size={11} /> {recentTraining.duration} min</span>
                </div>
                {recentTraining.objective && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>🎯 {recentTraining.objective}</div>
                )}
                <Link to="/entrenamientos" style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 600, color: '#0057ff', textDecoration: 'none' }}>
                  Ver todos →
                </Link>
              </>
            ) : (
              <div style={{ color: '#96a0b5', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                No hay entrenamientos aún.
              </div>
            )}
          </div>
        </div>

        {/* Player scores (only for players) */}
        {!isAdmin && (
          <div className="card">
            <div style={{ padding: "11px 14px", borderBottom: "1px solid #e2e6ed" }}>
              <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={16} color="#f59e0b"/> Mis puntuaciones
              </span>
            </div>
            <div style={{ padding: 14 }}>
              {myScores.length > 0 ? (
                myScores.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: s.score >= 7 ? '#10b981' : s.score >= 5 ? '#f59e0b' : '#ef4444', width: 30 }}>
                      {s.score}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{s.trainings?.title || 'Entrenamiento'}</div>
                      <div style={{ fontSize: 10, color: '#96a0b5' }}>{s.trainings?.date}</div>
                    </div>
                    {s.comment && <div style={{ fontSize: 10, color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💬 {s.comment}</div>}
                  </div>
                ))
              ) : (
                <div style={{ color: '#96a0b5', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
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
              <div style={{ color: "#96a0b5", fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                Todo al día. Sin notificaciones nuevas.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#96a0b5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Acceso rápido</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '14px 12px', textAlign: 'center', transition: 'all .15s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ color: link.color, marginBottom: 6 }}>{link.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#1e293b' }}>{link.label}</div>
              <div style={{ fontSize: 9, color: '#96a0b5', marginTop: 2 }}>{link.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
