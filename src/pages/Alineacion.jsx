import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Save, Trash2, X, ChevronRight, Download, Share2 } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { exportSvgAsImage } from '../utils/ExportHelper';
import Convocatoria from '../components/Convocatoria';

const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1'];

const POS_LABELS = ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL', 'DEL'];
const POS_COLORS = {
  POR: '#facc15', DEF: '#3b82f6', MED: '#22c55e', DEL: '#ef4444'
};

const FORMATION_POSITIONS = {
  '4-3-3': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 140, y: 55, pos: 'DEF' }, { x: 140, y: 135, pos: 'DEF' }, { x: 140, y: 235, pos: 'DEF' }, { x: 140, y: 315, pos: 'DEF' },
    { x: 280, y: 100, pos: 'MED' }, { x: 280, y: 185, pos: 'MED' }, { x: 280, y: 270, pos: 'MED' },
    { x: 420, y: 80, pos: 'DEL' }, { x: 420, y: 185, pos: 'DEL' }, { x: 420, y: 290, pos: 'DEL' },
  ],
  '4-4-2': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 150, y: 55, pos: 'DEF' }, { x: 150, y: 140, pos: 'DEF' }, { x: 150, y: 230, pos: 'DEF' }, { x: 150, y: 315, pos: 'DEF' },
    { x: 290, y: 55, pos: 'MED' }, { x: 290, y: 140, pos: 'MED' }, { x: 290, y: 230, pos: 'MED' }, { x: 290, y: 315, pos: 'MED' },
    { x: 420, y: 130, pos: 'DEL' }, { x: 420, y: 240, pos: 'DEL' },
  ],
  '4-2-3-1': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 140, y: 55, pos: 'DEF' }, { x: 140, y: 140, pos: 'DEF' }, { x: 140, y: 230, pos: 'DEF' }, { x: 140, y: 315, pos: 'DEF' },
    { x: 250, y: 140, pos: 'MED' }, { x: 250, y: 230, pos: 'MED' },
    { x: 360, y: 80, pos: 'MED' }, { x: 360, y: 185, pos: 'MED' }, { x: 360, y: 290, pos: 'MED' },
    { x: 450, y: 185, pos: 'DEL' },
  ],
  '3-5-2': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 140, y: 100, pos: 'DEF' }, { x: 140, y: 185, pos: 'DEF' }, { x: 140, y: 270, pos: 'DEF' },
    { x: 280, y: 40, pos: 'MED' }, { x: 280, y: 110, pos: 'MED' }, { x: 280, y: 185, pos: 'MED' }, { x: 280, y: 260, pos: 'MED' }, { x: 280, y: 330, pos: 'MED' },
    { x: 420, y: 130, pos: 'DEL' }, { x: 420, y: 240, pos: 'DEL' },
  ],
  '3-4-3': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 140, y: 100, pos: 'DEF' }, { x: 140, y: 185, pos: 'DEF' }, { x: 140, y: 270, pos: 'DEF' },
    { x: 280, y: 55, pos: 'MED' }, { x: 280, y: 140, pos: 'MED' }, { x: 280, y: 230, pos: 'MED' }, { x: 280, y: 315, pos: 'MED' },
    { x: 420, y: 80, pos: 'DEL' }, { x: 420, y: 185, pos: 'DEL' }, { x: 420, y: 290, pos: 'DEL' },
  ],
  '4-5-1': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 150, y: 55, pos: 'DEF' }, { x: 150, y: 140, pos: 'DEF' }, { x: 150, y: 230, pos: 'DEF' }, { x: 150, y: 315, pos: 'DEF' },
    { x: 290, y: 40, pos: 'MED' }, { x: 290, y: 110, pos: 'MED' }, { x: 290, y: 185, pos: 'MED' }, { x: 290, y: 260, pos: 'MED' }, { x: 290, y: 330, pos: 'MED' },
    { x: 450, y: 185, pos: 'DEL' },
  ],
  '5-3-2': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 140, y: 40, pos: 'DEF' }, { x: 140, y: 110, pos: 'DEF' }, { x: 140, y: 185, pos: 'DEF' }, { x: 140, y: 260, pos: 'DEF' }, { x: 140, y: 330, pos: 'DEF' },
    { x: 300, y: 100, pos: 'MED' }, { x: 300, y: 185, pos: 'MED' }, { x: 300, y: 270, pos: 'MED' },
    { x: 420, y: 130, pos: 'DEL' }, { x: 420, y: 240, pos: 'DEL' },
  ],
  '5-4-1': [
    { x: 50, y: 185, pos: 'POR' },
    { x: 140, y: 40, pos: 'DEF' }, { x: 140, y: 110, pos: 'DEF' }, { x: 140, y: 185, pos: 'DEF' }, { x: 140, y: 260, pos: 'DEF' }, { x: 140, y: 330, pos: 'DEF' },
    { x: 300, y: 55, pos: 'MED' }, { x: 300, y: 140, pos: 'MED' }, { x: 300, y: 230, pos: 'MED' }, { x: 300, y: 315, pos: 'MED' },
    { x: 450, y: 185, pos: 'DEL' },
  ],
};

const W = 500;
const H = 370;

export default function Alineacion() {
  const { isRealAdmin, viewAsPlayer } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  const isMobile = useIsMobile();
  
  const [lineups, setLineups] = useState([]);
  const [activeLineup, setActiveLineup] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', formation: '4-3-3', match_date: '' });
  const [mobileTab, setMobileTab] = useState('list');
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [showConvocatoria, setShowConvocatoria] = useState(false);

  useEffect(() => { fetchAll(); }, []);

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

  const saveLineup = async () => {
    if (isPlayerMode || !activeLineup) return;
    await supabase.from('lineups').update({
      starters: activeLineup.starters || [],
      substitutes: activeLineup.substitutes || []
    }).eq('id', activeLineup.id);
  };

  const createLineup = async () => {
    if (!form.name) return;
    const positions = FORMATION_POSITIONS[form.formation] || FORMATION_POSITIONS['4-3-3'];
    const starters = positions.map((pos) => ({
      x: pos.x, y: pos.y, player_id: null, number: null, name: null, photo_url: null, pos: pos.pos
    }));
    const { data } = await supabase.from('lineups').insert([{
      name: form.name,
      formation: form.formation,
      match_date: form.match_date || null,
      starters,
      substitutes: []
    }]).select().single();
    if (data) {
      setLineups([data, ...lineups]);
      setActiveLineup(data);
      setShowForm(false);
      setForm({ name: '', formation: '4-3-3', match_date: '' });
      if (isMobile) setMobileTab('field');
    }
  };

  const toSVG = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    pt.x = e.clientX ?? touch?.clientX ?? 0;
    pt.y = e.clientY ?? touch?.clientY ?? 0;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    return pt.matrixTransform(ctm.inverse());
  };

  const onDragStart = (e, index) => {
    if (isPlayerMode) return;
    e.preventDefault();
    setDragging({ index });
  };

  const onMove = (e) => {
    if (!dragging || isPlayerMode) return;
    e.preventDefault();
    const pt = toSVG(e);
    const next = [...activeLineup.starters];
    next[dragging.index] = { ...next[dragging.index], x: pt.x, y: pt.y };
    setActiveLineup({ ...activeLineup, starters: next });
  };

  const assignPlayer = (player) => {
    if (isPlayerMode || !activeLineup) return;
    const emptySlot = activeLineup.starters.findIndex(s => s.player_id === null);
    if (emptySlot !== -1) {
      const next = [...activeLineup.starters];
      next[emptySlot] = { ...next[emptySlot], player_id: player.id, number: player.number, name: player.name, photo_url: player.photo_url };
      setActiveLineup({ ...activeLineup, starters: next });
    }
  };

  const removePlayer = (slotIndex) => {
    if (isPlayerMode) return;
    const next = [...activeLineup.starters];
    next[slotIndex] = { ...next[slotIndex], player_id: null, number: null, name: null, photo_url: null };
    setActiveLineup({ ...activeLineup, starters: next });
  };

  const handleExport = () => {
    if (svgRef.current) exportSvgAsImage(svgRef.current, `alineacion-${activeLineup?.name || 'xi'}.png`);
  };

  const changeFormation = (newF) => {
    if (isPlayerMode || !activeLineup) return;
    const positions = FORMATION_POSITIONS[newF] || FORMATION_POSITIONS['4-3-3'];
    const oldStarters = activeLineup.starters || [];
    const newStarters = positions.map((pos, i) => {
      const old = oldStarters[i];
      return {
        x: pos.x, y: pos.y, pos: pos.pos,
        player_id: old?.player_id || null,
        number: old?.number || null,
        name: old?.name || null,
        photo_url: old?.photo_url || null,
      };
    });
    setActiveLineup({ ...activeLineup, formation: newF, starters: newStarters });
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden md:flex-row">
      
      {/* Convocatoria Modal */}
      {showConvocatoria && <Convocatoria lineup={activeLineup} onClose={() => setShowConvocatoria(false)} />}

      {/* Create Modal */}
      {showForm && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-white mb-6">Nueva Alineación</h2>
            <input className="input-field mb-3" placeholder="Ej: Jornada 15 vs Béjar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            <select className="input-field mb-3" value={form.formation} onChange={e => setForm({ ...form, formation: e.target.value })}>
              {FORMATIONS.map(f => <option key={f} value={f} className="bg-bg">{f}</option>)}
            </select>
            <input type="date" className="input-field mb-6" value={form.match_date} onChange={e => setForm({ ...form, match_date: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-[10px]">Cancelar</button>
              <button onClick={createLineup} className="flex-1 py-4 rounded-2xl bg-accent text-bg font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar List */}
      <div className={`flex-shrink-0 md:w-64 border-r border-white/10 flex flex-col ${isMobile && mobileTab !== 'list' ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Alineaciones</h1>
          {!isPlayerMode && <button onClick={() => setShowForm(true)} className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center"><Plus size={16} /></button>}
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {lineups.map(l => (
            <button key={l.id} onClick={() => { setActiveLineup(l); if(isMobile) setMobileTab('field'); }}
              className={`w-full p-3 rounded-2xl text-left border transition-all ${activeLineup?.id === l.id ? 'bg-accent/10 border-accent/40 text-white' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
              <div className="text-[10px] font-black uppercase tracking-widest">{l.name}</div>
              <div className="text-[9px] font-bold mt-0.5 opacity-40">{l.match_date} · {l.formation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Field View */}
      <div className={`flex-1 relative flex flex-col bg-bg ${isMobile && mobileTab !== 'field' && mobileTab !== 'players' ? 'hidden' : 'flex'}`}>
        {/* Header */}
        <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/10">
          {isMobile && <button onClick={() => setMobileTab('list')} className="text-muted"><X size={18} /></button>}
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white">{activeLineup?.name || 'XI'}</h2>
            {/* Formation badge */}
            {activeLineup && (
              <select value={activeLineup.formation || '4-3-3'} onChange={e => changeFormation(e.target.value)} disabled={isPlayerMode}
                className="bg-accent/10 text-accent text-[10px] font-black px-2 py-1 rounded-lg border-none outline-none cursor-pointer">
                {FORMATIONS.map(f => <option key={f} value={f} className="bg-bg text-white">{f}</option>)}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            {!isPlayerMode && <button onClick={() => setShowConvocatoria(true)} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center" title="Convocatoria WhatsApp"><Share2 size={14} /></button>}
            {!isPlayerMode && <button onClick={handleExport} className="w-8 h-8 rounded-lg bg-white/5 text-muted flex items-center justify-center" title="Exportar"><Download size={14} /></button>}
            {!isPlayerMode && <button onClick={saveLineup} className="px-3 py-1.5 bg-accent text-bg font-black rounded-lg text-[9px] uppercase tracking-widest active:scale-95 transition-all">Guardar</button>}
          </div>
        </div>

        {/* SVG Field */}
        <div className={`flex-1 relative overflow-hidden ${isMobile && mobileTab === 'players' ? 'h-[40vh]' : ''}`}>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ touchAction: 'none' }}
            onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}
            onTouchMove={(e) => { e.preventDefault(); onMove(e); }} onTouchEnd={() => setDragging(null)}>
            
            {/* Field Stripes */}
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={i} x={i * (W/7)} y={0} width={W/7} height={H} fill={i % 2 === 0 ? '#1a3b10' : '#1e4412'} />
            ))}
            
            {/* Lines */}
            <g stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none">
              <rect x={15} y={15} width={W-30} height={H-30} />
              <line x1={W/2} y1={15} x2={W/2} y2={H-15} />
              <circle cx={W/2} cy={H/2} r={40} />
              <rect x={15} y={H/2 - 60} width={60} height={120} />
              <rect x={W-75} y={H/2 - 60} width={60} height={120} />
              <rect x={15} y={H/2 - 30} width={25} height={60} />
              <rect x={W-40} y={H/2 - 30} width={25} height={60} />
            </g>

            {/* Starter Tokens */}
            {activeLineup?.starters?.map((s, i) => {
              if (!s) return null;
              const p = players.find(player => player.id === s.player_id);
              const posColor = POS_COLORS[s.pos] || POS_COLORS.MED;
              const isEmpty = !s.player_id;

              return (
                <g key={i} transform={`translate(${s.x}, ${s.y})`} 
                  onMouseDown={(e) => onDragStart(e, i)} onTouchStart={(e) => onDragStart(e, i)}
                  onDoubleClick={() => removePlayer(i)} className="cursor-grab active:cursor-grabbing">
                  
                    {isEmpty ? (
                      <>
                        {/* Empty slot with position indicator */}
                        <circle r={18} fill="rgba(255,255,255,0.03)" stroke={posColor} strokeWidth="1.5" strokeDasharray="4,3" />
                        <text textAnchor="middle" dy="1" fontSize="8" fontWeight="900" fill={posColor} opacity={0.7}>{s.pos}</text>
                        <text textAnchor="middle" dy="12" fontSize="6" fontWeight="700" fill="white" opacity={0.2}>{i + 1}</text>
                      </>
                    ) : (
                      <>
                        {p?.photo_url ? (
                          <foreignObject x={-25} y={-25} width={50} height={50}>
                            <div style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <img 
                                src={p.photo_url} 
                                crossOrigin="anonymous" 
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          </foreignObject>
                        ) : (
                          <>
                            <circle r={16} fill={posColor} stroke="white" strokeWidth="2" />
                            <text textAnchor="middle" dy="5" fontSize="13" fontWeight="900" fill="white">{p?.number || '?'}</text>
                          </>
                        )}
                        {p && <text textAnchor="middle" dy={p?.photo_url ? 32 : 28} fontSize="9" fontWeight="900" fill="white" style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}>{(p.name || '').split(' ')[0]}</text>}
                      </>
                    )}
                </g>
              );
            })}
          </svg>

          {/* Mobile Tabs */}
          {isMobile && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10">
              <button onClick={() => setMobileTab('field')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${mobileTab === 'field' ? 'bg-accent text-bg' : 'text-white/50'}`}>Campo</button>
              <button onClick={() => setMobileTab('players')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${mobileTab === 'players' ? 'bg-accent text-bg' : 'text-white/50'}`}>Plantilla</button>
            </div>
          )}
        </div>

        {/* Players Panel */}
        <div className={`bg-surface/95 backdrop-blur-2xl border-t border-white/10 transition-all ${
          isMobile && mobileTab !== 'players' ? 'h-0 opacity-0 overflow-hidden' : 
          isMobile ? 'h-[45vh] opacity-100' : 'h-[240px] opacity-100'
        }`}>
          <div className="p-3 flex items-center justify-between border-b border-white/10">
            <h3 className="text-[9px] font-black text-accent uppercase tracking-widest">Jugadores Disponibles</h3>
            {isMobile && <button onClick={() => setMobileTab('field')} className="text-muted"><ChevronRight size={16} /></button>}
          </div>
          <div className="p-3 grid grid-cols-5 md:grid-cols-8 gap-2 overflow-y-auto no-scrollbar" style={{ maxHeight: isMobile ? 'calc(45vh - 44px)' : '196px' }}>
            {players.map(p => {
              const isUsed = activeLineup?.starters?.some(s => s.player_id === p.id);
              return (
                <button key={p.id} onClick={() => assignPlayer(p)} disabled={isUsed}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all ${isUsed ? 'bg-white/5 opacity-20 border-transparent' : 'bg-white/5 border-white/5 hover:border-accent active:scale-90'}`}>
                  <span className="text-sm font-black text-white">{p.number}</span>
                  <span className="text-[7px] font-bold text-muted truncate w-full px-1 text-center">{(p.name || '').split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
