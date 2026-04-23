import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import FieldCanvas from '../components/FieldCanvas';
import { Plus, Move, ArrowRight, Trash2, Undo2, Save, FolderOpen, Play, Pause, Monitor, Spline, X, Layers, Minus } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const CATEGORIES = [
  { id: 'corners', label: '⛳ Córners', color: '#f59e0b' },
  { id: 'free_kicks_for', label: '🎯 Faltas a favor', color: '#10b981' },
  { id: 'free_kicks_against', label: '🛡️ Faltas en contra', color: '#ef4444' },
  { id: 'build_up', label: '⚡ Salida de balón', color: '#3b82f6' },
  { id: 'set_pieces', label: '📐 Jugadas ensayadas', color: '#8b5cf6' },
  { id: 'pressing', label: '💪 Presión', color: '#f97316' },
  { id: 'general', label: '📋 General', color: '#6b7280' },
];

const ELEM_BTNS = [
  { id: "ball", label: "Balón", icon: "⚽" },
  { id: "cone", label: "Cono", icon: "🔺" },
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

export default function Tactica() {
  const { isAdmin, profile } = useAuth();
  const isMobile = useIsMobile();
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  const [activeCategory, setActiveCategory] = useState('corners');
  
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
  const [players, setPlayers] = useState([]);
  const [fieldView, setFieldView] = useState('full');
  const [mobileTab, setMobileTab] = useState('jugadas'); // 'jugadas' | 'campo'

  const VIEWS = [
    { id: 'full',  label: '⬛ Campo completo' },
    { id: 'left',  label: '◧ Mitad izquierda' },
    { id: 'right', label: '◨ Mitad derecha' },
  ];
  
  const myRosterId = players.find(p => p.auth_profile_id === profile?.id)?.id;

  const cycleView = () => {
    const idx = VIEWS.findIndex(v => v.id === fieldView);
    setFieldView(VIEWS[(idx + 1) % VIEWS.length].id);
  };

  useEffect(() => {
    fetchPlays();
    fetchPlayers();
    
    // Auto-adjust field view based on category for optimal tactical design
    if (activeCategory === 'corners' || activeCategory === 'free_kicks_for') {
      setFieldView('right');
    } else if (activeCategory === 'build_up' || activeCategory === 'free_kicks_against') {
      setFieldView('left');
    } else {
      setFieldView('full');
    }
  }, [activeCategory]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('roster').select('*').order('number');
    if (data) setPlayers(data);
  };

  const fetchPlays = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('plays')
        .select('*')
        .eq('category', activeCategory)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Migrate legacy data (tokens/arrows on root) to steps array on the fly
        const safePlays = data.map(p => {
          const isMigrated = p.tokens && Array.isArray(p.tokens) && p.tokens.length > 0 && p.tokens[0].step !== undefined;
          if (!isMigrated) {
            return { ...p, tokens: [{ step: 1, tokens: p.tokens || [], arrows: p.arrows || [], zones: p.zones || [] }] };
          }
          return p;
        });
        setPlays(safePlays);
        setActivePlay(safePlays[0]);
      } else {
        setPlays([]);
        setActivePlay(null);
      }
    } catch (err) {
      console.error('Error fetching plays:', err);
      setPlays([]);
      setActivePlay(null);
    }
    setLoading(false);
    setActiveStepIndex(0);
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
      tokens: JSON.parse(JSON.stringify(currentStep.tokens || [])), 
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
    updateCurrentStep({ tokens: (currentStep.tokens || []).map(t => t.id === id ? { ...t, x, y } : t) });
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

  const onDeleteToken = (id) => {
    updateCurrentStep({ tokens: (currentStep.tokens || []).filter(t => t.id !== id) });
    if (selectedTokenId === id) setSelectedTokenId(null);
  };

  const onZoneAdd = (z) => updateCurrentStep({ zones: [...(currentStep.zones || []), z] });
  const onZoneDelete = (zid) => updateCurrentStep({ zones: (currentStep.zones || []).filter(z => z.id !== zid) });

  const updateSelectedToken = (updates) => {
    if (!selectedTokenId) return;
    updateCurrentStep({
      tokens: (currentStep.tokens || []).map(t => t.id === selectedTokenId ? { ...t, ...updates } : t)
    });
  };

  const togglePlayer = (p, isRival = false) => {
    if (!activePlay) return;
    const label = String(p.number || '?');
    const has = (currentStep.tokens || []).find(t => t.kind === "player" && t.label === label && !!t.isRival === isRival);
    if (has) {
      updateCurrentStep({ tokens: (currentStep.tokens || []).filter(t => t.id !== has.id) });
    } else {
      updateCurrentStep({
        tokens: [...(currentStep.tokens || []), {
          id: `pl${label}${isRival ? 'R' : ''}t${Date.now()}`,
          kind: "player",
          x: 80 + Math.random() * 390,
          y: 40 + Math.random() * 280,
          color: isRival ? '#ef4444' : '#0057ff',
          label,
          name: isRival ? null : p.name,
          isRival
        }]
      });
    }
  };

  const createNewPlay = async () => {
    const name = prompt("Nombre de la nueva jugada:");
    if (!name) return;
    const np = { name, category: activeCategory, type: "Táctica", tokens: [{ step: 1, tokens: [], arrows: [], zones: [] }], arrows: [] };
    
    try {
      const { data } = await supabase.from('plays').insert([
        { ...np, created_by: profile?.id }
      ]).select().single();

      if (data) {
        setPlays([data, ...plays]);
        setActivePlay(data);
      } else {
        const mockNp = { ...np, id: Date.now().toString() };
        setPlays([mockNp, ...plays]);
        setActivePlay(mockNp);
      }
    } catch {
      const mockNp = { ...np, id: Date.now().toString() };
      setPlays([mockNp, ...plays]);
      setActivePlay(mockNp);
    }
    setActiveStepIndex(0);
  };

  const deletePlay = async () => {
    if (!activePlay) return;
    if (!confirm('¿Eliminar esta jugada?')) return;
    
    try {
      await supabase.from('plays').delete().eq('id', activePlay.id);
    } catch {}
    
    const remaining = plays.filter(p => p.id !== activePlay.id);
    setPlays(remaining);
    setActivePlay(remaining[0] || null);
    setActiveStepIndex(0);
  };

  const savePlay = async () => {
    if (!activePlay || activePlay.id.length < 10) return;
    try {
      await supabase.from('plays').update({
        tokens: activePlay.tokens,
        arrows: []
      }).eq('id', activePlay.id);
      alert('✅ Jugada guardada correctamente.');
    } catch {
      alert('❌ Error al guardar. Inténtalo de nuevo.');
    }
  };

  const catInfo = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[6];

  // ── Sidebar content (shared between mobile and desktop) ─────────────────
  const SidebarContent = () => (
    <>
      {/* Category Tabs */}
      <div className="card" style={{ padding: 8 }}>
        <div className="label" style={{ marginBottom: 6 }}>
          <FolderOpen size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Categorías
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setActivePlay(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 8px', borderRadius: 7, border: 'none', background: activeCategory === cat.id ? `${cat.color}18` : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: activeCategory === cat.id ? 700 : 500, color: activeCategory === cat.id ? cat.color : '#64748b', transition: 'all .12s' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, opacity: activeCategory === cat.id ? 1 : 0.3 }} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plays List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 12, color: catInfo.color }}>{catInfo.label}</span>
        {isAdmin && <button className="btn btn-outline btn-sm" onClick={createNewPlay}><Plus size={14}/></button>}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#96a0b5', fontSize: 11 }}>Cargando...</div>
      ) : plays.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#96a0b5', fontSize: 11 }}>
          No hay jugadas en esta categoría.
          {isAdmin && <div style={{ marginTop: 6 }}>Pulsa <strong>+</strong> para crear una.</div>}
        </div>
      ) : (
        plays.map(p => (
          <div key={p.id}
            onClick={() => { setActivePlay(p); setActiveStepIndex(0); if (isMobile) setMobileTab('campo'); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${activePlay?.id === p.id ? catInfo.color : "#e0e4ed"}`, background: activePlay?.id === p.id ? `${catInfo.color}0d` : "white", cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "#96a0b5", marginTop: 1 }}>{p.tokens?.length || 1} pasos</div>
          </div>
        ))
      )}

      {/* Admin tools */}
      {isAdmin && activePlay && (
        <>
          <div className="card" style={{ padding: 10 }}>
            <div className="label">Cabrerizos FC</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {players.map(p => {
                const label = String(p.number || '?');
                const on = (currentStep.tokens || []).some(t => t.kind === "player" && t.label === label && !t.isRival);
                return (
                  <div key={p.id} onClick={() => togglePlayer(p, false)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 8, border: `1.5px solid ${on ? "#0057ff" : "#e0e4ed"}`, background: on ? "#eef3ff" : "white", cursor: "pointer", transition: 'all .1s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                      {p.number || '?'}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, flex: 1 }}>{p.name || 'Jugador'}</span>
                    {on && <span style={{ fontSize: 9, color: '#0057ff', fontWeight: 700 }}>✓</span>}
                  </div>
                );
              })}
            </div>
            <div className="label" style={{ marginTop: 10 }}>Equipo Rival</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {Array.from({ length: 11 }).map((_, i) => {
                const num = String(i + 1);
                const on = (currentStep.tokens || []).some(t => t.kind === "player" && t.label === num && t.isRival);
                return (
                  <div key={`rival-${i}`} onClick={() => togglePlayer({ number: i + 1 }, true)}
                    style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${on ? "#ef4444" : "#fca5a5"}`, background: on ? "#ef4444" : "#fee2e2", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, cursor: "pointer", color: on ? 'white' : '#ef4444' }}>
                    {num}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 9, color: '#96a0b5', marginTop: 6, padding: '4px 6px', background: '#f8f9fb', borderRadius: 6 }}>
              💡 Doble clic o clic derecho sobre una ficha para eliminarla
            </div>
          </div>

          <div className="card" style={{ padding: 10 }}>
            <div className="label">Fichas</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {ELEM_BTNS.map(e => (
                <button key={e.id} onClick={() => setTool(t => t === e.id ? "move" : e.id)}
                  title={e.label}
                  style={{ height: 32, borderRadius: 7, border: `1.5px solid ${tool === e.id ? "#0057ff" : "#e0e4ed"}`, background: tool === e.id ? "#eef3ff" : "#f5f6f9", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <span>{e.icon}</span>
                  <span style={{ fontSize: 9 }}>{e.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Panel de Balón si está seleccionado */}
          {selectedTokenId && (currentStep.tokens || []).find(t => t.id === selectedTokenId)?.kind === 'ball' && (
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

          {/* Panel de Jugador si está seleccionado */}
          {selectedTokenId && (currentStep.tokens || []).find(t => t.id === selectedTokenId)?.kind === 'player' && !(currentStep.tokens || []).find(t => t.id === selectedTokenId)?.isRival && (
            <div className="card" style={{ padding: 10, background: '#f0f9ff', borderColor: '#bae6fd' }}>
              <div className="label">Instrucciones Tácticas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <select 
                  className="input-field" 
                  style={{ padding: '6px 8px', fontSize: 11 }}
                  value={(currentStep.tokens || []).find(t => t.id === selectedTokenId)?.assigned_player_id || ''}
                  onChange={e => updateSelectedToken({ assigned_player_id: e.target.value })}
                >
                  <option value="">-- Vincular Jugador --</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name} {p.surname}</option>)}
                </select>
                <input 
                  className="input-field" 
                  placeholder="Rol (Ej: Bloqueo ciego)" 
                  style={{ fontSize: 11, padding: '6px 8px' }}
                  value={(currentStep.tokens || []).find(t => t.id === selectedTokenId)?.tactical_role || ''}
                  onChange={e => updateSelectedToken({ tactical_role: e.target.value })}
                />
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
    </>
  );

  // ── Canvas toolbar (shared) ───────────────────────────────────────────
  const Toolbar = () => (
    isAdmin && activePlay ? (
      <div style={{ display: "flex", alignItems: "center", gap: 5, background: "white", border: "1px solid #e0e4ed", borderRadius: 9, padding: "6px 8px", flexWrap: 'wrap' }}>
        <button onClick={() => setTool('move')} title="Mover"
          style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "move" ? "#0057ff" : "#e0e4ed"}`, background: tool === "move" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "move" ? "#0057ff" : "#4a5568" }}>
          <Move size={16} />
        </button>
        <button onClick={() => setTool('arrow')} title="Flecha"
          style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "arrow" ? "#0057ff" : "#e0e4ed"}`, background: tool === "arrow" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "arrow" ? "#0057ff" : "#4a5568" }}>
          <ArrowRight size={16} />
        </button>
        <button onClick={() => { setTool('zone'); setZoneColor('red'); }} title="Zona Peligro"
          style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "zone" && zoneColor === 'red' ? "#0057ff" : "#e0e4ed"}`, background: tool === "zone" && zoneColor === 'red' ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "zone" && zoneColor === 'red' ? "#0057ff" : "#ef4444" }}>
          <Layers size={16} />
        </button>
        <div style={{ width: 1, height: 20, background: "#e0e4ed", margin: "0 2px" }} />
        <button onClick={undoArrow} className="btn btn-outline btn-sm"><Undo2 size={12}/></button>
        <button onClick={clearArrows} className="btn btn-outline btn-sm"><Trash2 size={12}/></button>
        <button onClick={deletePlay} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }}><Trash2 size={12}/></button>
        <button onClick={cycleView}
          style={{ padding: '0 8px', height: 32, borderRadius: 6, border: '1.5px solid #e0e4ed', background: fieldView !== 'full' ? '#eef3ff' : '#f5f6f9', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: fieldView !== 'full' ? '#0057ff' : '#4a5568', whiteSpace: 'nowrap' }}>
          {VIEWS.find(v => v.id === fieldView)?.label}
        </button>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={() => setPresentationMode(true)} className="btn btn-outline btn-sm">
            <Monitor size={14}/> TV Mode
          </button>
          <button onClick={savePlay} className="btn btn-primary btn-sm"><Save size={12}/> Guardar</button>
        </div>
      </div>
    ) : null
  );

  const Timeline = () => (
    activePlay ? (
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
    ) : null
  );

  if (presentationMode) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => setPresentationMode(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.2)', color: 'white', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <div style={{ width: '100%', maxWidth: 800, aspectRatio: '550/366', background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
          <FieldCanvas 
            tokens={currentStep.tokens} arrows={currentStep.arrows} zones={currentStep.zones}
            animating={animating} presentationMode={true} viewMode={fieldView}
          />
        </div>
        <div style={{ position: 'absolute', bottom: 30, display: 'flex', gap: 10 }}>
          <button onClick={() => { setIsPlaying(true); setActiveStepIndex(0); }} className="btn btn-primary"><Play size={16}/> Reproducir</button>
        </div>
      </div>
    );
  }

  // ── Mobile layout ─────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f0f2f5', borderRadius: 10, padding: 4 }}>
          <button onClick={() => setMobileTab('jugadas')}
            style={{ flex: 1, padding: '8px 4px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: mobileTab === 'jugadas' ? 'white' : 'transparent', color: mobileTab === 'jugadas' ? '#0057ff' : '#64748b', boxShadow: mobileTab === 'jugadas' ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition: 'all .15s' }}>
            📋 Jugadas
          </button>
          <button onClick={() => setMobileTab('campo')}
            style={{ flex: 1, padding: '8px 4px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: mobileTab === 'campo' ? 'white' : 'transparent', color: mobileTab === 'campo' ? '#0057ff' : '#64748b', boxShadow: mobileTab === 'campo' ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition: 'all .15s' }}>
            ⚽ Campo
          </button>
        </div>

        {mobileTab === 'jugadas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SidebarContent />
          </div>
        )}

        {mobileTab === 'campo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Toolbar />
            <div style={{ background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
              {activePlay ? (
                <FieldCanvas
                  tokens={currentStep.tokens || []}
                  arrows={currentStep.arrows || []}
                  zones={currentStep.zones || []}
                  onMove={isAdmin ? onMove : undefined}
                  tool={isAdmin ? tool : 'move'}
                  arrowType="pass"
                  onArrow={isAdmin ? onArrow : undefined}
                  drawPt={drawPt}
                  setDrawPt={setDrawPt}
                  onPlace={isAdmin ? onPlace : undefined}
                  onDelete={isAdmin ? onDeleteToken : undefined}
                  onZoneAdd={isAdmin ? onZoneAdd : undefined} 
                  onZoneDelete={isAdmin ? onZoneDelete : undefined} zoneColor={zoneColor}
                  viewMode={fieldView}
                  animating={animating}
                  selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId}
                  myRosterId={myRosterId}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.5)', padding: '40px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Selecciona una jugada en la pestaña "Jugadas"</div>
                </div>
              )}
            </div>
            <Timeline />
          </div>
        )}
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 100px)' }}>
      <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingRight: 5 }}>
        <SidebarContent />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Toolbar />
        <div style={{ flex: 1, background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.2)", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activePlay ? (
            <FieldCanvas
              tokens={currentStep.tokens || []}
              arrows={currentStep.arrows || []}
              zones={currentStep.zones || []}
              onMove={isAdmin ? onMove : undefined}
              tool={isAdmin ? tool : 'move'}
              arrowType="pass"
              onArrow={isAdmin ? onArrow : undefined}
              drawPt={drawPt}
              setDrawPt={setDrawPt}
              onPlace={isAdmin ? onPlace : undefined}
              onDelete={isAdmin ? onDeleteToken : undefined}
              onZoneAdd={isAdmin ? onZoneAdd : undefined} 
              onZoneDelete={isAdmin ? onZoneDelete : undefined} zoneColor={zoneColor}
              viewMode={fieldView}
              animating={animating}
              selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.5)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Selecciona una categoría y una jugada</div>
              <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
                {isAdmin ? 'O crea una nueva con el botón +' : 'El entrenador irá subiendo jugadas'}
              </div>
            </div>
          )}
        </div>
        <Timeline />
      </div>
    </div>
  );
}
