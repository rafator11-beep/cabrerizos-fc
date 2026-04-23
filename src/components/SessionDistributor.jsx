import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Save, X, UserCheck, Maximize2, Map } from 'lucide-react';
import FieldCanvas from './FieldCanvas';

const NOMENCLATURE_COLORS = [
  { id: 'red', label: 'Rojo', hex: '#ef4444', border: '#f87171', text: '#7f1d1d' },
  { id: 'yellow', label: 'Amarillo', hex: '#facc15', border: '#fde047', text: '#713f12' },
  { id: 'green', label: 'Verde', hex: '#22c55e', border: '#4ade80', text: '#14532d' },
  { id: 'blue', label: 'Azul', hex: '#3b82f6', border: '#60a5fa', text: '#1e3a8a' },
  { id: 'pink', label: 'Rosa', hex: '#ec4899', border: '#f472b6', text: '#831843' },
];

export default function SessionDistributor({ activeTraining, players, onClose, onSave }) {
  const [attendees, setAttendees] = useState(activeTraining.attendees || players.map(p => p.id));
  
  // Normalize exercises to have the new nomenclature structure and canvas_tokens
  const [exercises, setExercises] = useState(
    (activeTraining.exercises || []).map(ex => {
      const ga = ex.group_assignments || {};
      return {
        ...ex,
        group_assignments: {
          red: ga.red || ga.teamB || [],
          yellow: ga.yellow || ga.jokers || [],
          green: ga.green || [],
          blue: ga.blue || ga.teamA || [],
          pink: ga.pink || [],
        },
        canvas_tokens: ex.canvas_tokens || []
      };
    })
  );

  const [activeVisualExercise, setActiveVisualExercise] = useState(null);

  const toggleAttendance = (playerId) => {
    if (attendees.includes(playerId)) {
      setAttendees(attendees.filter(id => id !== playerId));
      setExercises(exercises.map(ex => {
        const newGa = { ...ex.group_assignments };
        Object.keys(newGa).forEach(k => { newGa[k] = newGa[k].filter(id => id !== playerId); });
        return { ...ex, group_assignments: newGa, canvas_tokens: ex.canvas_tokens.filter(t => t.id !== playerId) };
      }));
    } else {
      setAttendees([...attendees, playerId]);
    }
  };

  const cycleGroup = (exerciseIndex, playerId) => {
    const ex = { ...exercises[exerciseIndex] };
    const ga = { ...ex.group_assignments };
    
    // Find current group
    let currentGroup = null;
    Object.keys(ga).forEach(k => {
      if (ga[k].includes(playerId)) {
        currentGroup = k;
        ga[k] = ga[k].filter(id => id !== playerId);
      }
    });

    if (!currentGroup) {
      ga.red.push(playerId);
    } else {
      const idx = NOMENCLATURE_COLORS.findIndex(c => c.id === currentGroup);
      if (idx !== -1 && idx < NOMENCLATURE_COLORS.length - 1) {
        ga[NOMENCLATURE_COLORS[idx + 1].id].push(playerId);
      }
      // If it was the last color, it goes to none (Free)
    }
    
    const newEx = [...exercises];
    newEx[exerciseIndex] = { ...ex, group_assignments: ga };
    setExercises(newEx);
  };

  const getPlayerGroupStyle = (exercise, playerId) => {
    const ga = exercise.group_assignments;
    for (const color of NOMENCLATURE_COLORS) {
      if (ga[color.id].includes(playerId)) {
        return { bg: `${color.hex}22`, color: color.text, border: color.border, label: color.label, hex: color.hex };
      }
    }
    return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Libre', hex: '#cbd5e1' };
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase.from('trainings').update({
        attendees,
        exercises
      }).eq('id', activeTraining.id).select().single();
      
      if (error) throw error;
      onSave(data);
    } catch (e) {
      alert("Error guardando la distribución.");
    }
  };

  const updateTokenPos = (exerciseIndex, playerId, x, y) => {
    const newEx = [...exercises];
    let tokens = [...(newEx[exerciseIndex].canvas_tokens || [])];
    const existing = tokens.find(t => t.id === playerId);
    if (existing) {
      existing.x = x; existing.y = y;
    } else {
      tokens.push({ id: playerId, x, y });
    }
    newEx[exerciseIndex].canvas_tokens = tokens;
    setExercises(newEx);
  };

  const attendingPlayers = players.filter(p => attendees.includes(p.id));

  // --- VISUAL MODE RENDER ---
  if (activeVisualExercise !== null) {
    const exIndex = activeVisualExercise;
    const ex = exercises[exIndex];
    
    // Build tokens for the canvas based on attending players
    const canvasTokens = attendingPlayers.map((p, idx) => {
      const style = getPlayerGroupStyle(ex, p.id);
      const savedPos = (ex.canvas_tokens || []).find(t => t.id === p.id);
      // Fallback position if not placed yet (line them up at the top)
      const x = savedPos ? savedPos.x : 25 + (idx * 35);
      const y = savedPos ? savedPos.y : 25;

      return {
        id: p.id,
        kind: 'player',
        x, y,
        label: p.surname ? p.surname.substring(0, 3).toUpperCase() : p.name.substring(0, 3).toUpperCase(),
        name: p.name,
        color: style.hex
      };
    });

    const bgImage = ex.image ? `${import.meta.env.BASE_URL}exercises/${ex.image}` : null;

    return (
      <div style={{ padding: '0 0 40px 0', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Smart Canvas: {ex.name}</h2>
            <div style={{ fontSize: 12, color: '#64748b' }}>Arrastra a los jugadores sobre la foto.</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveVisualExercise(null)}>
            <Save size={14} /> Listo
          </button>
        </div>
        <div style={{ flex: 1, background: '#1e293b', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
          <FieldCanvas 
            tool="move"
            tokens={canvasTokens}
            onMove={(id, x, y) => updateTokenPos(exIndex, id, x, y)}
            backgroundImage={bgImage}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Distribuidor de Sesión</h2>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{activeTraining.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}><X size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> Guardar</button>
        </div>
      </div>

      {/* ASISTENCIA */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserCheck size={16} color="#0057ff"/> 
          <span>Asistencia del Día ({attendees.length}/{players.length})</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {players.map(p => {
            const isAttending = attendees.includes(p.id);
            return (
              <button key={p.id} onClick={() => toggleAttendance(p.id)}
                style={{
                  padding: '4px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: `1.5px solid ${isAttending ? '#0057ff' : '#e2e8f0'}`,
                  background: isAttending ? '#eef3ff' : '#f8fafc',
                  color: isAttending ? '#0057ff' : '#94a3b8',
                  transition: 'all .1s'
                }}>
                {p.name} {p.surname?.charAt(0)}.
              </button>
            )
          })}
        </div>
      </div>

      {/* EJERCICIOS */}
      {exercises.map((ex, i) => (
        <div key={ex.id || i} className="card" style={{ padding: 16, marginBottom: 12, borderLeft: '4px solid #0057ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              {i + 1}. {ex.name}
            </div>
            <button className="btn btn-sm" style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8 }}
                    onClick={() => setActiveVisualExercise(i)}>
              <Map size={14} /> Pizarra Interactiva
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
            Asigna equipos haciendo clic sobre el jugador (colores oficiales).
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {attendingPlayers.map(p => {
              const style = getPlayerGroupStyle(ex, p.id);
              return (
                <div key={p.id} onClick={() => cycleGroup(i, p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', borderRadius: 8, cursor: 'pointer', userSelect: 'none',
                    background: style.bg, border: `1px solid ${style.border}`, color: style.color,
                    transition: 'all .1s'
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.8 }}>
                    {style.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {exercises.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 12 }}>
          Este entrenamiento no tiene ejercicios todavía.
        </div>
      )}
    </div>
  );
}
