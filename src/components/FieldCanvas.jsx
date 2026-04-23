import { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';

const W = 550;
const H = 366;

// Arrow visual config — id must match ARROW_TYPES ids in Tactica.jsx
const ARROW_CONFIGS = {
  pass:    { color: "#4ade80", dash: "",    w: 2.5, lineStyle: "solid"  },
  run:     { color: "#ffe066", dash: "7,4", w: 2,   lineStyle: "dashed" },
  shoot:   { color: "#ff6b6b", dash: "",    w: 3,   lineStyle: "solid"  },
  curved:  { color: "#c084fc", dash: "",    w: 2.5, lineStyle: "curved" },
  free:    { color: "#c084fc", dash: "",    w: 2.5, lineStyle: "curved" }, // backward compat
  press:   { color: "#f97316", dash: "4,3", w: 2,   lineStyle: "dashed" },
  key:     { color: "#fbbf24", dash: "",    w: 3,   lineStyle: "solid"  },
  // inline shoot style (used when lineStyle === 'shoot' from Tactica VECTOR_STYLES)
  _shoot:  { color: "#ef4444", dash: "",    w: 4,   lineStyle: "shoot"  },
};

const VIEW_BOXES = {
  full:  `0 0 ${W} ${H}`,
  left:  `0 0 ${Math.round(W * 0.56)} ${H}`,
  right: `${Math.round(W * 0.44)} 0 ${Math.round(W * 0.56)} ${H}`,
  corner_r: `${Math.round(W * 0.55)} ${Math.round(H * 0.1)} ${Math.round(W * 0.45)} ${Math.round(H * 0.8)}`,
  corner_l: `0 ${Math.round(H * 0.1)} ${Math.round(W * 0.45)} ${Math.round(H * 0.8)}`,
};

// Sawtooth path between two points — used for "Conducción" arrows
function zigzagPath(x1, y1, x2, y2, amplitude = 7, segs = 8) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return `M${x1},${y1}`;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux; // perpendicular unit
  const endFrac = 0.88;    // stop zigzag before endpoint so arrowhead is clean
  const pts = [`${x1},${y1}`];
  for (let i = 1; i <= segs; i++) {
    const t = (i / segs) * endFrac;
    const side = i % 2 === 0 ? amplitude : -amplitude;
    pts.push(`${x1 + dx * t + px * side},${y1 + dy * t + py * side}`);
  }
  pts.push(`${x2},${y2}`);
  return `M${pts.join(' L')}`;
}

// Quadratic Bézier control point (perpendicular offset from midpoint)
function bezierCtrl(x1, y1, x2, y2, factor = 0.28) {
  return {
    cx: (x1 + x2) / 2 - (y2 - y1) * factor,
    cy: (y1 + y2) / 2 + (x2 - x1) * factor,
  };
}

const FieldCanvas = forwardRef(function FieldCanvas({
  tokens, arrows, zones = [],
  onMove, tool, arrowType, onArrow, drawPt, setDrawPt, onPlace, onDelete,
  viewMode = 'full',
  onZoneAdd, onZoneDelete,
  animating = false,
  selectedTokenId, onSelectToken,
  onUpdateToken,
  presentationMode = false,
  zoneColor = 'red',
  myRosterId,
  backgroundImage,
}, fwdRef) {
  const ref = useRef(null);

  // Expose the raw SVG DOM element so parents can serialise it for video export
  useImperativeHandle(fwdRef, () => ref.current, []);
  const drag = useRef(null);
  const [zoneStart, setZoneStart] = useState(null);
  const [zoneCurrent, setZoneCurrent] = useState(null);

  const toSVG = useCallback((cx, cy) => {
    const svg = ref.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = cx; pt.y = cy;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }, []);

  // ── Token pointer events ─────────────────────────────────────────────
  const onTokenMD = (e, t) => {
    e.stopPropagation(); // always stop — prevents zone start under tokens
    if (tool !== 'move' || !onMove) return;
    e.preventDefault();
    const c = toSVG(e.clientX, e.clientY);
    drag.current = { id: t.id, ox: t.x - c.x, oy: t.y - c.y };
  };

  const onTokenTS = (e, t) => {
    e.stopPropagation();
    if (tool !== 'move' || !onMove) return;
    const touch = e.touches[0];
    const c = toSVG(touch.clientX, touch.clientY);
    drag.current = { id: t.id, ox: t.x - c.x, oy: t.y - c.y };
  };

  // ── SVG-level pointer events ─────────────────────────────────────────
  const onSvgMD = (e) => {
    if (tool !== 'zone') return;
    const c = toSVG(e.clientX, e.clientY);
    setZoneStart(c);
    setZoneCurrent(c);
  };

  const onSvgMM = useCallback((e) => {
    const pt = e.touches ? e.touches[0] : e;
    const c = toSVG(pt.clientX, pt.clientY);
    if (drag.current && onMove) {
      onMove(drag.current.id, c.x + drag.current.ox, c.y + drag.current.oy);
    }
    if (tool === 'zone' && zoneStart) {
      setZoneCurrent(c);
    }
  }, [onMove, tool, zoneStart, toSVG]);

  const onSvgMU = useCallback(() => {
    if (tool === 'zone' && zoneStart && zoneCurrent && onZoneAdd) {
      const w = Math.abs(zoneCurrent.x - zoneStart.x);
      const h = Math.abs(zoneCurrent.y - zoneStart.y);
      if (w > 12 && h > 12) {
        const ZONE_COLORS = {
          red:    { fill: 'rgba(239,68,68,.18)',   stroke: 'rgba(239,68,68,.7)' },
          yellow: { fill: 'rgba(251,191,36,.18)',  stroke: 'rgba(251,191,36,.8)' },
          blue:   { fill: 'rgba(59,130,246,.18)',  stroke: 'rgba(59,130,246,.7)' },
          green:  { fill: 'rgba(16,185,129,.18)',  stroke: 'rgba(16,185,129,.7)' },
        };
        const zc = ZONE_COLORS[zoneColor] || ZONE_COLORS.red;
        onZoneAdd({
          id: 'z' + Date.now(),
          x1: Math.min(zoneStart.x, zoneCurrent.x),
          y1: Math.min(zoneStart.y, zoneCurrent.y),
          x2: Math.max(zoneStart.x, zoneCurrent.x),
          y2: Math.max(zoneStart.y, zoneCurrent.y),
          ...zc,
        });
      }
      setZoneStart(null);
      setZoneCurrent(null);
    }
    drag.current = null;
  }, [tool, zoneStart, zoneCurrent, onZoneAdd, zoneColor]);

  const onSvgLeave = () => {
    drag.current = null;
    setZoneStart(null);
    setZoneCurrent(null);
  };

  const onBgClick = (e) => {
    if (tool === 'zone') return;
    const c = toSVG(e.clientX, e.clientY);
    if (tool === 'arrow' && onArrow && setDrawPt) {
      if (!drawPt) {
        setDrawPt(c);
      } else {
        const cfg = ARROW_CONFIGS[arrowType] || ARROW_CONFIGS.pass;
        onArrow({
          id: 'a' + Date.now(),
          type: arrowType,
          x1: drawPt.x, y1: drawPt.y,
          x2: c.x, y2: c.y,
          lineStyle: cfg.lineStyle,
        });
        setDrawPt(null);
      }
    } else if (tool !== 'move' && onPlace) {
      onPlace(tool, c.x, c.y);
    }
  };

  const onTokenRC = (e, id) => { e.preventDefault(); e.stopPropagation(); onDelete?.(id); };
  const onTokenDC = (e, id) => { e.preventDefault(); e.stopPropagation(); onDelete?.(id); };

  // ── Token renderer (shapes at 0,0 inside translated group) ──────────
  const renderElem = (t) => {
    const isSelected = selectedTokenId === t.id;
    const isBall = t.kind === 'ball';
    const transStyle = animating
      ? { transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)' }
      : {};

    const tokenScale = viewMode === 'full' ? 1 : 0.65;

    const ev = {
      transform: `translate(${t.x}, ${t.y}) scale(${tokenScale})`,
      style: { cursor: tool === 'move' ? 'grab' : 'default', ...transStyle },
      onMouseDown: e => onTokenMD(e, t),
      onTouchStart: e => onTokenTS(e, t),
      onClick: e => {
  e.stopPropagation();
  if (presentationMode) return;
  if (onSelectToken) onSelectToken(isSelected ? null : t.id);
},
      onContextMenu: e => onTokenRC(e, t.id),
      onDoubleClick: e => onTokenDC(e, t.id),
    };

    const selRing = isSelected
      ? <circle cx={0} cy={0} r={21} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,2" />
      : null;

    switch (t.kind) {
      case 'ball': return (
        <g key={t.id} {...ev}>
          {selRing}
          <circle cx={0} cy={0} r={13} fill="white" stroke="#bbb" strokeWidth="1.5" />
          <path d="M0,-13 C8,-5 12,5 0,13 C-12,5 -8,-5 0,-13" fill="none" stroke="#999" strokeWidth="1" />
          <path d="M-13,0 C-5,-8 5,-8 13,0" fill="none" stroke="#999" strokeWidth="1" />
          <path d="M-13,0 C-5,8 5,8 13,0" fill="none" stroke="#999" strokeWidth="1" />
          {/* Directional effect arrows */}
          {t.ballEffect === 'top'     && <polygon points="0,-20 -5,-14 5,-14" fill="#fbbf24" />}
          {t.ballEffect === 'bottom'  && <polygon points="0,20 -5,14 5,14" fill="#fbbf24" />}
          {t.ballEffect === 'left'    && <polygon points="-20,0 -14,-5 -14,5" fill="#fbbf24" />}
          {t.ballEffect === 'right'   && <polygon points="20,0 14,-5 14,5" fill="#fbbf24" />}
          {t.ballEffect === 'curve-l' && <path d="M8,-13 Q20,0 8,13" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />}
          {t.ballEffect === 'curve-r' && <path d="M-8,-13 Q-20,0 -8,13" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />}
        </g>
      );
      case 'cone': return (
        <g key={t.id} {...ev}>
          <polygon points="0,-13 -8,6 8,6" fill="#ff9500" stroke="white" strokeWidth="1" />
          <ellipse cx={0} cy={6} rx={8} ry={3} fill="#cc7700" />
        </g>
      );
      case 'cone_blue': return (
        <g key={t.id} {...ev}>
          <polygon points="0,-13 -8,6 8,6" fill="#0057ff" stroke="white" strokeWidth="1" />
          <ellipse cx={0} cy={6} rx={8} ry={3} fill="#003bb3" />
        </g>
      );
      case 'goal': return (
        <g key={t.id} {...ev}>
          <rect x={-22} y={-12} width={44} height={24} fill="rgba(255,255,255,.12)" stroke="white" strokeWidth="2.5" rx="1" />
        </g>
      );
      case 'mannequin': return (
        <g key={t.id} {...ev}>
          <circle cx={0} cy={-14} r={6} fill="#ffd580" stroke="white" strokeWidth="1" />
          <rect x={-5} y={-8} width={10} height={14} rx={2} fill="#ffd580" stroke="white" strokeWidth="1" />
          <line x1={-9} y1={-2} x2={9} y2={-2} stroke="white" strokeWidth="1.5" />
          <line x1={-3} y1={6} x2={-6} y2={18} stroke="#ffd580" strokeWidth="2" />
          <line x1={3} y1={6} x2={6} y2={18} stroke="#ffd580" strokeWidth="2" />
        </g>
      );
      case 'pole': return (
        <g key={t.id} {...ev}>
          <line x1={0} y1={16} x2={0} y2={-16} stroke="#ffd700" strokeWidth="2.5" />
          <polygon points="0,-16 12,-10 0,-4" fill="#ff4444" />
        </g>
      );
      case 'ladder': return (
        <g key={t.id} {...ev}>
          <rect x={-22} y={-10} width={44} height={20} fill="none" stroke="#ffe066" strokeWidth="2" />
          <line x1={-11} y1={-10} x2={-11} y2={10} stroke="#ffe066" strokeWidth="2" />
          <line x1={0} y1={-10} x2={0} y2={10} stroke="#ffe066" strokeWidth="2" />
          <line x1={11} y1={-10} x2={11} y2={10} stroke="#ffe066" strokeWidth="2" />
        </g>
      );
      case 'hurdle': return (
        <g key={t.id} {...ev}>
          <line x1={-12} y1={0} x2={12} y2={0} stroke="#ff6b6b" strokeWidth="3" />
          <line x1={-10} y1={0} x2={-10} y2={10} stroke="#444" strokeWidth="2" />
          <line x1={10} y1={0} x2={10} y2={10} stroke="#444" strokeWidth="2" />
        </g>
      );
      case 'zone': return (
        <g key={t.id} {...ev}>
          <rect x={-25} y={-16} width={50} height={32} fill="rgba(255,255,100,.12)" stroke="rgba(255,255,100,.6)" strokeWidth="1.5" strokeDasharray="4,2" rx="2" />
        </g>
      );
      case 'player': 
        const isMyRole = myRosterId && t.assigned_player_id === myRosterId;
        return (
        <g key={t.id} {...ev}>
          {isMyRole && <circle cx={0} cy={0} r={22} fill="rgba(251,191,36,.4)" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,2">
            <animate attributeName="r" values="22;28;22" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
          </circle>}
          <circle cx={0} cy={0} r={16} fill={t.color || '#e74c3c'} stroke={isMyRole ? '#fbbf24' : 'white'} strokeWidth={isMyRole ? '3' : '2.5'} />
          <text x={0} y={0} textAnchor="middle" dy="4" fontSize="12" fontWeight="800" fill="white">{t.label}</text>
          {t.name && (
            <text x={0} y={27} textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(255,255,255,.95)">
              {t.name.split(' ')[0]}
            </text>
          )}
        </g>
      );
      default: return null;
    }
  };

  // ── Arrow renderer ───────────────────────────────────────────────────
  const renderArrow = (a, i) => {
    const cfg = ARROW_CONFIGS[a.type] || ARROW_CONFIGS.pass;
    const color = a.color || cfg.color;
    const w = cfg.w;
    const lineStyle = a.lineStyle || cfg.lineStyle;
    const dash = lineStyle === 'dashed' ? (cfg.dash || '6,3') : undefined;
    const mid = `mka${i}${a.type || ''}`;

    const marker = (
      <defs>
        <marker id={mid} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0,7 2.5,0 5" fill={color} />
        </marker>
      </defs>
    );

    if (lineStyle === 'curved') {
      const { cx, cy } = bezierCtrl(a.x1, a.y1, a.x2, a.y2);
      return (
        <g key={a.id || i} style={{ pointerEvents: 'none' }}>
          {marker}
          <path d={`M${a.x1},${a.y1} Q${cx},${cy} ${a.x2},${a.y2}`}
            fill="none" stroke={color} strokeWidth={w}
            markerEnd={`url(#${mid})`} strokeLinecap="round" />
        </g>
      );
    }

    if (lineStyle === 'zigzag') {
      return (
        <g key={a.id || i} style={{ pointerEvents: 'none' }}>
          {marker}
          <path d={zigzagPath(a.x1, a.y1, a.x2, a.y2)}
            fill="none" stroke={color} strokeWidth={w}
            markerEnd={`url(#${mid})`} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    }

    if (lineStyle === 'shoot') {
      // Bold solid line + oversized arrowhead for shots on goal
      const shootMid = `mks${i}`;
      return (
        <g key={a.id || i} style={{ pointerEvents: 'none' }}>
          <defs>
            <marker id={shootMid} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0,10 3.5,0 7" fill={color} />
            </marker>
          </defs>
          {/* Shadow line for emphasis */}
          <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke={color} strokeWidth={w + 3} strokeOpacity="0.18" strokeLinecap="round" />
          <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke={color} strokeWidth={w}
            markerEnd={`url(#${shootMid})`} strokeLinecap="round" />
        </g>
      );
    }

    return (
      <g key={a.id || i} style={{ pointerEvents: 'none' }}>
        {marker}
        <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
          stroke={color} strokeWidth={w}
          strokeDasharray={dash}
          markerEnd={`url(#${mid})`} strokeLinecap="round" />
      </g>
    );
  };

  // ── SVG ──────────────────────────────────────────────────────────────
  return (
    <svg
      ref={ref}
      viewBox={VIEW_BOXES[viewMode] ?? VIEW_BOXES.full}
      style={{ display: 'block', width: '100%', height: '100%', cursor: tool === 'move' ? 'default' : 'crosshair' }}
      onMouseDown={onSvgMD}
      onMouseMove={onSvgMM} onMouseUp={onSvgMU} onMouseLeave={onSvgLeave}
      onTouchMove={e => { e.preventDefault(); onSvgMM(e); }} onTouchEnd={onSvgMU}
      onClick={onBgClick}
    >
      {backgroundImage ? (
        <image href={backgroundImage} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice" style={{ pointerEvents: 'none' }} />
      ) : (
        <>
          {/* Grass stripes */}
          {Array.from({ length: 11 }).map((_, i) => (
            <rect key={i} x={i * (W / 11)} y={0} width={W / 11} height={H}
              fill={i % 2 === 0 ? '#2a6118' : '#2f6e1c'}
              style={{ pointerEvents: 'none' }} />
          ))}
        </>
      )}

      {/* Field lines */}
      {!backgroundImage && (
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
      )}

      {/* Persistent shadow zones */}
      {zones.map(z => (
        <rect key={z.id}
          x={z.x1} y={z.y1} width={z.x2 - z.x1} height={z.y2 - z.y1}
          fill={z.fill || 'rgba(239,68,68,.18)'}
          stroke={z.stroke || 'rgba(239,68,68,.7)'}
          strokeWidth="1.5" strokeDasharray="5,3" rx="2"
          style={{ pointerEvents: onZoneDelete ? 'auto' : 'none', cursor: 'pointer' }}
          onContextMenu={e => { e.preventDefault(); onZoneDelete?.(z.id); }}
          onDoubleClick={e => { e.preventDefault(); onZoneDelete?.(z.id); }}
        />
      ))}

      {/* Zone being drawn (live preview) */}
      {zoneStart && zoneCurrent && (
        <rect
          x={Math.min(zoneStart.x, zoneCurrent.x)}
          y={Math.min(zoneStart.y, zoneCurrent.y)}
          width={Math.abs(zoneCurrent.x - zoneStart.x)}
          height={Math.abs(zoneCurrent.y - zoneStart.y)}
          fill="rgba(255,100,100,.12)" stroke="rgba(255,100,100,.7)"
          strokeWidth="1.5" strokeDasharray="5,3" rx="2"
          style={{ pointerEvents: 'none' }} />
      )}

      {/* Arrows */}
      {arrows?.map((a, i) => renderArrow(a, i))}

      {/* Arrow first-click indicator */}
      {drawPt && (
        <g style={{ pointerEvents: 'none' }}>
          <circle cx={drawPt.x} cy={drawPt.y} r={7} fill="rgba(255,220,0,.85)" stroke="white" strokeWidth="1.5" />
        </g>
      )}

      {/* Tokens */}
      {tokens?.map(t => renderElem(t))}
    </svg>
  );
});

export default FieldCanvas;
