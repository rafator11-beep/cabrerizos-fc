import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Star, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import EXERCISE_IMAGES from '../exercises.json';

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

export default function Entrenamientos() {
  const { isAdmin, profile, user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScoring, setShowScoring] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().split('T')[0],
    duration: 90, intensity: 'media', objective: '', exercises: [], notes: ''
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
        setForm({ title: '', date: new Date().toISOString().split('T')[0], duration: 90, intensity: 'media', objective: '', exercises: [], notes: '' });
      }
    } catch { alert('Error al crear el entrenamiento.'); }
  };

  const deleteTraining = async (id) => {
    if (!confirm('¿Eliminar este entrenamiento?')) return;
    await supabase.from('trainings').delete().eq('id', id);
    const remaining = trainings.filter(t => t.id !== id);
    setTrainings(remaining);
    setActiveTraining(remaining[0] || null);
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

  // Player view: only show their own scores
  const myScores = !isAdmin ? scores.filter(s => s.player_id === user?.id) : [];

  if (loading) return <div style={{ padding: 20, color: '#96a0b5' }}>Cargando entrenamientos...</div>;

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 100px)' }}>
      {/* Left: Training List */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>📋 Entrenamientos</span>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={14} /> Nuevo
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && isAdmin && (
          <div className="card" style={{ padding: 12 }}>
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

            {/* Quick-add exercises */}
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

            {/* Exercises list */}
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: '#4a5568' }}>📝 Ejercicios del día:</div>
            {form.exercises.map(ex => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', background: '#f8f9fb', borderRadius: 6, marginBottom: 3, fontSize: 11 }}>
                {ex.image && <img src={import.meta.env.BASE_URL + 'exercises/' + ex.image} alt="ej" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}
                <span style={{ flex: 1, fontSize: 10 }}>{ex.name} <span style={{ color: '#0057ff', fontWeight: 700 }}>({ex.duration}min)</span></span>
                <button onClick={() => removeExercise(ex.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={12} /></button>
              </div>
            ))}

            {/* Custom exercise input */}
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 3, marginTop: 4 }}>O añade uno personalizado:</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {exerciseInput.image && (
                <img src={import.meta.env.BASE_URL + 'exercises/' + exerciseInput.image} alt="selected" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              )}
              <button className="btn btn-outline btn-sm" onClick={() => setShowGallery(!showGallery)} style={{ padding: '0 8px' }} title="Imagen">
                <ImageIcon size={14} />
              </button>
              <input className="input-field" placeholder="Nombre ejercicio" value={exerciseInput.name} onChange={e => setExerciseInput(ei => ({ ...ei, name: e.target.value }))} style={{ flex: 1 }} />
              <input type="number" className="input-field" value={exerciseInput.duration} onChange={e => setExerciseInput(ei => ({ ...ei, duration: parseInt(e.target.value) || 15 }))} style={{ width: 50 }} />
              <button className="btn btn-outline btn-sm" onClick={addExercise}>+</button>
            </div>
            {showGallery && (
              <div style={{ background: '#f8f9fb', padding: 8, borderRadius: 8, marginBottom: 6, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                {EXERCISE_IMAGES.map(img => (
                  <img key={img} src={import.meta.env.BASE_URL + 'exercises/' + img} alt="ejercicio"
                    onClick={() => { setExerciseInput(ei => ({ ...ei, image: img })); setShowGallery(false); }}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: exerciseInput.image === img ? '2.5px solid #0057ff' : '1.5px solid transparent' }} />
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={createTraining}><Save size={12} /> Crear</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Training list */}
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
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{activeTraining.title}</h2>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: '#64748b' }}>
                  <span>📅 {activeTraining.date}</span>
                  <span>⏱️ {activeTraining.duration} min</span>
                  <span>{intInfo(activeTraining.intensity).icon} {intInfo(activeTraining.intensity).label}</span>
                </div>
                {activeTraining.objective && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0f9ff', borderRadius: 8, borderLeft: '3px solid #0057ff', fontSize: 12, color: '#334155' }}>
                    🎯 <strong>Objetivo:</strong> {activeTraining.objective}
                  </div>
                )}
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowScoring(!showScoring)}>
                    <Star size={12} /> {showScoring ? 'Ocultar puntuación' : 'Puntuar jugadores'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => deleteTraining(activeTraining.id)} style={{ color: '#ef4444' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Exercises */}
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
                      {ex.image && (
                        <div style={{ marginTop: 4, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e6ed', background: '#f8f9fb' }}>
                          <img src={import.meta.env.BASE_URL + 'exercises/' + ex.image} alt="ej" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }} />
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

            {/* Scoring Panel (Admin) */}
            {showScoring && isAdmin && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>⭐ Puntuaciones del entrenamiento</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {scores.length}/{players.length} evaluados
                  </div>
                </div>
                {/* Summary bar */}
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
                    return (
                      <PlayerScoreRow
                        key={player.id}
                        player={player}
                        existing={existing}
                        onSave={saveScore}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Player view: show my scores */}
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'white', borderRadius: 10, border: `1.5px solid ${saved ? '#a7f3d0' : '#e2e6ed'}`, transition: 'border-color .2s' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
        {player.number || player.name?.[0]}
      </div>
      <div style={{ minWidth: 100 }}>
        <div style={{ fontWeight: 700, fontSize: 12 }}>{player.name} {player.surname}</div>
        <div style={{ fontSize: 10, color: '#96a0b5' }}>{player.position || 'Sin posición'}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Stars (half = 1 star out of 5 mapped from 1-10) */}
        <div style={{ display: 'flex', gap: 2 }}>
          {[2, 4, 6, 8, 10].map(v => (
            <span key={v} onClick={() => { setLocalScore(v); setSaved(false); }}
              style={{ fontSize: 18, cursor: 'pointer', color: localScore >= v ? '#f59e0b' : '#d1d5db', transition: 'color .1s' }}>
              ★
            </span>
          ))}
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${scoreColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${scoreColor}` }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: scoreColor }}>{localScore}</span>
        </div>
        <input type="range" min="1" max="10" value={localScore}
          onChange={e => { setLocalScore(parseInt(e.target.value)); setSaved(false); }}
          style={{ width: 90, accentColor: scoreColor }} />
      </div>
      <input className="input-field" placeholder="Comentario del entrenador..."
        value={localComment} onChange={e => { setLocalComment(e.target.value); setSaved(false); }}
        style={{ width: 180, fontSize: 10 }} />
      <button className="btn btn-sm" onClick={handleSave}
        style={{ background: saved ? '#10b981' : '#0057ff', color: 'white', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}>
        {saved ? '✓' : <Save size={12} />}
      </button>
    </div>
  );
}
