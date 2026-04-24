import { useRef, useCallback, useState, useMemo, forwardRef, useImperativeHandle } from 'react';

const W = 550;
const H = 366;

const ARROW_CONFIGS = {
  pass: { color: '#4ade80', dash: '', w: 2.5, lineStyle: 'solid' },
  run: { color: '#ffe066', dash: '7,4', w: 2, lineStyle: 'dashed' },
  shoot: { color: '#ff6b6b', dash: '', w: 3, lineStyle: 'solid' },
  curved: { color: '#c084fc', dash: '', w: 2.5, lineStyle: 'curved' },
  free: { color: '#c084fc', dash: '', w: 2.5, lineStyle: 'curved' },
  press: { color: '#f97316', dash: '4,3', w: 2, lineStyle: 'dashed' },
  key: { color: '#fbbf24', dash: '', w: 3, lineStyle: 'solid' },
  _shoot: { color: '#ef4444', dash: '', w: 4, lineStyle: 'shoot' },
};

const VIEW_BOXES = {
  full: `0 0 ${W} ${H}`,
  half: `${Math.round(W * 0.17)} 0 ${Math.round(W * 0.66)} ${H}`,
  left: `0 0 ${Math.round(W * 0.7)} ${H}`,
  right: `${Math.round(W * 0.3)} 0 ${Math.round(W * 0.7)} ${H}`,
  corner_r: `${Math.round(W * 0.3)} ${Math.round(H * 0.01)} ${Math.round(W * 0.7)} ${Math.round(H * 0.98)}`,
  corner_l: `0 ${Math.round(H * 0.01)} ${Math.round(W * 0.7)} ${Math.round(H * 0.98)}`,
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function hashId(value = '') {
  return String(value).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function shortPlayerName(name, crowded) {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  if (!first) return '';
  if (crowded) return first.slice(0, 3).toUpperCase();
  return first.length > 7 ? `${first.slice(0, 6)}.` : first;
}

function bezierCtrl(x1, y1, x2, y2, factor = 0.28) {
  return {
    cx: (x1 + x2) / 2 - (y2 - y1) * factor,
    cy: (y1 + y2) / 2 + (x2 - x1) * factor,
  };
}

function zigzagPath(x1, y1, x2, y2, amplitude = 7, segs = 8) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return `M${x1},${y1}`;
  const px = -dy / len;
  const py = dx / len;
  const pts = [`${x1},${y1}`];
  for (let i = 1; i <= segs; i += 1) {
    const t = (i / segs) * 0.88;
    const side = i % 2 === 0 ? amplitude : -amplitude;
    pts.push(`${x1 + dx * t + px * side},${y1 + dy * t + py * side}`);
  }
  pts.push(`${x2},${y2}`);
  return `M${pts.join(' L')}`;
}

function collectArrowPoints(arrow) {
  if (!arrow) return [];
  if (Number.isFinite(arrow?.x1) && Number.isFinite(arrow?.y1) && Number.isFinite(arrow?.x2) && Number.isFinite(arrow?.y2)) {
    const pts = [[arrow.x1, arrow.y1], [arrow.x2, arrow.y2]];
    if ((arrow.lineStyle || arrow.type) === 'curved') {
      const { cx, cy } = bezierCtrl(arrow.x1, arrow.y1, arrow.x2, arrow.y2);
      pts.push([cx, cy]);
    }
    return pts;
  }
  if (Number.isFinite(arrow?.from?.x) && Number.isFinite(arrow?.from?.y) && Number.isFinite(arrow?.to?.x) && Number.isFinite(arrow?.to?.y)) {
    return [[arrow.from.x, arrow.from.y], [arrow.to.x, arrow.to.y]];
  }
  return [];
}

function computeAdaptiveViewBox(tokens = [], arrows = [], zones = []) {
  const pts = [];

  tokens.forEach((token) => {
    if (Number.isFinite(token?.x) && Number.isFinite(token?.y)) pts.push([token.x, token.y]);
  });
  arrows.forEach((arrow) => {
    collectArrowPoints(arrow).forEach((pt) => pts.push(pt));
  });
  zones.forEach((zone) => {
    if ([zone?.x1, zone?.y1, zone?.x2, zone?.y2].every(Number.isFinite)) {
      pts.push([zone.x1, zone.y1], [zone.x2, zone.y2]);
    }
  });

  if (pts.length < 2) return VIEW_BOXES.full;

  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const clusterWidth = Math.max(24, maxX - minX);
  const clusterHeight = Math.max(24, maxY - minY);
  const ratio = W / H;
  const centerX = (minX + maxX) / 2;
  const lateralBias = centerX < W * 0.28 || centerX > W * 0.72;
  const dense = tokens.length >= 9 || arrows.length >= 4;

  let width = Math.max(clusterWidth + (lateralBias ? 150 : 126), W * (dense || lateralBias ? 0.82 : 0.78));
  let height = Math.max(clusterHeight + 98, H * 0.78);

  if (width / height > ratio) {
    height = width / ratio;
  } else {
    width = height * ratio;
  }

  width = Math.min(W, width);
  height = Math.min(H, height);

  const cx = centerX;
  const cy = (minY + maxY) / 2;
  const x = clamp(cx - width / 2, 0, W - width);
  const y = clamp(cy - height / 2, 0, H - height);
  return `${Math.round(x)} ${Math.round(y)} ${Math.round(width)} ${Math.round(height)}`;
}

const FieldCanvas = forwardRef(function FieldCanvas({
  tokens = [],
  arrows = [],
  zones = [],
  onMove,
  tool = 'move',
  arrowType = 'pass',
  onArrow,
  drawPt,
  setDrawPt,
  onPlace,
  onDelete,
  viewMode = 'full',
  onZoneAdd,
  onZoneDelete,
  animating = false,
  selectedTokenId,
  onSelectToken,
  presentationMode = false,
  zoneColor = 'red',
  myRosterId,
  backgroundImage,
  adaptiveView = false,
}, fwdRef) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [zoneStart, setZoneStart] = useState(null);
  const [zoneCurrent, setZoneCurrent] = useState(null);

  useImperativeHandle(fwdRef, () => ref.current, []);

  const crowdedPlayerIds = useMemo(() => {
    const players = tokens.filter((token) => token?.kind === 'player');
    const crowded = new Set();
    for (let i = 0; i < players.length; i += 1) {
      for (let j = i + 1; j < players.length; j += 1) {
        if (Math.abs(players[i].x - players[j].x) < 28 && Math.abs(players[i].y - players[j].y) < 22) {
          crowded.add(players[i].id);
          crowded.add(players[j].id);
        }
      }
    }
    return crowded;
  }, [tokens]);

  const resolvedViewBox = useMemo(() => {
    if (adaptiveView) return computeAdaptiveViewBox(tokens, arrows, zones);
    return VIEW_BOXES[viewMode] ?? VIEW_BOXES.full;
  }, [adaptiveView, arrows, tokens, viewMode, zones]);

  const toSVG = useCallback((cx, cy) => {
    const svg = ref.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }, []);

  const onTokenMouseDown = (e, token) => {
    e.stopPropagation();
    if (tool !== 'move' || !onMove) return;
    e.preventDefault();
    const c = toSVG(e.clientX, e.clientY);
    drag.current = { id: token.id, ox: token.x - c.x, oy: token.y - c.y };
  };

  const onTokenTouchStart = (e, token) => {
    e.stopPropagation();
    if (tool !== 'move' || !onMove) return;
    const touch = e.touches[0];
    const c = toSVG(touch.clientX, touch.clientY);
    drag.current = { id: token.id, ox: token.x - c.x, oy: token.y - c.y };
  };

  const onSvgMouseDown = (e) => {
    if (tool !== 'zone') return;
    const c = toSVG(e.clientX, e.clientY);
    setZoneStart(c);
    setZoneCurrent(c);
  };

  const onSvgMove = useCallback((e) => {
    const pt = e.touches ? e.touches[0] : e;
    const c = toSVG(pt.clientX, pt.clientY);
    if (drag.current && onMove) {
      onMove(drag.current.id, c.x + drag.current.ox, c.y + drag.current.oy);
    }
    if (tool === 'zone' && zoneStart) setZoneCurrent(c);
  }, [onMove, tool, zoneStart, toSVG]);

  const onSvgUp = useCallback(() => {
    if (tool === 'zone' && zoneStart && zoneCurrent && onZoneAdd) {
      const w = Math.abs(zoneCurrent.x - zoneStart.x);
      const h = Math.abs(zoneCurrent.y - zoneStart.y);
      if (w > 12 && h > 12) {
        const zoneColors = {
          red: { fill: 'rgba(239,68,68,.18)', stroke: 'rgba(239,68,68,.7)' },
          yellow: { fill: 'rgba(251,191,36,.18)', stroke: 'rgba(251,191,36,.8)' },
          blue: { fill: 'rgba(59,130,246,.18)', stroke: 'rgba(59,130,246,.7)' },
          green: { fill: 'rgba(16,185,129,.18)', stroke: 'rgba(16,185,129,.7)' },
        };
        const zoneTheme = zoneColors[zoneColor] || zoneColors.red;
        onZoneAdd({
          id: `z${Date.now()}`,
          x1: Math.min(zoneStart.x, zoneCurrent.x),
          y1: Math.min(zoneStart.y, zoneCurrent.y),
          x2: Math.max(zoneStart.x, zoneCurrent.x),
          y2: Math.max(zoneStart.y, zoneCurrent.y),
          ...zoneTheme,
        });
      }
    }
    drag.current = null;
    setZoneStart(null);
    setZoneCurrent(null);
  }, [onZoneAdd, tool, zoneColor, zoneCurrent, zoneStart]);

  const onSvgLeave = () => {
    drag.current = null;
    setZoneStart(null);
    setZoneCurrent(null);
  };

  const onBackgroundClick = (e) => {
    if (tool === 'zone') return;
    const c = toSVG(e.clientX, e.clientY);
    if (tool === 'arrow' && onArrow && setDrawPt) {
      if (!drawPt) {
        setDrawPt(c);
      } else {
        const cfg = ARROW_CONFIGS[arrowType] || ARROW_CONFIGS.pass;
        onArrow({
          id: `a${Date.now()}`,
          type: arrowType,
          x1: drawPt.x,
          y1: drawPt.y,
          x2: c.x,
          y2: c.y,
          lineStyle: cfg.lineStyle,
        });
        setDrawPt(null);
      }
    } else if (tool !== 'move' && onPlace) {
      onPlace(tool, c.x, c.y);
    }
  };

  const onTokenDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(id);
  };

  const renderToken = (token) => {
    const isSelected = selectedTokenId === token.id;
    const isMyRole = myRosterId && token.assigned_player_id === myRosterId;
    const crowded = crowdedPlayerIds.has(token.id);
    const tokenScale = viewMode === 'full' ? 0.68 : viewMode === 'half' ? 0.62 : 0.56;
    const transitionStyle = animating ? { transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)' } : {};
    const eventProps = {
      transform: `translate(${token.x}, ${token.y}) scale(${tokenScale})`,
      style: { cursor: tool === 'move' ? 'grab' : 'default', ...transitionStyle },
      onMouseDown: (e) => onTokenMouseDown(e, token),
      onTouchStart: (e) => onTokenTouchStart(e, token),
      onClick: (e) => {
        e.stopPropagation();
        onSelectToken?.(isSelected ? null : token.id);
      },
      onContextMenu: (e) => onTokenDelete(e, token.id),
      onDoubleClick: (e) => onTokenDelete(e, token.id),
    };

    const selectionRing = isSelected
      ? <circle cx={0} cy={0} r={18} fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="4,2" />
      : null;

    if (token.kind === 'player') {
      const labelText = shortPlayerName(token.name, crowded);
      const labelWidth = Math.max(16, labelText.length * 5 + 8);
      const placeLabelAbove = hashId(token.id) % 2 === 0;
      const labelY = crowded ? (placeLabelAbove ? -19 : 21) : 20;
      const labelRectY = crowded ? (placeLabelAbove ? -27 : 13) : 12;
      const hasInstruction = !!(token.tactical_note || token.tactical_role);
      const clipId = `player-photo-${String(token.id).replace(/[^a-zA-Z0-9_-]/g, '')}`;

      return (
        <g key={token.id} {...eventProps}>
          <defs>
            <clipPath id={clipId}>
              <rect x={-8.5} y={-12} width={17} height={23} rx={4} />
            </clipPath>
          </defs>
          {(token.tactical_note || token.tactical_role) ? (
            <title>{[token.tactical_role, token.tactical_note].filter(Boolean).join(' - ')}</title>
          ) : null}
          {selectionRing}
          {isMyRole && (
            <circle cx={0} cy={0} r={18} fill="rgba(251,191,36,.22)" stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="4,2">
              <animate attributeName="r" values="18;23;18" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.38;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
          {token.photo_url ? (
            <g>
              <rect x={-10} y={-13.5} width={20} height={27} rx={5} fill={token.color || '#0057ff'} stroke={isMyRole ? '#fbbf24' : 'white'} strokeWidth={isMyRole ? '2' : '1.7'} />
              <image href={token.photo_url} x={-8.5} y={-12} width={17} height={23} clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice" />
              <rect x={-10} y={6.5} width={20} height={7} rx={3.5} fill="rgba(15,23,42,.82)" />
            </g>
          ) : (
            <circle cx={0} cy={0} r={10.2} fill={token.color || '#e74c3c'} stroke={isMyRole ? '#fbbf24' : 'white'} strokeWidth={isMyRole ? '2' : '1.8'} />
          )}
          {hasInstruction && <circle cx={8.5} cy={-8.5} r={3.1} fill="#fbbf24" stroke="#0f172a" strokeWidth="1.2" />}
          <text x={0} y={token.photo_url ? 11.7 : 0} textAnchor="middle" dy={token.photo_url ? "0" : "2.5"} fontSize={token.photo_url ? "5.6" : "8.2"} fontWeight="900" fill="white">
            {token.label}
          </text>
          {labelText && (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={-labelWidth / 2} y={labelRectY} width={labelWidth} height={9.5} rx={4.75} fill="rgba(15,23,42,.82)" stroke="rgba(255,255,255,.12)" strokeWidth="0.5" />
              <text x={0} y={labelY} textAnchor="middle" fontSize="5.8" fontWeight="900" fill="rgba(255,255,255,.97)" letterSpacing="0.12">
                {labelText}
              </text>
            </g>
          )}
        </g>
      );
    }

    const kinds = {
      ball: (
        <>
          {selectionRing}
          <circle cx={0} cy={0} r={11.5} fill="white" stroke="#bbb" strokeWidth="1.4" />
          <path d="M0,-11.5 C7,-4.5 10.5,4.5 0,11.5 C-10.5,4.5 -7,-4.5 0,-11.5" fill="none" stroke="#999" strokeWidth="0.9" />
          <path d="M-11.5,0 C-4.5,-7 4.5,-7 11.5,0" fill="none" stroke="#999" strokeWidth="0.9" />
          <path d="M-11.5,0 C-4.5,7 4.5,7 11.5,0" fill="none" stroke="#999" strokeWidth="0.9" />
        </>
      ),
      cone: (
        <>
          {selectionRing}
          <polygon points="0,-12 -7,5 7,5" fill="#ff9500" stroke="white" strokeWidth="1" />
          <ellipse cx={0} cy={5} rx={7} ry={2.8} fill="#cc7700" />
        </>
      ),
      cone_blue: (
        <>
          {selectionRing}
          <polygon points="0,-12 -7,5 7,5" fill="#0057ff" stroke="white" strokeWidth="1" />
          <ellipse cx={0} cy={5} rx={7} ry={2.8} fill="#003bb3" />
        </>
      ),
      goal: (
        <>
          {selectionRing}
          <rect x={-18} y={-10} width={36} height={20} fill="rgba(255,255,255,.12)" stroke="white" strokeWidth="2.2" rx="1" />
        </>
      ),
      mannequin: (
        <>
          {selectionRing}
          <circle cx={0} cy={-12} r={5} fill="#ffd580" stroke="white" strokeWidth="1" />
          <rect x={-4.5} y={-7} width={9} height={12} rx={2} fill="#ffd580" stroke="white" strokeWidth="1" />
          <line x1={-8} y1={-1} x2={8} y2={-1} stroke="white" strokeWidth="1.4" />
          <line x1={-2.5} y1={5} x2={-5} y2={15} stroke="#ffd580" strokeWidth="1.8" />
          <line x1={2.5} y1={5} x2={5} y2={15} stroke="#ffd580" strokeWidth="1.8" />
        </>
      ),
      pole: (
        <>
          {selectionRing}
          <line x1={0} y1={13} x2={0} y2={-13} stroke="#ffd700" strokeWidth="2.3" />
          <polygon points="0,-13 10,-8 0,-3" fill="#ff4444" />
        </>
      ),
      ladder: (
        <>
          {selectionRing}
          <rect x={-18} y={-8} width={36} height={16} fill="none" stroke="#ffe066" strokeWidth="1.8" />
          <line x1={-9} y1={-8} x2={-9} y2={8} stroke="#ffe066" strokeWidth="1.8" />
          <line x1={0} y1={-8} x2={0} y2={8} stroke="#ffe066" strokeWidth="1.8" />
          <line x1={9} y1={-8} x2={9} y2={8} stroke="#ffe066" strokeWidth="1.8" />
        </>
      ),
      hurdle: (
        <>
          {selectionRing}
          <line x1={-10} y1={0} x2={10} y2={0} stroke="#ff6b6b" strokeWidth="2.8" />
          <line x1={-9} y1={0} x2={-9} y2={8} stroke="#444" strokeWidth="1.8" />
          <line x1={9} y1={0} x2={9} y2={8} stroke="#444" strokeWidth="1.8" />
        </>
      ),
      zone: (
        <>
          {selectionRing}
          <rect x={-21} y={-14} width={42} height={28} fill="rgba(255,255,100,.12)" stroke="rgba(255,255,100,.6)" strokeWidth="1.4" strokeDasharray="4,2" rx="2" />
        </>
      ),
    };

    return <g key={token.id} {...eventProps}>{kinds[token.kind] || null}</g>;
  };

  const renderArrow = (arrow, index) => {
    const cfg = ARROW_CONFIGS[arrow.type] || ARROW_CONFIGS.pass;
    const color = arrow.color || cfg.color;
    const weight = cfg.w;
    const lineStyle = arrow.lineStyle || cfg.lineStyle;
    const dash = lineStyle === 'dashed' ? (cfg.dash || '6,3') : undefined;
    const markerId = `marker-${index}-${arrow.type || 'default'}`;

    const marker = (
      <defs>
        <marker id={markerId} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0,7 2.5,0 5" fill={color} />
        </marker>
      </defs>
    );

    if (lineStyle === 'curved') {
      const { cx, cy } = bezierCtrl(arrow.x1, arrow.y1, arrow.x2, arrow.y2);
      return (
        <g key={arrow.id || index} style={{ pointerEvents: 'none' }}>
          {marker}
          <path d={`M${arrow.x1},${arrow.y1} Q${cx},${cy} ${arrow.x2},${arrow.y2}`} fill="none" stroke={color} strokeWidth={weight} markerEnd={`url(#${markerId})`} strokeLinecap="round" />
        </g>
      );
    }

    if (lineStyle === 'zigzag') {
      return (
        <g key={arrow.id || index} style={{ pointerEvents: 'none' }}>
          {marker}
          <path d={zigzagPath(arrow.x1, arrow.y1, arrow.x2, arrow.y2)} fill="none" stroke={color} strokeWidth={weight} markerEnd={`url(#${markerId})`} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    }

    if (lineStyle === 'shoot') {
      const shootMarkerId = `shoot-${index}`;
      return (
        <g key={arrow.id || index} style={{ pointerEvents: 'none' }}>
          <defs>
            <marker id={shootMarkerId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0,10 3.5,0 7" fill={color} />
            </marker>
          </defs>
          <line x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} stroke={color} strokeWidth={weight + 3} strokeOpacity="0.18" strokeLinecap="round" />
          <line x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} stroke={color} strokeWidth={weight} markerEnd={`url(#${shootMarkerId})`} strokeLinecap="round" />
        </g>
      );
    }

    return (
      <g key={arrow.id || index} style={{ pointerEvents: 'none' }}>
        {marker}
        <line x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} stroke={color} strokeWidth={weight} strokeDasharray={dash} markerEnd={`url(#${markerId})`} strokeLinecap="round" />
      </g>
    );
  };

  return (
    <svg
      ref={ref}
      viewBox={resolvedViewBox}
      style={{ display: 'block', width: '100%', height: '100%', cursor: tool === 'move' ? 'default' : 'crosshair' }}
      onMouseDown={onSvgMouseDown}
      onMouseMove={onSvgMove}
      onMouseUp={onSvgUp}
      onMouseLeave={onSvgLeave}
      onTouchMove={(e) => {
        e.preventDefault();
        onSvgMove(e);
      }}
      onTouchEnd={onSvgUp}
      onClick={onBackgroundClick}
    >
      {backgroundImage ? (
        <image href={backgroundImage} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice" style={{ pointerEvents: 'none' }} />
      ) : (
        <>
          {Array.from({ length: 11 }).map((_, i) => (
            <rect key={i} x={i * (W / 11)} y={0} width={W / 11} height={H} fill={i % 2 === 0 ? '#2a6118' : '#2f6e1c'} style={{ pointerEvents: 'none' }} />
          ))}
        </>
      )}

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

      {zones.map((zone) => (
        <g key={zone.id} onDoubleClick={(e) => { e.stopPropagation(); onZoneDelete?.(zone.id); }}>
          <rect x={zone.x1} y={zone.y1} width={zone.x2 - zone.x1} height={zone.y2 - zone.y1} fill={zone.fill} stroke={zone.stroke} strokeWidth="2" rx="4" />
        </g>
      ))}

      {zoneStart && zoneCurrent && (
        <rect
          x={Math.min(zoneStart.x, zoneCurrent.x)}
          y={Math.min(zoneStart.y, zoneCurrent.y)}
          width={Math.abs(zoneCurrent.x - zoneStart.x)}
          height={Math.abs(zoneCurrent.y - zoneStart.y)}
          fill="rgba(59,130,246,.15)"
          stroke="rgba(59,130,246,.7)"
          strokeWidth="2"
          strokeDasharray="6,4"
          rx="4"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {arrows.map(renderArrow)}

      {drawPt && tool === 'arrow' && (
        <circle cx={drawPt.x} cy={drawPt.y} r="4" fill="#fbbf24" stroke="white" strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      )}

      {tokens.map(renderToken)}
    </svg>
  );
});

export default FieldCanvas;
