import { Flame, Target, Star } from 'lucide-react';

export default function RoleVisualizer({ exercises = [], playerId, playerName }) {
  if (!playerId || !exercises.length) return null;
  
  // Find all exercises where this player is assigned
  const myAssignments = [];
  exercises.forEach((ex, i) => {
    if (!ex.assignments) return;
    Object.entries(ex.assignments).forEach(([role, assigned]) => {
      if (assigned?.id === playerId) {
        myAssignments.push({ exerciseName: ex.name, role, exerciseIndex: i, image_url: ex.image_url });
      }
    });
  });
  
  if (myAssignments.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-br from-accent/5 via-purple-500/5 to-amber-500/5 rounded-2xl border border-accent/20 p-4 space-y-3 animate-fade-in">
      {/* Hero Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Flame size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">
            🔥 Hoy tu rol es:
          </h3>
          <p className="text-xs font-bold text-white/60">
            {playerName ? `${playerName}, tienes ${myAssignments.length} asignación${myAssignments.length > 1 ? 'es' : ''}` : `${myAssignments.length} asignación${myAssignments.length > 1 ? 'es' : ''}`}
          </p>
        </div>
      </div>
      
      {/* Role Cards */}
      <div className="space-y-2">
        {myAssignments.map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-accent/20 transition-all">
            {/* Exercise thumbnail */}
            {a.image_url && (
              <div className="w-12 h-9 rounded-lg overflow-hidden bg-black/30 flex-shrink-0 border border-white/5">
                <img src={a.image_url} alt="" className="w-full h-full object-contain" />
              </div>
            )}
            
            {/* Exercise info */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-white truncate">{a.exerciseName}</div>
              <div className="text-[8px] text-muted font-medium">Ejercicio {a.exerciseIndex + 1}</div>
            </div>
            
            {/* Role Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-xl">
              <Star size={10} className="text-bg" />
              <span className="text-[10px] font-black text-bg uppercase tracking-widest">{a.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
