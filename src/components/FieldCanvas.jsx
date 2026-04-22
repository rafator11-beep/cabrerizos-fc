import { useRef, useCallback } from 'react';

const W = 550;
const H = 366;

const ARROW_TYPES = [
  { id: "pass", label: "Pase", color: "#ffe066", dash: "", w: 2.5 },
  { id: "run", label: "Carrera", color: "#4de8a0", dash: "6,3", w: 2.5 },
  { id: "shoot", label: "Disparo", color: "#ff6b6b", dash: "", w: 3.5 },
  { id: "press", label: "Presión", color: "#ffaa44", dash: "3,3", w: 2 },
  { id: "free", label: "Libre", color: "#c084fc", dash: "8,4", w: 2 },
];

export default function FieldCanvas({ tokens, arrows, onMove, tool, arrowType, onArrow, drawPt, setDrawPt, onPlace }) {
  const ref = useRef(null);
  const drag = useRef(null);

  const toSVG = (cx, cy) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
  };

  const onMD = (e, id) => {
    if (tool !== "move") return;
    e.preventDefault();
    e.stopPropagation();
    drag.current = id;
  };

  const onMM = useCallback((e) => {
    if (!drag.current) return;
    const pt = e.touches ? e.touches[0] : e;
    const c = toSVG(pt.clientX, pt.clientY);
    onMove(drag.current, c.x, c.y);
  }, [onMove]);

  const onMU = () => { drag.current = null; };

  const onClick = (e) => {
    const c = toSVG(e.clientX, e.clientY);
    if (tool === "arrow") {
      if (!drawPt) {
        setDrawPt(c);
      } else {
        onArrow({ id: "a" + Date.now(), type: arrowType, x1: drawPt.x, y1: drawPt.y, x2: c.x, y2: c.y });
        setDrawPt(null);
      }
    } else if (tool !== "move") {
      onPlace(tool, c.x, c.y);
    }
  };

  const renderElem = (t) => {
    const baseStyle = { cursor: "grab" };
    switch (t.kind) {
      case "ball": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <circle cx={t.x} cy={t.y} r={10} fill="white" stroke="#bbb" strokeWidth="1" />
          <path d={`M${t.x},${t.y - 10} C${t.x + 6},${t.y - 4} ${t.x + 9},${t.y + 4} ${t.x},${t.y + 10} C${t.x - 9},${t.y + 4} ${t.x - 6},${t.y - 4} ${t.x},${t.y - 10}`} fill="none" stroke="#888" strokeWidth=".8" />
          <path d={`M${t.x - 10},${t.y} C${t.x - 4},${t.y - 6} ${t.x + 4},${t.y - 6} ${t.x + 10},${t.y}`} fill="none" stroke="#888" strokeWidth=".8" />
        </g>
      );
      case "cone": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <polygon points={`${t.x},${t.y - 11} ${t.x - 7},${t.y + 5} ${t.x + 7},${t.y + 5}`} fill="#ff9500" stroke="white" strokeWidth="1" />
          <ellipse cx={t.x} cy={t.y + 5} rx={7} ry={2.5} fill="#cc7700" />
        </g>
      );
      case "cone_blue": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <polygon points={`${t.x},${t.y - 11} ${t.x - 7},${t.y + 5} ${t.x + 7},${t.y + 5}`} fill="#0057ff" stroke="white" strokeWidth="1" />
          <ellipse cx={t.x} cy={t.y + 5} rx={7} ry={2.5} fill="#003bb3" />
        </g>
      );
      case "goal": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <rect x={t.x - 20} y={t.y - 11} width={40} height={22} fill="rgba(255,255,255,.1)" stroke="white" strokeWidth="2.5" rx="1" />
        </g>
      );
      case "mannequin": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <circle cx={t.x} cy={t.y - 13} r={5} fill="#ffd580" stroke="white" strokeWidth="1" />
          <rect x={t.x - 4} y={t.y - 8} width={8} height={12} rx={2} fill="#ffd580" stroke="white" strokeWidth="1" />
          <line x1={t.x - 8} y1={t.y - 2} x2={t.x + 8} y2={t.y - 2} stroke="white" strokeWidth="1.5" />
          <line x1={t.x - 3} y1={t.y + 4} x2={t.x - 5} y2={t.y + 15} stroke="#ffd580" strokeWidth="2" />
          <line x1={t.x + 3} y1={t.y + 4} x2={t.x + 5} y2={t.y + 15} stroke="#ffd580" strokeWidth="2" />
        </g>
      );
      case "pole": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <line x1={t.x} y1={t.y + 14} x2={t.x} y2={t.y - 14} stroke="#ffd700" strokeWidth="2.5" />
          <polygon points={`${t.x},${t.y - 14} ${t.x + 10},${t.y - 9} ${t.x},${t.y - 4}`} fill="#ff4444" />
        </g>
      );
      case "ladder": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <rect x={t.x - 20} y={t.y - 8} width={40} height={16} fill="none" stroke="#ffe066" strokeWidth="2" />
          <line x1={t.x - 10} y1={t.y - 8} x2={t.x - 10} y2={t.y + 8} stroke="#ffe066" strokeWidth="2" />
          <line x1={t.x} y1={t.y - 8} x2={t.x} y2={t.y + 8} stroke="#ffe066" strokeWidth="2" />
          <line x1={t.x + 10} y1={t.y - 8} x2={t.x + 10} y2={t.y + 8} stroke="#ffe066" strokeWidth="2" />
        </g>
      );
      case "hurdle": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <line x1={t.x - 10} y1={t.y} x2={t.x + 10} y2={t.y} stroke="#ff6b6b" strokeWidth="3" />
          <line x1={t.x - 8} y1={t.y} x2={t.x - 8} y2={t.y + 8} stroke="#333" strokeWidth="2" />
          <line x1={t.x + 8} y1={t.y} x2={t.x + 8} y2={t.y + 8} stroke="#333" strokeWidth="2" />
        </g>
      );
      case "zone": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <rect x={t.x - 22} y={t.y - 14} width={44} height={28} fill="rgba(255,255,100,.1)" stroke="rgba(255,255,100,.55)" strokeWidth="1.5" strokeDasharray="4,2" rx="2" />
        </g>
      );
      case "player": return (
        <g key={t.id} onMouseDown={e => onMD(e, t.id)} style={baseStyle}>
          <circle cx={t.x} cy={t.y} r={14} fill={t.color || '#e74c3c'} stroke="white" strokeWidth="2" />
          <text x={t.x} y={t.y} textAnchor="middle" dy="4" fontSize="11" fontWeight="800" fill="white">{t.label}</text>
        </g>
      );
      default: return null;
    }
  };

  const renderArrow = (a, i) => {
    const at = ARROW_TYPES.find(x => x.id === a.type) || ARROW_TYPES[0];
    const mid = `mka${i}${a.type}`;
    return (
      <g key={a.id || i}>
        <defs>
          <marker id={mid} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0,6 2,0 4" fill={at.color} />
          </marker>
        </defs>
        <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
          stroke={at.color} strokeWidth={at.w}
          strokeDasharray={at.dash || undefined}
          markerEnd={`url(#${mid})`} strokeLinecap="round" />
      </g>
    );
  };

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", width: "100%", height: "100%", cursor: tool === "move" ? "default" : "crosshair" }}
      onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
      onTouchMove={e => { e.preventDefault(); onMM(e); }} onTouchEnd={onMU}
      onClick={onClick}>
      {/* Grass stripes */}
      {Array.from({ length: 11 }).map((_, i) => (
        <rect key={i} x={i * (W / 11)} y={0} width={W / 11} height={H} fill={i % 2 === 0 ? "#2a6118" : "#2f6e1c"} />
      ))}
      {/* Field lines */}
      <rect x={14} y={11} width={W - 28} height={H - 22} fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="1.5" rx="2" />
      <line x1={W / 2} y1={11} x2={W / 2} y2={H - 11} stroke="rgba(255,255,255,.3)" strokeWidth="1.2" />
      <circle cx={W / 2} cy={H / 2} r={46} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" />
      <circle cx={W / 2} cy={H / 2} r={3} fill="rgba(255,255,255,.5)" />
      <rect x={14} y={H / 2 - 54} width={72} height={108} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" />
      <rect x={14} y={H / 2 - 30} width={28} height={60} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2" />
      <rect x={W - 86} y={H / 2 - 54} width={72} height={108} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" />
      <rect x={W - 42} y={H / 2 - 30} width={28} height={60} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2" />
      <rect x={2} y={H / 2 - 22} width={12} height={44} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
      <rect x={W - 14} y={H / 2 - 22} width={12} height={44} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
      {/* Arrows */}
      {arrows?.map((a, i) => renderArrow(a, i))}
      {drawPt && <circle cx={drawPt.x} cy={drawPt.y} r={5} fill="rgba(255,220,0,.8)" stroke="white" strokeWidth="1" />}
      {/* Elements */}
      {tokens?.map(t => renderElem(t))}
    </svg>
  );
}
