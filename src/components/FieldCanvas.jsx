import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Field constants
const FW = 550;
const FH = 366;

const FieldCanvas = forwardRef(({ 
  tokens = [], 
  arrows = [], 
  zones = [], 
  onMove, 
  onDelete, 
  onPlace, 
  onArrow, 
  onZoneAdd,
  onZoneDelete,
  tool = 'move', 
  arrowType = 'pass',
  zoneColor = 'red',
  animating = false,
  presentationMode = false,
  selectedTokenId,
  onSelectToken,
}, ref) => {
  const { isRealAdmin, viewAsPlayer } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  
  const svgRef = useRef(null);
  const [dragId, setDragId] = useState(null);
  const [drawingArrow, setDrawingArrow] = useState(null);
  const [drawingZone, setDrawingZone] = useState(null);

  useImperativeHandle(ref, () => ({
    getSvg: () => svgRef.current
  }));

  const toSVG = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    pt.x = e.clientX ?? touch?.clientX ?? 0;
    pt.y = e.clientY ?? touch?.clientY ?? 0;
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const handlePointerDown = (e) => {
    if (isPlayerMode && !presentationMode) return;
    e.preventDefault(); // Prevent scroll on touch
    const { x, y } = toSVG(e);

    if (tool === 'arrow') {
      setDrawingArrow({ id: Date.now(), type: arrowType, from: { x, y }, to: { x, y } });
    } else if (tool === 'zone') {
      setDrawingZone({ id: `zone-${Date.now()}`, x, y, w: 0, h: 0, color: zoneColor });
    } else if (tool !== 'move') {
      onPlace?.(tool, x, y);
    }
  };

  const handlePointerMove = (e) => {
    if (isPlayerMode && !presentationMode) return;
    e.preventDefault();
    const { x, y } = toSVG(e);

    if (dragId) {
      onMove?.(dragId, x, y);
    } else if (drawingArrow) {
      setDrawingArrow({ ...drawingArrow, to: { x, y } });
    } else if (drawingZone) {
      setDrawingZone({ ...drawingZone, w: x - drawingZone.x, h: y - drawingZone.y });
    }
  };

  const handlePointerUp = () => {
    if (drawingArrow) {
      if (Math.hypot(drawingArrow.to.x - drawingArrow.from.x, drawingArrow.to.y - drawingArrow.from.y) > 10) {
        onArrow?.(drawingArrow);
      }
      setDrawingArrow(null);
    }
    if (drawingZone) {
      if (Math.abs(drawingZone.w) > 10 && Math.abs(drawingZone.h) > 10) {
        onZoneAdd?.(drawingZone);
      }
      setDrawingZone(null);
    }
    setDragId(null);
  };

  const renderArrow = (a, isGhost = false) => {
    if (!a?.from || !a?.to) return null;
    const dx = a.to.x - a.from.x;
    const dy = a.to.y - a.from.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 5) return null;

    const angle = Math.atan2(dy, dx);
    const headSize = 8;
    const type = a.type || 'pass';

    // Color based on type — if a.color is set explicitly, use it
    const colorMap = {
      'pass': '#4ade80',
      'run': '#fbbf24',
      'shoot': '#ef4444',
      'curved': '#c084fc',
      'zigzag': '#3b82f6',
    };
    const color = a.color || colorMap[type] || '#4ade80';
    
    const isDashed = type === 'run' || type === 'dashed' || a.lineStyle === 'dashed';
    const isCurved = type === 'curved' || a.lineStyle === 'curved';

    let d = `M ${a.from.x} ${a.from.y} L ${a.to.x} ${a.to.y}`;
    
    if (isCurved) {
      const mx = (a.from.x + a.to.x) / 2 - dy * 0.25;
      const my = (a.from.y + a.to.y) / 2 + dx * 0.25;
      d = `M ${a.from.x} ${a.from.y} Q ${mx} ${my} ${a.to.x} ${a.to.y}`;
    }

    // Zigzag path
    if (type === 'zigzag') {
      const steps = Math.max(3, Math.floor(dist / 20));
      const nx = dx / dist;
      const ny = dy / dist;
      const perpX = -ny;
      const perpY = nx;
      const amplitude = 6;
      let points = `M ${a.from.x} ${a.from.y}`;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const cx = a.from.x + dx * t;
        const cy = a.from.y + dy * t;
        const side = (i % 2 === 0 ? 1 : -1) * (i === steps ? 0 : 1);
        points += ` L ${cx + perpX * amplitude * side} ${cy + perpY * amplitude * side}`;
      }
      d = points;
    }

    const dashArray = isDashed ? "8,5" : a.dash || "none";

    return (
      <g key={a.id} opacity={isGhost ? 0.4 : 0.9} className="pointer-events-none">
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={dashArray} strokeLinecap="round" />
        <path d={`M ${a.to.x} ${a.to.y} L ${a.to.x - headSize * Math.cos(angle - Math.PI/6)} ${a.to.y - headSize * Math.sin(angle - Math.PI/6)} M ${a.to.x} ${a.to.y} L ${a.to.x - headSize * Math.cos(angle + Math.PI/6)} ${a.to.y - headSize * Math.sin(angle + Math.PI/6)}`} 
          stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    );
  };

  const renderZone = (z) => {
    if (!z) return null;
    const x = z.w < 0 ? z.x + z.w : z.x;
    const y = z.h < 0 ? z.y + z.h : z.y;
    const w = Math.abs(z.w);
    const h = Math.abs(z.h);
    const zoneColors = { red: 'rgba(239,68,68,0.15)', blue: 'rgba(59,130,246,0.15)', green: 'rgba(34,197,94,0.15)', yellow: 'rgba(250,204,21,0.15)' };
    const strokeColors = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#facc15' };
    return (
      <rect key={z.id} x={x} y={y} width={w} height={h} rx={6}
        fill={zoneColors[z.color] || zoneColors.red}
        stroke={strokeColors[z.color] || strokeColors.red}
        strokeWidth="1.5" strokeDasharray="4,3" opacity={0.7}
        onDoubleClick={() => onZoneDelete?.(z.id)}
      />
    );
  };

  const renderToken = (t) => {
    const isSelected = selectedTokenId === t.id;
    const ev = {
      onPointerDown: (e) => { 
        e.stopPropagation(); 
        e.preventDefault();
        if (tool === 'move') {
          setDragId(t.id);
          onSelectToken?.(t.id);
        }
      },
      onDoubleClick: (e) => { e.stopPropagation(); onDelete?.(t.id); }
    };

    const posX = t.x || 0;
    const posY = t.y || 0;

    switch(t.kind) {
      case 'ball': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <circle r={10} fill="white" stroke="#555" strokeWidth="1" />
          <path d="M -5 -5 L 5 5 M -5 5 L 5 -5 M 0 -7 L 0 7 M -7 0 L 7 0" stroke="#777" strokeWidth="0.5" opacity={0.4} />
          {isSelected && <circle r={14} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'cone': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <path d="M -8 8 L 0 -10 L 8 8 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
          {isSelected && <circle r={14} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'cone_blue': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <path d="M -8 8 L 0 -10 L 8 8 Z" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1" />
          {isSelected && <circle r={14} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'goal': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <rect x={-14} y={-10} width={28} height={20} rx={2} fill="none" stroke="white" strokeWidth="2" />
          <line x1={-14} y1={-3} x2={14} y2={-3} stroke="white" strokeWidth="0.5" opacity={0.3} />
          <line x1={-14} y1={4} x2={14} y2={4} stroke="white" strokeWidth="0.5" opacity={0.3} />
          <line x1={-5} y1={-10} x2={-5} y2={10} stroke="white" strokeWidth="0.5" opacity={0.3} />
          <line x1={5} y1={-10} x2={5} y2={10} stroke="white" strokeWidth="0.5" opacity={0.3} />
          {isSelected && <rect x={-18} y={-14} width={36} height={28} rx={4} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'mannequin': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <rect x={-5} y={-8} width={10} height={16} rx={3} fill="#8b5cf6" stroke="white" strokeWidth="1" />
          <circle cy={-12} r={4} fill="#8b5cf6" stroke="white" strokeWidth="1" />
          {isSelected && <circle r={18} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'pole': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <line x1={0} y1={-12} x2={0} y2={12} stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          <circle cy={-12} r={3} fill="#ef4444" />
          {isSelected && <circle r={16} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'ladder': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <rect x={-12} y={-6} width={24} height={12} rx={2} fill="none" stroke="#facc15" strokeWidth="1.5" />
          {[-6, 0, 6].map(lx => <line key={lx} x1={lx} y1={-6} x2={lx} y2={6} stroke="#facc15" strokeWidth="1" />)}
          {isSelected && <rect x={-16} y={-10} width={32} height={20} rx={4} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'hurdle': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <line x1={-10} y1={4} x2={-10} y2={-6} stroke="#f97316" strokeWidth="2" />
          <line x1={10} y1={4} x2={10} y2={-6} stroke="#f97316" strokeWidth="2" />
          <line x1={-10} y1={-6} x2={10} y2={-6} stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          {isSelected && <rect x={-14} y={-10} width={28} height={18} rx={4} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="3,2" />}
        </g>
      );
      case 'player': {
        const hasPhoto = !!t.photo_url;
        const isRival = t.isRival;
        const tokenColor = isRival ? '#ef4444' : (t.color || '#0057ff');
        const r = 18;
        
        return (
          <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
            <defs>
              <filter id={`f-shadow-${t.id}`}><feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.3"/></filter>
              <clipPath id={`f-clip-${t.id}`}><circle r={r - 2}/></clipPath>
            </defs>
            <g filter={`url(#f-shadow-${t.id})`}>
              <circle r={r} fill={tokenColor} stroke="white" strokeWidth="2" />
              {hasPhoto ? (
                <image href={t.photo_url} x={-(r-2)} y={-(r-2)} width={(r-2)*2} height={(r-2)*2} clipPath={`url(#f-clip-${t.id})`} preserveAspectRatio="xMidYMid slice" />
              ) : (
                <text textAnchor="middle" dy="5" fontSize="12" fontWeight="900" fill="white" style={{ pointerEvents: 'none' }}>{t.label}</text>
              )}
              <circle r={r} fill="none" stroke="white" strokeWidth="2" />
            </g>
            {t.name && <text textAnchor="middle" dy={r + 12} fontSize="7" fontWeight="800" fill="white" className="uppercase tracking-widest" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{(t.name || '').split(' ')[0]}</text>}
            {isSelected && <circle r={r + 4} fill="none" stroke="#00ff87" strokeWidth="1.5" strokeDasharray="4,3" />}
          </g>
        );
      }
      default: return null;
    }
  };

  return (
    <svg 
      ref={svgRef}
      viewBox={`0 0 ${FW} ${FH}`}
      className="w-full h-full select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Grass stripes */}
      <rect width={FW} height={FH} fill="#1a3b10" />
      {Array.from({ length: 11 }).map((_, i) => (
        <rect key={i} x={i * (FW/11)} y={0} width={FW/22} height={FH} fill="#1e4412" />
      ))}

      {/* Field Lines */}
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none">
        <rect x={20} y={20} width={FW-40} height={FH-40} />
        <line x1={FW/2} y1={20} x2={FW/2} y2={FH-20} />
        <circle cx={FW/2} cy={FH/2} r={45} />
        <circle cx={FW/2} cy={FH/2} r={2} fill="white" />
        
        {/* Penalty areas */}
        <rect x={20} y={FH/2 - 80} width={80} height={160} />
        <rect x={FW-100} y={FH/2 - 80} width={80} height={160} />
        <rect x={20} y={FH/2 - 40} width={30} height={80} />
        <rect x={FW-50} y={FH/2 - 40} width={30} height={80} />

        {/* Goal lines */}
        <rect x={12} y={FH/2 - 18} width={8} height={36} rx={2} />
        <rect x={FW-20} y={FH/2 - 18} width={8} height={36} rx={2} />

        {/* Penalty spots */}
        <circle cx={80} cy={FH/2} r={2} fill="rgba(255,255,255,0.15)" />
        <circle cx={FW-80} cy={FH/2} r={2} fill="rgba(255,255,255,0.15)" />

        {/* Corner arcs */}
        <path d={`M 20 28 A 8 8 0 0 1 28 20`} />
        <path d={`M ${FW-28} 20 A 8 8 0 0 1 ${FW-20} 28`} />
        <path d={`M 28 ${FH-20} A 8 8 0 0 1 20 ${FH-28}`} />
        <path d={`M ${FW-20} ${FH-28} A 8 8 0 0 1 ${FW-28} ${FH-20}`} />
      </g>

      {/* Zones */}
      {zones.map(z => renderZone(z))}
      {drawingZone && renderZone(drawingZone)}

      {/* Arrows */}
      {arrows.map(a => renderArrow(a))}
      {drawingArrow && renderArrow(drawingArrow, true)}

      {/* Tokens */}
      {tokens.map(t => renderToken(t))}
    </svg>
  );
});

FieldCanvas.displayName = 'FieldCanvas';
export default FieldCanvas;
