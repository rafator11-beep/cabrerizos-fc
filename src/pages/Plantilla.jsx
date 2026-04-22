import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit3, Save, X, User, Shield, Camera } from 'lucide-react';

const POSITIONS = ['Portero', 'Central', 'Lateral Derecho', 'Lateral Izquierdo', 'Mediocentro', 'Mediapunta', 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro', 'Carrilero'];

export default function Plantilla() {
  const { isAdmin, profile, user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').order('number', { ascending: true, nullsFirst: false });
      setPlayers(data || []);
    } catch { }
    setLoading(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name, surname: p.surname, position: p.position || '',
      number: p.number || '', photo_url: p.photo_url || '',
      stats: p.stats || { goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, matches_played: 0 }
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    try {
      await supabase.from('profiles').update({
        name: editForm.name, surname: editForm.surname,
        position: editForm.position, number: editForm.number || null,
        photo_url: editForm.photo_url, stats: editForm.stats
      }).eq('id', id);
      setPlayers(players.map(p => p.id === id ? { ...p, ...editForm, number: editForm.number || null } : p));
      setEditingId(null);
      if (selectedPlayer?.id === id) setSelectedPlayer({ ...selectedPlayer, ...editForm });
    } catch { alert('Error al guardar.'); }
  };

  const updateStat = (key, value) => {
    setEditForm(f => ({ ...f, stats: { ...f.stats, [key]: parseInt(value) || 0 } }));
  };

  const allPlayers = players.filter(p => p.role === 'player');
  const admins = players.filter(p => p.role === 'admin');

  if (loading) return <div style={{ padding: 20, color: '#96a0b5' }}>Cargando plantilla...</div>;

  return (
    <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0' }}>👥 Plantilla</h2>

      {/* Staff */}
      {admins.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#96a0b5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Cuerpo Técnico</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {admins.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#eef3ff', borderRadius: 10, border: '1px solid #c7d5ff' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>
                  {a.photo_url ? <img src={a.photo_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> : '🔑'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{a.name} {a.surname}</div>
                  <div style={{ fontSize: 10, color: '#0057ff' }}>Entrenador</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players Grid */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#96a0b5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Jugadores ({allPlayers.length})
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {allPlayers.map(p => {
          const isEditing = editingId === p.id;
          const stats = p.stats || {};
          const isMe = p.id === user?.id;

          return (
            <div key={p.id} className="card" style={{
              padding: isEditing ? 14 : 12, position: 'relative',
              border: isMe ? '2px solid #0057ff' : '1px solid #e2e6ed',
              background: isMe ? '#f8faff' : 'white',
            }}>
              {isMe && (
                <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 9, fontWeight: 700, color: '#0057ff', background: '#eef3ff', padding: '2px 6px', borderRadius: 8 }}>
                  Tú
                </div>
              )}

              {!isEditing ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 800, color: '#0057ff', overflow: 'hidden',
                      border: '2px solid #e2e6ed'
                    }}>
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        p.number || <User size={20} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{p.name} {p.surname}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {p.position || 'Sin posición'}
                        {p.number && <span> · #{p.number}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {stats.matches_played != null && <StatBadge label="PJ" value={stats.matches_played} color="#6366f1" />}
                    {stats.goals != null && <StatBadge label="G" value={stats.goals} color="#10b981" />}
                    {stats.assists != null && <StatBadge label="A" value={stats.assists} color="#3b82f6" />}
                    {stats.yellow_cards != null && <StatBadge label="🟨" value={stats.yellow_cards} color="#f59e0b" />}
                    {stats.red_cards != null && <StatBadge label="🟥" value={stats.red_cards} color="#ef4444" />}
                  </div>

                  {isAdmin && (
                    <button onClick={() => startEdit(p)} className="btn btn-outline btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                      <Edit3 size={11} /> Editar
                    </button>
                  )}
                </>
              ) : (
                /* Editing mode */
                <>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Editar jugador</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input className="input-field" placeholder="Nombre" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 1 }} />
                    <input className="input-field" placeholder="Apellidos" value={editForm.surname} onChange={e => setEditForm(f => ({ ...f, surname: e.target.value }))} style={{ flex: 1 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <select className="input-field" value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} style={{ flex: 1 }}>
                      <option value="">Posición...</option>
                      {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                    <input type="number" className="input-field" placeholder="Nº" value={editForm.number} onChange={e => setEditForm(f => ({ ...f, number: e.target.value }))} style={{ width: 60 }} />
                  </div>
                  <input className="input-field" placeholder="URL de la foto" value={editForm.photo_url} onChange={e => setEditForm(f => ({ ...f, photo_url: e.target.value }))} style={{ marginBottom: 6 }} />
                  
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Estadísticas:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
                    <StatInput label="Partidos" value={editForm.stats?.matches_played} onChange={v => updateStat('matches_played', v)} />
                    <StatInput label="Goles" value={editForm.stats?.goals} onChange={v => updateStat('goals', v)} />
                    <StatInput label="Asistencias" value={editForm.stats?.assists} onChange={v => updateStat('assists', v)} />
                    <StatInput label="🟨 Amarillas" value={editForm.stats?.yellow_cards} onChange={v => updateStat('yellow_cards', v)} />
                    <StatInput label="🟥 Rojas" value={editForm.stats?.red_cards} onChange={v => updateStat('red_cards', v)} />
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => saveEdit(p.id)}><Save size={11} /> Guardar</button>
                    <button className="btn btn-outline btn-sm" onClick={cancelEdit}><X size={11} /></button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {allPlayers.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#96a0b5' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>No hay jugadores registrados aún.</div>
          <div style={{ fontSize: 11, marginTop: 6 }}>Los jugadores aparecerán aquí cuando se registren en la app.</div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 6, background: `${color}10`, fontSize: 10, fontWeight: 700 }}>
      <span style={{ color }}>{label}</span>
      <span style={{ color: '#334155' }}>{value}</span>
    </div>
  );
}

function StatInput({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', flex: 1 }}>{label}</span>
      <input type="number" className="input-field" value={value || 0} onChange={e => onChange(e.target.value)} style={{ width: 50, textAlign: 'center', padding: '3px 4px' }} />
    </div>
  );
}
