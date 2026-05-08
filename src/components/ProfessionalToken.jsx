import React from 'react';

export default function ProfessionalToken({ token, isSelected, onPointerDown, onPointerMove, onPointerUp, onDoubleClick, zoomScale = 1 }) {
  const { id, x = 0, y = 0, photo_url, name, label, isRival } = token;
  const tokenColor = isRival ? '#ef4444' : (token.color || '#0057ff');
  const hasPhoto = !!photo_url;
  
  // Base scale is 1, but when zoomed in, we might want tokens to scale down slightly relative to the field 
  // to maintain visual crispness, but the user requested them to scale automatically.
  // The base size
  const r = 18; 
  const size = r * 3; 

  return (
    <g 
      key={id} 
      transform={`translate(${x}, ${y})`} 
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
      className="cursor-grab active:cursor-grabbing transition-transform duration-200" 
      style={{ touchAction: 'none' }}
    >
      <defs>
        <filter id={`drop-shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5" floodColor="#000000" />
        </filter>
        <filter id={`drop-shadow-selected-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodOpacity="0.8" floodColor="#00ff87" />
        </filter>
      </defs>

      {/* We use foreignObject so CSS mix-blend-mode and drop-shadow work perfectly without SVG bugs */}
      {hasPhoto ? (
        <foreignObject x={-size/2 - 5} y={-size/2 - 5} width={size + 10} height={size + 10} className="overflow-visible">
          <img 
            src={photo_url} 
            crossOrigin="anonymous" 
            alt={name || label}
            className="w-full h-full object-contain"
            style={{ 
              mixBlendMode: 'screen',
              filter: isSelected 
                ? 'drop-shadow(0px 0px 8px rgba(0,255,135,0.8))'
                : 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))'
            }} 
            draggable={false}
          />
        </foreignObject>
      ) : (
        <g filter={isSelected ? `url(#drop-shadow-selected-${id})` : `url(#drop-shadow-${id})`}>
          <circle r={r} fill={tokenColor} stroke="white" strokeWidth="2" />
          <text textAnchor="middle" dy="5" fontSize="12" fontWeight="900" fill="white" style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}>
            {label}
          </text>
        </g>
      )}

      {/* Clean, professional name badge */}
      {name && (
        <g transform={`translate(0, ${hasPhoto ? size / 2 + 2 : r + 10})`}>
          <rect 
            x="-25" 
            y="0" 
            width="50" 
            height="12" 
            rx="4" 
            fill="rgba(0,0,0,0.4)" 
            className="pointer-events-none"
          />
          <text 
            textAnchor="middle" 
            dy="9" 
            fontSize="8" 
            fontWeight="700" 
            fill="white" 
            className="pointer-events-none"
            style={{ fontFamily: 'Montserrat, Roboto, sans-serif', letterSpacing: '0.05em' }}
          >
            {name.split(' ')[0]}
          </text>
        </g>
      )}

      {/* Optional selection ring if it doesn't have a photo, or rely purely on the neon drop-shadow defined above */}
      {isSelected && !hasPhoto && (
        <circle r={r + 4} fill="none" stroke="#00ff87" strokeWidth="2" strokeDasharray="4,3" className="pointer-events-none" />
      )}
    </g>
  );
}
