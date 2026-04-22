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

export default function FieldCanvas({ tokens, arrows, onMove, tool, arrowType, onArrow, drawPt, setDrawPt, onPlace, onDelete }) {
  const ref = useRef(null);
  const drag = useRef(null);

  const toSVG = (cx, cy) => {
    const svg = ref.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = cx; pt.y = cy;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  // Start drag — store offset from cursor to token center so the token doesn't jump
  const onTokenMD = (e, t) => {
    if (tool !== "move" || !onMove) return;
    e.preventDefault();
    e.stopPropagation();
    const c = toSVG(e.clientX, e.clientY);
    drag.current = { id: t.id, ox: t.x - c.x, oy: t.y - c.y };
  };

  const onTokenTS = (e, t) => {
    if (tool !== "move" || !onMove) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const c = toSVG(touch.clientX, touch.clientY);
    drag.current = { id: t.id, ox: t.x - c.x, oy: t.y - c.y };
  };

  const onSvgMM = useCallback((e) => {
    if (!drag.current || !onMove) return;
    const pt = e.touches ? e.touches[0] : e;
    const c = toSVG(pt.clientX, pt.clientY);
    onMove(drag.current.id, c.x + drag.current.ox, c.y + drag.current.oy);
  }, [onMove]);

  const onSvgMU = () => { drag.current = null; };

  // Click on field background — place element or draw arrow
  const onBgClick = (e) => {
    const c = toSVG(e.clientX, e.clientY);
    if (tool === "arrow" && onArrow && setDrawPt) {
      if (!drawPt) {
        setDrawPt(c);
      } else {
        onArrow({ id: "a" + Date.now(), type: arrowType, x1: drawPt.x, y1: drawPt.y, x2: c.x, y2: c.y });
        setDrawPt(null);
      }
    } else if (tool !== "move" && onPlace) {
      onPlace(tool, c.x, c.y);
    }
  };

  // Right-click on token → delete
  const onTokenRC = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  // Double-click on token → also delete
  const onTokenDC = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  const renderElem = (t) => {
    const cursor = tool === "move" ? "grab" : "default";
    const ev = {
      onMouseDown: e => onTokenMD(e, t),
      onTouchStart: e => onTokenTS(e, t),
      // In place/arrow modes keep click bubbling; in move mode stop it so no accidental placement
      onClick: e => { if (tool !== 'arrow') e.stopPropagation(); },
      onContextMenu: e => onTokenRC(e, t.id),
      onDoubleClick: e => onTokenDC(e, t.id),
      style: { cursor },
    };

    switch (t.kind) {
      case "ball": return (
        <g key={t.id} {...ev}>
          <circle cx={t.x} cy={t.y} r={13} fill="white" stroke="#bbb" strokeWidth="1.5" />
          <path d={`M${t.x},${t.y-13} C${t.x+8},${t.y-5} ${t.x+12},${t.y+5} ${t.x},${t.y+13} C${t.x-12},${t.y+5} ${t.x-8},${t.y-5} ${t.x},${t.y-13}`} fill="none" stroke="#999" strokeWidth="1" />
          <path d={`M${t.x-13},${t.y} C${t.x-5},${t.y-8} ${t.x+5},${t.y-8} ${t.x+13},${t.y}`} fill="none" stroke="#999" strokeWidth="1" />
          <path d={`M${t.x-13},${t.y} C${t.x-5},${t.y+8} ${t.x+5},${t.y+8} ${t.x+13},${t.y}`} fill="none" stroke="#999" strokeWidth="1" />
        </g>
      );
      case "cone": return (
        <g key={t.id} {...ev}>
          <polygon points={`${t.x},${t.y-13} ${t.x-8},${t.y+6} ${t.x+8},${t.y+6}`} fill="#ff9500" stroke="white" strokeWidth="1" />
          <ellipse cx={t.x} cy={t.y+6} rx={8} ry={3} fill="#cc7700" />
        </g>
      );
      case "cone_blue": return (
        <g key={t.id} {...ev}>
          <polygon points={`${t.x},${t.y-13} ${t.x-8},${t.y+6} ${t.x+8},${t.y+6}`} fill="#0057ff" stroke="white" strokeWidth="1" />
          <ellipse cx={t.x} cy={t.y+6} rx={8} ry={3} fill="#003bb3" />
        </g>
      );
      case "goal": return (
        <g key={t.id} {...ev}>
          <rect x={t.x-22} y={t.y-12} width={44} height={24} fill="rgba(255,255,255,.12)" stroke="white" strokeWidth="2.5" rx="1" />
          <rect x={t.x-22} y={t.y-12} width={44} height={24} fill="transparent" />
        </g>
      );
      case "mannequin": return (
        <g key={t.id} {...ev}>
          <circle cx={t.x} cy={t.y-14} r={6} fill="#ffd580" stroke="white" strokeWidth="1" />
          <rect x={t.x-5} y={t.y-8} width={10} height={14} rx={2} fill="#ffd580" stroke="white" strokeWidth="1" />
          <line x1={t.x-9} y1={t.y-2} x2={t.x+9} y2={t.y-2} stroke="white" strokeWidth="1.5" />
          <line x1={t.x-3} y1={t.y+6} x2={t.x-6} y2={t.y+18} stroke="#ffd580" strokeWidth="2" />
          <line x1={t.x+3} y1={t.y+6} x2={t.x+6} y2={t.y+18} stroke="#ffd580" strokeWidth="2" />
        </g>
      );
      case "pole": return (
        <g key={t.id} {...ev}>
          <line x1={t.x} y1={t.y+16} x2={t.x} y2={t.y-16} stroke="#ffd700" strokeWidth="2.5" />
          <polygon points={`${t.x},${t.y-16} ${t.x+12},${t.y-10} ${t.x},${t.y-4}`} fill="#ff4444" />
        </g>
      );
      case "ladder": return (
        <g key={t.id} {...ev}>
          <rect x={t.x-22} y={t.y-10} width={44} height={20} fill="none" stroke="#ffe066" strokeWidth="2" />
          <line x1={t.x-11} y1={t.y-10} x2={t.x-11} y2={t.y+10} stroke="#ffe066" strokeWidth="2" />
          <line x1={t.x} y1={t.y-10} x2={t.x} y2={t.y+10} stroke="#ffe066" strokeWidth="2" />
          <line x1={t.x+11} y1={t.y-10} x2={t.x+11} y2={t.y+10} stroke="#ffe066" strokeWidth="2" />
        </g>
      );
      case "hurdle": return (
        <g key={t.id} {...ev}>
          <line x1={t.x-12} y1={t.y} x2={t.x+12} y2={t.y} stroke="#ff6b6b" strokeWidth="3" />
          <line x1={t.x-10} y1={t.y} x2={t.x-10} y2={t.y+10} stroke="#444" strokeWidth="2" />
          <line x1={t.x+10} y1={t.y} x2={t.x+10} y2={t.y+10} stroke="#444" strokeWidth="2" />
        </g>
      );
      case "zone": return (
        <g key={t.id} {...ev}>
          <rect x={t.x-25} y={t.y-16} width={50} height={32} fill="rgba(255,255,100,.12)" stroke="rgba(255,255,100,.6)" strokeWidth="1.5" strokeDasharray="4,2" rx="2" />
        </g>
      );
      case "player": return (
        <g key={t.id} {...ev}>
          <circle cx={t.x} cy={t.y} r={16} fill={t.color || '#e74c3c'} stroke="white" strokeWidth="2.5" />
          <text x={t.x} y={t.y} textAnchor="middle" dy="4" fontSize="12" fontWeight="800" fill="white">{t.label}</text>
          {t.name && (
            <text x={t.x} y={t.y + 27} textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(255,255,255,.95)"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>
              {t.name.split(' ')[0]}
            </text>
          )}
        </g>
      );
      default: return null;
    }
  };

  const renderArrow = (a, i) => {
    const at = ARROW_TYPES.find(x => x.id === a.type) || ARROW_TYPES[0];
    const mid = `mka${i}${a.type}`;
    return (
      <g key={a.id || i} style={{ pointerEvents: 'none' }}>
        <defs>
          <marker id={mid} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0,7 2.5,0 5" fill={at.color} />
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
      onMouseMove={onSvgMM} onMouseUp={onSvgMU} onMouseLeave={onSvgMU}
      onTouchMove={e => { e.preventDefault(); onSvgMM(e); }} onTouchEnd={onSvgMU}
      onClick={onBgClick}>

      {/* Grass stripes */}
      {Array.from({ length: 11 }).map((_, i) => (
        <rect key={i} x={i * (W / 11)} y={0} width={W / 11} height={H} fill={i % 2 === 0 ? "#2a6118" : "#2f6e1c"} style={{ pointerEvents: 'none' }} />
      ))}

      {/* Field lines — pointer-events none so they don't block background clicks */}
      <g style={{ pointerEvents: 'none' }}>
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
      </g>

      {/* Arrows */}
      {arrows?.map((a, i) => renderArrow(a, i))}

      {/* Arrow start point indicator */}
      {drawPt && (
        <g style={{ pointerEvents: 'none' }}>
          <circle cx={drawPt.x} cy={drawPt.y} r={7} fill="rgba(255,220,0,.85)" stroke="white" strokeWidth="1.5" />
        </g>
      )}

      {/* Tokens */}
      {tokens?.map(t => renderElem(t))}
    </svg>
  );
}
