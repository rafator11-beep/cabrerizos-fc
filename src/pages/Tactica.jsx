import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import FieldCanvas from '../components/FieldCanvas';
import Heatmap from '../components/Heatmap';
import { useRealtimePizarra } from '../hooks/useRealtimePizarra';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Plus, Move, ArrowRight, Trash2, Undo2, Save, FolderOpen, Play, Monitor, Spline, X, Layers, Minus, Wifi, WifiOff, Thermometer, Download, Activity, Target, ChevronRight, Layers as LayersIcon, Users, Smartphone, Maximize2, MousePointer2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'corners', label: 'Córners', icon: '⛳', color: '#f59e0b' },
  { id: 'free_kicks_for', label: 'Faltas (+)', icon: '🎯', color: '#10b981' },
  { id: 'free_kicks_against', label: 'Faltas (-)', icon: '🛡️', color: '#ef4444' },
  { id: 'build_up', label: 'Salida', icon: '⚡', color: '#3b82f6' },
  { id: 'set_pieces', label: 'Estrategia', icon: '📐', color: '#8b5cf6' },
  { id: 'pressing', label: 'Presión', icon: '💪', color: '#f97316' },
  { id: 'general', label: 'General', icon: '📋', color: '#6b7280' },
];

const FORMATIONS = {
  "4-3-3": [
    { x: 275, y: 330, l: "1" }, { x: 100, y: 260, l: "4" }, { x: 210, y: 280, l: "5" }, { x: 340, y: 280, l: "2" }, { x: 450, y: 260, l: "3" },
    { x: 275, y: 200, l: "6" }, { x: 180, y: 150, l: "8" }, { x: 370, y: 150, l: "10" }, { x: 120, y: 70, l: "7" }, { x: 275, y: 40, l: "9" }, { x: 430, y: 70, l: "11" }
  ],
  "4-4-2": [
    { x: 275, y: 330, l: "1" }, { x: 100, y: 260, l: "4" }, { x: 210, y: 280, l: "5" }, { x: 340, y: 280, l: "2" }, { x: 450, y: 260, l: "3" },
    { x: 100, y: 160, l: "11" }, { x: 220, y: 180, l: "6" }, { x: 330, y: 180, l: "8" }, { x: 450, y: 160, l: "7" }, { x: 220, y: 60, l: "9" }, { x: 330, y: 60, l: "10" }
  ],
  "4-5-1": [
    { x: 275, y: 330, l: "1" }, { x: 100, y: 260, l: "4" }, { x: 210, y: 280, l: "5" }, { x: 340, y: 280, l: "2" }, { x: 450, y: 260, l: "3" },
    { x: 100, y: 170, l: "11" }, { x: 200, y: 190, l: "6" }, { x: 275, y: 200, l: "8" }, { x: 350, y: 190, l: "10" }, { x: 450, y: 170, l: "7" }, { x: 275, y: 60, l: "9" }
  ],
  "4-2-3-1": [
    { x: 275, y: 330, l: "1" }, { x: 100, y: 260, l: "4" }, { x: 210, y: 280, l: "5" }, { x: 340, y: 280, l: "2" }, { x: 450, y: 260, l: "3" },
    { x: 200, y: 190, l: "6" }, { x: 350, y: 190, l: "8" }, { x: 100, y: 120, l: "7" }, { x: 275, y: 130, l: "10" }, { x: 450, y: 120, l: "11" }, { x: 275, y: 50, l: "9" }
  ],
  "5-3-2": [
    { x: 275, y: 330, l: "1" }, { x: 80, y: 240, l: "3" }, { x: 180, y: 270, l: "4" }, { x: 275, y: 280, l: "5" }, { x: 370, y: 270, l: "2" }, { x: 470, y: 240, l: "6" },
    { x: 180, y: 170, l: "8" }, { x: 275, y: 190, l: "10" }, { x: 370, y: 170, l: "11" }, { x: 220, y: 60, l: "9" }, { x: 330, y: 60, l: "7" }
  ],
  "3-5-2": [
    { x: 275, y: 330, l: "1" }, { x: 150, y: 280, l: "4" }, { x: 275, y: 290, l: "5" }, { x: 400, y: 280, l: "2" },
    { x: 60, y: 180, l: "3" }, { x: 180, y: 200, l: "6" }, { x: 275, y: 180, l: "8" }, { x: 370, y: 200, l: "10" }, { x: 490, y: 180, l: "7" },
    { x: 220, y: 70, l: "9" }, { x: 330, y: 70, l: "11" }
  ]
};

const LEGEND = [
  { id: 'pass', label: 'Pase Raso', icon: '⎯', color: '#4ade80', style: 'solid' },
  { id: 'run', label: 'Desmarque', icon: '╌', color: '#fbbf24', style: 'dashed' },
  { id: 'shoot', label: 'Tiro/Largo', icon: '⟶', color: '#ef4444', style: 'solid' },
  { id: 'curved', label: 'Bombeado', icon: '⤿', color: '#c084fc', style: 'curved' },
  { id: 'zigzag', label: 'Conducción', icon: '〰', color: '#3b82f6', style: 'zigzag' },
];

export default function Tactica() {
  const { isAdmin, profile } = useAuth();
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  const [activeCategory, setActiveCategory] = useState('corners');
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState('jugadas'); // 'jugadas' | 'campo' | 'plantilla'
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '' });
  
  // Canvas Tools
  const [tool, setTool] = useState("move");
  const [arrowType, setArrowType] = useState("pass");
  const [arrowColor, setArrowColor] = useState("#4ade80");
  const [arrowStyle, setArrowStyle] = useState("solid");
  const [drawPt, setDrawPt] = useState(null);
  
  // Steps & Animation
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(null); // id of token being edited
  
  const [players, setPlayers] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const fieldSvgRef = useRef(null);
  const { queueUpdate } = useOfflineSync();

  useEffect(() => {
    fetchPlays();
    fetchPlayers();
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, [activeCategory]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('roster').select('*').order('number');
    if (data) setPlayers(data);
  };

  const fetchPlays = async () => {
    setLoading(true);
    const { data } = await supabase.from('plays').select('*').eq('category', activeCategory).order('created_at', { ascending: false });
    if (data) {
      const safe = data.map(p => {
        const isMigrated = p.tokens && Array.isArray(p.tokens) && p.tokens.length > 0 && p.tokens[0].step !== undefined;
        return isMigrated ? p : { ...p, tokens: [{ step: 1, tokens: p.tokens || [], arrows: p.arrows || [], zones: p.zones || [] }] };
      });
      setPlays(safe);
      if (safe.length > 0) setActivePlay(safe[0]);
    }
    setLoading(false);
  };

  const createPlay = async () => {
    if (!form.name) return;
    const { data } = await supabase.from('plays').insert([{
      name: form.name,
      category: activeCategory,
      tokens: [{ step: 1, tokens: [], arrows: [], zones: [] }],
      created_by: profile?.id
    }]).select().single();
    if (data) {
      setPlays([data, ...plays]);
      setActivePlay(data);
      setShowForm(false);
      setForm({ name: '' });
      setMobileTab('campo');
    }
  };

  const deletePlay = async (e, id) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar?')) return;
    await supabase.from('plays').delete().eq('id', id);
    const rem = plays.filter(p => p.id !== id);
    setPlays(rem);
    if (activePlay?.id === id) setActivePlay(rem[0] || null);
  };

  const steps = activePlay?.tokens || [{ step: 1, tokens: [], arrows: [], zones: [] }];
  const currentStep = steps[activeStepIndex] || steps[0];

  const updateCurrentStep = (updates) => {
    if (!activePlay) return;
    const newSteps = [...steps];
    newSteps[activeStepIndex] = { ...currentStep, ...updates };
    const upd = { ...activePlay, tokens: newSteps };
    setActivePlay(upd);
    setPlays(ps => ps.map(p => p.id === upd.id ? upd : p));
  };

  const applyFormation = (name) => {
    const formation = FORMATIONS[name];
    if (!formation) return;
    const newTokens = formation.map((pos, i) => ({
      id: `pl-${name}-${i}-${Date.now()}`,
      kind: "player",
      x: pos.x,
      y: pos.y,
      color: "#0057ff",
      label: pos.l,
      isRival: false
    }));
    updateCurrentStep({ tokens: [...(currentStep.tokens || []).filter(t => t.kind !== 'player' || t.isRival), ...newTokens] });
    setShowTools(false);
  };

  const togglePlayer = (p, isRival = false) => {
    const label = String(p.number || '?');
    const existing = (currentStep.tokens || []).find(t => t.kind === 'player' && t.label === label && !!t.isRival === isRival);
    if (existing) {
      updateCurrentStep({ tokens: (currentStep.tokens || []).filter(t => t.id !== existing.id) });
    } else {
      const offsetX = (Date.now() % 100) - 50;
      const offsetY = (Date.now() % 80) - 40;
      updateCurrentStep({
        tokens: [...(currentStep.tokens || []), {
          id: `pl-${label}-${isRival ? 'R' : ''}-${Date.now()}`,
          kind: "player",
          x: 275 + offsetX,
          y: 183 + offsetY,
          color: isRival ? '#ef4444' : '#0057ff',
          label,
          name: p.name,
          photo_url: p.photo_url,
          isRival
        }]
      });
    }
  };

  const selectPlayerForToken = (p) => {
    if (!showPlayerModal) return;
    const tokens = currentStep.tokens.map(t => t.id === showPlayerModal ? { ...t, label: String(p.number), name: p.name, photo_url: p.photo_url } : t);
    updateCurrentStep({ tokens });
    setShowPlayerModal(null);
  };

  const savePlay = async () => {
    if (!activePlay) return;
    await queueUpdate('plays', activePlay.id, { tokens: activePlay.tokens });
    alert('Jugada guardada 🔥');
  };

  const onMove = (id, x, y) => {
    updateCurrentStep({ tokens: (currentStep.tokens || []).map(t => t.id === id ? { ...t, x, y } : t) });
  };

  const onArrow = (a) => {
    updateCurrentStep({ arrows: [...(currentStep.arrows || []), { ...a, color: arrowColor, lineStyle: arrowStyle }] });
  };

  const selectLegend = (l) => {
    setArrowType(l.id);
    setArrowColor(l.color);
    setArrowStyle(l.style);
    setTool('arrow');
    setShowTools(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full animate-fade-in relative no-scrollbar">
      
      {/* PLAYER SELECTION MODAL */}
      {showPlayerModal && (
        <div className="absolute inset-0 z-[100] bg-bg/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm space-y-4 animate-slide-up border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Asignar Identidad</h3>
              <button onClick={() => setShowPlayerModal(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"><X size={16}/></button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
              {players.map(p => (
                <button key={p.id} onClick={() => selectPlayerForToken(p)} className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl hover:bg-accent group transition-all text-left border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-bg/20 flex items-center justify-center text-xs font-black">{p.number}</div>
                  <div className="text-xs font-bold group-hover:text-bg">{p.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE TABS */}
      <div className="md:hidden segmented-control mx-auto w-full max-w-sm">
        <button onClick={() => setMobileTab('jugadas')} className={`segmented-item ${mobileTab === 'jugadas' ? 'segmented-item-active' : 'segmented-item-inactive'}`}>LISTA</button>
        <button onClick={() => setMobileTab('campo')} className={`segmented-item ${mobileTab === 'campo' ? 'segmented-item-active' : 'segmented-item-inactive'}`}>PIZARRA</button>
        <button onClick={() => setMobileTab('plantilla')} className={`segmented-item ${mobileTab === 'plantilla' ? 'segmented-item-active' : 'segmented-item-inactive'}`}>PLANTILLA</button>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        
        {/* LIST PANEL */}
        <div className={`
          flex-col gap-4 w-full md:w-[240px] flex-shrink-0 
          ${mobileTab === 'jugadas' ? 'flex' : 'hidden md:flex'}
        `}>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`p-3 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1 ${activeCategory === cat.id ? 'bg-accent/10 border-accent text-accent' : 'bg-surface-2/20 border-white/5 text-muted'}`}>
                <span className="text-lg">{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">JUGADAS</span>
              <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 bg-accent text-bg rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">{showForm ? <X size={16}/> : <Plus size={16}/>}</button>
            </div>
            {showForm && (
              <div className="glass-card !p-3 space-y-3 animate-slide-up mb-4 border border-accent/20">
                <input className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-accent/30" placeholder="Nombre de la jugada" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <button className="w-full py-3 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all" onClick={createPlay}>CREAR JUGADA</button>
              </div>
            )}
            {plays.map(p => (
              <div key={p.id} className="relative group">
                <button onClick={() => { setActivePlay(p); setMobileTab('campo'); }} className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-98 ${activePlay?.id === p.id ? 'bg-accent/10 border-accent text-white' : 'bg-surface-2/10 border-white/5 text-muted hover:border-white/10'}`}>
                  <div className="text-xs font-bold truncate pr-8 uppercase tracking-wide">{p.name}</div>
                  <div className="text-[9px] font-black opacity-30 mt-1.5 uppercase tracking-tighter">{p.tokens?.length || 1} fases tácticas</div>
                </button>
                {isAdmin && <button onClick={(e) => deletePlay(e, p.id)} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500/30 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>}
              </div>
            ))}
          </div>
        </div>

        {/* FIELD PANEL */}
        <div className={`
          flex-1 flex flex-col gap-4 min-h-0
          ${mobileTab === 'campo' ? 'flex' : 'hidden md:flex'}
        `}>
          
          {/* MOBILE & DESKTOP TOOLBAR */}
          <div className="glass p-2 rounded-2xl border border-white/5 flex items-center justify-between gap-2 shadow-xl">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setTool('move')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${tool === 'move' ? 'bg-accent text-bg shadow-lg shadow-accent/20' : 'bg-white/5 text-muted'}`}><MousePointer2 size={18} /></button>
              
              <div className="w-[1px] h-6 bg-white/10 mx-1 shrink-0" />
              
              <button 
                onClick={() => setShowTools(!showTools)}
                className={`md:hidden h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showTools ? 'bg-accent text-bg' : 'bg-white/5 text-muted'}`}
              >
                <LayersIcon size={16} /> TOOLS
              </button>

              {/* DESKTOP ONLY TOOLS */}
              <div className="hidden md:flex gap-1">
                {LEGEND.map(l => (
                  <button key={l.id} onClick={() => selectLegend(l)} className={`px-3 h-10 border rounded-xl flex flex-col items-center justify-center transition-all ${arrowType === l.id && tool === 'arrow' ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
                    <span className="text-sm font-black">{l.icon}</span>
                    <span className="text-[7px] font-black uppercase tracking-tighter">{l.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              <div className="hidden md:block w-[1px] h-6 bg-white/10 mx-1 shrink-0" />

              <div className="hidden md:flex gap-1">
                {Object.keys(FORMATIONS).map(f => (
                  <button key={f} onClick={() => applyFormation(f)} className="px-3 h-10 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 hover:text-white hover:border-white/10 transition-all">{f}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setAnimating(!animating)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${animating ? 'bg-amber-500 text-bg shadow-lg' : 'bg-white/5 text-muted'}`}>
                <Monitor size={18} />
              </button>
              <button onClick={() => setIsVertical(!isVertical)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isVertical ? 'bg-accent text-bg shadow-lg shadow-accent/20' : 'bg-white/5 text-muted'}`}>
                <Smartphone size={18} className={isVertical ? '' : 'rotate-90'} />
              </button>
              <button onClick={savePlay} className="px-5 h-10 bg-emerald-500 text-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">OK</button>
            </div>
          </div>

          <div className={`
            flex-1 relative glass rounded-[32px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500
            ${isVertical ? 'aspect-[2/3] max-h-[60vh] mx-auto scale-95' : 'aspect-[3/2]'}
          `}>
            <div className={`w-full h-full transform transition-transform duration-500 ${isVertical ? 'rotate-90 scale-[1.4]' : 'scale-100'}`}>
              <FieldCanvas 
                ref={fieldSvgRef}
                tokens={currentStep.tokens || []}
                arrows={currentStep.arrows || []}
                zones={currentStep.zones || []}
                onMove={isAdmin ? onMove : undefined}
                onArrow={isAdmin ? onArrow : undefined}
                tool={isAdmin ? tool : 'move'}
                onSelectToken={setShowPlayerModal}
                viewMode={fieldView}
                animating={animating}
                presentationMode={true}
              />
            </div>
            
            {/* TOOL SHEET (Mobile Only) */}
            {showTools && (
              <div className="absolute inset-0 z-50 md:hidden bg-bg/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowTools(false)}>
                <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[32px] p-6 border-t border-white/10 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-muted uppercase tracking-widest px-1">TRAZOS</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {LEGEND.map(l => (
                          <button key={l.id} onClick={() => selectLegend(l)} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${arrowType === l.id && tool === 'arrow' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/5 text-muted'}`}>
                            <span className="text-xl">{l.icon}</span>
                            <span className="text-[8px] font-black uppercase">{l.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-muted uppercase tracking-widest px-1">SISTEMAS</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(FORMATIONS).map(f => (
                          <button key={f} onClick={() => applyFormation(f)} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-white hover:bg-accent hover:text-bg transition-all">{f}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEPS INDICATOR */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
              {steps.map((_, i) => (
                <button key={i} onClick={() => setActiveStepIndex(i)} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${activeStepIndex === i ? 'bg-accent text-bg shadow-lg shadow-accent/20 scale-110' : 'text-muted hover:text-white'}`}>{i + 1}</button>
              ))}
              {isAdmin && (
                <button 
                  onClick={() => {
                    const newStep = { step: steps.length + 1, tokens: [...currentStep.tokens], arrows: [], zones: [] };
                    updateCurrentStep({}); // ensure current is saved
                    const upd = { ...activePlay, tokens: [...steps, newStep] };
                    setActivePlay(upd);
                    setActiveStepIndex(steps.length);
                  }} 
                  className="w-9 h-9 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-accent hover:text-bg transition-all"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="glass p-3 rounded-[24px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <button onClick={() => { setIsPlaying(true); setActiveStepIndex(0); }} className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-accent text-bg rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all"><Play size={16} /> REPRODUCIR ANIMACIÓN</button>
            <div className="hidden md:flex gap-6 overflow-x-auto no-scrollbar px-4">
              {LEGEND.map(l => (
                <div key={l.id} className="flex items-center gap-2 text-[9px] font-black text-muted uppercase tracking-[0.2em] whitespace-nowrap">
                  <span style={{ color: l.color }} className="text-base">{l.icon}</span> {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PLANTILLA PANEL */}
        <div className={`
          flex-col gap-4 w-full md:w-[220px] flex-shrink-0 
          ${mobileTab === 'plantilla' ? 'flex' : 'hidden md:flex'}
        `}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Cabrerizos FC</h3>
            <span className="text-[10px] font-black text-accent">{(currentStep.tokens || []).filter(t => t.kind === 'player' && !t.isRival).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {players.map(p => {
              const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === String(p.number) && !t.isRival);
              return (
                <button key={p.id} onClick={() => togglePlayer(p)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${on ? 'bg-accent/10 border-accent/30 text-white' : 'bg-surface-2/10 border-white/5 text-muted hover:border-white/10'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${on ? 'bg-accent text-bg shadow-lg shadow-accent/20' : 'bg-white/5 text-muted'}`}>{p.number || '?'}</div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-[11px] font-bold truncate w-full uppercase leading-none mb-1">{p.name}</span>
                    <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter">JUGADOR</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
            <h3 className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.2em] px-1">Escuadra Rival</h3>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 11 }).map((_, i) => {
                const num = String(i + 1);
                const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === num && t.isRival);
                return (
                  <button key={i} onClick={() => togglePlayer({ number: i + 1 }, true)} className={`aspect-square rounded-xl border flex items-center justify-center text-[11px] font-black transition-all ${on ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>{num}</button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
