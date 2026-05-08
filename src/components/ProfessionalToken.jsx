import React from 'react';

export default function ProfessionalToken({ token, isSelected, onPointerDown, onPointerMove, onPointerUp, onDoubleClick }) {
  const { id, x = 0, y = 0, photo_url, name, label, isRival } = token;
  const tokenColor = isRival ? '#ef4444' : (token.color || '#0057ff');
  const r = 18;
  const hasPhoto = !!photo_url;

  return (
    <g 
      key={id} 
      transform={`translate(${x}, ${y})`} 
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
      className="cursor-grab active:cursor-grabbing transition-transform duration-200 md:scale-125" 
      style={{ touchAction: 'none' }}
    >
      <defs>
        <filter id={`f-shadow-${id}`}>
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.4" />
        </filter>
        <clipPath id={`f-clip-${id}`}>
          <path d={`M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`} />
        </clipPath>
      </defs>

      <g filter={`url(#f-shadow-${id})`}>
        {hasPhoto ? (
          <image 
            href={photo_url} 
            x={-r * 1.5} 
            y={-r * 1.5} 
            width={r * 3} 
            height={r * 3} 
            preserveAspectRatio="xMidYMid slice" 
          />
        ) : (
          <g>
            <circle r={r} fill={tokenColor} stroke="white" strokeWidth="2" />
            <text textAnchor="middle" dy="5" fontSize="12" fontWeight="900" fill="white" style={{ pointerEvents: 'none' }}>
              {label}
            </text>
          </g>
        )}
      </g>

      {name && (
        <text 
          textAnchor="middle" 
          dy={hasPhoto ? r * 1.6 : r + 12} 
          fontSize="8" 
          fontWeight="900" 
          fill="white" 
          className="uppercase tracking-widest" 
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
        >
          {name.split(' ')[0]}
        </text>
      )}

      {isSelected && (
        <circle r={hasPhoto ? r * 1.4 : r + 4} fill="none" stroke="#00ff87" strokeWidth="2" strokeDasharray="4,3" />
      )}
    </g>
  );
}
