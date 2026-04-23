import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import FieldCanvas from '../components/FieldCanvas';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { 
  Plus, Move, ArrowRight, Trash2, Save, Monitor, Spline, X, 
  ChevronRight, ChevronLeft, Layers, Users, MousePointer2, 
  Target, Activity, Info, Settings, Play, Square,
  Dumbbell, PenTool, Circle, Type
} from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const CATEGORIES = [
  { id: 'corners', label: 'Córners', icon: '⛳', color: '#f59e0b' },
  { id: 'free_kicks_for', label: 'Faltas (+)', icon: '🎯', color: '#10b981' },
  { id: 'free_kicks_against', label: 'Faltas (-)', icon: '🛡️', color: '#ef4444' },
  { id: 'build_up', label: 'Salida', icon: '⚡', color: '#3b82f6' },
  { id: 'set_pieces', label: 'Estrategia', icon: '📐', color: '#8b5cf6' },
  { id: 'pressing', label: 'Presión', icon: '💪', color: '#f97316' },
  { id: 'general', label: 'General', icon: '📋', color: '#6b7280' },
];

const LEGEND = [
  { id: 'pass', label: 'Pase Raso', icon: '⎯', color: '#4ade80' },
  { id: 'run', label: 'Desmarque', icon: '╌', color: '#fbbf24' },
  { id: 'shoot', label: 'Tiro/Largo', icon: '⟶', color: '#ef4444' },
  { id: 'curved', label: 'Bombeado', icon: '⤿', color: '#c084fc' },
  { id: 'zigzag', label: 'Conducción', icon: '〰', color: '#3b82f6' },
];

export default function Tactica() {
  const { isAdmin, isRealAdmin, viewAsPlayer, profile } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  const isMobile = useIsMobile();
  
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  const [activeCategory, setActiveCategory] = useState('corners');
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState('jugadas'); 
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [tool, setTool] = useState("move");
  const [arrowType, setArrowType] = useState("pass");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
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

  const steps = (activePlay?.tokens && activePlay.tokens.length > 0) ? activePlay.tokens : [{ step: 1, tokens: [], arrows: [], zones: [] }];
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
      updateCurrentStep({
        tokens: [...(currentStep.tokens || []), {
          id: `pl-${label}-${isRival ? 'R' : ''}-${Date.now()}`,
          kind: "player",
          x: 275 + (Math.random() * 40 - 20),
          y: 183 + (Math.random() * 40 - 20),
          color: isRival ? '#ef4444' : '#0057ff',
          label,
          name: p.name,
          photo_url: p.photo_url,
          isRival
        }]
      });
    }
  };

  const addStep = () => {
    if (isPlayerMode) return;
    const newSteps = [...steps, { step: steps.length + 1, tokens: JSON.parse(JSON.stringify(currentStep.tokens || [])), arrows: [], zones: [] }];
    setActiveStepIndex(newSteps.length - 1);
    const upd = { ...activePlay, tokens: newSteps };
    setActivePlay(upd);
    setPlays(ps => ps.map(p => p.id === upd.id ? upd : p));
  };

  const removeStep = () => {
    if (isPlayerMode || steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== activeStepIndex);
    setActiveStepIndex(Math.max(0, activeStepIndex - 1));
    const upd = { ...activePlay, tokens: newSteps };
    setActivePlay(upd);
    setPlays(ps => ps.map(p => p.id === upd.id ? upd : p));
  };

  const createPlay = async () => {
    if (!form.name) return;
    const { data } = await supabase.from('plays').insert([{ 
      name: form.name, 
      category: activeCategory, 
      tokens: [{ step: 1, tokens: [], arrows: [], zones: [] }] 
    }]).select().single();
    if (data) {
      setPlays([data, ...plays]);
      setActivePlay(data);
      setShowForm(false);
      setForm({ name: '' });
    }
  };

  return (
    <div className="flex h-full bg-bg overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: Biblioteca */}
      <div className={`
        flex-shrink-0 w-full md:w-64 bg-surface/30 border-r border-white/5 flex flex-col transition-all duration-300
        ${isMobile && mobileTab !== 'jugadas' ? 'hidden' : 'flex'}
      `}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] leading-none mb-1">Biblioteca</h1>
            <p className="text-xs font-bold text-white truncate">{CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
          </div>
          {!isPlayerMode && (
            <button onClick={() => setShowForm(true)} className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-bg transition-all active:scale-90 shadow-lg shadow-accent/5">
              <Plus size={18} />
            </button>
          )}
        </div>

        <div className="flex overflow-x-auto no-scrollbar p-2 gap-2 bg-black/10">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} title={cat.label}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${activeCategory === cat.id ? 'bg-accent text-bg scale-105 shadow-lg shadow-accent/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              {cat.icon}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white/5 rounded-2xl" />)}
            </div>
          ) : plays.length > 0 ? plays.map(p => (
            <button key={p.id} onClick={() => { setActivePlay(p); setMobileTab('campo'); }}
              className={`w-full p-4 rounded-2xl text-left border transition-all ${activePlay?.id === p.id ? 'bg-accent/10 border-accent/40 text-white' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest truncate">{p.name}</span>
                {activePlay?.id === p.id && <ChevronRight size={14} className="text-accent flex-shrink-0" />}
              </div>
            </button>
          )) : (
            <div className="py-20 text-center opacity-20">
              <PenTool size={32} className="mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sin jugadas</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER: Editor Canvas */}
      <div className={`
        flex-1 relative flex flex-col bg-[#05070a] overflow-hidden 
        ${isMobile && mobileTab !== 'campo' ? 'hidden' : 'flex'}
      `}>
        
        {/* Playback Controls (Floating Top) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2 bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button onClick={() => setAnimating(!animating)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${animating ? 'bg-amber-500 text-bg shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white'}`}>
            <Monitor size={18} />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1" />

          <button onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))} className="w-8 h-8 rounded-xl text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 px-3">
            {steps.map((_, idx) => (
              <button key={idx} onClick={() => setActiveStepIndex(idx)}
                className={`h-3 rounded-full transition-all duration-300 ${activeStepIndex === idx ? 'w-10 bg-accent shadow-[0_0_15px_rgba(0,255,135,0.5)]' : 'w-3 bg-white/10 hover:bg-white/20'}`} />
            ))}
            {!isPlayerMode && (
              <button onClick={addStep} className="w-7 h-7 rounded-xl bg-white/5 text-white/40 hover:text-accent hover:bg-accent/10 flex items-center justify-center ml-1 transition-all">
                <Plus size={14} />
              </button>
            )}
          </div>

          <button onClick={() => setActiveStepIndex(Math.min(steps.length - 1, activeStepIndex + 1))} className="w-8 h-8 rounded-xl text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
            <ChevronRight size={20} />
          </button>

          {!isPlayerMode && steps.length > 1 && (
            <button onClick={removeStep} className="w-8 h-8 rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center ml-2 transition-all">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Global Actions (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {!isPlayerMode && (
            <button onClick={savePlay} className="h-11 px-6 bg-accent text-bg font-black rounded-2xl shadow-xl shadow-accent/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Save size={18} />
              <span className="text-[11px] uppercase tracking-[0.2em] hidden sm:inline">Guardar</span>
            </button>
          )}
        </div>

        {/* FIELD CANVAS (Maximum protagonist) */}
        <div className="flex-1 p-6 md:p-16 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full max-w-6xl aspect-[550/366] bg-surface rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.7)] border border-white/5 relative overflow-hidden group">
            <FieldCanvas
              ref={fieldSvgRef}
              tokens={currentStep.tokens || []}
              arrows={currentStep.arrows || []}
              zones={currentStep.zones || []}
              tool={tool}
              arrowType={arrowType}
              animating={animating}
              onMove={(id, x, y) => {
                if (isPlayerMode || !currentStep) return;
                const nextTs = (currentStep.tokens || []).map(t => t.id === id ? { ...t, x, y } : t);
                updateCurrentStep({ tokens: nextTs });
              }}
              onArrow={a => {
                if (isPlayerMode) return;
                updateCurrentStep({ arrows: [...(currentStep.arrows || []), a] });
              }}
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
        </div>

        {/* MOBILE: TOOLS BOTTOM BUTTON */}
        {isMobile && !isPlayerMode && (
          <button 
            onClick={() => setShowTools(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-accent text-bg font-black px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 active:scale-95 transition-all"
          >
            <PenTool size={20} />
            <span className="text-xs uppercase tracking-[0.2em]">Herramientas</span>
          </button>
        )}
      </div>

      {/* 3. RIGHT SIDEBAR: Editor PRO Panel (Desktop Only) */}
      {!isPlayerMode && (
        <div className="hidden md:flex flex-shrink-0 w-80 bg-surface/60 backdrop-blur-xl border-l border-white/10 flex-col overflow-hidden animate-in slide-in-from-right duration-500">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] leading-none mb-1">Editor PRO</h2>
            <p className="text-[9px] text-muted font-bold uppercase tracking-tighter">Cabrerizos F.C. Engine</p>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
            
            {/* Mode Selectors */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Modo de Edición</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTool('move')} 
                  className={`flex items-center justify-center gap-3 h-14 rounded-2xl border transition-all ${tool === 'move' ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
                  <Move size={18} />
                  <span className="text-[10px] font-black uppercase">Mover</span>
                </button>
                <button onClick={() => { setTool('arrow'); setArrowType('pass'); }} 
                  className={`flex items-center justify-center gap-3 h-14 rounded-2xl border transition-all ${tool === 'arrow' ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}>
                  <Spline size={18} />
                  <span className="text-[10px] font-black uppercase">Trazado</span>
                </button>
              </div>
            </div>

            {/* Elements Palette */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Insertar Objetos</h4>
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => updateCurrentStep({ tokens: [...(currentStep.tokens || []), { id: `ball-${Date.now()}`, kind: 'ball', x: 275, y: 183 }] })}
                  className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-90" title="Balón">
                  ⚽
                </button>
                <button onClick={() => updateCurrentStep({ tokens: [...(currentStep.tokens || []), { id: `cone-${Date.now()}`, kind: 'cone', x: 275, y: 183 }] })}
                  className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-90" title="Cono">
                  🚧
                </button>
                <button onClick={() => updateCurrentStep({ tokens: [...(currentStep.tokens || []), { id: `man-${Date.now()}`, kind: 'mannequin', x: 275, y: 183 }] })}
                  className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-90" title="Barrera/Maniquí">
                  👤
                </button>
                <button className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 cursor-not-allowed" title="Zonas (Próximamente)">
                  <Circle size={18} />
                </button>
              </div>
            </div>

            {/* Arrow Sub-palette */}
            {tool === 'arrow' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">Tipo de Trazo</h4>
                <div className="grid grid-cols-1 gap-2">
                  {LEGEND.map(l => (
                    <button key={l.id} onClick={() => setArrowType(l.id)}
                      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${arrowType === l.id ? 'bg-white/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'}`}>
                      <span className="text-2xl w-8 text-center">{l.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Roster Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Plantilla CFC</h4>
                <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-black rounded-full">{(currentStep.tokens || []).filter(t => t.kind === 'player' && !t.isRival).length}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {players.map(p => {
                  const label = String(p.number || '?');
                  const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === label && !t.isRival);
                  return (
                    <button key={p.id} onClick={() => togglePlayer(p, false)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${on ? 'bg-accent text-bg shadow-lg shadow-accent/20 scale-95' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'}`}>
                      {p.number}
                    </button>
                  );
                })}
              </div>

              {/* Rivals */}
              <h4 className="text-[9px] font-black text-rose-500/50 uppercase tracking-[0.2em] pt-4">Rival</h4>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 11 }).map((_, i) => {
                  const num = String(i + 1);
                  const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === num && t.isRival);
                  return (
                    <button key={i} onClick={() => togglePlayer({ number: i + 1 }, true)}
                      className={`aspect-square rounded-xl border text-[10px] font-black transition-all ${on ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'}`}>
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-black/30 border-t border-white/5">
            <div className="flex items-start gap-3 opacity-30">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <p className="text-[9px] font-medium leading-relaxed">Sugerencia: Usa el ratón para arrastrar jugadores con precisión. Doble clic para eliminar trazos.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODALS & MOBILE SHEETS */}
      {isMobile && showTools && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowTools(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-surface rounded-t-[48px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto my-6" />
            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">
              <div className="space-y-5">
                <h4 className="text-xs font-black text-accent uppercase tracking-widest">Edición</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => { setTool('move'); setShowTools(false); }} className={`aspect-square rounded-3xl flex items-center justify-center border transition-all ${tool === 'move' ? 'bg-accent text-bg shadow-xl shadow-accent/20 border-accent' : 'bg-white/5 text-white/40 border-white/5'}`}><Move size={24}/></button>
                  <button onClick={() => { setTool('arrow'); setArrowType('pass'); setShowTools(false); }} className={`aspect-square rounded-3xl flex items-center justify-center border transition-all ${tool === 'arrow' ? 'bg-accent text-bg shadow-xl shadow-accent/20 border-accent' : 'bg-white/5 text-white/40 border-white/5'}`}><Spline size={24}/></button>
                  <button onClick={() => { updateCurrentStep({ tokens: [...(currentStep.tokens || []), { id: `ball-${Date.now()}`, kind: 'ball', x: 275, y: 183 }] }); setShowTools(false); }} className="aspect-square rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl">⚽</button>
                </div>
              </div>
              
              <div className="space-y-5">
                <h4 className="text-xs font-black text-muted uppercase tracking-widest">Plantilla</h4>
                <div className="grid grid-cols-4 gap-3">
                  {players.map(p => {
                    const label = String(p.number || '?');
                    const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === label && !t.isRival);
                    return (
                      <button key={p.id} onClick={() => togglePlayer(p, false)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${on ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-white/40'}`}>
                        <span className="text-xl font-black">{p.number}</span>
                        <span className="text-[10px] font-bold truncate w-full px-2 text-center">{p.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">Rival</h4>
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 11 }).map((_, i) => {
                    const num = String(i + 1);
                    const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === num && t.isRival);
                    return (
                      <button key={i} onClick={() => togglePlayer({ number: i + 1 }, true)}
                        className={`aspect-square rounded-2xl border flex items-center justify-center text-sm font-black ${on ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 border-white/5 text-white/40'}`}>{num}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-8 bg-black/40 backdrop-blur-2xl border-t border-white/10">
              <button onClick={() => setShowTools(false)} className="w-full py-5 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-2xl">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* New Play Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-md rounded-[48px] p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-white mb-8 tracking-tighter">Nueva Jugada</h2>
            <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-accent/50 transition-all mb-8 font-bold text-lg"
              placeholder="Ej: Salida de balón 01" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            <div className="flex gap-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-5 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Cancelar</button>
              <button onClick={createPlay} className="flex-1 py-5 rounded-2xl bg-accent text-bg font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20 active:scale-95 transition-all">Crear Jugada</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
