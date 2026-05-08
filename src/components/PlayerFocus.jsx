import { Flame, Users, ArrowRight, RotateCcw } from 'lucide-react';
import { getPlayerAssignments } from '../lib/SmartDistributor';

const TEAM_STYLES = {
  'Equipo A': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500' },
  'Equipo B': { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500' },
  'Comodín': { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500' },
  'Rotación': { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/40', badge: 'bg-white/20' },
};

export default function PlayerFocus({ exercises = [], sessionLineup, playerId, playerName }) {
  if (!playerId || !sessionLineup || !exercises.length) return null;

  const assignments = getPlayerAssignments(sessionLineup, exercises, playerId);
  if (assignments.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-accent/5 via-blue-500/5 to-rose-500/5 rounded-2xl border border-accent/20 p-4 space-y-3 animate-fade-in">
      {/* Hero */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Flame size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">
            🔥 Tu sesión de hoy
          </h3>
          <p className="text-xs font-bold text-white/60">
            {playerName || 'Jugador'} — {assignments.length} ejercicio{assignments.length !== 1 ? 's' : ''} asignado{assignments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="space-y-2">
        {assignments.map((a, i) => {
          const style = TEAM_STYLES[a.team] || TEAM_STYLES['Rotación'];
          return (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${style.bg} border ${style.border} transition-all`}>
              {/* Exercise number */}
              <span className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center text-[10px] font-black flex-shrink-0">
                {a.exerciseIndex + 1}
              </span>

              {/* Thumbnail */}
              {a.image_url && (
                <div className="w-12 h-9 rounded-lg overflow-hidden bg-black/30 flex-shrink-0 border border-white/5">
                  <img src={a.image_url} alt="" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-white truncate">{a.exerciseName}</div>
                {a.parsed && <div className="text-[8px] text-muted font-medium">Formato: {a.parsed}</div>}
              </div>

              {/* Team Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 ${style.badge} rounded-xl`}>
                {a.team === 'Comodín' ? <RotateCcw size={10} className="text-bg" /> : <Users size={10} className="text-bg" />}
                <span className="text-[9px] font-black text-bg uppercase tracking-widest whitespace-nowrap">{a.team}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
