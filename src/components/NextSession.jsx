import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, AlertTriangle, Map, ChevronDown, ChevronUp, Users } from 'lucide-react';
import FieldCanvas from './FieldCanvas';

const NOMENCLATURE_COLORS = [
  { id: 'red',    label: 'Rojo',     hex: '#ef4444', bg: 'bg-red-500/15',     text: 'text-red-400'     },
  { id: 'yellow', label: 'Amarillo', hex: '#facc15', bg: 'bg-yellow-500/15',  text: 'text-yellow-400'  },
  { id: 'green',  label: 'Verde',    hex: '#22c55e', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  { id: 'blue',   label: 'Azul',     hex: '#3b82f6', bg: 'bg-blue-500/15',    text: 'text-blue-400'    },
  { id: 'pink',   label: 'Rosa',     hex: '#ec4899', bg: 'bg-pink-500/15',    text: 'text-pink-400'    },
];

export default function NextSession({ training, myRosterId }) {
  const [tacticalRoles, setTacticalRoles] = useState([]);
  const [visualModeIndex, setVisualModeIndex] = useState(null);

  useEffect(() => {
    if (myRosterId) fetchTacticalRoles();
  }, [myRosterId]);

  const fetchTacticalRoles = async () => {
    const { data } = await supabase.from('plays').select('*');
    if (!data) return;
    const myRoles = [];
    data.forEach(play => {
      const tokens = play.tokens?.[0]?.tokens || [];
      const playComment = play.tokens?.[0]?.playComment || '';
      const myToken = tokens.find(t => t.assigned_player_id === myRosterId);
      if (myToken && (myToken.tactical_role || myToken.tactical_note || playComment)) {
        myRoles.push({
          playName: play.name,
          category: play.category,
          role: myToken.tactical_role || '',
          note: myToken.tactical_note || '',
          playComment,
        });
      }
    });
    setTacticalRoles(myRoles);
  };

  if (!training) return (
    <div className="bg-surface rounded-3xl border border-white/5 p-10 text-center">
      <Calendar size={32} className="mx-auto mb-3 text-muted/30" />
      <p className="text-xs font-black uppercase tracking-widest text-muted/40">Sin sesiones programadas</p>
    </div>
  );

  const getMyGroup = (exercise) => {
    const ga = exercise.group_assignments;
    if (!ga) return null;
    if (ga.teamA?.includes(myRosterId)) return { label: 'Petos',    hex: '#3b82f6', bg: 'bg-blue-500/15',    text: 'text-blue-400'    };
    if (ga.teamB?.includes(myRosterId)) return { label: 'Sin Peto', hex: '#ef4444', bg: 'bg-red-500/15',     text: 'text-red-400'     };
    if (ga.jokers?.includes(myRosterId)) return { label: 'Comodín', hex: '#facc15', bg: 'bg-yellow-500/15',  text: 'text-yellow-400'  };
    for (const c of NOMENCLATURE_COLORS) {
      if (ga[c.id]?.includes(myRosterId)) return c;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* ── Alerta táctica ── */}
      {tacticalRoles.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest mb-3">
            <AlertTriangle size={14} /> Atención Táctica
          </div>
          <div className="space-y-2">
            {tacticalRoles.map((r, i) => (
              <div key={i} className="bg-black/20 rounded-xl p-3 border border-amber-500/10">
                <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">
                  {r.category || 'Estrategia'} · {r.playName}
                </div>
                {r.role && <div className="text-sm font-bold text-white">{r.role}</div>}
                {r.note && <div className="text-xs text-white/60 mt-1 leading-relaxed">{r.note}</div>}
                {r.playComment && <div className="text-xs text-amber-300/70 mt-2 leading-relaxed">{r.playComment}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sesión principal ── */}
      <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden">
        <div className="h-1 w-full bg-emerald-500" />
        <div className="p-5">
          <div className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Próxima Sesión</div>
          <h3 className="text-lg font-black text-white mb-3">{training.title}</h3>
          <div className="flex items-center gap-4 text-muted mb-5 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px] font-bold">
              <Calendar size={12} /> {training.date}
            </span>
            {training.duration && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold">
                <Clock size={12} /> {training.duration}'
              </span>
            )}
            {(training.exercises || []).length > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold">
                <Users size={12} /> {training.exercises.length} ejercicios
              </span>
            )}
          </div>

          {(training.exercises || []).length > 0 && (
            <div className="space-y-2">
              <div className="text-[9px] font-black text-muted/40 uppercase tracking-widest mb-2">Tu plan de sesión</div>
              {(training.exercises || []).map((ex, i) => {
                const myGroup = getMyGroup(ex);
                const hasCanvas = ex.canvas_tokens?.length > 0;
                const isOpen = visualModeIndex === i;

                return (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-muted flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{ex.name}</div>
                        {myGroup ? (
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black ${myGroup.bg} ${myGroup.text}`}>
                            Equipo {myGroup.label}
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted/40 font-bold mt-1 block">Sin grupo asignado</span>
                        )}
                      </div>
                      {hasCanvas && (
                        <button
                          onClick={() => setVisualModeIndex(isOpen ? null : i)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-muted uppercase tracking-wide hover:text-white transition-colors flex-shrink-0"
                        >
                          <Map size={10} />
                          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                      )}
                    </div>

                    {isOpen && ex.image && (
                      <div className="h-56 bg-bg border-t border-white/5">
                        <FieldCanvas
                          tool="view"
                          tokens={ex.canvas_tokens.map(t => ({
                            ...t,
                            kind: 'player',
                            label: 'TÚ',
                            assigned_player_id: t.id,
                            color: myGroup?.hex || '#3b82f6',
                          }))}
                          backgroundImage={`${import.meta.env.BASE_URL}exercises/${ex.image}`}
                          myRosterId={myRosterId}
                          animating={true}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
