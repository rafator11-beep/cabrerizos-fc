import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Star, Trash2, Save, X, ChevronLeft, Users, PenTool, Dumbbell, Activity, ChevronRight, Target } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import FieldCanvas from '../components/FieldCanvas';
import { resolveExerciseImageSrc } from '../utils/exerciseImages';
import { decorateExercise, EXERCISE_GROUPS } from '../utils/exerciseCatalog';

const INTENSITIES = [
  { id: 'baja', label: 'Baja', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: '🟢' },
  { id: 'media', label: 'Media', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: '🟡' },
  { id: 'alta', label: 'Alta', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: '🔴' },
];

const EXERCISES_CATALOG = (Array.isArray(EXERCISES_DATA) ? EXERCISES_DATA : []).map(decorateExercise);

export default function Entrenamientos() {
 const { isAdmin, isRealAdmin, viewAsPlayer, profile, user } = useAuth();
const isPlayerMode = !isRealAdmin || viewAsPlayer;
const viewerIsAdmin = isAdmin && !isPlayerMode;
  const isMobile = useIsMobile();
  const [trainings, setTrainings] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], intensity: 'media', duration: '90', objective: '' });

<<<<<<< HEAD
  useEffect(() => { fetchTrainings(); }, []);
=======
  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().split('T')[0],
    duration: 90, intensity: 'media', objective: '', attendees: [], exercises: [], notes: ''
  });
  const [exerciseInput, setExerciseInput] = useState({ name: '', description: '', duration: 15, image: '' });
  const [showGallery, setShowGallery] = useState(false);
>>>>>>> origin/main

  const createTraining = async () => {
    if (!form.title) return;
    const { data } = await supabase.from('trainings').insert([{ ...form, exercises: [], created_by: profile?.id }]).select().single();
    if (data) {
      setTrainings([data, ...trainings]);
      setActiveTraining(data);
      setShowForm(false);
      setForm({ title: '', date: new Date().toISOString().split('T')[0], intensity: 'media', duration: '90', objective: '' });
      if (isMobile) setMobileView('detail');
    }
  };

  const deleteTraining = async (id) => {
    if (!confirm('¿Eliminar sesión?')) return;
    await supabase.from('trainings').delete().eq('id', id);
    const rem = trainings.filter(t => t.id !== id);
    setTrainings(rem);
    if (activeTraining?.id === id) setActiveTraining(rem[0] || null);
    if (isMobile) setMobileView('list');
  };

  const fetchTrainings = async () => {
    setLoading(true);
    const { data } = await supabase.from('trainings').select('*').order('date', { ascending: false });
    if (data) {
      setTrainings(data);
      if (data.length > 0) setActiveTraining(data[0]);
    }
    setLoading(false);
  };

  const selectTraining = (t) => {
    setActiveTraining(t);
    if (isMobile) setMobileView('detail');
  };

<<<<<<< HEAD
  const getIntensity = (id) => INTENSITIES.find(i => i.id === id) || INTENSITIES[1];
=======
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
          <button onClick={() => setMobileView('list')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#0b63ff', fontWeight: 950, fontSize: 14, marginBottom: 12, padding: 0 }}>
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
              isAdmin={viewerIsAdmin}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 950, fontSize: 18, color: '#0f172a' }}>Entrenamientos</span>
          <button className={isAdmin ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> {isAdmin ? 'Nuevo' : 'Sugerir'}
          </button>
        </div>

        {showForm && (
          <TrainingForm
            form={form} setForm={setForm}
            players={players}
            isAdmin={viewerIsAdmin}
            exerciseInput={exerciseInput} setExerciseInput={setExerciseInput}
            showGallery={showGallery} setShowGallery={setShowGallery}
            addExercise={addExercise} removeExercise={removeExercise}
            createTraining={isAdmin ? createTraining : suggestTraining}
            setShowForm={setShowForm}
            isSuggestion={!isAdmin}
          />
        )}

        {trainings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 22, color: '#64748b', fontSize: 13 }}>
            No hay entrenamientos aún.
            {isAdmin && <div style={{ marginTop: 6 }}>Pulsa <strong>Nuevo</strong> para crear uno.</div>}
          </div>
        ) : trainings.map(t => {
          const int = intInfo(t.intensity);
          return (
            <div key={t.id} onClick={() => selectTraining(t)}
              style={{
                padding: "14px 16px", borderRadius: 16,
                border: `2px solid ${activeTraining?.id === t.id ? "#0b63ff" : "#e2e8f0"}`,
                background: activeTraining?.id === t.id ? "rgba(11,99,255,.08)" : "white",
                cursor: "pointer", transition: 'all .12s'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 950, fontSize: 15, color: '#0f172a' }}>{t.title}</div>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: `${int.color}18`, color: int.color, fontWeight: 900 }}>{int.icon} {int.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#475569', flexWrap: 'wrap', fontWeight: 700 }}>
                <span><Calendar size={12} style={{ verticalAlign: 'middle' }} /> {t.date}</span>
                <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {t.duration} min</span>
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
            isAdmin={viewerIsAdmin}
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
              isAdmin={viewerIsAdmin}
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
>>>>>>> origin/main

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in relative">
      
      {showForm && (
        <div className="absolute inset-0 z-50 bg-bg/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Nueva Sesión</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <input className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" placeholder="Título de la sesión" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <input type="number" className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" placeholder="Minutos" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <select className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" value={form.intensity} onChange={e => setForm(f => ({ ...f, intensity: e.target.value }))}>
                {INTENSITIES.map(i => <option key={i.id} value={i.id} className="bg-bg">{i.label}</option>)}
              </select>
              <textarea className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none min-h-[100px]" placeholder="Objetivo de la sesión..." value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} />
              <button className="w-full py-4 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-accent/20" onClick={createTraining}>CREAR ENTRENAMIENTO</button>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Entrenamientos</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary !rounded-full !px-6 text-[10px] uppercase font-black tracking-widest shadow-lg shadow-accent/20"
        >
          <Plus size={14} className="mr-2" /> {isAdmin ? 'Nuevo' : 'Proponer'}
=======
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
>>>>>>> origin/main
        </button>
      </div>

<<<<<<< HEAD
      <div className="flex flex-1 gap-8 min-h-0">
        
        {/* LIST PANEL */}
        <div className={`
          w-full md:w-[350px] flex-col gap-4 flex-shrink-0
          ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
        `}>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {loading ? (
              <div className="py-20 text-center text-muted animate-pulse font-black text-xs">CARGANDO...</div>
            ) : trainings.length === 0 ? (
              <div className="py-20 text-center text-muted/30 font-black text-xs uppercase tracking-[0.2em] italic">Sin registros</div>
            ) : trainings.map(t => {
              const intensity = getIntensity(t.intensity);
=======
      {showGallery && (
        <div style={{ background: '#f8f9fb', padding: 8, borderRadius: 8, marginBottom: 6 }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
            {EXERCISE_CATS.map(cat => {
              const count = cat.id === 'all' ? EXERCISES_CATALOG.length : EXERCISES_CATALOG.filter(e => e.category === cat.id).length;
>>>>>>> origin/main
              return (
                <button 
                  key={t.id}
                  onClick={() => selectTraining(t)}
                  className={`
                    w-full flex flex-col p-5 rounded-[28px] border transition-all text-left group active:scale-95
                    ${activeTraining?.id === t.id ? 'bg-accent/5 border-accent/30 shadow-lg' : 'bg-surface-2/20 border-white/5 hover:border-white/10'}
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${intensity.bg} ${intensity.color}`}>
                      {intensity.icon} {intensity.label}
                    </div>
                    <span className="text-[10px] font-black text-muted/40">{t.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-3 group-hover:text-accent transition-colors leading-tight">{t.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {t.duration}'</span>
                    <span className="flex items-center gap-1.5"><Activity size={12} /> {(t.exercises || []).length} Ex.</span>
                  </div>
                </button>
              );
            })}
          </div>
<<<<<<< HEAD
        </div>

        {/* DETAIL PANEL */}
        <div className={`
          flex-1 flex flex-col gap-6 min-h-0
          ${mobileView === 'detail' ? 'flex' : 'hidden md:flex'}
        `}>
          {isMobile && (
            <button onClick={() => setMobileView('list')} className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest mb-2">
              <ChevronLeft size={16} /> Volver a la lista
            </button>
          )}

          {activeTraining ? (
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
              
              {/* Header Card */}
              <div className="glass-card">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white leading-tight">{activeTraining.title}</h2>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => deleteTraining(activeTraining.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 active:scale-90 transition-all"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">Fecha</span>
                      <span className="text-xs font-bold text-white">{activeTraining.date}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">Duración</span>
                      <span className="text-xs font-bold text-white">{activeTraining.duration} min</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">Intensidad</span>
                      <span className={`text-xs font-bold ${getIntensity(activeTraining.intensity).color}`}>
                        {getIntensity(activeTraining.intensity).label}
                      </span>
                    </div>
                  </div>
                  {activeTraining.objective && (
                    <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <div className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-widest mb-2">
                        <Target size={12} /> Objetivo de la sesión
                      </div>
                      <p className="text-sm font-medium text-white/80 leading-relaxed italic">"{activeTraining.objective}"</p>
                    </div>
                  )}
=======

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
>>>>>>> origin/main
                </div>
              </div>

<<<<<<< HEAD
              {/* Exercises List */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] px-2">Secuencia de Ejercicios</h3>
                <div className="space-y-3">
                  {(activeTraining.exercises || []).map((ex, i) => (
                    <div key={i} className="glass-card !p-0 overflow-hidden group">
                      <div className="p-6 flex items-start gap-5">
                        <div className="w-10 h-10 rounded-2xl bg-surface-2 flex items-center justify-center text-lg font-black text-white/20 border border-white/5 group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{ex.name}</h4>
                            <span className="text-[11px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest">{ex.duration}'</span>
                          </div>
                          <p className="text-sm text-muted leading-relaxed opacity-60 font-medium">{ex.description}</p>
                        </div>
                      </div>
                      {ex.canvas_drawing && (
                        <div className="aspect-[550/366] bg-[#111827] border-t border-white/5 relative group-hover:opacity-100 opacity-90 transition-opacity">
                          <FieldCanvas 
                            tokens={ex.canvas_drawing.tokens || []}
                            arrows={ex.canvas_drawing.arrows || []}
                            zones={ex.canvas_drawing.zones || []}
                            viewMode="full"
                            presentationMode={true}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted/20 animate-pulse">
              <Dumbbell size={80} strokeWidth={1} />
              <span className="text-xs font-black uppercase tracking-[0.4em] mt-6">Selecciona una sesión</span>
            </div>
          )}
        </div>
=======
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
>>>>>>> origin/main
      </div>
    </div>
  );
}
