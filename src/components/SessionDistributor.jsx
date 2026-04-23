import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, X, UserCheck, Map, Image as ImageIcon, ChevronRight } from 'lucide-react';
import FieldCanvas from './FieldCanvas';

const GRUPOS = [
  { id: 'red',    label: 'Equipo A',  peto: 'Peto Rojo',     bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', dot: '#ef4444' },
  { id: 'yellow', label: 'Equipo B',  peto: 'Peto Amarillo', bg: '#fef9c3', color: '#854d0e', border: '#fde047', dot: '#eab308' },
  { id: 'green',  label: 'Equipo C',  peto: 'Peto Verde',    bg: '#dcfce7', color: '#166534', border: '#86efac', dot: '#22c55e' },
  { id: 'blue',   label: 'Equipo D',  peto: 'Peto Azul',     bg: '#dbeafe', color: '#1e3a8a', border: '#93c5fd', dot: '#3b82f6' },
  { id: 'pink',   label: 'Comodines', peto: 'Sin Peto',      bg: '#fce7f3', color: '#831843', border: '#f9a8d4', dot: '#ec4899' },
];

const PETO_ICONS = { red: '🔴', yellow: '🟡', green: '🟢', blue: '🔵', pink: '🩷' };

export default function SessionDistributor({ activeTraining, players, onClose, onSave }) {
  const [attendees, setAttendees] = useState(
    activeTraining.attendees?.length ? activeTraining.attendees : players.map(p => p.id)
  );

  const normalizeEx = (ex) => {
    const ga = ex.group_assignments || {};
    return {
      ...ex,
      group_assignments: {
        red:    ga.red    || ga.teamA || [],
        yellow: ga.yellow || ga.teamB || [],
        green:  ga.green  || [],
        blue:   ga.blue   || [],
        pink:   ga.pink   || ga.jokers || [],
      },
      canvas_tokens: ex.canvas_tokens || [],
    };
  };

  const [exercises, setExercises] = useState((activeTraining.exercises || []).map(normalizeEx));
  const [activeExIdx, setActiveExIdx]   = useState(0);
  const [canvasMode, setCanvasMode]     = useState(false);
  const [previewImage, setPreviewImage] = useState(false);

  const attendingPlayers = players.filter(p => attendees.includes(p.id));

  // ── Attendance ───────────────────────────────────────────────────────────
  const toggleAttendance = (pid) => {
    if (attendees.includes(pid)) {
      setAttendees(a => a.filter(id => id !== pid));
      setExercises(exs => exs.map(ex => {
        const ga = { ...ex.group_assignments };
        Object.keys(ga).forEach(k => { ga[k] = ga[k].filter(id => id !== pid); });
        return { ...ex, group_assignments: ga, canvas_tokens: ex.canvas_tokens.filter(t => t.id !== pid) };
      }));
    } else {
      setAttendees(a => [...a, pid]);
    }
  };

  // ── Group cycling: Libre → A → B → C → D → Comodín → Libre ─────────────
  const cycleGroup = (exIdx, pid) => {
    setExercises(prev => {
      const exs = [...prev];
      const ga = { ...exs[exIdx].group_assignments };
      let current = null;
      GRUPOS.forEach(g => { if (ga[g.id]?.includes(pid)) current = g.id; });
      GRUPOS.forEach(g => { ga[g.id] = (ga[g.id] || []).filter(id => id !== pid); });
      if (!current) {
        ga[GRUPOS[0].id].push(pid);
      } else {
        const idx = GRUPOS.findIndex(g => g.id === current);
        if (idx < GRUPOS.length - 1) ga[GRUPOS[idx + 1].id].push(pid);
        // last group → back to Libre (do nothing)
      }
      exs[exIdx] = { ...exs[exIdx], group_assignments: ga };
      return exs;
    });
  };

  const getPlayerGroup = (ex, pid) => {
    for (const g of GRUPOS) {
      if (ex.group_assignments[g.id]?.includes(pid)) return g;
    }
    return null;
  };

  // ── Canvas ───────────────────────────────────────────────────────────────
  const updateTokenPos = (exIdx, pid, x, y) => {
    setExercises(prev => {
      const exs = [...prev];
      const tokens = [...(exs[exIdx].canvas_tokens || [])];
      const found = tokens.find(t => t.id === pid);
      if (found) { found.x = x; found.y = y; }
      else tokens.push({ id: pid, x, y });
      exs[exIdx].canvas_tokens = tokens;
      return exs;
    });
  };

  const buildCanvasTokens = (ex) =>
    attendingPlayers.map((p, idx) => {
      const g = getPlayerGroup(ex, p.id);
      const saved = ex.canvas_tokens?.find(t => t.id === p.id);
      return {
        id: p.id, kind: 'player',
        x: saved?.x ?? 25 + idx * 38,
        y: saved?.y ?? 25,
        label: (p.surname || p.name).substring(0, 3).toUpperCase(),
        name: p.name,
        color: g?.dot ?? '#94a3b8',
      };
    });

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('trainings').update({ attendees, exercises })
        .eq('id', activeTraining.id).select().single();
      if (error) throw error;
      onSave(data);
    } catch { alert('Error al guardar. Inténtalo de nuevo.'); }
  };

  const ex = exercises[activeExIdx];

  // ── Canvas mode ───────────────────────────────────────────────────────────
  if (canvasMode && ex) {
    const bgImage = ex.image ? `${import.meta.env.BASE_URL}exercises/${ex.image}` : null;
    const canvasTokens = buildCanvasTokens(ex);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Pizarra: {ex.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Arrastra fichas sobre el diagrama.</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setCanvasMode(false)}>
            <Save size={14}/> Listo
          </button>
        </div>
        <div style={{ flex: 1, background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <FieldCanvas
            tool="move"
            tokens={canvasTokens}
            arrows={[]} zones={[]}
            onMove={(id, x, y) => updateTokenPos(activeExIdx, id, x, y)}
            backgroundImage={bgImage}
          />
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Distribuidor de Sesión</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{activeTraining.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}><X size={14}/></button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14}/> Guardar</button>
        </div>
      </div>

      {/* Attendance */}
      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserCheck size={15} color="#0057ff"/>
          Control de Asistencia
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#0057ff', background: '#eef3ff', padding: '2px 8px', borderRadius: 20 }}>
            {attendees.length}/{players.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {players.map(p => {
            const on = attendees.includes(p.id);
            return (
              <label key={p.id} onClick={() => toggleAttendance(p.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', userSelect: 'none', background: on ? '#eef3ff' : '#f8fafc', border: `1.5px solid ${on ? '#0057ff' : '#e2e8f0'}`, transition: 'all .1s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${on ? '#0057ff' : '#cbd5e1'}`, background: on ? '#0057ff' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .1s' }}>
                  {on && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: 12, fontWeight: on ? 700 : 500, color: on ? '#0057ff' : '#475569' }}>
                  {p.number ? `#${p.number} ` : ''}{p.name} {p.surname}
                </span>
                {p.position && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{p.position}</span>}
              </label>
            );
          })}
        </div>
      </div>

      {/* Exercise tabs */}
      {exercises.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
          {exercises.map((e, i) => (
            <button key={i} onClick={() => setActiveExIdx(i)}
              style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${activeExIdx === i ? '#0057ff' : '#e0e4ed'}`, background: activeExIdx === i ? '#eef3ff' : 'white', color: activeExIdx === i ? '#0057ff' : '#64748b', fontWeight: 700, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {i + 1}. {e.name}
            </button>
          ))}
        </div>
      )}

      {/* Exercise card */}
      {ex ? (
        <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
          {/* Exercise header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{ex.name}</div>
              {ex.description && (
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{ex.description}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {ex.image && (
                <button className="btn btn-outline btn-sm" onClick={() => setPreviewImage(p => !p)}>
                  <ImageIcon size={13}/> {previewImage ? 'Ocultar' : 'Ver foto'}
                </button>
              )}
              <button className="btn btn-sm" style={{ background: '#111827', color: 'white', border: 'none' }}
                onClick={() => { setCanvasMode(true); }}>
                <Map size={13}/> Pizarra
              </button>
            </div>
          </div>

          {/* Image preview */}
          {previewImage && ex.image && (
            <div style={{ padding: 12, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <img
                src={`${import.meta.env.BASE_URL}exercises/${ex.image}`}
                alt={ex.name}
                style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, background: '#fff' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Group assignment grid */}
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, color: '#96a0b5', marginBottom: 10 }}>
              Asignación de grupos — clic para ciclar
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {GRUPOS.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: g.bg, border: `1px solid ${g.border}` }}>
                  <span style={{ fontSize: 10 }}>{PETO_ICONS[g.id]}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: g.color }}>{g.label}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>⬜ Libre</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
              {attendingPlayers.map(p => {
                const g = getPlayerGroup(ex, p.id);
                const style = g
                  ? { bg: g.bg, color: g.color, border: g.border, label: g.label, icon: PETO_ICONS[g.id] }
                  : { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Libre', icon: '⬜' };
                return (
                  <div key={p.id} onClick={() => cycleGroup(activeExIdx, p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 9, cursor: 'pointer', userSelect: 'none', background: style.bg, border: `1.5px solid ${style.border}`, transition: 'all .12s' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{style.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 11, color: style.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 9, color: style.color, opacity: .7 }}>{style.label}</div>
                    </div>
                    <ChevronRight size={11} color={style.color} style={{ opacity: .5, flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary by group */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GRUPOS.map(g => {
              const members = (ex.group_assignments[g.id] || [])
                .map(id => attendingPlayers.find(p => p.id === id)?.name)
                .filter(Boolean);
              if (!members.length) return null;
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: g.bg, border: `1px solid ${g.border}` }}>
                  <span style={{ fontSize: 11 }}>{PETO_ICONS[g.id]}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: g.color }}>{g.label}:</span>
                  <span style={{ fontSize: 10, color: g.color }}>{members.join(', ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 12 }}>
          Este entrenamiento no tiene ejercicios todavía.
        </div>
      )}
    </div>
  );
}
