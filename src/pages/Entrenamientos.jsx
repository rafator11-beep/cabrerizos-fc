import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Flame, ChevronRight, Star, MessageSquare, Trash2, Edit3, Save, X } from 'lucide-react';

const INTENSITIES = [
  { id: 'baja', label: 'Baja', color: '#10b981', icon: '🟢' },
  { id: 'media', label: 'Media', color: '#f59e0b', icon: '🟡' },
  { id: 'alta', label: 'Alta', color: '#ef4444', icon: '🔴' },
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
  const [exerciseInput, setExerciseInput] = useState({ name: '', description: '', duration: 15 });

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
    setExerciseInput({ name: '', description: '', duration: 15 });
  };

  const removeExercise = (id) => {
    setForm(f => ({ ...f, exercises: f.exercises.filter(e => e.id !== id) }));
  };

  const createTraining = async () => {
    if (!form.title) { alert('Pon un título al entrenamiento'); return; }
    try {
      const { data, error } = await supabase.from('trainings').insert([{
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

            {/* Exercises */}
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: '#4a5568' }}>Ejercicios:</div>
            {form.exercises.map(ex => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', background: '#f8f9fb', borderRadius: 6, marginBottom: 3, fontSize: 11 }}>
                <span style={{ flex: 1 }}>{ex.name} ({ex.duration}min)</span>
                <button onClick={() => removeExercise(ex.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={12} /></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              <input className="input-field" placeholder="Nombre ejercicio" value={exerciseInput.name} onChange={e => setExerciseInput(ei => ({ ...ei, name: e.target.value }))} style={{ flex: 1 }} />
              <input type="number" className="input-field" value={exerciseInput.duration} onChange={e => setExerciseInput(ei => ({ ...ei, duration: parseInt(e.target.value) || 15 }))} style={{ width: 50 }} />
              <button className="btn btn-outline btn-sm" onClick={addExercise}>+</button>
            </div>

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
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'white', borderRadius: 10, border: '1px solid #e2e6ed' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eef3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#0057ff' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{ex.name}</div>
                        {ex.description && <div style={{ fontSize: 11, color: '#96a0b5', marginTop: 2 }}>{ex.description}</div>}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{ex.duration} min</div>
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
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>⭐ Puntuaciones</div>
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'white', borderRadius: 10, border: '1px solid #e2e6ed' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>
        {player.number || player.name?.[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 12 }}>{player.name} {player.surname}</div>
        <div style={{ fontSize: 10, color: '#96a0b5' }}>{player.position || 'Sin posición'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="range" min="1" max="10" value={localScore}
          onChange={e => setLocalScore(parseInt(e.target.value))}
          style={{ width: 80 }} />
        <span style={{ fontWeight: 800, fontSize: 14, color: localScore >= 7 ? '#10b981' : localScore >= 5 ? '#f59e0b' : '#ef4444', width: 24, textAlign: 'center' }}>
          {localScore}
        </span>
      </div>
      <input className="input-field" placeholder="Comentario..."
        value={localComment} onChange={e => setLocalComment(e.target.value)}
        style={{ width: 150, fontSize: 10 }} />
      <button className="btn btn-outline btn-sm" onClick={() => onSave(player.id, localScore, localComment)}>
        <Save size={10} />
      </button>
    </div>
  );
}
