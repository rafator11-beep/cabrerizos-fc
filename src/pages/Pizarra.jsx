import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import FieldCanvas from '../components/FieldCanvas';
import { Plus, Move, ArrowRight, Trash2, Undo2, Save } from 'lucide-react';

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

const ARROW_TYPES = [
  { id: "pass", label: "Pase", color: "#ffe066" },
  { id: "run", label: "Carrera", color: "#4de8a0" },
  { id: "shoot", label: "Disparo", color: "#ff6b6b" },
  { id: "press", label: "Presión", color: "#ffaa44" },
  { id: "free", label: "Libre", color: "#c084fc" },
];

export default function Pizarra() {
  const { isAdmin, profile } = useAuth();
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  const [tool, setTool] = useState("move");
  const [arrowType, setArrowType] = useState("pass");
  const [drawPt, setDrawPt] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default players mockup
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
    const { data, error } = await supabase.from('plays').select('*').order('created_at', { ascending: false });
    if (data) {
      setPlays(data);
      if (data.length > 0) setActivePlay(data[0]);
    } else {
      // Mock data if no connection or empty
      const mock = [{ id: '1', name: 'Presión 4-3-3', type: 'Táctica', tokens: [], arrows: [] }];
      setPlays(mock);
      setActivePlay(mock[0]);
    }
    setLoading(false);
  };

  const sync = (upd) => {
    setActivePlay(upd);
    setPlays(ps => ps.map(p => p.id === upd.id ? upd : p));
  };

  const onMove = (id, x, y) => {
    if (!activePlay) return;
    sync({ ...activePlay, tokens: activePlay.tokens.map(t => t.id === id ? { ...t, x, y } : t) });
  };

  const onArrow = (a) => sync({ ...activePlay, arrows: [...(activePlay.arrows || []), a] });
  const clearArrows = () => sync({ ...activePlay, arrows: [] });
  const undoArrow = () => sync({ ...activePlay, arrows: (activePlay.arrows || []).slice(0, -1) });
  
  const onPlace = (kind, x, y) => {
    let t = { id: kind + Date.now(), kind, x, y };
    if (kind === 'player') {
      t = { ...t, label: 'X', color: '#333' }; // Basic opponent or generic player
    }
    sync({ ...activePlay, tokens: [...(activePlay.tokens || []), t] });
  };

  const togglePlayer = (p) => {
    if (!activePlay) return;
    const has = activePlay.tokens.find(t => t.kind === "player" && t.label === String(p.num));
    if (has) {
      sync({ ...activePlay, tokens: activePlay.tokens.filter(t => t.id !== has.id) });
    } else {
      sync({
        ...activePlay, 
        tokens: [...activePlay.tokens, { id: `pl${p.num}t${Date.now()}`, kind: "player", x: 80 + Math.random() * 390, y: 40 + Math.random() * 280, color: p.color, label: String(p.num) }]
      });
    }
  };

  const createNewPlay = async () => {
    const name = prompt("Nombre de la nueva jugada:");
    if (!name) return;
    const np = { name, type: "Nueva", tokens: [], arrows: [] };
    
    // Save to DB
    const { data, error } = await supabase.from('plays').insert([
      { ...np, created_by: profile?.id }
    ]).select().single();

    if (data) {
      setPlays([data, ...plays]);
      setActivePlay(data);
    } else {
      // Offline fallback
      const mockNp = { ...np, id: Date.now().toString() };
      setPlays([mockNp, ...plays]);
      setActivePlay(mockNp);
    }
  };

  const savePlay = async () => {
    if (!activePlay || activePlay.id.length < 10) return; // Ignore mock IDs
    await supabase.from('plays').update({
      tokens: activePlay.tokens,
      arrows: activePlay.arrows
    }).eq('id', activePlay.id);
    alert('Jugada guardada en la base de datos.');
  };

  if (loading) return <div>Cargando Pizarra...</div>;

  return (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 100px)' }}>
      {/* Left Sidebar */}
      <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>Jugadas</span>
          {isAdmin && <button className="btn btn-outline btn-sm" onClick={createNewPlay}><Plus size={14}/></button>}
        </div>

        {plays.map(p => (
          <div key={p.id} onClick={() => setActivePlay(p)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${activePlay?.id === p.id ? "#0057ff" : "#e0e4ed"}`, background: activePlay?.id === p.id ? "#eef3ff" : "white", cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "#96a0b5", marginTop: 1 }}>{p.type} · {p.tokens?.length || 0} items</div>
          </div>
        ))}

        {isAdmin && activePlay && (
          <div className="card" style={{ padding: 10 }}>
            <div className="label">Jugadores</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {players.map(p => {
                const on = activePlay.tokens?.some(t => t.kind === "player" && t.label === String(p.num));
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
        )}

        {isAdmin && (
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
        )}

        {isAdmin && (
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
        )}
      </div>

      {/* Field Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isAdmin && (
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
            
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={savePlay} className="btn btn-primary btn-sm"><Save size={12}/> Guardar</button>
            </div>
          </div>
        )}
        
        <div style={{ flex: 1, background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          {activePlay && (
            <FieldCanvas 
              tokens={activePlay.tokens || []} 
              arrows={activePlay.arrows || []}
              onMove={onMove} tool={tool} arrowType={arrowType}
              onArrow={onArrow} drawPt={drawPt} setDrawPt={setDrawPt}
              onPlace={onPlace} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
