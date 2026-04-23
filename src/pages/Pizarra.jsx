import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import FieldCanvas from '../components/FieldCanvas';
import { Plus, Move, ArrowRight, Trash2, Undo2, Save, Play, Pause, Monitor, Minus, Spline, X, Layers } from 'lucide-react';

const ELEM_BTNS = [
  { id: "ball", label: "Balón", icon: "⚽" },
  { id: "cone", label: "Cono Naranja", icon: "🔺" },
  { id: "cone_blue", label: "Cono Azul", icon: "🔷" },
  { id: "goal", label: "Portería", icon: "🥅" },
  { id: "mannequin", label: "Maniquí", icon: "🧍" },
  { id: "pole", label: "Poste", icon: "🚩" },
  { id: "ladder", label: "Escalera", icon: "🪜" },
  { id: "hurdle", label: "Valla", icon: "🚧" },
  { id: "zone", label: "Zona", icon: "⬜" },
  { id: "player", label: "Jugador X", icon: "❌" }
];

const VECTOR_COLORS = [
  { id: '#3b82f6', label: 'Ofensivo', hex: '#3b82f6' },
  { id: '#ef4444', label: 'Defensa', hex: '#ef4444' },
  { id: '#fbbf24', label: 'Pase Clave', hex: '#fbbf24' },
];

const VECTOR_STYLES = [
  { id: 'solid', label: 'Pase Raso', icon: <Minus size={14} /> },
  { id: 'dashed', label: 'Desmarque', icon: <div style={{width: 14, borderBottom: '2px dashed currentColor'}}></div> },
  { id: 'curved', label: 'Bombeado', icon: <Spline size={14} /> },
];

export default function Pizarra() {
  const { isAdmin, profile } = useAuth();
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  
  // Canvas Tools
  const [tool, setTool] = useState("move");
  const [arrowColor, setArrowColor] = useState("#3b82f6");
  const [arrowStyle, setArrowStyle] = useState("solid");
  const [drawPt, setDrawPt] = useState(null);
  const [zoneColor, setZoneColor] = useState("red");
  
  // Sequences & Playback
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Selection & View
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [presentationMode, setPresentationMode] = useState(false);
  
  const [loading, setLoading] = useState(true);

  const players = [
    { num: 1, color: '#e74c3c' }, { num: 2, color: '#2980b9' }, { num: 3, color: '#27ae60' },
    { num: 4, color: '#2980b9' }, { num: 5, color: '#2980b9' }, { num: 6, color: '#8e44ad' },
    { num: 7, color: '#e67e22' }, { num: 8, color: '#8e44ad' }, { num: 9, color: '#e74c3c' },
    { num: 10, color: '#e67e22' }, { num: 11, color: '#27ae60' }
  ];

  useEffect(() => {
    fetchPlays();
  }, []);

  const fetchPlays = async () => {
    setLoading(true);
    const { data } = await supabase.from('plays').select('*').order('created_at', { ascending: false });
    if (data) {
      // Migrate legacy data (tokens/arrows on root) to steps array on the fly
      const migrated = data.map(p => {
        const isMigrated = p.tokens && Array.isArray(p.tokens) && p.tokens.length > 0 && p.tokens[0].step !== undefined;
        if (!isMigrated) {
          return { ...p, tokens: [{ step: 1, tokens: p.tokens || [], arrows: p.arrows || [], zones: p.zones || [] }] };
        }
        return p;
      });
      setPlays(migrated);
      if (migrated.length > 0) setActivePlay(migrated[0]);
    } else {
      const mock = [{ id: '1', name: 'Presión 4-3-3', type: 'Táctica', tokens: [{ step: 1, tokens: [], arrows: [], zones: [] }] }];
      setPlays(mock);
      setActivePlay(mock[0]);
    }
    setLoading(false);
  };

  // Steps handling
  const steps = activePlay?.tokens?.[0]?.step !== undefined 
    ? activePlay.tokens 
    : [{ step: 1, tokens: [], arrows: [], zones: [] }];
    
  const currentStep = steps[activeStepIndex] || { tokens: [], arrows: [], zones: [] };

  const updateCurrentStep = (updates) => {
    if (!activePlay) return;
    const newSteps = [...steps];
    newSteps[activeStepIndex] = { ...currentStep, ...updates };
    sync({ ...activePlay, tokens: newSteps });
  };

  const sync = (upd) => {
    setActivePlay(upd);
    setPlays(ps => ps.map(p => p.id === upd.id ? upd : p));
  };

  const addStep = () => {
    const newSteps = [...steps, { 
      step: steps.length + 1, 
      tokens: JSON.parse(JSON.stringify(currentStep.tokens)), 
      arrows: [], 
      zones: JSON.parse(JSON.stringify(currentStep.zones || []))
    }];
    sync({ ...activePlay, tokens: newSteps });
    setActiveStepIndex(newSteps.length - 1);
    setSelectedTokenId(null);
  };

  const deleteCurrentStep = () => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== activeStepIndex);
    sync({ ...activePlay, tokens: newSteps });
    setActiveStepIndex(Math.max(0, activeStepIndex - 1));
  };

  // Playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      setAnimating(true);
      interval = setInterval(() => {
        setActiveStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            setTimeout(() => setAnimating(false), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  // Canvas Handlers
  const onMove = (id, x, y) => {
    updateCurrentStep({ tokens: currentStep.tokens.map(t => t.id === id ? { ...t, x, y } : t) });
  };

  const onArrow = (a) => {
    updateCurrentStep({ arrows: [...(currentStep.arrows || []), { ...a, color: arrowColor, lineStyle: arrowStyle, dash: arrowStyle === 'dashed' ? '6,4' : '' }] });
  };
  const clearArrows = () => updateCurrentStep({ arrows: [] });
  const undoArrow = () => updateCurrentStep({ arrows: (currentStep.arrows || []).slice(0, -1) });
  
  const onPlace = (kind, x, y) => {
    let t = { id: kind + Date.now(), kind, x, y };
    if (kind === 'player') {
      t = { ...t, label: 'X', color: '#333' };
    }
    updateCurrentStep({ tokens: [...(currentStep.tokens || []), t] });
  };

  const onDelete = (id) => {
    updateCurrentStep({ tokens: currentStep.tokens.filter(t => t.id !== id) });
    if (selectedTokenId === id) setSelectedTokenId(null);
  };

  const onZoneAdd = (z) => updateCurrentStep({ zones: [...(currentStep.zones || []), z] });
  const onZoneDelete = (zid) => updateCurrentStep({ zones: (currentStep.zones || []).filter(z => z.id !== zid) });

  const updateSelectedToken = (updates) => {
    if (!selectedTokenId) return;
    updateCurrentStep({
      tokens: currentStep.tokens.map(t => t.id === selectedTokenId ? { ...t, ...updates } : t)
    });
  };

  const togglePlayer = (p) => {
    if (!activePlay) return;
    const has = currentStep.tokens.find(t => t.kind === "player" && t.label === String(p.num));
    if (has) {
      updateCurrentStep({ tokens: currentStep.tokens.filter(t => t.id !== has.id) });
    } else {
      updateCurrentStep({
        tokens: [...currentStep.tokens, { id: `pl${p.num}t${Date.now()}`, kind: "player", x: 80 + Math.random() * 390, y: 40 + Math.random() * 280, color: p.color, label: String(p.num) }]
      });
    }
  };

  const createNewPlay = async () => {
    const name = prompt("Nombre de la nueva jugada:");
    if (!name) return;
    const np = { name, type: "Táctica", tokens: [{ step: 1, tokens: [], arrows: [], zones: [] }], arrows: [] };
    
    const { data } = await supabase.from('plays').insert([{ ...np, created_by: profile?.id }]).select().single();
    if (data) {
      setPlays([data, ...plays]);
      setActivePlay(data);
    } else {
      const mockNp = { ...np, id: Date.now().toString() };
      setPlays([mockNp, ...plays]);
      setActivePlay(mockNp);
    }
    setActiveStepIndex(0);
  };

  const savePlay = async () => {
    if (!activePlay || activePlay.id.length < 10) return;
    await supabase.from('plays').update({
      tokens: activePlay.tokens,
      arrows: [] // Leave empty on root, keeping it inside tokens as steps array
    }).eq('id', activePlay.id);
    alert('Jugada guardada con éxito.');
  };

  if (loading) return <div>Cargando Pizarra...</div>;

  // Presentation Mode Wrapper
  if (presentationMode) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => setPresentationMode(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.2)', color: 'white', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <div style={{ width: '100%', maxWidth: 800, aspectRatio: '550/366', background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
          <FieldCanvas 
            tokens={currentStep.tokens} arrows={currentStep.arrows} zones={currentStep.zones}
            animating={animating} presentationMode={true}
          />
        </div>
        {/* Timeline simple overlay */}
        <div style={{ position: 'absolute', bottom: 30, display: 'flex', gap: 10 }}>
          <button onClick={() => { setIsPlaying(true); setActiveStepIndex(0); }} className="btn btn-primary"><Play size={16}/> Reproducir</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 100px)' }}>
      {/* Left Sidebar */}
      <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>Jugadas</span>
          {isAdmin && <button className="btn btn-outline btn-sm" onClick={createNewPlay}><Plus size={14}/></button>}
        </div>

        {plays.map(p => (
          <div key={p.id} onClick={() => { setActivePlay(p); setActiveStepIndex(0); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${activePlay?.id === p.id ? "#0057ff" : "#e0e4ed"}`, background: activePlay?.id === p.id ? "#eef3ff" : "white", cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "#96a0b5", marginTop: 1 }}>{p.tokens?.length || 1} pasos</div>
          </div>
        ))}

        {isAdmin && activePlay && (
          <>
            <div className="card" style={{ padding: 10 }}>
              <div className="label">Plantilla</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {players.map(p => {
                  const on = currentStep.tokens?.some(t => t.kind === "player" && t.label === String(p.num));
                  return (
                    <div key={p.num} onClick={() => togglePlayer(p)}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 6px", borderRadius: 20, border: `1.5px solid ${on ? "#0057ff" : "#e0e4ed"}`, background: on ? "#eef3ff" : "white", cursor: "pointer" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: p.color }} />
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{p.num}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: 10 }}>
              <div className="label">Fichas</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {ELEM_BTNS.map(e => (
                  <button key={e.id} onClick={() => setTool(t => t === e.id ? "move" : e.id)}
                    style={{ height: 32, borderRadius: 7, border: `1.5px solid ${tool === e.id ? "#0057ff" : "#e0e4ed"}`, background: tool === e.id ? "#eef3ff" : "#f5f6f9", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span>{e.icon}</span>
                    <span style={{ fontSize: 9 }}>{e.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de Balón si está seleccionado */}
            {selectedTokenId && currentStep.tokens.find(t => t.id === selectedTokenId)?.kind === 'ball' && (
              <div className="card" style={{ padding: 10, background: '#fffbeb', borderColor: '#fcd34d' }}>
                <div className="label">Efecto / Rotación</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {['top', 'bottom', 'left', 'right', 'curve-l', 'curve-r'].map(eff => (
                    <button key={eff} onClick={() => updateSelectedToken({ ballEffect: eff })}
                      style={{ fontSize: 9, padding: '4px 0', borderRadius: 4, border: '1px solid #fcd34d', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                      {eff.toUpperCase()}
                    </button>
                  ))}
                  <button onClick={() => updateSelectedToken({ ballEffect: null })}
                    style={{ fontSize: 9, padding: 4, borderRadius: 4, border: '1px solid #fca5a5', background: '#fee2e2', gridColumn: 'span 2', fontWeight: 700, cursor: 'pointer' }}>
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            <div className="card" style={{ padding: 10 }}>
              <div className="label">Trazos (Flechas)</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {VECTOR_STYLES.map(s => (
                  <button key={s.id} onClick={() => { setArrowStyle(s.id); setTool('arrow'); }} title={s.label}
                    style={{ flex: 1, padding: 4, borderRadius: 6, border: `1.5px solid ${arrowStyle === s.id ? '#0057ff' : '#e0e4ed'}`, background: arrowStyle === s.id ? '#eef3ff' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                    {s.icon}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {VECTOR_COLORS.map(c => (
                  <div key={c.id} onClick={() => { setArrowColor(c.id); setTool('arrow'); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: 6, cursor: "pointer", background: arrowColor === c.id ? "#f5f6f9" : "transparent" }}>
                    <div style={{ width: 14, height: 14, background: c.hex, borderRadius: '50%' }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: arrowColor === c.id ? "#111" : "#4a5568" }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Field Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        
        {/* Top Toolbar */}
        {isAdmin && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "white", border: "1px solid #e0e4ed", borderRadius: 9, padding: "6px 8px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#96a0b5", textTransform: "uppercase", marginRight: 5 }}>Herramienta:</span>
            
            <button onClick={() => setTool('move')} title="Mover / Seleccionar"
              style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "move" ? "#0057ff" : "#e0e4ed"}`, background: tool === "move" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "move" ? "#0057ff" : "#4a5568" }}>
              <Move size={16} />
            </button>
            <button onClick={() => setTool('arrow')} title="Dibujar Trazo"
              style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "arrow" ? "#0057ff" : "#e0e4ed"}`, background: tool === "arrow" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "arrow" ? "#0057ff" : "#4a5568" }}>
              <ArrowRight size={16} />
            </button>
            <button onClick={() => { setTool('zone'); setZoneColor('red'); }} title="Dibujar Zona Peligro"
              style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "zone" && zoneColor === 'red' ? "#0057ff" : "#e0e4ed"}`, background: tool === "zone" && zoneColor === 'red' ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "zone" && zoneColor === 'red' ? "#0057ff" : "#ef4444" }}>
              <Layers size={16} />
            </button>

            <div style={{ width: 1, height: 20, background: "#e0e4ed", margin: "0 6px" }} />
            
            <button onClick={undoArrow} className="btn btn-outline btn-sm"><Undo2 size={12}/> Deshacer</button>
            <button onClick={clearArrows} className="btn btn-outline btn-sm"><Trash2 size={12}/> Limpiar Trazos</button>
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button onClick={() => setPresentationMode(true)} className="btn btn-outline btn-sm">
                <Monitor size={14}/> TV Mode
              </button>
              <button onClick={savePlay} className="btn btn-primary btn-sm"><Save size={14}/> Guardar DB</button>
            </div>
          </div>
        )}
        
        {/* Canvas */}
        <div style={{ flex: 1, background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }}>
          {activePlay && (
            <FieldCanvas 
              tokens={currentStep.tokens} 
              arrows={currentStep.arrows}
              zones={currentStep.zones}
              onMove={onMove} tool={tool} arrowType="pass" // Overridden by custom a.color/a.lineStyle
              onArrow={onArrow} drawPt={drawPt} setDrawPt={setDrawPt}
              onPlace={onPlace} onDelete={onDelete}
              onZoneAdd={onZoneAdd} onZoneDelete={onZoneDelete} zoneColor={zoneColor}
              animating={animating}
              selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId}
            />
          )}
        </div>

        {/* Timeline Bottom Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", border: "1px solid #e0e4ed", borderRadius: 9, padding: "8px 12px" }}>
          <button onClick={() => { setIsPlaying(true); setActiveStepIndex(0); }} className="btn btn-primary btn-sm" disabled={steps.length < 2 || isPlaying}>
            <Play size={14} /> Reproducir
          </button>
          <div style={{ width: 1, height: 20, background: "#e0e4ed", margin: "0 4px" }} />
          
          <div style={{ display: 'flex', gap: 6, flex: 1, overflowX: 'auto', paddingBottom: 2 }}>
            {steps.map((s, i) => (
              <button key={i} onClick={() => { setActiveStepIndex(i); setIsPlaying(false); }}
                style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1.5px solid ${activeStepIndex === i ? '#0057ff' : '#e0e4ed'}`, background: activeStepIndex === i ? '#eef3ff' : 'white', color: activeStepIndex === i ? '#0057ff' : '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Paso {i + 1}
              </button>
            ))}
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 6 }}>
              {steps.length > 1 && (
                <button onClick={deleteCurrentStep} className="btn btn-outline btn-sm" title="Borrar Paso" style={{ color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={addStep} className="btn btn-outline btn-sm">
                <Plus size={14} /> Añadir Paso
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
