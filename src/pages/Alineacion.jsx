import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Save, Trash2, Users, Layout, Calendar, ChevronRight, X, UserPlus, Shield, UserMinus } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1'];

const FORMATION_POSITIONS = {
  '4-3-3': [
    { x: 50, y: 185 }, { x: 130, y: 50 }, { x: 130, y: 140 }, { x: 130, y: 230 }, { x: 130, y: 320 },
    { x: 270, y: 100 }, { x: 270, y: 185 }, { x: 270, y: 270 }, { x: 410, y: 80 }, { x: 410, y: 185 }, { x: 410, y: 290 },
  ],
  '4-4-2': [
    { x: 50, y: 185 }, { x: 150, y: 50 }, { x: 150, y: 140 }, { x: 150, y: 230 }, { x: 150, y: 320 },
    { x: 290, y: 50 }, { x: 290, y: 140 }, { x: 290, y: 230 }, { x: 290, y: 320 }, { x: 420, y: 130 }, { x: 420, y: 240 },
  ],
  '4-2-3-1': [
    { x: 50, y: 185 }, { x: 140, y: 50 }, { x: 140, y: 140 }, { x: 140, y: 230 }, { x: 140, y: 320 },
    { x: 250, y: 140 }, { x: 250, y: 230 }, { x: 360, y: 80 }, { x: 360, y: 185 }, { x: 360, y: 290 }, { x: 440, y: 185 },
  ],
  '3-5-2': [
    { x: 50, y: 185 }, { x: 140, y: 100 }, { x: 140, y: 185 }, { x: 140, y: 270 },
    { x: 270, y: 40 }, { x: 270, y: 110 }, { x: 270, y: 185 }, { x: 270, y: 260 }, { x: 270, y: 330 },
    { x: 420, y: 130 }, { x: 420, y: 240 },
  ],
};

const W = 500;
const H = 370;

export default function Alineacion() {
  const { isAdmin, profile } = useAuth();
  const isMobile = useIsMobile();
  const [lineups, setLineups] = useState([]);
  const [activeLineup, setActiveLineup] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', formation: '4-3-3', match_date: '' });
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'field' | 'players'
  const svgRef = useRef(null);
  const drag = useRef(null);

  const [dragging, setDragging] = useState(null); // { type: 'starter'|'extra', index: number, x: number, y: number }
  const [extras, setExtras] = useState(() => {
    const saved = localStorage.getItem('alineacion_extras');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (activeLineup) {
      localStorage.setItem('alineacion_extras', JSON.stringify(extras));
    }
  }, [extras]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: l }, { data: p }] = await Promise.all([
        supabase.from('lineups').select('*').order('created_at', { ascending: false }),
        supabase.from('roster').select('*').order('number'),
      ]);
      setLineups(l || []);
      setPlayers(p || []);
      if (l?.length > 0) setActiveLineup(l[0]);
    } catch { }
    setLoading(false);
  };

  const createLineup = async () => {
    if (!form.name) return;
    const positions = FORMATION_POSITIONS[form.formation] || FORMATION_POSITIONS['4-3-3'];
    const starters = positions.map((pos, i) => ({ slot: i, player_id: null, x: pos.x, y: pos.y, number: null }));
    const { data } = await supabase.from('lineups').insert([{
      ...form, starters, substitutes: [], created_by: profile?.id
    }]).select().single();
    if (data) {
      setLineups([data, ...lineups]);
      setActiveLineup(data);
      setShowForm(false);
      if (isMobile) setMobileTab('field');
    }
  };

  const deleteLineup = async () => {
    if (!activeLineup || !confirm('¿Eliminar?')) return;
    await supabase.from('lineups').delete().eq('id', activeLineup.id);
    const remaining = lineups.filter(l => l.id !== activeLineup.id);
    setLineups(remaining);
    setActiveLineup(remaining[0] || null);
    if (isMobile) setMobileTab('list');
  };

  const saveLineup = async () => {
    if (!activeLineup) return;
    await supabase.from('lineups').update({
      starters: activeLineup.starters || [],
      substitutes: activeLineup.substitutes || [],
    }).eq('id', activeLineup.id);
    // Also save extras to local storage or could add a column in DB
    localStorage.setItem('alineacion_extras', JSON.stringify(extras));
    alert('Guardado con éxito 🔥');
  };

  const assignPlayer = (slotIndex, playerId) => {
    if (!activeLineup) return;
    const p = players.find(pl => pl.id === playerId);
    const starters = (activeLineup.starters || []).map((s, i) => {
      if (i === slotIndex) return { ...s, player_id: playerId, number: p?.number || null, name: p ? `${p.name}` : null };
      if (s.player_id === playerId) return { ...s, player_id: null, number: null, name: null };
      return s;
    });
    const substitutes = (activeLineup.substitutes || []).filter(s => s.player_id !== playerId);
    const upd = { ...activeLineup, starters, substitutes };
    setActiveLineup(upd);
    setLineups(ls => ls.map(l => l.id === upd.id ? upd : l));
  };

  const toggleSubstitute = (playerId) => {
    if (!activeLineup) return;
    const subs = activeLineup.substitutes || [];
    const exists = subs.find(s => s.player_id === playerId);
    if (exists) {
      const newSubs = subs.filter(s => s.player_id !== playerId);
      setActiveLineup({ ...activeLineup, substitutes: newSubs });
    } else {
      const starters = (activeLineup.starters || []).map(s => s.player_id === playerId ? { ...s, player_id: null, number: null, name: null } : s);
      const p = players.find(pl => pl.id === playerId);
      const newSubs = [...subs, { player_id: playerId, number: p?.number, name: p?.name }];
      setActiveLineup({ ...activeLineup, starters, substitutes: newSubs });
    }
  };

  const toSVG = (cx, cy) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
  };

  const onPointerDown = (e, type, index) => {
    if (!isAdmin) return;
    const pt = e.touches ? e.touches[0] : e;
    const c = toSVG(pt.clientX, pt.clientY);
    setDragging({ type, index, ox: c.x, oy: c.y });
    if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging || !isAdmin) return;
    const pt = e.touches ? e.touches[0] : e;
    const c = toSVG(pt.clientX, pt.clientY);
    
    if (dragging.type === 'starter') {
      const starters = [...activeLineup.starters];
      starters[dragging.index] = { ...starters[dragging.index], x: c.x, y: c.y };
      setActiveLineup(prev => ({ ...prev, starters }));
    } else if (dragging.type === 'extra') {
      const newExtras = [...extras];
      newExtras[dragging.index] = { ...newExtras[dragging.index], x: c.x, y: c.y };
      setExtras(newExtras);
    }
  };

  const onPointerUp = (e) => {
    if (!dragging) return;
    setDragging(null);
    if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
  };

  const addExtra = (kind) => {
    const newExtra = {
      id: `${kind}-${Date.now()}`,
      kind,
      x: W / 2,
      y: H / 2,
      color: kind === 'rival' ? '#ef4444' : '#fff'
    };
    setExtras([...extras, newExtra]);
  };

  const deleteExtra = (index) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const assignedIds = new Set((activeLineup?.starters || []).filter(s => s.player_id).map(s => s.player_id));
  const subIds = new Set((activeLineup?.substitutes || []).map(s => s.player_id));

  return (
    <div className="flex flex-col gap-4 h-full animate-fade-in relative no-scrollbar">
      
      {/* MOBILE TABS */}
      <div className="md:hidden segmented-control mx-auto w-full max-w-sm">
        <button onClick={() => setMobileTab('list')} className={`segmented-item ${mobileTab === 'list' ? 'segmented-item-active' : 'segmented-item-inactive'}`}>LISTA</button>
        <button onClick={() => setMobileTab('field')} className={`segmented-item ${mobileTab === 'field' ? 'segmented-item-active' : 'segmented-item-inactive'}`}>CAMPO</button>
        {isAdmin && <button onClick={() => setMobileTab('players')} className={`segmented-item ${mobileTab === 'players' ? 'segmented-item-active' : 'segmented-item-inactive'}`}>PLANTILLA</button>}
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* LIST PANEL */}
        <div className={`
          w-full md:w-[280px] flex-col gap-4 flex-shrink-0
          ${mobileTab === 'list' ? 'flex' : 'hidden md:flex'}
        `}>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Partidos</h2>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)} className="w-9 h-9 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center active:scale-90 transition-all">
                {showForm ? <X size={18} /> : <Plus size={18} />}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {showForm && (
              <div className="glass-card !p-4 space-y-3 animate-slide-up border border-accent/20 shadow-[0_0_30px_rgba(0,255,135,0.1)]">
                <input className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-accent/30" placeholder="Nombre del partido" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" value={form.formation} onChange={e => setForm(f => ({ ...f, formation: e.target.value }))}>
                    {FORMATIONS.map(f => <option key={f} value={f} className="bg-bg">{f}</option>)}
                  </select>
                  <input type="date" className="bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" value={form.match_date} onChange={e => setForm(f => ({ ...f, match_date: e.target.value }))} />
                </div>
                <button className="w-full py-3.5 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all" onClick={createLineup}>CREAR PARTIDO</button>
              </div>
            )}

            {lineups.map(l => (
              <button 
                key={l.id} 
                onClick={() => { setActiveLineup(l); if (isMobile) setMobileTab('field'); }}
                className={`
                  w-full flex flex-col p-4 rounded-2xl border transition-all text-left active:scale-98
                  ${activeLineup?.id === l.id ? 'bg-accent/10 border-accent/40 shadow-[0_8px_20px_rgba(0,255,135,0.15)]' : 'bg-surface-2/20 border-white/5 hover:border-white/10'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${activeLineup?.id === l.id ? 'bg-accent text-bg' : 'bg-white/5 text-muted'}`}>{l.formation}</span>
                  <span className="text-[9px] font-black text-muted/50 uppercase tracking-tighter">{l.match_date || 'Próximamente'}</span>
                </div>
                <h3 className={`text-sm font-bold truncate w-full ${activeLineup?.id === l.id ? 'text-white' : 'text-muted'}`}>{l.name}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* FIELD PANEL */}
        <div className={`
          flex-1 flex flex-col gap-4 min-h-0
          ${mobileTab === 'field' ? 'flex' : 'hidden md:flex'}
        `}>
          {activeLineup ? (
            <>
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-white leading-tight">{activeLineup.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">{activeLineup.formation}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest">{activeLineup.match_date}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button onClick={saveLineup} className="h-10 px-4 rounded-xl bg-emerald-500 text-bg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-90 transition-all">
                      <Save size={16} /> <span className="hidden sm:inline">GUARDAR</span>
                    </button>
                    <button onClick={deleteLineup} className="w-10 h-10 rounded-xl bg-white/5 text-rose-500 flex items-center justify-center border border-white/5 active:scale-90 transition-all hover:bg-rose-500/10">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-surface-2/20 rounded-[32px] overflow-hidden border border-white/5 relative shadow-2xl touch-none group">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a6118] to-[#1e4511] opacity-40 pointer-events-none" />
                
                <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full relative z-10"
                  onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
                  style={{ touchAction: 'none' }}>
                  
                  {/* Field Lines */}
                  <g opacity="0.4">
                    <rect x={15} y={15} width={W - 30} height={H - 30} fill="none" stroke="white" strokeWidth="1.5" rx="2" />
                    <line x1={15} y1={H / 2} x2={W - 15} y2={H / 2} stroke="white" strokeWidth="1.2" />
                    <circle cx={W / 2} cy={H / 2} r={50} fill="none" stroke="white" strokeWidth="1.2" />
                    <circle cx={W / 2} cy={H / 2} r={2} fill="white" />
                    {/* Areas */}
                    <rect x={W/2 - 80} y={15} width={160} height={40} fill="none" stroke="white" strokeWidth="1.2" />
                    <rect x={W/2 - 80} y={H - 55} width={160} height={40} fill="none" stroke="white" strokeWidth="1.2" />
                  </g>

                  {/* Starters */}
                  {(activeLineup.starters || []).map((s, i) => {
                    const p = s.player_id ? players.find(pl => pl.id === s.player_id) : null;
                    const isDragging = dragging?.type === 'starter' && dragging?.index === i;
                    
                    return (
                      <g key={`s-${i}`} 
                        onPointerDown={(e) => onPointerDown(e, 'starter', i)}
                        style={{ cursor: isAdmin ? 'grab' : 'default', transition: isDragging ? 'none' : 'transform 0.1s' }}>
                        
                        <filter id={`shadow-${i}`}>
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                        </filter>

                        {/* Player Representation: Real App Feel (Cromito style if has photo) */}
                        <g transform={`translate(${s.x}, ${s.y}) scale(${isDragging ? 1.15 : 1})`}>
                          <circle r={22} fill={p ? '#0057ff' : 'rgba(255,255,255,0.05)'} 
                            stroke={isDragging ? '#00ff87' : 'white'} 
                            strokeWidth={isDragging ? 3 : 2} 
                            filter={`url(#shadow-${i})`}
                          />
                          
                          {p?.photo_url ? (
                            <>
                              <defs>
                                <clipPath id={`clip-${i}`}>
                                  <circle r={20} />
                                </clipPath>
                              </defs>
                              <image href={p.photo_url} x={-20} y={-20} width={40} height={40} clipPath={`url(#clip-${i})`} preserveAspectRatio="xMidYMid slice" />
                            </>
                          ) : (
                            <text textAnchor="middle" dy="6" fontSize="16" fontWeight="900" fill="white" style={{ pointerEvents: 'none' }}>
                              {p ? p.number : '?'}
                            </text>
                          )}
                          
                          {p && (
                            <g transform="translate(0, 34)">
                              <rect x={-30} y={-8} width={60} height={16} rx={8} fill="rgba(0,0,0,0.6)" backdrop-blur="md" />
                              <text textAnchor="middle" dy="4" fontSize="9" fontWeight="800" fill="white" className="uppercase tracking-widest">
                                {p.name.split(' ')[0]}
                              </text>
                            </g>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* Extras (Ball, Rivals) */}
                  {extras.map((ex, i) => {
                    const isDragging = dragging?.type === 'extra' && dragging?.index === i;
                    return (
                      <g key={ex.id} 
                        onPointerDown={(e) => onPointerDown(e, 'extra', i)}
                        onDoubleClick={() => deleteExtra(i)}
                        style={{ cursor: 'grab' }}>
                        <g transform={`translate(${ex.x}, ${ex.y}) scale(${isDragging ? 1.2 : 1})`}>
                          {ex.kind === 'ball' ? (
                            <g>
                              <circle r={12} fill="white" stroke="#333" strokeWidth="1" />
                              <path d="M-12,0 A12,12 0 0,1 12,0" fill="none" stroke="#ddd" />
                              <circle r={3} fill="#333" />
                            </g>
                          ) : (
                            <g>
                              <circle r={18} fill="#ef4444" stroke="white" strokeWidth="2" />
                              <text textAnchor="middle" dy="4" fontSize="10" fontWeight="900" fill="white">R</text>
                            </g>
                          )}
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* MOBILE PALETTE */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-4 p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 md:hidden">
                  <div className="flex gap-2">
                    <button onClick={() => addExtra('ball')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                      <span className="text-xl">⚽</span>
                    </button>
                    <button onClick={() => addExtra('rival')} className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all border-2 border-white">
                      <span className="text-xs font-black text-white">R</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-x-auto flex gap-2 no-scrollbar px-2 border-l border-white/10">
                    {players.filter(p => !assignedIds.has(p.id) && !subIds.has(p.id)).map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          const slot = (activeLineup?.starters || []).findIndex(s => !s.player_id);
                          if (slot !== -1) assignPlayer(slot, p.id);
                        }}
                        className="flex-shrink-0 w-10 h-10 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                      >
                        <span className="text-[10px] font-black text-accent">{p.number || p.name[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Substitutes Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Convocatoria / Suplentes</h3>
                  <span className="text-[9px] font-bold text-muted/40 italic">Toca para quitar</span>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                  {(activeLineup.substitutes || []).map(s => {
                    const p = players.find(pl => pl.id === s.player_id);
                    return (
                      <button 
                        key={s.player_id} 
                        onClick={() => toggleSubstitute(s.player_id)}
                        className="flex-shrink-0 flex items-center gap-2 bg-surface-2/40 border border-white/5 rounded-xl p-2 pr-4 active:bg-rose-500/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center text-[10px] font-black">{p?.number || '?'}</div>
                        <span className="text-[10px] font-bold text-white uppercase whitespace-nowrap">{p?.name.split(' ')[0]}</span>
                        <X size={10} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                  {activeLineup.substitutes?.length === 0 && (
                    <div className="text-[9px] font-black text-muted/20 uppercase tracking-widest py-3 px-4 bg-white/5 rounded-xl border border-dashed border-white/5 w-full text-center">Sin suplentes</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted/10">
              <Layout size={100} strokeWidth={0.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] mt-8">Selecciona un partido</span>
            </div>
          )}
        </div>

        {/* ASSIGNMENT PANEL (Desktop) */}
        <div className={`
          w-full md:w-[260px] flex-col gap-4 flex-shrink-0
          ${mobileTab === 'players' ? 'flex' : 'hidden md:flex'}
        `}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Plantilla</h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-accent/20" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {players.map(p => {
              const isStarter = assignedIds.has(p.id);
              const isSub = subIds.has(p.id);
              return (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isStarter ? 'bg-accent/10 border-accent/30 text-white' : isSub ? 'bg-emerald-500/10 border-emerald-500/20 text-white' : 'bg-surface-2/10 border-white/5 text-muted'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${isStarter ? 'bg-accent text-bg shadow-lg shadow-accent/20' : isSub ? 'bg-emerald-500 text-bg shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-muted'}`}>{p.number || '?'}</div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold truncate max-w-[100px] uppercase leading-none mb-1">{p.name}</span>
                      <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter">{p.position || 'JUGADOR'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {!isStarter && (
                      <button onClick={() => {
                        const slot = (activeLineup?.starters || []).findIndex(s => !s.player_id);
                        if (slot !== -1) assignPlayer(slot, p.id);
                      }} title="Asignar al XI" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-accent hover:text-bg transition-all text-muted hover:text-bg"><Shield size={14} /></button>
                    )}
                    {!isSub && (
                      <button onClick={() => toggleSubstitute(p.id)} title="Convocatoria" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-bg transition-all text-muted hover:text-bg"><UserPlus size={14} /></button>
                    )}
                    {(isStarter || isSub) && (
                      <button onClick={() => {
                        if (isStarter) {
                          const idx = activeLineup.starters.findIndex(s => s.player_id === p.id);
                          const starters = activeLineup.starters.map((s, i) => i === idx ? { ...s, player_id: null, number: null, name: null } : s);
                          setActiveLineup({ ...activeLineup, starters });
                        } else {
                          toggleSubstitute(p.id);
                        }
                      }} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 active:scale-90"><X size={14} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
