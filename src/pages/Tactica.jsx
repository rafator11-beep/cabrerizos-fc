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
  const { isAdmin, isRealAdmin, viewAsPlayer, profile } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  const [activeCategory, setActiveCategory] = useState('corners');
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState('jugadas');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [tool, setTool] = useState("move");
  const [arrowType, setArrowType] = useState("pass");
  const [drawPt, setDrawPt] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [players, setPlayers] = useState([]);
  const [showTools, setShowTools] = useState(false);
  
  const fieldSvgRef = useRef(null);
  const { queueUpdate } = useOfflineSync();

  useEffect(() => {
    fetchPlays();
    fetchPlayers();
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

  const steps = activePlay?.tokens || [{ step: 1, tokens: [], arrows: [], zones: [] }];
  const currentStep = steps[activeStepIndex] || steps[0];

  const updateCurrentStep = (updates) => {
    if (isPlayerMode || !activePlay) return;
    const newSteps = [...steps];
    newSteps[activeStepIndex] = { ...currentStep, ...updates };
    const upd = { ...activePlay, tokens: newSteps };
    setActivePlay(upd);
    setPlays(ps => ps.map(p => p.id === upd.id ? upd : p));
  };

  const savePlay = async () => {
    if (isPlayerMode || !activePlay) return;
    await queueUpdate('plays', activePlay.id, { tokens: activePlay.tokens });
  };

  const togglePlayer = (p, isRival = false) => {
    if (isPlayerMode) return;
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

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden md:flex-row">
      {/* Mobile Header / Desktop Sidebar Navigation */}
      <div className="md:w-72 bg-surface/50 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xs font-black text-white uppercase tracking-[0.3em]">Jugadas</h1>
            <p className="text-[10px] text-muted font-bold mt-0.5">{CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
          </div>
          {!isPlayerMode && (
            <button onClick={() => setShowForm(true)} className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center hover:bg-accent hover:text-bg transition-all">
              <Plus size={18} />
            </button>
          )}
        </div>
        
        {/* Category Icons */}
        <div className="flex overflow-x-auto no-scrollbar p-2 gap-2 bg-black/20">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${activeCategory === cat.id ? 'bg-accent/20 border-accent/40 scale-110' : 'bg-white/5 opacity-40 hover:opacity-100'}`}>
              {cat.icon}
            </button>
          ))}
        </div>

        {/* Plays List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
            </div>
          ) : plays.map(p => (
            <button key={p.id} onClick={() => { setActivePlay(p); setMobileTab('campo'); }}
              className={`w-full p-4 rounded-2xl text-left border transition-all ${activePlay?.id === p.id ? 'bg-accent/10 border-accent/40 text-white' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest">{p.name}</span>
                {activePlay?.id === p.id && <ChevronRight size={14} className="text-accent" />}
              </div>
              <div className="flex gap-2 mt-2 opacity-40">
                <div className="w-4 h-4 rounded-full bg-white/20" />
                <div className="w-4 h-4 rounded-full bg-white/20" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Field View */}
      <div className="flex-1 relative flex flex-col bg-bg overflow-hidden animate-in fade-in duration-500">
        
        {/* Field Header Actions */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            {!isPlayerMode && (
              <>
                <button onClick={() => setTool('move')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${tool === 'move' ? 'bg-accent text-bg scale-110' : 'bg-black/40 backdrop-blur-md text-white border border-white/10'}`}>
                  <Move size={18} />
                </button>
                <button onClick={() => setTool('arrow')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${tool === 'arrow' ? 'bg-accent text-bg scale-110' : 'bg-black/40 backdrop-blur-md text-white border border-white/10'}`}>
                  <Spline size={18} />
                </button>
              </>
            )}
            <button onClick={() => setAnimating(prev => !prev)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${animating ? 'bg-amber-500 text-bg' : 'bg-black/40 backdrop-blur-md text-white border border-white/10'}`}>
              <Monitor size={18} />
            </button>
          </div>
          
          <div className="flex gap-2 pointer-events-auto">
            {!isPlayerMode && (
              <button onClick={savePlay} className="h-10 px-4 bg-accent text-bg font-black rounded-xl shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                <Save size={18} />
                <span className="text-[10px] uppercase tracking-widest">Guardar</span>
              </button>
            )}
          </div>
        </div>

        {/* The Field */}
        <div className="flex-1 relative mt-16 md:mt-0">
          <FieldCanvas
            ref={fieldSvgRef}
            tokens={currentStep.tokens || []}
            arrows={currentStep.arrows || []}
            zones={currentStep.zones || []}
            tool={tool}
            arrowType={arrowType}
            animating={animating}
            onMove={(id, x, y) => {
              if (isPlayerMode) return;
              const nextTs = (currentStep.tokens || []).map(t => t.id === id ? { ...t, x, y } : t);
              updateCurrentStep({ tokens: nextTs });
            }}
            onArrow={a => {
              if (isPlayerMode) return;
              updateCurrentStep({ arrows: [...(currentStep.arrows || []), a] });
            }}
            drawPt={drawPt}
            setDrawPt={setDrawPt}
            onPlace={(kind, x, y) => {
              if (isPlayerMode) return;
              updateCurrentStep({ tokens: [...(currentStep.tokens || []), { id: Date.now(), kind, x, y }] });
            }}
            onDelete={id => {
              if (isPlayerMode) return;
              updateCurrentStep({
                tokens: (currentStep.tokens || []).filter(t => t.id !== id),
                arrows: (currentStep.arrows || []).filter(a => a.id !== id)
              });
            }}
          />
        </div>

        {/* BOTTOM TOOL SHEET / PALETTE */}
        {!isPlayerMode && (
          <div className={`absolute bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-2xl border-t border-white/10 transition-all duration-500 ${showTools ? 'h-[320px]' : 'h-16'}`}>
            <button onClick={() => setShowTools(!showTools)} className="w-full h-16 flex items-center justify-center gap-2 group">
              <div className="w-8 h-1 bg-white/20 rounded-full group-hover:bg-accent transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-white">Herramientas & Plantilla</span>
            </button>
            
            <div className="px-6 pb-6 overflow-y-auto h-[256px] space-y-6 no-scrollbar">
              {/* Arrows & Elements Palette */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-accent uppercase tracking-widest">Trazado y Elementos</h4>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                  {LEGEND.map(l => (
                    <button key={l.id} onClick={() => { setArrowType(l.id); setTool('arrow'); }}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 group`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${arrowType === l.id && tool === 'arrow' ? 'bg-accent text-bg scale-110 shadow-lg shadow-accent/20' : 'bg-white/5 text-white/40'}`}>
                        {l.icon}
                      </div>
                      <span className="text-[8px] font-black uppercase text-muted truncate w-12 text-center">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Palette */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[9px] font-black text-muted uppercase tracking-widest">Jugadores Cabrerizos</h4>
                  <span className="text-[10px] font-black text-accent">{(currentStep.tokens || []).filter(t => t.kind === 'player' && !t.isRival).length}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {players.map(p => {
                    const label = String(p.number || '?');
                    const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === label && !t.isRival);
                    return (
                      <button key={p.id} onClick={() => togglePlayer(p, false)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${on ? 'bg-accent/20 border-accent/40 text-accent scale-95 shadow-inner' : 'bg-white/5 border-white/5 text-white/40 active:scale-90'}`}>
                        <span className="text-sm font-black">{p.number}</span>
                        <span className="text-[8px] font-bold truncate w-full px-1 text-center">{p.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rivals */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Rival</h4>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {Array.from({ length: 11 }).map((_, i) => {
                    const num = String(i + 1);
                    const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === num && t.isRival);
                    return (
                      <button key={i} onClick={() => togglePlayer({ number: i + 1 }, true)}
                        className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black transition-all ${on ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40'}`}>
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
