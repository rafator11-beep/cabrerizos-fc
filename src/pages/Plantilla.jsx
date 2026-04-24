import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit3, Save, X, User, Camera, Plus, Trash2, ChevronDown, ChevronUp, Activity, Move, Spline } from 'lucide-react';
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
        name: isRival ? null : [p.name, p.surname].filter(Boolean).join(' ').trim(),
        photo_url: isRival ? '' : (p.photo_url || ''),
        assigned_player_id: isRival ? null : p.id,
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

      {/* Pizarra de análisis - MOBILE FIRST REDESIGN */}
      {showPizarra && (
        <div className="fixed inset-0 z-[120] bg-bg flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/10 bg-surface/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Pizarra de Análisis</h2>
                <span className="text-[9px] font-black text-muted uppercase tracking-widest mt-1 block">Juvenil B · Cabrerizos FC</span>
              </div>
            </div>
            <button onClick={() => setShowPizarra(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 md:flex-row overflow-hidden">
            {/* Field Container - TOP on mobile, FLEX-1 on desktop */}
            <div className="flex-1 min-h-0 bg-surface-2 relative group flex flex-col">
              {/* Field Toolbar Overlay */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                  <button onClick={() => setPizarraTool('move')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${pizarraTool === 'move' ? 'bg-accent text-bg' : 'bg-black/40 backdrop-blur-md text-white border border-white/10'}`}>
                    <Move size={18} />
                  </button>
                  <button onClick={() => setPizarraTool('arrow')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${pizarraTool === 'arrow' ? 'bg-accent text-bg' : 'bg-black/40 backdrop-blur-md text-white border border-white/10'}`}>
                    <Spline size={18} />
                  </button>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button onClick={pizarraClear} className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md text-rose-500 border border-white/10 flex items-center justify-center shadow-xl active:scale-90 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Tool Options Popover (only if arrow tool active) */}
              {pizarraTool === 'arrow' && (
                <div className="absolute top-16 left-4 z-20 flex gap-2 p-1 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 animate-in slide-in-from-left duration-200">
                  {PIZARRA_ARROW_TYPES.map(a => (
                    <button key={a.id} onClick={() => setPizarraArrowType(a.id)} 
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${pizarraArrowType === a.id ? 'bg-white text-bg' : 'text-white/60 hover:text-white'}`}
                      style={{ color: pizarraArrowType === a.id ? '#000' : a.color }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a6118] to-[#1e4511] opacity-50" />
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
                  viewMode="full"
                  adaptiveView={false}
                />
              </div>

              {/* Quick Elements Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
                <button onClick={() => pizarraAddToken('ball')} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-active:scale-90 transition-all">⚽</div>
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Balón</span>
                </button>
                <div className="w-[1px] h-6 bg-white/10" />
                <button onClick={() => pizarraAddToken('cone')} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center group-active:scale-90 transition-all">🔺</div>
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Cono</span>
                </button>
                <div className="w-[1px] h-6 bg-white/10" />
                <button onClick={() => pizarraAddToken('goal')} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 bg-surface rounded-xl border border-white/20 flex items-center justify-center group-active:scale-90 transition-all text-white">🥅</div>
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Arco</span>
                </button>
              </div>
            </div>

            {/* Controls Panel - BOTTOM on mobile, SIDE on desktop */}
            <div className="h-[280px] md:h-full md:w-[320px] flex-shrink-0 bg-surface border-t md:border-t-0 md:border-l border-white/10 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                
                {/* Cabrerizos Players */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Cabrerizos FC</h4>
                    <span className="text-[10px] font-black text-muted opacity-40">Toca para añadir</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {players.map(p => {
                      const label = String(p.number || '?');
                      const on = pizarraTokens.some(t => t.kind === 'player' && t.label === label && !t.isRival);
                      return (
                        <button key={p.id} onClick={() => pizarraTogglePlayer(p, false)}
                          className={`flex items-center gap-3 p-2 rounded-xl border transition-all text-left ${on ? 'bg-accent/10 border-accent/40 text-white' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${on ? 'bg-accent text-bg shadow-lg shadow-accent/20' : 'bg-white/5 text-muted'}`}>{p.number || '?'}</div>
                          <span className="text-[10px] font-bold truncate uppercase">{p.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rival Players */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] px-1">Rival</h4>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {Array.from({ length: 11 }).map((_, i) => {
                      const num = String(i + 1);
                      const on = pizarraTokens.some(t => t.kind === 'player' && t.label === num && t.isRival);
                      return (
                        <button key={i} onClick={() => pizarraTogglePlayer({ number: i + 1 }, true)}
                          className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-[11px] font-black transition-all ${on ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-black/20 border-t border-white/5">
                <button onClick={() => setShowPizarra(false)} className="w-full py-4 bg-accent text-bg font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all">
                  FINALIZAR ANÁLISIS
                </button>
              </div>
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
          style={{ width: 50, height: 64, borderRadius: 14, background: 'linear-gradient(180deg,#f8fafc,#e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#0057ff', overflow: 'hidden', border: '2px solid #dbe4f0', cursor: isAdmin ? 'pointer' : 'default', position: 'relative', flexShrink: 0, boxShadow: '0 10px 22px rgba(15,23,42,.12)' }}>
          {p.photo_url ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.number || <User size={22} />)}
          {isAdmin && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 18, background: 'linear-gradient(180deg,rgba(15,23,42,.25),rgba(15,23,42,.78))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={10} color="white" /></div>}
          {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}><div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}
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
