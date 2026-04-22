import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit3, Save, X, User, Camera, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import FieldCanvas from '../components/FieldCanvas';

const PIZARRA_ARROW_TYPES = [
  { id: "pass", label: "Pase", color: "#ffe066" },
  { id: "run", label: "Carrera", color: "#4de8a0" },
  { id: "shoot", label: "Disparo", color: "#ff6b6b" },
];

const POSITIONS = ['Portero', 'Central', 'Lateral Derecho', 'Lateral Izquierdo', 'Mediocentro', 'Mediapunta', 'Medio Defensivo', 'Interior', 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro', 'Carrilero'];

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
  const { isAdmin } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', surname: '', number: '', position: '', is_starter: true });
  const [expandedId, setExpandedId] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadingId, setUploadingId] = useState(null);

  // Pizarra de análisis
  const [showPizarra, setShowPizarra] = useState(false);
  const [pizarraTokens, setPizarraTokens] = useState([]);
  const [pizarraArrows, setPizarraArrows] = useState([]);
  const [pizarraTool, setPizarraTool] = useState('move');
  const [pizarraArrowType, setPizarraArrowType] = useState('pass');
  const [pizarraDrawPt, setPizarraDrawPt] = useState(null);

  const pizarraTogglePlayer = (p, isRival) => {
    const label = String(p.number || '?');
    const has = pizarraTokens.find(t => t.kind === 'player' && t.label === label && !!t.isRival === isRival);
    if (has) {
      setPizarraTokens(ts => ts.filter(t => t.id !== has.id));
    } else {
      setPizarraTokens(ts => [...ts, {
        id: `piz_${label}${isRival ? 'R' : ''}t${Date.now()}`,
        kind: 'player',
        x: 100 + Math.random() * 350,
        y: 50 + Math.random() * 260,
        color: isRival ? '#ef4444' : '#0057ff',
        label,
        name: isRival ? null : p.name,
        isRival,
      }]);
    }
  };

  const pizarraAddToken = (kind) => {
    setPizarraTokens(ts => [...ts, {
      id: kind + Date.now(),
      kind,
      x: 200 + Math.random() * 150,
      y: 100 + Math.random() * 150,
    }]);
  };

  const pizarraClear = () => {
    setPizarraTokens([]);
    setPizarraArrows([]);
    setPizarraDrawPt(null);
  };

  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    const { data } = await supabase.from('roster').select('*').order('number', { ascending: true, nullsFirst: false });
    setPlayers(data || []);
    setLoading(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name, surname: p.surname, position: p.position || '',
      number: p.number || '', is_starter: p.is_starter !== false,
      stats: p.stats || {}
    });
  };

  const saveEdit = async (id) => {
    await supabase.from('roster').update({
      name: editForm.name, surname: editForm.surname,
      position: editForm.position, number: editForm.number || null,
      is_starter: editForm.is_starter, stats: editForm.stats
    }).eq('id', id);
    setPlayers(players.map(p => p.id === id ? { ...p, ...editForm, number: editForm.number || null } : p));
    setEditingId(null);
  };

  const updateStat = (key, value) => {
    setEditForm(f => ({ ...f, stats: { ...f.stats, [key]: isNaN(Number(value)) ? value : Number(value) } }));
  };

  const addPlayer = async () => {
    if (!addForm.name || !addForm.surname) { alert('Pon nombre y apellidos'); return; }
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
  };

  const deletePlayer = async (id) => {
    if (!confirm('¿Eliminar este jugador?')) return;
    await supabase.from('roster').delete().eq('id', id);
    setPlayers(players.filter(p => p.id !== id));
  };

  const handlePhotoUpload = async (playerId, file) => {
    if (!file) return;
    setUploadingId(playerId);
    const dataUrl = await resizeImage(file, 200);
    await supabase.from('roster').update({ photo_url: dataUrl }).eq('id', playerId);
    setPlayers(players.map(p => p.id === playerId ? { ...p, photo_url: dataUrl } : p));
    setUploadingId(null);
  };

  const triggerPhotoUpload = (playerId) => {
    setUploadingId(playerId);
    fileInputRef.current?.click();
  };

  const starters = players.filter(p => p.is_starter !== false);
  const subs = players.filter(p => p.is_starter === false);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#96a0b5' }}>Cargando plantilla...</div>;

  return (
    <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f && uploadingId) handlePhotoUpload(uploadingId, f); e.target.value = ''; }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>👥 Plantilla Cabrerizos F.C.</h2>
          <div style={{ fontSize: 11, color: '#96a0b5', marginTop: 2 }}>Juvenil B · {players.length} jugadores</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`btn btn-sm ${showPizarra ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowPizarra(v => !v)}>
            ⚽ Pizarra de análisis
          </button>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={14} /> Añadir
            </button>
          )}
        </div>
      </div>

      {/* Pizarra de análisis */}
      {showPizarra && (
        <div style={{ marginBottom: 20, border: '1.5px solid #e0e4ed', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
          <div style={{ display: 'flex', height: 440 }}>
            {/* Toolbar */}
            <div style={{ width: 170, background: '#f8f9fb', borderRight: '1px solid #e0e4ed', padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#0057ff', textTransform: 'uppercase', marginBottom: 2 }}>Cabrerizos FC</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {players.map(p => {
                  const label = String(p.number || '?');
                  const on = pizarraTokens.some(t => t.kind === 'player' && t.label === label && !t.isRival);
                  return (
                    <div key={p.id} onClick={() => pizarraTogglePlayer(p, false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 7, cursor: 'pointer', background: on ? '#eef3ff' : 'white', border: `1px solid ${on ? '#0057ff' : '#e0e4ed'}`, transition: 'all .1s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: 'white', flexShrink: 0 }}>{p.number || '?'}</div>
                      <span style={{ fontSize: 9, fontWeight: on ? 700 : 500, flex: 1 }}>{p.name}</span>
                      {on && <span style={{ fontSize: 8, color: '#0057ff' }}>✓</span>}
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginTop: 8 }}>Rival</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Array.from({ length: 11 }).map((_, i) => {
                  const num = String(i + 1);
                  const on = pizarraTokens.some(t => t.kind === 'player' && t.label === num && t.isRival);
                  return (
                    <div key={i} onClick={() => pizarraTogglePlayer({ number: i + 1 }, true)}
                      style={{ width: 26, height: 26, borderRadius: '50%', background: on ? '#ef4444' : '#fee2e2', border: `2px solid ${on ? '#ef4444' : '#fca5a5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, cursor: 'pointer', color: on ? 'white' : '#ef4444' }}>
                      {num}
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid #e0e4ed', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Elementos</div>
                <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', gap: 6, fontSize: 10 }} onClick={() => pizarraAddToken('ball')}>⚽ Balón</button>
                <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', gap: 6, fontSize: 10 }} onClick={() => pizarraAddToken('cone')}>🔺 Cono</button>
                <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', gap: 6, fontSize: 10 }} onClick={() => pizarraAddToken('goal')}>🥅 Portería</button>
              </div>

              <div style={{ borderTop: '1px solid #e0e4ed', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Herramienta</div>
                {[
                  { id: 'move', label: '↕ Mover' },
                  { id: 'arrow', label: '→ Flecha' },
                ].map(t => (
                  <button key={t.id} onClick={() => setPizarraTool(t.id)}
                    className={`btn btn-sm ${pizarraTool === t.id ? 'btn-primary' : 'btn-outline'}`}
                    style={{ justifyContent: 'flex-start', fontSize: 10 }}>
                    {t.label}
                  </button>
                ))}
                {pizarraTool === 'arrow' && (
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {PIZARRA_ARROW_TYPES.map(a => (
                      <button key={a.id} onClick={() => setPizarraArrowType(a.id)}
                        style={{ flex: 1, padding: '3px 4px', borderRadius: 6, border: `2px solid ${pizarraArrowType === a.id ? a.color : '#e0e4ed'}`, background: pizarraArrowType === a.id ? `${a.color}22` : 'white', cursor: 'pointer', fontSize: 8, fontWeight: 700 }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn btn-outline btn-sm" style={{ fontSize: 10 }} onClick={() => setPizarraArrows([])}>🗑 Borrar flechas</button>
                <button className="btn btn-outline btn-sm" style={{ fontSize: 10, color: '#ef4444' }} onClick={pizarraClear}>✕ Limpiar todo</button>
              </div>

              <div style={{ fontSize: 8, color: '#96a0b5', textAlign: 'center', marginTop: 4, lineHeight: 1.4 }}>
                Clic derecho o doble clic para eliminar elemento
              </div>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, background: '#2a6118' }}>
              <FieldCanvas
                tokens={pizarraTokens}
                arrows={pizarraArrows}
                onMove={(id, x, y) => setPizarraTokens(ts => ts.map(t => t.id === id ? { ...t, x, y } : t))}
                tool={pizarraTool}
                arrowType={pizarraArrowType}
                onArrow={a => setPizarraArrows(as => [...as, a])}
                drawPt={pizarraDrawPt}
                setDrawPt={setPizarraDrawPt}
                onPlace={(kind, x, y) => setPizarraTokens(ts => [...ts, { id: kind + Date.now(), kind, x, y }])}
                onDelete={id => setPizarraTokens(ts => ts.filter(t => t.id !== id))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Team summary bar */}
      <TeamSummary players={players} />

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
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={addPlayer}>Añadir</button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Titulares */}
      <SectionHeader title="Titulares" count={starters.length} color="#0057ff" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginBottom: 24 }}>
        {starters.map(p => (
          <PlayerCard key={p.id} player={p} isAdmin={isAdmin}
            isEditing={editingId === p.id} editForm={editForm} setEditForm={setEditForm}
            onStartEdit={() => startEdit(p)} onCancelEdit={() => setEditingId(null)}
            onSaveEdit={() => saveEdit(p.id)} onDelete={() => deletePlayer(p.id)}
            onPhotoClick={() => triggerPhotoUpload(p.id)} uploading={uploadingId === p.id}
            updateStat={updateStat} expanded={expandedId === p.id}
            onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)} />
        ))}
      </div>

      {subs.length > 0 && (
        <>
          <SectionHeader title="Suplentes / Cadete" count={subs.length} color="#f59e0b" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {subs.map(p => (
              <PlayerCard key={p.id} player={p} isAdmin={isAdmin}
                isEditing={editingId === p.id} editForm={editForm} setEditForm={setEditForm}
                onStartEdit={() => startEdit(p)} onCancelEdit={() => setEditingId(null)}
                onSaveEdit={() => saveEdit(p.id)} onDelete={() => deletePlayer(p.id)}
                onPhotoClick={() => triggerPhotoUpload(p.id)} uploading={uploadingId === p.id}
                updateStat={updateStat} expanded={expandedId === p.id}
                onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ========== TEAM SUMMARY ========== */
function TeamSummary({ players }) {
  const withStats = players.filter(p => p.stats?.matches_played > 0);
  const totals = withStats.reduce((acc, p) => {
    const s = p.stats || {};
    acc.goals += s.goals || 0;
    acc.assists += s.assists || 0;
    acc.yellow += s.yellow_cards || 0;
    acc.red += s.red_cards || 0;
    acc.minutes += s.minutes || 0;
    return acc;
  }, { goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0 });
  const avgRating = withStats.length > 0
    ? (withStats.reduce((sum, p) => sum + (p.stats?.rating || 0), 0) / withStats.length).toFixed(2)
    : '-';

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      <SummaryCard icon="⚽" label="Goles" value={totals.goals} color="#10b981" />
      <SummaryCard icon="🅰️" label="Asist." value={totals.assists} color="#3b82f6" />
      <SummaryCard icon="🟨" label="Amarillas" value={totals.yellow} color="#f59e0b" />
      <SummaryCard icon="🟥" label="Rojas" value={totals.red} color="#ef4444" />
      <SummaryCard icon="⏱️" label="Min. totales" value={totals.minutes.toLocaleString()} color="#8b5cf6" />
      <SummaryCard icon="⭐" label="Val. media" value={avgRating} color="#0057ff" />
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div style={{ flex: '1 1 100px', minWidth: 90, background: 'white', border: '1px solid #e2e6ed', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 9, color: '#96a0b5', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function SectionHeader({ title, count, color }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {title} ({count})
    </div>
  );
}

/* ========== PLAYER CARD ========== */
function PlayerCard({ player: p, isAdmin, isEditing, editForm, setEditForm, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onPhotoClick, uploading, updateStat, expanded, onToggleExpand }) {
  const stats = p.stats || {};
  const hasStats = stats.matches_played > 0;

  if (isEditing) {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>✏️ Editar jugador</div>
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
        <select className="input-field" value={editForm.is_starter ? 'true' : 'false'} onChange={e => setEditForm(f => ({ ...f, is_starter: e.target.value === 'true' }))} style={{ marginBottom: 8, width: '100%' }}>
          <option value="true">Titular</option>
          <option value="false">Suplente</option>
        </select>

        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>📊 Estadísticas:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
          <StatInput label="Conv." value={editForm.stats?.matches_played} onChange={v => updateStat('matches_played', v)} />
          <StatInput label="Tit." value={editForm.stats?.starts} onChange={v => updateStat('starts', v)} />
          <StatInput label="Min." value={editForm.stats?.minutes} onChange={v => updateStat('minutes', v)} />
          <StatInput label="Goles" value={editForm.stats?.goals} onChange={v => updateStat('goals', v)} />
          <StatInput label="Asist." value={editForm.stats?.assists} onChange={v => updateStat('assists', v)} />
          <StatInput label="🟨" value={editForm.stats?.yellow_cards} onChange={v => updateStat('yellow_cards', v)} />
          <StatInput label="🟥" value={editForm.stats?.red_cards} onChange={v => updateStat('red_cards', v)} />
          <StatInput label="Val." value={editForm.stats?.rating} onChange={v => updateStat('rating', v)} />
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={onSaveEdit}><Save size={11} /> Guardar</button>
          <button className="btn btn-outline btn-sm" onClick={onCancelEdit}><X size={11} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 12, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: hasStats ? 8 : 0 }}>
        {/* Photo */}
        <div onClick={isAdmin ? onPhotoClick : undefined}
          style={{ width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#0057ff', overflow: 'hidden', border: '2.5px solid #e2e6ed', cursor: isAdmin ? 'pointer' : 'default', position: 'relative', flexShrink: 0 }}>
          {p.photo_url ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.number || <User size={22} />)}
          {isAdmin && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={9} color="white" /></div>}
          {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}><div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</span>
            {p.number && <span style={{ fontWeight: 800, fontSize: 12, color: '#0057ff' }}>#{p.number}</span>}
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#64748b' }}>{p.surname}</div>
          <div style={{ fontSize: 10, color: '#96a0b5', display: 'flex', gap: 6, marginTop: 1, flexWrap: 'wrap' }}>
            {p.position && <span>{p.position}</span>}
            {stats.age > 0 && <span>{stats.age} años</span>}
            {stats.laterality && stats.laterality !== 'Desconocido' && <span>· {stats.laterality}</span>}
          </div>
        </div>

        {/* Rating badge */}
        {stats.rating > 0 && (
          <div style={{ width: 36, height: 36, borderRadius: 8, background: stats.rating >= 5 ? '#ecfdf5' : stats.rating >= 4.7 ? '#fefce8' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: stats.rating >= 5 ? '#059669' : stats.rating >= 4.7 ? '#d97706' : '#dc2626' }}>{stats.rating}</span>
          </div>
        )}
      </div>

      {/* Quick stat badges */}
      {hasStats && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
          <Badge label="Conv" value={stats.matches_played} color="#6366f1" />
          <Badge label="Tit" value={stats.starts} color="#0057ff" />
          <Badge label="Min" value={stats.minutes} color="#8b5cf6" />
          {stats.goals > 0 && <Badge label="⚽" value={stats.goals} color="#10b981" />}
          {stats.assists > 0 && <Badge label="🅰️" value={stats.assists} color="#3b82f6" />}
          {stats.yellow_cards > 0 && <Badge label="🟨" value={stats.yellow_cards} color="#f59e0b" />}
          {stats.red_cards > 0 && <Badge label="🟥" value={stats.red_cards} color="#ef4444" />}
        </div>
      )}

      {/* Expand for more details */}
      {hasStats && (
        <button onClick={onToggleExpand} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10, color: '#96a0b5', padding: '4px 0 0' }}>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Ocultar' : 'Ver detalle'}
        </button>
      )}

      {expanded && hasStats && (
        <div style={{ marginTop: 6, padding: '8px 0 0', borderTop: '1px solid #f1f3f7' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, fontSize: 10 }}>
            <DetailRow label="Convocatorias" value={stats.matches_played} />
            <DetailRow label="Titularidades" value={stats.starts} />
            <DetailRow label="Suplencias" value={stats.sub_appearances} />
            <DetailRow label="Minutos" value={stats.minutes?.toLocaleString()} />
            <DetailRow label="Goles" value={stats.goals} highlight={stats.goals > 0} />
            <DetailRow label="Asistencias" value={stats.assists} highlight={stats.assists > 0} />
            <DetailRow label="T. Amarillas" value={stats.yellow_cards} warn={stats.yellow_cards > 3} />
            <DetailRow label="T. Rojas" value={stats.red_cards} danger={stats.red_cards > 0} />
            {stats.club_origin && <DetailRow label="Club origen" value={stats.club_origin} />}
            {stats.birth_date && <DetailRow label="Nacimiento" value={stats.birth_date.split('-').reverse().join('/')} />}
          </div>
        </div>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <button onClick={onStartEdit} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}><Edit3 size={11} /> Editar</button>
          <button onClick={onDelete} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }}><Trash2 size={11} /></button>
        </div>
      )}
    </div>
  );
}

function Badge({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 6, background: `${color}10`, fontSize: 10, fontWeight: 700 }}>
      <span style={{ color }}>{label}</span>
      <span style={{ color: '#334155' }}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, highlight, warn, danger }) {
  let valColor = '#334155';
  if (highlight) valColor = '#059669';
  if (warn) valColor = '#d97706';
  if (danger) valColor = '#dc2626';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{ color: '#96a0b5' }}>{label}</span>
      <span style={{ fontWeight: 700, color: valColor }}>{value || 0}</span>
    </div>
  );
}

function StatInput({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', flex: 1 }}>{label}</span>
      <input type="number" step="any" className="input-field" value={value || 0} onChange={e => onChange(e.target.value)} style={{ width: 55, textAlign: 'center', padding: '3px 4px' }} />
    </div>
  );
}
