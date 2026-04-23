import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Star, Trash2, Save, X, Image as ImageIcon, ChevronLeft, Users, PenTool } from 'lucide-react';
import EXERCISES_DATA from '../exercises_data.json';
import { useIsMobile } from '../hooks/useIsMobile';
import SessionDistributor from '../components/SessionDistributor';
import FieldCanvas from '../components/FieldCanvas';
import { resolveExerciseImageSrc } from '../utils/exerciseImages';
import { decorateExercise, EXERCISE_GROUPS } from '../utils/exerciseCatalog';

const EXERCISE_CATS = [
  { id: 'all',          label: 'Todos' },
  { id: 'tecnica',      label: 'Técnica' },
  { id: 'tactica',      label: 'Táctica' },
  { id: 'fisico',       label: 'Físico' },
  { id: 'calentamiento',label: 'Calentamiento' },
];

const INTENSITIES = [
  { id: 'baja', label: 'Baja', color: '#10b981', icon: '🟢' },
  { id: 'media', label: 'Media', color: '#f59e0b', icon: '🟡' },
  { id: 'alta', label: 'Alta', color: '#ef4444', icon: '🔴' },
];

const QUICK_EXERCISES = [
  { name: 'Calentamiento articular', description: 'Rotaciones de articulaciones de mayor a menor', duration: 8 },
  { name: 'Trote continuo', description: 'Carrera suave alrededor del campo', duration: 8 },
  { name: 'Estiramientos dinámicos', description: 'Zancadas, rodillas al pecho, talones al glúteo', duration: 7 },
  { name: 'Rondo 4v2', description: 'Posesión en cuadrado 8×8 m, 4 contra 2', duration: 10 },
  { name: 'Pases por parejas', description: 'Pase-control-recepción en movimiento', duration: 8 },
  { name: 'Conducción + regate', description: 'Slalom entre conos con cambio de ritmo', duration: 10 },
  { name: 'Sprint + recuperación', description: 'Sprints cortos 10–20 m con pausa activa', duration: 8 },
  { name: 'Fuerza y core', description: 'Plancha, cuadrupedias, puente de glúteos', duration: 10 },
  { name: 'Técnica individual', description: 'Control orientado y toque con ambas piernas', duration: 10 },
  { name: 'Juego posicional', description: 'Posesión con superioridad numérica', duration: 15 },
  { name: 'Partido reducido', description: 'Juego en espacio reducido 5v5 o 6v6', duration: 20 },
  { name: 'Vuelta a la calma', description: 'Estiramientos estáticos y relajación activa', duration: 10 },
];

const EXERCISES_CATALOG = (Array.isArray(EXERCISES_DATA) ? EXERCISES_DATA : []).map(decorateExercise);

export default function Entrenamientos() {
  const { isAdmin, profile, user } = useAuth();
  const isMobile = useIsMobile();
  const [trainings, setTrainings] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [showDistributor, setShowDistributor] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().split('T')[0],
    duration: 90, intensity: 'media', objective: '', attendees: [], exercises: [], notes: ''
  });
  const [exerciseInput, setExerciseInput] = useState({ name: '', description: '', duration: 15, image: '' });
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => { fetchTrainings(); fetchPlayers(); }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('trainings').select('*').order('date', { ascending: false });
      setTrainings(data || []);
      if (data?.length > 0) {
        setActiveTraining(data[0]);
        fetchScores(data[0].id);
      }
    } catch { }
    setLoading(false);
  };

  const fetchPlayers = async () => {
    try {
      const { data } = await supabase.from('roster').select('*').order('number');
      setPlayers(data || []);
    } catch { }
  };

  const fetchScores = async (trainingId) => {
    try {
      const { data } = await supabase.from('training_scores').select('*').eq('training_id', trainingId);
      setScores(data || []);
    } catch { }
  };

  const selectTraining = (t) => {
    setActiveTraining(t);
    fetchScores(t.id);
    setShowScoring(false);
    setShowDistributor(false);
    if (isMobile) setMobileView('detail');
  };

  const addExercise = () => {
    if (!exerciseInput.name) return;
    setForm(f => ({ ...f, exercises: [...f.exercises, { ...exerciseInput, id: Date.now() }] }));
    setExerciseInput({ name: '', description: '', duration: 15, image: '' });
  };

  const removeExercise = (id) => {
    setForm(f => ({ ...f, exercises: f.exercises.filter(e => e.id !== id) }));
  };

  const createTraining = async () => {
    if (!form.title) { alert('Pon un título al entrenamiento'); return; }
    try {
      const { data } = await supabase.from('trainings').insert([{
        ...form, created_by: profile?.id
      }]).select().single();
      if (data) {
        setTrainings([data, ...trainings]);
        setActiveTraining(data);
        setScores([]);
        setShowForm(false);
        // After creation, jump into planning groups/positions so players know in advance.
        if (isAdmin) {
          setShowDistributor(true);
          if (isMobile) setMobileView('detail');
        }
        setForm({ title: '', date: new Date().toISOString().split('T')[0], duration: 90, intensity: 'media', objective: '', attendees: [], exercises: [], notes: '' });
      }
    } catch { alert('Error al crear el entrenamiento.'); }
  };

  const suggestTraining = async () => {
    if (!form.title) { alert('Pon un título a tu propuesta'); return; }
    try {
      const payload = {
        title: form.title,
        duration: form.duration,
        intensity: form.intensity,
        objective: form.objective,
        exercises: form.exercises
      };
      await supabase.from('feedback').insert([{
        player_id: profile?.id,
        type: 'training_proposal',
        content: JSON.stringify(payload)
      }]);
      alert('Propuesta de sesión enviada al cuerpo técnico con éxito.');
      setShowForm(false);
      setForm({ title: '', date: new Date().toISOString().split('T')[0], duration: 90, intensity: 'media', objective: '', attendees: [], exercises: [], notes: '' });
    } catch { alert('Error al enviar la propuesta.'); }
  };

  const deleteTraining = async (id) => {
    if (!confirm('¿Eliminar este entrenamiento?')) return;
    await supabase.from('trainings').delete().eq('id', id);
    const remaining = trainings.filter(t => t.id !== id);
    setTrainings(remaining);
    setActiveTraining(remaining[0] || null);
    if (isMobile) setMobileView('list');
  };

  const saveScore = async (playerId, score, comment) => {
    try {
      const existing = scores.find(s => s.player_id === playerId);
      if (existing) {
        await supabase.from('training_scores').update({ score, comment }).eq('id', existing.id);
        setScores(scores.map(s => s.id === existing.id ? { ...s, score, comment } : s));
      } else {
        const { data } = await supabase.from('training_scores').insert([{
          training_id: activeTraining.id, player_id: playerId, score, comment
        }]).select().single();
        if (data) setScores([...scores, data]);
      }
    } catch { alert('Error al guardar la puntuación.'); }
  };

  const intInfo = (id) => INTENSITIES.find(i => i.id === id) || INTENSITIES[1];
  const myScores = !isAdmin ? scores.filter(s => s.player_id === user?.id) : [];

  if (loading) return <div style={{ padding: 20, color: '#96a0b5' }}>Cargando entrenamientos...</div>;

  // ── Mobile: only show one panel at a time ──────────────────────────────
  if (isMobile) {
    if (mobileView === 'detail' && activeTraining) {
      return (
        <div>
          {/* Back button */}
          <button onClick={() => setMobileView('list')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#0057ff', fontWeight: 700, fontSize: 13, marginBottom: 12, padding: 0 }}>
            <ChevronLeft size={18} /> Entrenamientos
          </button>
          {showDistributor ? (
            <SessionDistributor 
              activeTraining={activeTraining} 
              players={players} 
              onClose={() => setShowDistributor(false)} 
              onSave={(updated) => {
                setActiveTraining(updated);
                setTrainings(trainings.map(t => t.id === updated.id ? updated : t));
                setShowDistributor(false);
              }}
            />
          ) : (
            <TrainingDetail
              activeTraining={activeTraining}
              isAdmin={isAdmin}
              user={user}
              showScoring={showScoring}
              setShowScoring={setShowScoring}
              showDistributor={showDistributor}
              setShowDistributor={setShowDistributor}
              scores={scores}
              players={players}
              myScores={myScores}
              saveScore={saveScore}
              deleteTraining={deleteTraining}
              intInfo={intInfo}
            />
          )}
        </div>
      );
    }

    // Mobile list view
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>📋 Entrenamientos</span>
          <button className={isAdmin ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> {isAdmin ? 'Nuevo' : 'Sugerir Sesión'}
          </button>
        </div>

        {showForm && (
          <TrainingForm
            form={form} setForm={setForm}
            players={players}
            isAdmin={isAdmin}
            exerciseInput={exerciseInput} setExerciseInput={setExerciseInput}
            showGallery={showGallery} setShowGallery={setShowGallery}
            addExercise={addExercise} removeExercise={removeExercise}
            createTraining={isAdmin ? createTraining : suggestTraining}
            setShowForm={setShowForm}
            isSuggestion={!isAdmin}
          />
        )}

        {trainings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#96a0b5', fontSize: 12 }}>
            No hay entrenamientos aún.
            {isAdmin && <div style={{ marginTop: 6 }}>Pulsa <strong>Nuevo</strong> para crear uno.</div>}
          </div>
        ) : trainings.map(t => {
          const int = intInfo(t.intensity);
          return (
            <div key={t.id} onClick={() => selectTraining(t)}
              style={{
                padding: "12px 14px", borderRadius: 10,
                border: `1.5px solid ${activeTraining?.id === t.id ? "#0057ff" : "#e0e4ed"}`,
                background: activeTraining?.id === t.id ? "#eef3ff" : "white",
                cursor: "pointer", transition: 'all .12s'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: `${int.color}15`, color: int.color, fontWeight: 700 }}>{int.icon} {int.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: '#96a0b5' }}>
                <span><Calendar size={10} style={{ verticalAlign: 'middle' }} /> {t.date}</span>
                <span><Clock size={10} style={{ verticalAlign: 'middle' }} /> {t.duration}min</span>
                <span>📝 {(t.exercises || []).length} ejercicios</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Desktop: side-by-side layout ──────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 100px)' }}>
      {/* Left: Training List */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>📋 Entrenamientos</span>
          <button className={isAdmin ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> {isAdmin ? 'Nuevo' : 'Sugerir Sesión'}
          </button>
        </div>

        {showForm && (
          <TrainingForm
            form={form} setForm={setForm}
            players={players}
            isAdmin={isAdmin}
            exerciseInput={exerciseInput} setExerciseInput={setExerciseInput}
            showGallery={showGallery} setShowGallery={setShowGallery}
            addExercise={addExercise} removeExercise={removeExercise}
            createTraining={isAdmin ? createTraining : suggestTraining}
            setShowForm={setShowForm}
            isSuggestion={!isAdmin}
          />
        )}

        {trainings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#96a0b5', fontSize: 12 }}>
            No hay entrenamientos aún.
            {isAdmin && <div style={{ marginTop: 6 }}>Pulsa <strong>Nuevo</strong> para crear uno.</div>}
          </div>
        ) : trainings.map(t => {
          const int = intInfo(t.intensity);
          return (
            <div key={t.id} onClick={() => selectTraining(t)}
              style={{
                padding: "10px 12px", borderRadius: 10,
                border: `1.5px solid ${activeTraining?.id === t.id ? "#0057ff" : "#e0e4ed"}`,
                background: activeTraining?.id === t.id ? "#eef3ff" : "white",
                cursor: "pointer", transition: 'all .12s'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: `${int.color}15`, color: int.color, fontWeight: 700 }}>{int.icon} {int.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: '#96a0b5' }}>
                <span><Calendar size={10} style={{ verticalAlign: 'middle' }} /> {t.date}</span>
                <span><Clock size={10} style={{ verticalAlign: 'middle' }} /> {t.duration}min</span>
                <span>📝 {(t.exercises || []).length} ejercicios</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Training Detail */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTraining ? (
          showDistributor ? (
            <SessionDistributor 
              activeTraining={activeTraining} 
              players={players} 
              onClose={() => setShowDistributor(false)} 
              onSave={(updated) => {
                setActiveTraining(updated);
                setTrainings(trainings.map(t => t.id === updated.id ? updated : t));
                setShowDistributor(false);
              }}
            />
          ) : (
            <TrainingDetail
              activeTraining={activeTraining}
              isAdmin={isAdmin}
              user={user}
              showScoring={showScoring}
              setShowScoring={setShowScoring}
              showDistributor={showDistributor}
              setShowDistributor={setShowDistributor}
              scores={scores}
              players={players}
              myScores={myScores}
              saveScore={saveScore}
              deleteTraining={deleteTraining}
              intInfo={intInfo}
            />
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#96a0b5' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Selecciona un entrenamiento</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Extracted components ───────────────────────────────────────────────

function TrainingDetail({ activeTraining, isAdmin, user, showScoring, setShowScoring, showDistributor, setShowDistributor, scores, players, myScores, saveScore, deleteTraining, intInfo }) {
  const roster = Array.isArray(players) ? players : [];
  const myRoster = user?.id ? roster.find(p => p.auth_profile_id === user.id) : null;
  const myRosterId = myRoster?.id || null;

  const getMyGroupForExercise = (ex) => {
    if (!myRosterId) return null;
    const ga = ex?.group_assignments || {};
    for (const [k, members] of Object.entries(ga)) {
      if (Array.isArray(members) && members.includes(myRosterId)) return k;
    }
    return null;
  };

  const buildPlanTokens = (ex) => {
    const ga = ex?.group_assignments || {};
    const savedTokens = Array.isArray(ex?.canvas_tokens) ? ex.canvas_tokens : [];
    return roster.map((p, idx) => {
      const groupKey = Object.entries(ga).find(([, members]) => Array.isArray(members) && members.includes(p.id))?.[0] || null;
      const saved = savedTokens.find(t => t.id === p.id);
      return {
        id: p.id,
        kind: 'player',
        x: saved?.x ?? 25 + (idx % 12) * 38,
        y: saved?.y ?? 25 + Math.floor(idx / 12) * 38,
        label: (p.surname || p.name || '?').substring(0, 3).toUpperCase(),
        name: p.name,
        color: groupKey === 'red' ? '#ef4444' : groupKey === 'yellow' ? '#eab308' : groupKey === 'green' ? '#22c55e' : groupKey === 'blue' ? '#3b82f6' : groupKey === 'pink' ? '#ec4899' : '#94a3b8',
      };
    });
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{activeTraining.title}</h2>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
            <span>📅 {activeTraining.date}</span>
            <span>⏱️ {activeTraining.duration} min</span>
            <span>{intInfo(activeTraining.intensity).icon} {intInfo(activeTraining.intensity).label}</span>
          </div>
          {activeTraining.objective && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0f9ff', borderRadius: 8, borderLeft: '3px solid #0057ff', fontSize: 12, color: '#334155' }}>
              🎯 <strong>Objetivo:</strong> {activeTraining.objective}
            </div>
          )}
          {Array.isArray(activeTraining.attendees) && activeTraining.attendees.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0057ff', background: '#eef3ff', padding: '4px 10px', borderRadius: 999 }}>
                👥 Asistentes: {activeTraining.attendees.length}
              </span>
              {!isAdmin && myRosterId && (
                <span style={{ fontSize: 11, fontWeight: 800, color: activeTraining.attendees.includes(myRosterId) ? '#16a34a' : '#ef4444', background: activeTraining.attendees.includes(myRosterId) ? '#dcfce7' : '#fee2e2', padding: '4px 10px', borderRadius: 999 }}>
                  {activeTraining.attendees.includes(myRosterId) ? 'Asistencia: OK' : 'Asistencia: No marcado'}
                </span>
              )}
            </div>
          )}
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDistributor(true)}>
              <Users size={12} /> Grupos
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowScoring(!showScoring)}>
              <Star size={12} /> {showScoring ? 'Ocultar' : 'Puntuar'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => deleteTraining(activeTraining.id)} style={{ color: '#ef4444' }}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {(activeTraining.exercises || []).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📝 Ejercicios del día</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(activeTraining.exercises || []).map((ex, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid #e2e6ed', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eef3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#0057ff', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>{ex.name}</div>
                    {ex.description && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ex.description}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: '#0057ff', fontWeight: 700, padding: '4px 10px', background: '#eef3ff', borderRadius: 8 }}>{ex.duration} min</div>
                </div>
                {resolveExerciseImageSrc(ex.image) && (
                  <div style={{ marginTop: 4, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e6ed', background: '#f8f9fb' }}>
                    <img
                      src={resolveExerciseImageSrc(ex.image)}
                      alt={ex.name || 'ejercicio'}
                      style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
                {ex.canvas_drawing && (
                  <div style={{ marginTop: 4, borderRadius: 10, overflow: 'hidden', border: '1px solid #c7d8ff', background: '#111827', aspectRatio: '550/366', width: '100%' }}>
                    <FieldCanvas
                      tokens={ex.canvas_drawing.tokens || []}
                      arrows={ex.canvas_drawing.arrows || []}
                      zones={ex.canvas_drawing.zones || []}
                      tool="move"
                      viewMode="full"
                      presentationMode={true}
                    />
                  </div>
                )}

                {/* Player view: show planned group + optional marked positions (from SessionDistributor) */}
                {!isAdmin && myRosterId && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(() => {
                      const myGroup = getMyGroupForExercise(ex);
                      if (!myGroup) {
                        return <span style={{ fontSize: 11, color: '#64748b' }}>No estÃ¡s asignado a este ejercicio.</span>;
                      }
                      const label = myGroup === 'red' ? 'Equipo A' : myGroup === 'yellow' ? 'Equipo B' : myGroup === 'green' ? 'Equipo C' : myGroup === 'blue' ? 'Equipo D' : 'Comodines';
                      const color = myGroup === 'red' ? '#991b1b' : myGroup === 'yellow' ? '#854d0e' : myGroup === 'green' ? '#166534' : myGroup === 'blue' ? '#1e3a8a' : '#831843';
                      const bg = myGroup === 'red' ? '#fee2e2' : myGroup === 'yellow' ? '#fef9c3' : myGroup === 'green' ? '#dcfce7' : myGroup === 'blue' ? '#dbeafe' : '#fce7f3';
                      const border = myGroup === 'red' ? '#fca5a5' : myGroup === 'yellow' ? '#fde047' : myGroup === 'green' ? '#86efac' : myGroup === 'blue' ? '#93c5fd' : '#f9a8d4';
                      return (
                        <span style={{ fontSize: 11, fontWeight: 800, color, background: bg, border: `2px solid ${border}`, padding: '6px 10px', borderRadius: 999 }}>
                          Tu grupo: {label}
                        </span>
                      );
                    })()}
                  </div>
                )}

                {Array.isArray(ex.canvas_tokens) && ex.canvas_tokens.length > 0 && resolveExerciseImageSrc(ex.image) && (
                  <div style={{ marginTop: 6, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e6ed', background: '#111827', aspectRatio: '550/366', width: '100%' }}>
                    <FieldCanvas
                      tokens={buildPlanTokens(ex)}
                      arrows={[]}
                      zones={[]}
                      tool="move"
                      viewMode="full"
                      presentationMode={true}
                      backgroundImage={resolveExerciseImageSrc(ex.image)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTraining.notes && (
        <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', fontSize: 12, marginBottom: 20 }}>
          📌 <strong>Notas:</strong> {activeTraining.notes}
        </div>
      )}

      {showScoring && isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>⭐ Puntuaciones del entrenamiento</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{scores.length}/{players.length} evaluados</div>
          </div>
          {scores.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, padding: '8px 12px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0057ff' }}>{(scores.reduce((s, r) => s + r.score, 0) / scores.length).toFixed(1)}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Media grupo</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{Math.max(...scores.map(s => s.score))}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Mejor nota</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>{scores.filter(s => s.score >= 7).length}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Con nota ≥7</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {players.map(player => {
              const existing = scores.find(s => s.player_id === player.id);
              return <PlayerScoreRow key={player.id} player={player} existing={existing} onSave={saveScore} />;
            })}
          </div>
        </div>
      )}

      {!isAdmin && myScores.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>⭐ Tu puntuación</div>
          {myScores.map(s => (
            <div key={s.id} style={{ padding: '12px 16px', background: 'white', borderRadius: 10, border: '1px solid #e2e6ed' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.score >= 7 ? '#10b981' : s.score >= 5 ? '#f59e0b' : '#ef4444' }}>{s.score}/10</div>
                {s.comment && <div style={{ fontSize: 12, color: '#64748b' }}>💬 {s.comment}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrainingForm({ form, setForm, players, isAdmin, exerciseInput, setExerciseInput, showGallery, setShowGallery, addExercise, removeExercise, createTraining, setShowForm, isSuggestion }) {
  const [galleryCategory, setGalleryCategory] = useState('all');
  const [galleryGroup, setGalleryGroup] = useState('all');
  const [query, setQuery] = useState('');
  const [step, setStep] = useState(isSuggestion ? 'plan' : 'attendance'); // admin: attendance first
  const [showPizarra, setShowPizarra] = useState(false);
  const [pzTokens, setPzTokens] = useState([]);
  const [pzArrows, setPzArrows] = useState([]);
  const [pzZones, setPzZones] = useState([]);
  const [pzTool, setPzTool] = useState('move');
  const [pzArrowType, setPzArrowType] = useState('pass');
  const [pzDrawPt, setPzDrawPt] = useState(null);

  const attendees = Array.isArray(form?.attendees) ? form.attendees : [];
  const roster = Array.isArray(players) ? players : [];

  const toggleAttendee = (pid) => {
    setForm(f => {
      const prev = Array.isArray(f.attendees) ? f.attendees : [];
      const next = prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid];
      return { ...f, attendees: next };
    });
  };

  const selectAllAttendees = () => setForm(f => ({ ...f, attendees: roster.map(p => p.id) }));
  const clearAttendees = () => setForm(f => ({ ...f, attendees: [] }));

  const filteredExercises = EXERCISES_CATALOG
    .filter(e => galleryCategory === 'all' ? true : e.category === galleryCategory)
    .filter(e => galleryGroup === 'all' ? true : e.meta?.group === galleryGroup)
    .filter(e => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = `${e.name || ''} ${e.description || ''}`.toLowerCase();
      return hay.includes(q);
    });

  const savePizarra = () => {
    setExerciseInput(ei => ({ ...ei, canvas_drawing: { tokens: pzTokens, arrows: pzArrows, zones: pzZones } }));
    setShowPizarra(false);
  };

  const clearPizarra = () => {
    setExerciseInput(ei => ({ ...ei, canvas_drawing: null }));
    setPzTokens([]); setPzArrows([]); setPzZones([]);
  };

  const PZ_TOOLS = [
    { id: 'move', label: '✋', title: 'Mover' },
    { id: 'player', label: '⬤', title: 'Jugador' },
    { id: 'ball', label: '⚽', title: 'Balón' },
    { id: 'cone', label: '🔺', title: 'Cono' },
    { id: 'arrow', label: '→', title: 'Flecha' },
  ];
  const PZ_ARROW_TYPES = [
    { id: 'pass', label: 'Pase', color: '#4ade80' },
    { id: 'run', label: 'Carrera', color: '#ffe066' },
    { id: 'shoot', label: 'Tiro', color: '#ff6b6b' },
    { id: 'curved', label: 'Curvo', color: '#c084fc' },
  ];

  const playerColors = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];

  return (
    <div className="card" style={{ padding: 12 }}>
      {/* ── Pizarra modal ─────────────────────────────────────────── */}
      {showPizarra && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
          <div style={{ background: '#111827', borderRadius: 14, width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#1e293b' }}>
              <PenTool size={15} color="#60a5fa" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 13, flex: 1 }}>Pizarra del ejercicio</span>
              <button onClick={() => setShowPizarra(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', display: 'flex' }}><X size={16} /></button>
            </div>

            {/* toolbar */}
            <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: '#1a2332', flexWrap: 'wrap', alignItems: 'center' }}>
              {PZ_TOOLS.map(t => (
                <button key={t.id} title={t.title} onClick={() => setPzTool(t.id)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
                    background: pzTool === t.id ? '#0057ff' : 'rgba(255,255,255,.1)',
                    color: 'white', fontWeight: 700 }}>
                  {t.label}
                </button>
              ))}
              {pzTool === 'arrow' && (
                <div style={{ display: 'flex', gap: 4, marginLeft: 6 }}>
                  {PZ_ARROW_TYPES.map(at => (
                    <button key={at.id} onClick={() => setPzArrowType(at.id)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: `2px solid ${pzArrowType === at.id ? at.color : 'transparent'}`,
                        background: 'rgba(255,255,255,.08)', color: at.color, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                      {at.label}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { setPzTokens([]); setPzArrows([]); setPzZones([]); }}
                style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,.2)', background: 'transparent', color: 'rgba(255,255,255,.5)', fontSize: 10, cursor: 'pointer' }}>
                Limpiar
              </button>
            </div>

            {/* canvas */}
            <div style={{ width: '100%', aspectRatio: '550/366', position: 'relative' }}>
              <FieldCanvas
                tokens={pzTokens} arrows={pzArrows} zones={pzZones}
                tool={pzTool} arrowType={pzArrowType}
                drawPt={pzDrawPt} setDrawPt={setPzDrawPt}
                onMove={(id, x, y) => setPzTokens(ts => ts.map(t => t.id === id ? { ...t, x, y } : t))}
                onPlace={(kind, x, y) => {
                  if (kind === 'player') {
                    setPzTokens(ts => [...ts, { id: 'p' + Date.now(), kind: 'player', x, y, color: playerColors[ts.filter(t=>t.kind==='player').length % playerColors.length], label: String(ts.filter(t=>t.kind==='player').length + 1) }]);
                  } else {
                    setPzTokens(ts => [...ts, { id: 'k' + Date.now(), kind, x, y }]);
                  }
                }}
                onArrow={a => setPzArrows(as => [...as, a])}
                onDelete={id => { setPzTokens(ts => ts.filter(t => t.id !== id)); setPzArrows(as => as.filter(a => a.id !== id)); }}
                onZoneAdd={z => setPzZones(zs => [...zs, z])}
                onZoneDelete={id => setPzZones(zs => zs.filter(z => z.id !== id))}
                viewMode="full"
              />
            </div>

            {/* footer */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#1e293b' }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={savePizarra}><Save size={12} /> Guardar dibujo</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowPizarra(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper: admin creates training by setting attendance first */}
      {isAdmin && !isSuggestion && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, background: '#f0f2f5', padding: 4, borderRadius: 10 }}>
          <button
            type="button"
            onClick={() => setStep('attendance')}
            style={{
              flex: 1, padding: '8px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 11,
              background: step === 'attendance' ? 'white' : 'transparent',
              color: step === 'attendance' ? '#0057ff' : '#64748b',
              boxShadow: step === 'attendance' ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            }}
          >
            1) Asistencia
          </button>
          <button
            type="button"
            onClick={() => { if (attendees.length) setStep('plan'); }}
            style={{
              flex: 1, padding: '8px 6px', borderRadius: 8, border: 'none',
              cursor: attendees.length ? 'pointer' : 'not-allowed',
              fontWeight: 800, fontSize: 11,
              background: step === 'plan' ? 'white' : 'transparent',
              color: step === 'plan' ? '#0057ff' : (attendees.length ? '#64748b' : '#cbd5e1'),
              boxShadow: step === 'plan' ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
              opacity: attendees.length ? 1 : 0.85,
            }}
          >
            2) Sesión
          </button>
        </div>
      )}

      {/* Attendance step */}
      {isAdmin && !isSuggestion && step === 'attendance' && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: '#1e293b' }}>👥 Asistentes del día</div>
            <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: '#0057ff', background: '#eef3ff', padding: '2px 8px', borderRadius: 20 }}>
              {attendees.length}/{roster.length}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={selectAllAttendees} style={{ flex: 1 }}>Todos</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={clearAttendees} style={{ flex: 1, color: '#ef4444' }}>Ninguno</button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setStep('plan')}
              disabled={!attendees.length}
              style={{ flex: 1 }}
            >
              Continuar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 320, overflowY: 'auto' }}>
            {roster.map(p => {
              const on = attendees.includes(p.id);
              return (
                <label key={p.id} onClick={() => toggleAttendee(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 10, cursor: 'pointer', userSelect: 'none',
                    background: on ? '#eef3ff' : '#f8fafc', border: `1.5px solid ${on ? '#0057ff' : '#e2e8f0'}` }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${on ? '#0057ff' : '#cbd5e1'}`, background: on ? '#0057ff' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: on ? 800 : 600, color: on ? '#0057ff' : '#475569' }}>
                    {p.number ? `#${p.number} ` : ''}{p.name} {p.surname}
                  </span>
                  {p.position && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>{p.position}</span>}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {(!isAdmin || isSuggestion || step === 'plan') && (
        <>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Nuevo Entrenamiento</div>
      <input className="input-field" placeholder="Título (ej: Técnica + Rondo)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ marginBottom: 6 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ flex: 1 }} />
        <input type="number" className="input-field" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 90 }))} style={{ width: 70 }} placeholder="min" />
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {INTENSITIES.map(int => (
          <button key={int.id} onClick={() => setForm(f => ({ ...f, intensity: int.id }))}
            style={{ flex: 1, padding: '4px 6px', borderRadius: 6, border: `1.5px solid ${form.intensity === int.id ? int.color : '#e0e4ed'}`, background: form.intensity === int.id ? `${int.color}15` : 'white', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: form.intensity === int.id ? int.color : '#64748b' }}>
            {int.icon} {int.label}
          </button>
        ))}
      </div>
      <textarea className="input-field" placeholder="Objetivo del entrenamiento" value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} rows={2} style={{ marginBottom: 6, resize: 'vertical' }} />

      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: '#4a5568' }}>⚡ Añadir rápido:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
        {QUICK_EXERCISES.map(ex => (
          <button key={ex.name}
            onClick={() => setForm(f => ({ ...f, exercises: [...f.exercises, { ...ex, id: Date.now() + Math.random(), image: '' }] }))}
            style={{ fontSize: 9, padding: '3px 7px', borderRadius: 10, border: '1px solid #e0e4ed', background: '#f8f9fb', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
            {ex.name} ({ex.duration}')
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: '#4a5568' }}>📝 Ejercicios del día:</div>
      {form.exercises.map(ex => (
        <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', background: '#f8f9fb', borderRadius: 6, marginBottom: 3, fontSize: 11 }}>
          {resolveExerciseImageSrc(ex.image) && (
            <img
              src={resolveExerciseImageSrc(ex.image)}
              alt="ej"
              style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              loading="lazy"
            />
          )}
          {ex.canvas_drawing && <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: '#eef3ff', color: '#0057ff', fontWeight: 700, flexShrink: 0 }}>🎨 Pizarra</span>}
          <span style={{ flex: 1, fontSize: 10 }}>{ex.name} <span style={{ color: '#0057ff', fontWeight: 700 }}>({ex.duration}min)</span></span>
          <button onClick={() => removeExercise(ex.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={12} /></button>
        </div>
      ))}

      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 3, marginTop: 4 }}>O añade uno personalizado:</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {resolveExerciseImageSrc(exerciseInput.image) && (
          <img
            src={resolveExerciseImageSrc(exerciseInput.image)}
            alt="selected"
            style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            loading="lazy"
          />
        )}
        <button className="btn btn-outline btn-sm" onClick={() => setShowGallery(!showGallery)} style={{ padding: '0 8px' }} title="Galería">
          <ImageIcon size={14} />
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setShowPizarra(true)} style={{ padding: '0 8px', color: exerciseInput.canvas_drawing ? '#0057ff' : undefined }} title="Dibujar en pizarra">
          <PenTool size={14} />
        </button>
        <input className="input-field" placeholder="Nombre ejercicio" value={exerciseInput.name} onChange={e => setExerciseInput(ei => ({ ...ei, name: e.target.value }))} style={{ flex: 1 }} />
        <input type="number" className="input-field" value={exerciseInput.duration} onChange={e => setExerciseInput(ei => ({ ...ei, duration: parseInt(e.target.value) || 15 }))} style={{ width: 50 }} />
        <button className="btn btn-outline btn-sm" onClick={addExercise}>+</button>
      </div>
      {exerciseInput.canvas_drawing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, padding: '4px 8px', background: '#eef3ff', borderRadius: 6 }}>
          <PenTool size={11} color="#0057ff" />
          <span style={{ fontSize: 10, color: '#0057ff', fontWeight: 700, flex: 1 }}>Pizarra dibujada ({exerciseInput.canvas_drawing.tokens?.length || 0} fichas, {exerciseInput.canvas_drawing.arrows?.length || 0} flechas)</span>
          <button onClick={clearPizarra} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 10 }}>✕ Borrar</button>
        </div>
      )}

      {showGallery && (
        <div style={{ background: '#f8f9fb', padding: 8, borderRadius: 8, marginBottom: 6 }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
            {EXERCISE_CATS.map(cat => {
              const count = cat.id === 'all' ? EXERCISES_CATALOG.length : EXERCISES_CATALOG.filter(e => e.category === cat.id).length;
              return (
                <button key={cat.id} onClick={() => setGalleryCategory(cat.id)}
                  style={{ padding: '3px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700,
                    background: galleryCategory === cat.id ? '#0057ff' : '#e2e6ed',
                    color: galleryCategory === cat.id ? 'white' : '#64748b' }}>
                  {cat.label} <span style={{ opacity: .7 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Group tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
            {EXERCISE_GROUPS.map(g => (
              <button key={g.id} onClick={() => setGalleryGroup(g.id)}
                style={{ padding: '3px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 800,
                  background: galleryGroup === g.id ? '#111827' : '#e2e6ed',
                  color: galleryGroup === g.id ? 'white' : '#64748b' }}>
                {g.label}
              </button>
            ))}
          </div>

          <input
            className="input-field"
            placeholder="Buscar ejercicio..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ marginBottom: 6, minHeight: 36, fontSize: 12 }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
            {filteredExercises.map(exData => (
              <div key={exData.id} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => {
                setExerciseInput(ei => ({ ...ei, image: exData.image, name: exData.name, description: exData.description || '', duration: exData.duration || 15, category: exData.category, meta: exData.meta }));
                setShowGallery(false);
              }}>
                <img
                  src={resolveExerciseImageSrc(exData.image) || ''}
                  alt={exData.name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, border: exerciseInput.image === exData.image ? '2.5px solid #0057ff' : '1.5px solid transparent' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  loading="lazy"
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 8, padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                  {exData.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={createTraining}><Save size={12} /> {isSuggestion ? 'Enviar Propuesta' : 'Crear'}</button>
        <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
      </div>
        </>
      )}
    </div>
  );
}

function PlayerScoreRow({ player, existing, onSave }) {
  const [localScore, setLocalScore] = useState(existing?.score || 5);
  const [localComment, setLocalComment] = useState(existing?.comment || '');
  const [saved, setSaved] = useState(!!existing);

  const scoreColor = localScore >= 8 ? '#10b981' : localScore >= 6 ? '#f59e0b' : localScore >= 4 ? '#f97316' : '#ef4444';

  const handleSave = () => {
    onSave(player.id, localScore, localComment);
    setSaved(true);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'white', borderRadius: 10, border: `1.5px solid ${saved ? '#a7f3d0' : '#e2e6ed'}`, transition: 'border-color .2s', flexWrap: 'wrap' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
        {player.number || player.name?.[0]}
      </div>
      <div style={{ minWidth: 90 }}>
        <div style={{ fontWeight: 700, fontSize: 12 }}>{player.name} {player.surname}</div>
        <div style={{ fontSize: 10, color: '#96a0b5' }}>{player.position || 'Sin posición'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[2, 4, 6, 8, 10].map(v => (
            <span key={v} onClick={() => { setLocalScore(v); setSaved(false); }}
              style={{ fontSize: 20, cursor: 'pointer', color: localScore >= v ? '#f59e0b' : '#d1d5db', transition: 'color .1s' }}>
              ★
            </span>
          ))}
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${scoreColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${scoreColor}` }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: scoreColor }}>{localScore}</span>
        </div>
        <input type="range" min="1" max="10" value={localScore}
          onChange={e => { setLocalScore(parseInt(e.target.value)); setSaved(false); }}
          style={{ flex: 1, minWidth: 60, accentColor: scoreColor }} />
      </div>
      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
        <input className="input-field" placeholder="Comentario del entrenador..."
          value={localComment} onChange={e => { setLocalComment(e.target.value); setSaved(false); }}
          style={{ flex: 1, fontSize: 12 }} />
        <button className="btn btn-sm" onClick={handleSave}
          style={{ background: saved ? '#10b981' : '#0057ff', color: 'white', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}>
          {saved ? '✓' : <Save size={12} />}
        </button>
      </div>
    </div>
  );
}
