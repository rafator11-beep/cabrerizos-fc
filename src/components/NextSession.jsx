import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, AlertTriangle, Map } from 'lucide-react';
import FieldCanvas from './FieldCanvas';

const NOMENCLATURE_COLORS = [
  { id: 'red', label: 'Rojo', hex: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
  { id: 'yellow', label: 'Amarillo', hex: '#facc15', bg: '#fefce8', text: '#a16207' },
  { id: 'green', label: 'Verde', hex: '#22c55e', bg: '#f0fdf4', text: '#15803d' },
  { id: 'blue', label: 'Azul', hex: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' },
  { id: 'pink', label: 'Rosa', hex: '#ec4899', bg: '#fdf2f8', text: '#be185d' },
];

export default function NextSession({ training, myRosterId }) {
  const [tacticalRoles, setTacticalRoles] = useState([]);
  const [visualModeIndex, setVisualModeIndex] = useState(null);

  useEffect(() => {
    if (myRosterId) {
      fetchTacticalRoles();
    }
  }, [myRosterId]);

  const fetchTacticalRoles = async () => {
    const { data } = await supabase.from('plays').select('*');
    if (data) {
      const myRoles = [];
      data.forEach(play => {
        const tokens = play.tokens?.[0]?.tokens || [];
        const myToken = tokens.find(t => t.assigned_player_id === myRosterId);
        if (myToken && myToken.tactical_role) {
          myRoles.push({
            playName: play.name,
            category: play.category,
            role: myToken.tactical_role
          });
        }
      });
      setTacticalRoles(myRoles);
    }
  };

  if (!training) return null;

  const getMyGroup = (exercise) => {
    const ga = exercise.group_assignments;
    if (!ga) return null;
    
    // Check old schema fallback
    if (ga.teamA?.includes(myRosterId)) return { label: 'Petos', color: '#1d4ed8', bg: '#dbeafe', hex: '#3b82f6' };
    if (ga.teamB?.includes(myRosterId)) return { label: 'Sin Peto', color: '#b91c1c', bg: '#fee2e2', hex: '#ef4444' };
    if (ga.jokers?.includes(myRosterId)) return { label: 'Comodín', color: '#b45309', bg: '#fef3c7', hex: '#facc15' };

    // New schema
    for (const color of NOMENCLATURE_COLORS) {
      if (ga[color.id] && ga[color.id].includes(myRosterId)) {
        return { label: color.label, color: color.text, bg: color.bg, hex: color.hex };
      }
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {tacticalRoles.length > 0 && (
        <div className="card" style={{ padding: 16, background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <div style={{ fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={18} /> ATENCIÓN TÁCTICA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tacticalRoles.map((r, i) => (
              <div key={i} style={{ padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 10, color: '#d97706', fontWeight: 800, textTransform: 'uppercase' }}>Estrategia | {r.playName}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>"{r.role}"</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 16, borderTop: '4px solid #10b981' }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{training.title}</div>
        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 10, marginBottom: 12 }}>
          <span><Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 2 }}/> {training.date}</span>
        </div>

        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Tu plan de sesión:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(training.exercises || []).map((ex, i) => {
            const myGroup = getMyGroup(ex);
            const hasVisual = ex.canvas_tokens && ex.canvas_tokens.length > 0;
            const isVisualOpen = visualModeIndex === i;

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#64748b' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
                      {ex.name}
                      {hasVisual && (
                        <button className="btn btn-sm" style={{ padding: '2px 8px', fontSize: 10, background: '#1e293b', color: 'white', borderRadius: 4, border: 'none' }}
                                onClick={() => setVisualModeIndex(isVisualOpen ? null : i)}>
                          <Map size={12} style={{ marginRight: 4 }}/> {isVisualOpen ? 'Ocultar Pizarra' : 'Ver tu posición'}
                        </button>
                      )}
                    </div>
                    {myGroup ? (
                      <div style={{ marginTop: 6, display: 'inline-block', padding: '4px 8px', borderRadius: 6, background: myGroup.bg, color: myGroup.color, fontSize: 11, fontWeight: 800 }}>
                        Vas con el equipo: {myGroup.label}
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>Sin grupo asignado</div>
                    )}
                  </div>
                </div>

                {isVisualOpen && ex.image && (
                  <div style={{ marginTop: 10, height: 250, background: '#1e293b', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                    <FieldCanvas 
                      tool="view"
                      tokens={ex.canvas_tokens.map(t => ({
                        ...t,
                        kind: 'player',
                        label: 'TÚ',
                        assigned_player_id: t.id,
                        color: myGroup?.hex || '#3b82f6'
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
      </div>
    </div>
  );
}
