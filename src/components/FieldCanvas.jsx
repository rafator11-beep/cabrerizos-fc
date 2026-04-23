import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
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
  tool = 'move', 
  arrowType = 'pass',
  animating = false,
  presentationMode = false,
  viewMode = 'normal', // 'normal' | 'full'
  backgroundImage = null
}, ref) => {
  const { isRealAdmin, viewAsPlayer } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  
  const svgRef = useRef(null);
  const [dragId, setDragId] = useState(null);
  const [drawingArrow, setDrawingArrow] = useState(null);

  useImperativeHandle(ref, () => ({
    getSvg: () => svgRef.current
  }));

  const toSVG = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX || (e.touches && e.touches[0].clientX);
    pt.y = e.clientY || (e.touches && e.touches[0].clientY);
    const transformed = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const handlePointerDown = (e) => {
    if (isPlayerMode && !presentationMode) return;
    const { x, y } = toSVG(e);

    if (tool === 'arrow') {
      setDrawingArrow({ id: Date.now(), type: arrowType, from: { x, y }, to: { x, y } });
    } else if (tool !== 'move') {
      onPlace?.(tool, x, y);
    }
  };

  const handlePointerMove = (e) => {
    if (isPlayerMode && !presentationMode) return;
    const { x, y } = toSVG(e);

    if (dragId) {
      onMove?.(dragId, x, y);
    } else if (drawingArrow) {
      setDrawingArrow({ ...drawingArrow, to: { x, y } });
    }
  };

  const handlePointerUp = () => {
    if (drawingArrow) {
      if (Math.hypot(drawingArrow.to.x - drawingArrow.from.x, drawingArrow.to.y - drawingArrow.from.y) > 10) {
        onArrow?.(drawingArrow);
      }
      setDrawingArrow(null);
    }
    setDragId(null);
  };

  const renderArrow = (a, isGhost = false) => {
    const isCurved = a.type === 'curved';
    const isZigzag = a.type === 'zigzag';
    const isDashed = a.type === 'run' || a.type === 'dashed';
    if (!a?.from || !a?.to) return null;
    const dx = a.to.x - a.from.x;
    const dy = a.to.y - a.from.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 5) return null;

    const angle = Math.atan2(dy, dx);
    const headSize = 8;

    let d = `M ${a.from.x} ${a.from.y} L ${a.to.x} ${a.to.y}`;
    
    if (isCurved) {
      const mx = (a.from.x + a.to.x) / 2 - dy * 0.2;
      const my = (a.from.y + a.to.y) / 2 + dx * 0.2;
      d = `M ${a.from.x} ${a.from.y} Q ${mx} ${my} ${a.to.x} ${a.to.y}`;
    }

    const color = a.type === 'shoot' ? '#ef4444' : a.type === 'run' ? '#fbbf24' : '#4ade80';

    return (
      <g key={a.id} opacity={isGhost ? 0.4 : 1} className="pointer-events-none">
        <path d={d} fill="none" stroke={color} strokeWidth="3" strokeDasharray={isDashed ? "6,4" : "none"} strokeLinecap="round" />
        <path d={`M ${a.to.x} ${a.to.y} L ${a.to.x - headSize * Math.cos(angle - Math.PI/6)} ${a.to.y - headSize * Math.sin(angle - Math.PI/6)} M ${a.to.x} ${a.to.y} L ${a.to.x - headSize * Math.cos(angle + Math.PI/6)} ${a.to.y - headSize * Math.sin(angle + Math.PI/6)}`} 
          stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  };

  const renderToken = (t) => {
    const isDragging = dragId === t.id;
    const ev = {
      onPointerDown: (e) => { e.stopPropagation(); if(tool === 'move') setDragId(t.id); },
      onDoubleClick: (e) => { e.stopPropagation(); onDelete?.(t.id); }
    };

    const posX = t.x || 0;
    const posY = t.y || 0;

    switch(t.kind) {
      case 'ball': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <circle r={8} fill="white" stroke="#333" strokeWidth="1" />
          <path d="M -4 -4 L 4 4 M -4 4 L 4 -4" stroke="#333" strokeWidth="0.5" />
        </g>
      );
      case 'cone': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <path d="M -8 8 L 0 -8 L 8 8 Z" fill="#f59e0b" stroke="white" strokeWidth="1" />
        </g>
      );
      case 'mannequin': return (
        <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
          <rect x={-6} y={-10} width={12} height={20} rx={4} fill="#8b5cf6" stroke="white" strokeWidth="1" />
          <circle cy={-14} r={4} fill="#8b5cf6" stroke="white" strokeWidth="1" />
        </g>
      );
      case 'player': {
        const hasPhoto = !!t.photo_url;
        const isRival = t.isRival;
        const tokenColor = isRival ? '#ef4444' : (t.color || '#0057ff');
        
        return (
          <g key={t.id} transform={`translate(${posX}, ${posY})`} {...ev} className="cursor-grab active:cursor-grabbing">
            <defs>
              <filter id={`f-shadow-${t.id}`}><feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodOpacity="0.3"/></filter>
              <clipPath id={`f-clip-${t.id}`}><circle r={17}/></clipPath>
            </defs>
            <g filter={`url(#f-shadow-${t.id})`}>
              <circle r={20} fill={tokenColor} stroke="white" strokeWidth="2" />
              {hasPhoto ? (
                <image href={t.photo_url} x={-17} y={-17} width={34} height={34} clipPath={`url(#f-clip-${t.id})`} preserveAspectRatio="xMidYMid slice" />
              ) : (
                <text textAnchor="middle" dy="5" fontSize="13" fontWeight="900" fill="white" style={{ pointerEvents: 'none' }}>{t.label}</text>
              )}
              <circle r={20} fill="none" stroke="white" strokeWidth="2" />
            </g>
            {t.name && <text textAnchor="middle" dy={32} fontSize="8" fontWeight="800" fill="white" className="uppercase tracking-widest drop-shadow-md">{t.name.split(' ')[0]}</text>}
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
      className="w-full h-full touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Grass */}
      <rect width={FW} height={FH} fill="#1a3b10" />
      {Array.from({ length: 11 }).map((_, i) => (
        <rect key={i} x={i * (FW/11)} y={0} width={FW/22} height={FH} fill="#1e4412" />
      ))}

      {/* Lines */}
      <g className="field-line" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none">
        <rect x={20} y={20} width={FW-40} height={FH-40} />
        <line x1={FW/2} y1={20} x2={FW/2} y2={FH-20} />
        <circle cx={FW/2} cy={FH/2} r={45} />
        <circle cx={FW/2} cy={FH/2} r={2} fill="white" />
        
        {/* Areas */}
        <rect x={20} y={FH/2 - 80} width={80} height={160} />
        <rect x={FW-100} y={FH/2 - 80} width={80} height={160} />
        <rect x={20} y={FH/2 - 40} width={30} height={80} />
        <rect x={FW-50} y={FH/2 - 40} width={30} height={80} />
      </g>

      {backgroundImage && (
        <image href={backgroundImage} x={0} y={0} width={FW} height={FH} opacity={0.3} preserveAspectRatio="xMidYMid slice" />
      )}

      {/* Content */}
      <g>
        {arrows.map(a => renderArrow(a))}
        {drawingArrow && renderArrow(drawingArrow, true)}
        {tokens.map(t => renderToken(t))}
      </g>
    </svg>
  );
});

FieldCanvas.displayName = 'FieldCanvas';
export default FieldCanvas;
