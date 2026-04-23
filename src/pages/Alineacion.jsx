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
  const { isAdmin, isRealAdmin, viewAsPlayer, profile } = useAuth();
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

  const saveLineup = async () => {
    if (isPlayerMode || !activeLineup) return;
    await supabase.from('lineups').update({
      starters: activeLineup.starters || [],
      substitutes: activeLineup.substitutes || []
    }).eq('id', activeLineup.id);
  };

  const toSVG = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX || e.touches[0].clientX;
    pt.y = e.clientY || e.touches[0].clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const onDragStart = (e, type, index) => {
    if (isPlayerMode) return;
    const pt = toSVG(e);
    setDragging({ type, index, ox: 0, oy: 0 });
  };

  const onMove = (e) => {
    if (!dragging || isPlayerMode) return;
    const pt = toSVG(e);
    if (dragging.type === 'starter') {
      const next = [...activeLineup.starters];
      next[dragging.index] = { ...next[dragging.index], x: pt.x, y: pt.y };
      setActiveLineup({ ...activeLineup, starters: next });
    } else if (dragging.type === 'extra') {
      const next = [...extras];
      next[dragging.index] = { ...next[dragging.index], x: pt.x, y: pt.y };
      setExtras(next);
    }
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

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden md:flex-row">
      {/* Sidebar List */}
      <div className={`flex-shrink-0 md:w-72 border-r border-white/10 flex flex-col transition-all ${isMobile && mobileTab !== 'list' ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-xs font-black text-white uppercase tracking-[0.3em]">Alineaciones</h1>
          {!isPlayerMode && (
            <button onClick={() => setShowForm(true)} className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
              <Plus size={18} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {lineups.map(l => (
            <button key={l.id} onClick={() => { setActiveLineup(l); if(isMobile) setMobileTab('field'); }}
              className={`w-full p-4 rounded-2xl text-left border transition-all ${activeLineup?.id === l.id ? 'bg-accent/10 border-accent/40 text-white' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
              <div className="text-xs font-black uppercase tracking-widest">{l.name}</div>
              <div className="text-[9px] font-bold mt-1 opacity-40">{l.match_date} · {l.formation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Field View */}
      <div className={`flex-1 relative flex flex-col bg-bg transition-all ${isMobile && mobileTab !== 'field' ? 'hidden' : 'flex'}`}>
        {/* Field Header */}
        <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/10">
          {isMobile && <button onClick={() => setMobileTab('list')} className="text-muted"><X size={20} /></button>}
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white">{activeLineup?.name || 'Nuevo XI'}</h2>
          {!isPlayerMode && <button onClick={saveLineup} className="px-4 py-1.5 bg-accent text-bg font-black rounded-lg text-[9px] uppercase tracking-widest">Guardar</button>}
        </div>

        <div className="flex-1 relative bg-[#05070a] overflow-hidden">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full"
            onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}
            onTouchMove={(e) => { e.preventDefault(); onMove(e); }} onTouchEnd={() => setDragging(null)}>
            
            {/* Field Stripes */}
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={i} x={i * (W/7)} y={0} width={W/7} height={H} fill={i % 2 === 0 ? '#1a3b10' : '#1e4412'} />
            ))}
            
            {/* Field Lines */}
            <rect x={15} y={15} width={W-30} height={H-30} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <line x1={W/2} y1={15} x2={W/2} y2={H-15} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <circle cx={W/2} cy={H/2} r={40} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <rect x={15} y={H/2 - 60} width={60} height={120} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <rect x={W-75} y={H/2 - 60} width={60} height={120} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

            {/* Starter Tokens */}
            {activeLineup?.starters.map((s, i) => {
              const p = players.find(player => player.id === s.player_id);
              const isDragging = dragging?.type === 'starter' && dragging.index === i;
              return (
                <g key={i} transform={`translate(${s.x}, ${s.y})`} 
                  onMouseDown={(e) => onDragStart(e, 'starter', i)} onTouchStart={(e) => onDragStart(e, 'starter', i)}
                  onDoubleClick={() => removePlayer(i)} className="cursor-grab active:cursor-grabbing">
                  <circle r={20} fill={p ? '#0057ff' : 'rgba(255,255,255,0.05)'} stroke="white" strokeWidth="2" />
                  {p?.photo_url ? (
                    <>
                      <defs><clipPath id={`clip-${i}`}><circle r={18}/></clipPath></defs>
                      <image href={p.photo_url} x={-18} y={-18} width={36} height={36} clipPath={`url(#clip-${i})`} preserveAspectRatio="xMidYMid slice" />
                    </>
                  ) : (
                    <text textAnchor="middle" dy="6" fontSize="14" fontWeight="900" fill="white">{p?.number || '?'}</text>
                  )}
                  {p && <text textAnchor="middle" dy={32} fontSize="8" fontWeight="800" fill="white" className="uppercase tracking-widest">{p.name.split(' ')[0]}</text>}
                </g>
              );
            })}

            {/* Extras (Balls, Rivals, etc) */}
            {extras.map((ex, i) => (
              <g key={i} transform={`translate(${ex.x}, ${ex.y})`} 
                onMouseDown={(e) => onDragStart(e, 'extra', i)} onTouchStart={(e) => onDragStart(e, 'extra', i)}
                className="cursor-grab active:cursor-grabbing">
                {ex.kind === 'ball' ? (
                  <circle r={10} fill="white" stroke="#333" strokeWidth="1" />
                ) : (
                  <circle r={18} fill="#ef4444" stroke="white" strokeWidth="2" />
                )}
              </g>
            ))}
          </svg>

          {/* Mobile Tab Buttons */}
          {isMobile && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
              <button onClick={() => setMobileTab('field')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${mobileTab === 'field' ? 'bg-accent text-bg' : 'text-white'}`}>Campo</button>
              <button onClick={() => setMobileTab('players')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${mobileTab === 'players' ? 'bg-accent text-bg' : 'text-white'}`}>Plantilla</button>
            </div>
          )}
        </div>

        {/* Players Panel (Overlay on mobile, Bottom on desktop) */}
        <div className={`absolute bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-2xl border-t border-white/10 transition-all ${isMobile && mobileTab !== 'players' ? 'h-0 opacity-0 pointer-events-none' : 'h-[280px] opacity-100'}`}>
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <h3 className="text-[10px] font-black text-accent uppercase tracking-widest">Plantilla</h3>
            {isMobile && <button onClick={() => setMobileTab('field')} className="text-muted"><ChevronRight size={18} /></button>}
          </div>
          <div className="p-4 grid grid-cols-4 md:grid-cols-6 gap-2 overflow-y-auto h-[220px] no-scrollbar">
            {players.map(p => {
              const isUsed = activeLineup?.starters.some(s => s.player_id === p.id);
              return (
                <button key={p.id} onClick={() => assignPlayer(p)} disabled={isUsed}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${isUsed ? 'bg-white/5 opacity-30 border-transparent' : 'bg-white/5 border-white/5 hover:border-accent'}`}>
                  <span className="text-xs font-black text-white">{p.number}</span>
                  <span className="text-[8px] font-bold text-muted truncate w-full px-1 text-center">{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
