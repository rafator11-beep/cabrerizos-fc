import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Users, Dumbbell, Trophy, Target } from 'lucide-react';

export default function StatsOverview() {
  const [stats, setStats] = useState({ players: 0, trainings: 0, plays: 0, techniques: 0, avgRating: 0, topScorer: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rosterRes, trainingsRes, playsRes, techRes] = await Promise.all([
          supabase.from('roster').select('id, name, number, stats'),
          supabase.from('trainings').select('id'),
          supabase.from('plays').select('id'),
          supabase.from('technique').select('id'),
        ]);

        const players = rosterRes.data || [];
        const withGoals = players.filter(p => (p.stats?.goals || 0) > 0).sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0));
        const withRating = players.filter(p => (p.stats?.rating || 0) > 0);
        const avgRating = withRating.length > 0 ? (withRating.reduce((s, p) => s + p.stats.rating, 0) / withRating.length).toFixed(1) : '-';

        setStats({
          players: players.length,
          trainings: (trainingsRes.data || []).length,
          plays: (playsRes.data || []).length,
          techniques: (techRes.data || []).length,
          avgRating,
          topScorer: withGoals[0] || null,
        });
      } catch (e) { console.error('StatsOverview error:', e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="card h-24 animate-pulse" />;

  const items = [
    { icon: <Users size={16} />, label: 'Jugadores', value: stats.players, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: <Dumbbell size={16} />, label: 'Sesiones', value: stats.trainings, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: <Target size={16} />, label: 'Jugadas', value: stats.plays, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: <TrendingUp size={16} />, label: 'Val. Media', value: stats.avgRating, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Trophy size={14} className="text-amber-500" />
        <span className="text-[10px] font-black text-muted uppercase tracking-widest">Resumen Temporada</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
        {items.map(item => (
          <div key={item.label} className="p-4 text-center hover:bg-white/[0.02] transition-colors">
            <div className={`w-8 h-8 ${item.bg} rounded-xl mx-auto flex items-center justify-center ${item.color} mb-2`}>{item.icon}</div>
            <div className="text-xl font-black text-white">{item.value}</div>
            <div className="text-[8px] font-bold text-muted uppercase tracking-widest">{item.label}</div>
          </div>
        ))}
      </div>
      {stats.topScorer && (
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted">⚽ Máximo goleador</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white">{stats.topScorer.name}</span>
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-black rounded-full">{stats.topScorer.stats.goals} goles</span>
          </div>
        </div>
      )}
    </div>
  );
}
