import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import FieldCanvas from '../components/FieldCanvas';
import { Plus, Move, ArrowRight, Trash2, Undo2, Save, FolderOpen } from 'lucide-react';

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

const ARROW_TYPES = [
  { id: "pass", label: "Pase", color: "#ffe066" },
  { id: "run", label: "Carrera", color: "#4de8a0" },
  { id: "shoot", label: "Disparo", color: "#ff6b6b" },
  { id: "press", label: "Presión", color: "#ffaa44" },
  { id: "free", label: "Libre", color: "#c084fc" },
];

export default function Tactica() {
  const { isAdmin, profile } = useAuth();
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  const [activeCategory, setActiveCategory] = useState('corners');
  const [tool, setTool] = useState("move");
  const [arrowType, setArrowType] = useState("pass");
  const [drawPt, setDrawPt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

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
    try {
      const { data } = await supabase
        .from('plays')
        .select('*')
        .eq('category', activeCategory)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Ensure tokens and arrows are always arrays
        const safePlays = data.map(p => ({
          ...p,
          tokens: Array.isArray(p.tokens) ? p.tokens : [],
          arrows: Array.isArray(p.arrows) ? p.arrows : [],
        }));
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
  };

  const sync = (upd) => {
    const safe = {
      ...upd,
      tokens: Array.isArray(upd.tokens) ? upd.tokens : [],
      arrows: Array.isArray(upd.arrows) ? upd.arrows : [],
    };
    setActivePlay(safe);
    setPlays(ps => ps.map(p => p.id === safe.id ? safe : p));
  };

  const onMove = (id, x, y) => {
    if (!activePlay) return;
    sync({ ...activePlay, tokens: (activePlay.tokens || []).map(t => t.id === id ? { ...t, x, y } : t) });
  };

  const onArrow = (a) => sync({ ...activePlay, arrows: [...(activePlay.arrows || []), a] });
  const clearArrows = () => sync({ ...activePlay, arrows: [] });
  const undoArrow = () => sync({ ...activePlay, arrows: (activePlay.arrows || []).slice(0, -1) });
  
  const onPlace = (kind, x, y) => {
    let t = { id: kind + Date.now(), kind, x, y };
    if (kind === 'player') {
      t = { ...t, label: 'X', color: '#333' };
    }
    sync({ ...activePlay, tokens: [...(activePlay.tokens || []), t] });
  };

  const onDeleteToken = (id) => {
    if (!activePlay) return;
    sync({ ...activePlay, tokens: (activePlay.tokens || []).filter(t => t.id !== id) });
  };

  const togglePlayer = (p, isRival = false) => {
    if (!activePlay) return;
    const label = String(p.number || '?');
    const has = (activePlay.tokens || []).find(t => t.kind === "player" && t.label === label && !!t.isRival === isRival);
    if (has) {
      sync({ ...activePlay, tokens: (activePlay.tokens || []).filter(t => t.id !== has.id) });
    } else {
      sync({
        ...activePlay,
        tokens: [...(activePlay.tokens || []), {
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
    const np = { name, category: activeCategory, type: "Táctica", tokens: [], arrows: [] };
    
    try {
      const { data } = await supabase.from('plays').insert([
        { ...np, created_by: profile?.id }
      ]).select().single();

      if (data) {
        const safe = { ...data, tokens: data.tokens || [], arrows: data.arrows || [] };
        setPlays([safe, ...plays]);
        setActivePlay(safe);
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
  };

  const savePlay = async () => {
    if (!activePlay) return;
    try {
      await supabase.from('plays').update({
        tokens: activePlay.tokens || [],
        arrows: activePlay.arrows || []
      }).eq('id', activePlay.id);
      alert('✅ Jugada guardada correctamente.');
    } catch {
      alert('❌ Error al guardar. Inténtalo de nuevo.');
    }
  };

  const catInfo = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[6];

  return (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 100px)' }}>
      {/* Left Sidebar */}
      <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingRight: 5 }}>
        {/* Category Tabs */}
        <div className="card" style={{ padding: 8 }}>
          <div className="label" style={{ marginBottom: 6 }}>
            <FolderOpen size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Categorías
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActivePlay(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px', borderRadius: 7, border: 'none',
                  background: activeCategory === cat.id ? `${cat.color}18` : 'transparent',
                  cursor: 'pointer', fontSize: 11, fontWeight: activeCategory === cat.id ? 700 : 500,
                  color: activeCategory === cat.id ? cat.color : '#64748b',
                  transition: 'all .12s',
                }}
              >
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
            <div key={p.id} onClick={() => setActivePlay(p)}
              style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${activePlay?.id === p.id ? catInfo.color : "#e0e4ed"}`, background: activePlay?.id === p.id ? `${catInfo.color}0d` : "white", cursor: "pointer" }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: "#96a0b5", marginTop: 1 }}>{(p.tokens || []).length} elementos · {(p.arrows || []).length} flechas</div>
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
                  const on = (activePlay.tokens || []).some(t => t.kind === "player" && t.label === label && !t.isRival);
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
                  const on = (activePlay.tokens || []).some(t => t.kind === "player" && t.label === num && t.isRival);
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
              <div className="label">Elementos de campo</div>
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

            <div className="card" style={{ padding: 10 }}>
              <div className="label">Líneas y Flechas</div>
              {ARROW_TYPES.map(a => (
                <div key={a.id} onClick={() => { setArrowType(a.id); setTool("arrow"); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: 6, cursor: "pointer", background: arrowType === a.id && tool === "arrow" ? "#eef3ff" : "transparent" }}>
                  <div style={{ width: 16, height: 4, background: a.color, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: arrowType === a.id && tool === "arrow" ? "#0057ff" : "#4a5568" }}>{a.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Field Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isAdmin && activePlay && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "white", border: "1px solid #e0e4ed", borderRadius: 9, padding: "6px 8px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#96a0b5", textTransform: "uppercase" }}>Herramienta:</span>
            
            <button onClick={() => setTool('move')} title="Mover"
              style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "move" ? "#0057ff" : "#e0e4ed"}`, background: tool === "move" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "move" ? "#0057ff" : "#4a5568" }}>
              <Move size={16} />
            </button>
            <button onClick={() => setTool('arrow')} title="Flecha"
              style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "arrow" ? "#0057ff" : "#e0e4ed"}`, background: tool === "arrow" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "arrow" ? "#0057ff" : "#4a5568" }}>
              <ArrowRight size={16} />
            </button>

            <div style={{ width: 1, height: 20, background: "#e0e4ed", margin: "0 6px" }} />
            
            <button onClick={undoArrow} className="btn btn-outline btn-sm"><Undo2 size={12}/> Deshacer</button>
            <button onClick={clearArrows} className="btn btn-outline btn-sm"><Trash2 size={12}/> Borrar flechas</button>
            <button onClick={deletePlay} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }}><Trash2 size={12}/> Eliminar</button>
            
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={savePlay} className="btn btn-primary btn-sm"><Save size={12}/> Guardar</button>
            </div>
          </div>
        )}
        
        <div style={{ flex: 1, background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.2)", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activePlay ? (
            <FieldCanvas 
              tokens={activePlay.tokens || []} 
              arrows={activePlay.arrows || []}
              onMove={isAdmin ? onMove : undefined}
              tool={isAdmin ? tool : 'move'}
              arrowType={arrowType}
              onArrow={isAdmin ? onArrow : undefined}
              drawPt={drawPt}
              setDrawPt={setDrawPt}
              onPlace={isAdmin ? onPlace : undefined}
              onDelete={isAdmin ? onDeleteToken : undefined}
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
      </div>
    </div>
  );
}
