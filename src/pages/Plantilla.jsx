import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit3, Save, X, User, Camera, Plus, Trash2, Upload } from 'lucide-react';

const POSITIONS = ['Portero', 'Central', 'Lateral Derecho', 'Lateral Izquierdo', 'Mediocentro', 'Mediapunta', 'Medio Defensivo', 'Interior', 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro', 'Carrilero'];

// Resize image to max 200x200 and return as data URL
function resizeImage(file, maxSize = 200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { h = (h / w) * maxSize; w = maxSize; }
        else { w = (w / h) * maxSize; h = maxSize; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Plantilla() {
  const { isAdmin, user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', surname: '', number: '', position: '', is_starter: true });
  const fileInputRef = useRef(null);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('roster').select('*').order('number', { ascending: true, nullsFirst: false });
      setPlayers(data || []);
    } catch { }
    setLoading(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name, surname: p.surname, position: p.position || '',
      number: p.number || '', is_starter: p.is_starter !== false,
      stats: p.stats || { goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, matches_played: 0 }
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    try {
      await supabase.from('roster').update({
        name: editForm.name, surname: editForm.surname,
        position: editForm.position, number: editForm.number || null,
        is_starter: editForm.is_starter, stats: editForm.stats
      }).eq('id', id);
      setPlayers(players.map(p => p.id === id ? { ...p, ...editForm, number: editForm.number || null } : p));
      setEditingId(null);
    } catch { alert('Error al guardar.'); }
  };

  const updateStat = (key, value) => {
    setEditForm(f => ({ ...f, stats: { ...f.stats, [key]: parseInt(value) || 0 } }));
  };

  const addPlayer = async () => {
    if (!addForm.name || !addForm.surname) { alert('Pon nombre y apellidos'); return; }
    try {
      const { data } = await supabase.from('roster').insert([{
        name: addForm.name, surname: addForm.surname,
        number: addForm.number ? parseInt(addForm.number) : null,
        position: addForm.position, is_starter: addForm.is_starter,
        stats: {}, photo_url: ''
      }]).select().single();
      if (data) {
        setPlayers([...players, data]);
        setShowAddForm(false);
        setAddForm({ name: '', surname: '', number: '', position: '', is_starter: true });
      }
    } catch { alert('Error al añadir jugador.'); }
  };

  const deletePlayer = async (id) => {
    if (!confirm('¿Eliminar este jugador de la plantilla?')) return;
    await supabase.from('roster').delete().eq('id', id);
    setPlayers(players.filter(p => p.id !== id));
  };

  // Photo upload handler
  const handlePhotoUpload = async (playerId, file) => {
    if (!file) return;
    setUploadingId(playerId);
    try {
      const dataUrl = await resizeImage(file, 200);
      await supabase.from('roster').update({ photo_url: dataUrl }).eq('id', playerId);
      setPlayers(players.map(p => p.id === playerId ? { ...p, photo_url: dataUrl } : p));
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Error al subir la foto.');
    }
    setUploadingId(null);
  };

  const triggerPhotoUpload = (playerId) => {
    setUploadingId(playerId);
    fileInputRef.current?.click();
  };

  const starters = players.filter(p => p.is_starter !== false);
  const subs = players.filter(p => p.is_starter === false);

  if (loading) return <div style={{ padding: 20, color: '#96a0b5' }}>Cargando plantilla...</div>;

  return (
    <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingId) handlePhotoUpload(uploadingId, file);
          e.target.value = '';
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>👥 Plantilla Cabrerizos F.C.</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={14} /> Añadir jugador
          </button>
        )}
      </div>

      {/* Add player form */}
      {showAddForm && isAdmin && (
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Nuevo jugador</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input className="input-field" placeholder="Nombre" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 1 }} />
            <input className="input-field" placeholder="Apellidos" value={addForm.surname} onChange={e => setAddForm(f => ({ ...f, surname: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input type="number" className="input-field" placeholder="Dorsal" value={addForm.number} onChange={e => setAddForm(f => ({ ...f, number: e.target.value }))} style={{ width: 80 }} />
            <select className="input-field" value={addForm.position} onChange={e => setAddForm(f => ({ ...f, position: e.target.value }))} style={{ flex: 1 }}>
              <option value="">Posición...</option>
              {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </select>
            <select className="input-field" value={addForm.is_starter ? 'true' : 'false'} onChange={e => setAddForm(f => ({ ...f, is_starter: e.target.value === 'true' }))} style={{ width: 110 }}>
              <option value="true">Titular</option>
              <option value="false">Suplente</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={addPlayer}>Añadir</button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Titulares */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#0057ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0057ff' }} />
        Titulares ({starters.length})
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginBottom: 24 }}>
        {starters.map(p => (
          <PlayerCard
            key={p.id}
            player={p}
            isAdmin={isAdmin}
            isEditing={editingId === p.id}
            editForm={editForm}
            setEditForm={setEditForm}
            onStartEdit={() => startEdit(p)}
            onCancelEdit={cancelEdit}
            onSaveEdit={() => saveEdit(p.id)}
            onDelete={() => deletePlayer(p.id)}
            onPhotoClick={() => triggerPhotoUpload(p.id)}
            uploading={uploadingId === p.id}
            updateStat={updateStat}
          />
        ))}
      </div>

      {/* Suplentes */}
      {subs.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            Suplentes ({subs.length})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {subs.map(p => (
              <PlayerCard
                key={p.id}
                player={p}
                isAdmin={isAdmin}
                isEditing={editingId === p.id}
                editForm={editForm}
                setEditForm={setEditForm}
                onStartEdit={() => startEdit(p)}
                onCancelEdit={cancelEdit}
                onSaveEdit={() => saveEdit(p.id)}
                onDelete={() => deletePlayer(p.id)}
                onPhotoClick={() => triggerPhotoUpload(p.id)}
                uploading={uploadingId === p.id}
                updateStat={updateStat}
              />
            ))}
          </div>
        </>
      )}

      {players.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#96a0b5' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>No hay jugadores en la plantilla.</div>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, isAdmin, isEditing, editForm, setEditForm, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onPhotoClick, uploading, updateStat }) {
  const p = player;
  const stats = p.stats || {};

  if (isEditing) {
    return (
      <div className="card" style={{ padding: 14 }}>
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
        <select className="input-field" value={editForm.is_starter ? 'true' : 'false'} onChange={e => setEditForm(f => ({ ...f, is_starter: e.target.value === 'true' }))} style={{ marginBottom: 6, width: '100%' }}>
          <option value="true">Titular</option>
          <option value="false">Suplente</option>
        </select>

        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Estadísticas:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
          <StatInput label="Partidos" value={editForm.stats?.matches_played} onChange={v => updateStat('matches_played', v)} />
          <StatInput label="Goles" value={editForm.stats?.goals} onChange={v => updateStat('goals', v)} />
          <StatInput label="Asistencias" value={editForm.stats?.assists} onChange={v => updateStat('assists', v)} />
          <StatInput label="🟨 Amarillas" value={editForm.stats?.yellow_cards} onChange={v => updateStat('yellow_cards', v)} />
          <StatInput label="🟥 Rojas" value={editForm.stats?.red_cards} onChange={v => updateStat('red_cards', v)} />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={onSaveEdit}><Save size={11} /> Guardar</button>
          <button className="btn btn-outline btn-sm" onClick={onCancelEdit}><X size={11} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 12, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {/* Photo / Avatar */}
        <div
          onClick={isAdmin ? onPhotoClick : undefined}
          style={{
            width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#0057ff', overflow: 'hidden',
            border: '2.5px solid #e2e6ed', cursor: isAdmin ? 'pointer' : 'default',
            position: 'relative', flexShrink: 0,
          }}
        >
          {p.photo_url ? (
            <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            p.number || <User size={22} />
          )}
          {/* Camera overlay for admin */}
          {isAdmin && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 18, background: 'rgba(0,0,0,.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Camera size={10} color="white" />
            </div>
          )}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
            }}>
              <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>{p.surname}</div>
          <div style={{ fontSize: 11, color: '#96a0b5', display: 'flex', gap: 6, marginTop: 2 }}>
            {p.position && <span>{p.position}</span>}
            {p.number && <span style={{ fontWeight: 700, color: '#0057ff' }}>#{p.number}</span>}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {stats.matches_played != null && stats.matches_played > 0 && <StatBadge label="PJ" value={stats.matches_played} color="#6366f1" />}
        {stats.goals != null && stats.goals > 0 && <StatBadge label="G" value={stats.goals} color="#10b981" />}
        {stats.assists != null && stats.assists > 0 && <StatBadge label="A" value={stats.assists} color="#3b82f6" />}
        {stats.yellow_cards != null && stats.yellow_cards > 0 && <StatBadge label="🟨" value={stats.yellow_cards} color="#f59e0b" />}
        {stats.red_cards != null && stats.red_cards > 0 && <StatBadge label="🟥" value={stats.red_cards} color="#ef4444" />}
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <button onClick={onStartEdit} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            <Edit3 size={11} /> Editar
          </button>
          <button onClick={onDelete} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }}>
            <Trash2 size={11} />
          </button>
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
