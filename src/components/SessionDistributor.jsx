import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Save, X, UserCheck, Map, Image as ImageIcon, ChevronRight, Plus, Loader } from 'lucide-react';
import FieldCanvas from './FieldCanvas';
import { resolveExerciseImageSrc } from '../utils/exerciseImages';

const GRUPOS = [
  { id: 'red',    label: 'Equipo A',  peto: 'Peto Rojo',     bg: 'rgba(239,68,68,0.12)',  color: '#fca5a5', border: 'rgba(239,68,68,0.3)',   dot: '#ef4444' },
  { id: 'yellow', label: 'Equipo B',  peto: 'Peto Amarillo', bg: 'rgba(234,179,8,0.12)',  color: '#fde047', border: 'rgba(234,179,8,0.3)',    dot: '#eab308' },
  { id: 'green',  label: 'Equipo C',  peto: 'Peto Verde',    bg: 'rgba(34,197,94,0.12)',  color: '#86efac', border: 'rgba(34,197,94,0.3)',    dot: '#22c55e' },
  { id: 'blue',   label: 'Equipo D',  peto: 'Peto Azul',     bg: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)',   dot: '#3b82f6' },
  { id: 'pink',   label: 'Comodines', peto: 'Sin Peto',      bg: 'rgba(236,72,153,0.12)', color: '#f9a8d4', border: 'rgba(236,72,153,0.3)',  dot: '#ec4899' },
];

const PETO_ICONS = { red: '🔴', yellow: '🟡', green: '🟢', blue: '🔵', pink: '🩷' };

const SURFACE    = 'rgba(255,255,255,0.03)';
const SURFACE_HI = 'rgba(255,255,255,0.07)';
const BORDER     = 'rgba(255,255,255,0.08)';
const MUTED      = '#64748b';
const ACCENT     = '#00ff87';
const FREE       = { bg: 'rgba(255,255,255,0.04)', color: '#64748b', border: 'rgba(255,255,255,0.1)', label: 'Sin equipo', icon: '⬜' };

export default function SessionDistributor({ activeTraining, players, onClose, onSave }) {
  const { showToast } = useAppContext();
  const [attendees, setAttendees] = useState(
    activeTraining.attendees?.length ? activeTraining.attendees : players.map(p => p.id)
  );
  const [saving, setSaving] = useState(false);

  const normalizeGa = (ga) => ({
    red:    ga?.red    || ga?.teamA  || [],
    yellow: ga?.yellow || ga?.teamB  || [],
    green:  ga?.green  || [],
    blue:   ga?.blue   || [],
    pink:   ga?.pink   || ga?.jokers || [],
  });

  const normalizeEx = (ex) => {
    const ga = normalizeGa(ex.group_assignments);
    const stations = ex.stations?.length
      ? ex.stations.map(s => ({ ...s, group_assignments: normalizeGa(s.group_assignments) }))
      : [{ id: 's1', name: 'Posta 1', group_assignments: ga }];
    return { ...ex, group_assignments: ga, canvas_tokens: ex.canvas_tokens || [], stations };
  };

  const [exercises, setExercises] = useState((activeTraining.exercises || []).map(normalizeEx));
  const [activeExIdx, setActiveExIdx]         = useState(0);
  const [activeStationIdx, setActiveStationIdx] = useState(0);
  const [canvasMode, setCanvasMode]           = useState(false);
  const [previewImage, setPreviewImage]       = useState(false);

  const attendingPlayers = players.filter(p => attendees.includes(p.id));

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

  const cycleGroup = (exIdx, pid) => {
    setExercises(prev => {
      const exs = [...prev];
      const ex = { ...exs[exIdx] };
      const stations = ex.stations.map((s, i) => {
        if (i !== activeStationIdx) return s;
        const ga = { ...s.group_assignments };
        let current = null;
        GRUPOS.forEach(g => { if (ga[g.id]?.includes(pid)) current = g.id; });
        GRUPOS.forEach(g => { ga[g.id] = (ga[g.id] || []).filter(id => id !== pid); });
        if (!current) {
          ga[GRUPOS[0].id] = [...ga[GRUPOS[0].id], pid];
        } else {
          const idx = GRUPOS.findIndex(g => g.id === current);
          if (idx < GRUPOS.length - 1) ga[GRUPOS[idx + 1].id] = [...ga[GRUPOS[idx + 1].id], pid];
        }
        return { ...s, group_assignments: ga };
      });
      exs[exIdx] = { ...ex, stations };
      return exs;
    });
  };

  const addStation = (exIdx) => {
    setExercises(prev => {
      const exs = [...prev];
      const ex = { ...exs[exIdx] };
      const newStation = {
        id: `s${Date.now()}`,
        name: `Posta ${ex.stations.length + 1}`,
        group_assignments: { red: [], yellow: [], green: [], blue: [], pink: [] },
      };
      exs[exIdx] = { ...ex, stations: [...ex.stations, newStation] };
      return exs;
    });
    setActiveStationIdx(exercises[exIdx].stations.length);
  };

  const getPlayerGroup = (ex, pid) => {
    const ga = ex.stations[activeStationIdx]?.group_assignments || ex.group_assignments;
    for (const g of GRUPOS) {
      if (ga[g.id]?.includes(pid)) return g;
    }
    return null;
  };

  const getPlayerStationSummary = (ex, pid) => {
    return ex.stations
      .map((s, i) => {
        for (const g of GRUPOS) {
          if (s.group_assignments[g.id]?.includes(pid)) return { stationName: s.name, group: g, stationIdx: i };
        }
        return null;
      })
      .filter(Boolean);
  };

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

  const handleSave = async () => {
    setSaving(true);
    const exercisesToSave = exercises.map(ex => ({
      ...ex,
      group_assignments: ex.stations?.[0]?.group_assignments || ex.group_assignments,
    }));
    try {
      const { data, error } = await supabase
        .from('trainings').update({ attendees, exercises: exercisesToSave })
        .eq('id', activeTraining.id).select().single();
      if (error) throw error;
      showToast('Grupos guardados ✓', 'success');
      onSave(data);
    } catch {
      showToast('Error al guardar · Inténtalo de nuevo', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const ex = exercises[activeExIdx];

  // ── Canvas mode ───────────────────────────────────────────────────────────
  if (canvasMode && ex) {
    const bgImage = resolveExerciseImageSrc(ex.image);
    const canvasTokens = buildCanvasTokens(ex);
    return (
      <div className="flex flex-col gap-3" style={{ height: '80vh' }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-black text-white text-base">Pizarra · {ex.name}</div>
            <div className="text-xs text-muted mt-0.5">Mueve los jugadores sobre el campo</div>
          </div>
          <button
            onClick={() => setCanvasMode(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-bg text-xs font-black uppercase tracking-wide"
          >
            <Save size={14} /> Listo
          </button>
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: '#0f1623', border: `1px solid ${BORDER}` }}>
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
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="font-black text-white text-lg leading-tight">Armar Grupos</div>
          <div className="text-xs text-muted mt-0.5">{activeTraining.title}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-muted hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-bg text-xs font-black uppercase tracking-wide disabled:opacity-50 active:scale-95 transition-all"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando...' : 'Confirmar Grupos'}
          </button>
        </div>
      </div>

      {/* Attendance */}
      <div className="rounded-2xl mb-5 overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: BORDER }}>
          <UserCheck size={15} color={ACCENT} />
          <span className="font-black text-white text-sm">¿Quién está hoy?</span>
          <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0,255,135,0.1)', color: ACCENT }}>
            {attendees.length}/{players.length}
          </span>
        </div>
        <div className="p-3 flex flex-col gap-1.5">
          {players.map(p => {
            const on = attendees.includes(p.id);
            return (
              <label
                key={p.id}
                onClick={() => toggleAttendance(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 10, cursor: 'pointer', userSelect: 'none',
                  background: on ? 'rgba(0,255,135,0.08)' : SURFACE,
                  border: `1.5px solid ${on ? 'rgba(0,255,135,0.25)' : BORDER}`,
                  transition: 'all .1s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${on ? ACCENT : MUTED}`,
                  background: on ? ACCENT : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .1s',
                }}>
                  {on && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? '#fff' : MUTED }}>
                  {p.number ? `#${p.number} ` : ''}{p.name} {p.surname}
                </span>
                {p.position && <span style={{ marginLeft: 'auto', fontSize: 9, color: MUTED, fontWeight: 600 }}>{p.position}</span>}
              </label>
            );
          })}
        </div>
      </div>

      {/* Exercise tabs */}
      {exercises.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
          {exercises.map((e, i) => (
            <button
              key={i}
              onClick={() => setActiveExIdx(i)}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                fontWeight: 800, fontSize: 11,
                border: `1.5px solid ${activeExIdx === i ? ACCENT : BORDER}`,
                background: activeExIdx === i ? 'rgba(0,255,135,0.1)' : SURFACE,
                color: activeExIdx === i ? ACCENT : MUTED,
              }}
            >
              {i + 1}. {e.name}
            </button>
          ))}
        </div>
      )}

      {/* Exercise card */}
      {ex ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          {/* Exercise header */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{ex.name}</div>
              {ex.description && (
                <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{ex.description}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {ex.image && (
                <button
                  onClick={() => setPreviewImage(p => !p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10, border: `1px solid ${BORDER}`, background: SURFACE_HI, color: MUTED, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  <ImageIcon size={13} /> {previewImage ? 'Ocultar' : 'Ver foto'}
                </button>
              )}
              <button
                onClick={() => setCanvasMode(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10, background: 'rgba(0,255,135,0.1)', border: `1px solid rgba(0,255,135,0.2)`, color: ACCENT, cursor: 'pointer', fontSize: 11, fontWeight: 800 }}
              >
                <Map size={13} /> Pizarra
              </button>
            </div>
          </div>

          {/* Image preview */}
          {previewImage && resolveExerciseImageSrc(ex.image) && (
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderBottom: `1px solid ${BORDER}` }}>
              <img
                src={resolveExerciseImageSrc(ex.image)}
                alt={ex.name}
                style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Station tabs */}
          <div style={{ padding: '10px 14px 0', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {ex.stations.map((s, si) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStationIdx(si)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 800, fontSize: 11,
                    border: `1.5px solid ${activeStationIdx === si ? ACCENT : BORDER}`,
                    background: activeStationIdx === si ? 'rgba(0,255,135,0.1)' : SURFACE,
                    color: activeStationIdx === si ? ACCENT : MUTED,
                  }}
                >
                  {s.name}
                </button>
              ))}
              <button
                onClick={() => addStation(activeExIdx)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, border: `1.5px dashed ${BORDER}`, background: 'transparent', color: MUTED, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
              >
                <Plus size={11} /> Añadir posta
              </button>
            </div>
          </div>

          {/* Group assignment grid */}
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, color: MUTED, marginBottom: 10 }}>
              {ex.stations[activeStationIdx]?.name || 'Posta'} · Toca para cambiar equipo
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {GRUPOS.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: g.bg, border: `1px solid ${g.border}` }}>
                  <span style={{ fontSize: 12 }}>{PETO_ICONS[g.id]}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: g.color }}>{g.label}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: FREE.bg, border: `1px solid ${FREE.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: FREE.color }}>⬜ Sin equipo</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 7 }}>
              {attendingPlayers.map(p => {
                const g = getPlayerGroup(ex, p.id);
                const allAssignments = getPlayerStationSummary(ex, p.id);
                const style = g
                  ? { bg: g.bg, color: g.color, border: g.border, label: g.label, icon: PETO_ICONS[g.id] }
                  : FREE;
                return (
                  <div
                    key={p.id}
                    onClick={() => cycleGroup(activeExIdx, p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', userSelect: 'none', background: style.bg, border: `1.5px solid ${style.border}`, transition: 'all .12s' }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{style.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: style.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 10, color: style.color, opacity: .7 }}>{style.label}</div>
                      {allAssignments.length > 1 && (
                        <div style={{ fontSize: 9, color: ACCENT, fontWeight: 700, marginTop: 1 }}>
                          {allAssignments.map(a => `${a.stationName}: ${a.group.label}`).join(' · ')}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={12} color={style.color} style={{ opacity: .5, flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary by group */}
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GRUPOS.map(g => {
              const ga = ex.stations[activeStationIdx]?.group_assignments || ex.group_assignments;
              const members = (ga[g.id] || [])
                .map(id => attendingPlayers.find(p => p.id === id)?.name)
                .filter(Boolean);
              if (!members.length) return null;
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: g.bg, border: `1px solid ${g.border}` }}>
                  <span style={{ fontSize: 12 }}>{PETO_ICONS[g.id]}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: g.color }}>{g.label}:</span>
                  <span style={{ fontSize: 10, color: g.color }}>{members.join(', ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-muted text-xs font-bold">
          Añade ejercicios al entrenamiento para organizar los grupos.
        </div>
      )}
    </div>
  );
}
