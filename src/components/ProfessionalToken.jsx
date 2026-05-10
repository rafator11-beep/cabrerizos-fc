import React, { useState } from 'react';

export default function ProfessionalToken({ token, isSelected, onPointerDown, onDoubleClick }) {
  const { id, x = 0, y = 0, photo_url, name, label, isRival } = token;
  const [imgError, setImgError] = useState(false);
  
  const tokenColor = isRival ? '#ef4444' : (token.color || '#0057ff');
  const hasPhoto = !!photo_url && !imgError;
  
  const r = 18; 
  const size = r * 3.2;

  return (
    <g
      key={id}
      transform={`translate(${x}, ${y})`}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className="cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <defs>
        <filter id={`shadow-${id}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" />
        </filter>
      </defs>

      {hasPhoto ? (
        <foreignObject x={-size/2} y={-size/2} width={size} height={size}>
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: 'transparent'
          }}>
            <img 
              src={photo_url} 
              crossOrigin="anonymous" 
              alt={name || label}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: `
                  ${isSelected ? 'drop-shadow(0 0 8px #00ff87)' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'}
                  contrast(1.2) 
                  saturate(1.2)
                  brightness(1.1)
                `,
                background: 'transparent',
                // Hacer el fondo gris/blanco transparente
                WebkitMaskImage: `
                  radial-gradient(circle, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,1) 60%, 
                    rgba(0,0,0,0.8) 70%, 
                    rgba(0,0,0,0.3) 80%, 
                    rgba(0,0,0,0) 90%
                  )
                `,
                maskImage: `
                  radial-gradient(circle, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,1) 60%, 
                    rgba(0,0,0,0.8) 70%, 
                    rgba(0,0,0,0.3) 80%, 
                    rgba(0,0,0,0) 90%
                  )
                `
              }} 
              draggable={false}
            />
          </div>
        </foreignObject>
      ) : (
        <g filter={`url(#shadow-${id})`}>
          <circle r={r} fill={tokenColor} stroke="white" strokeWidth="2" />
          <text textAnchor="middle" dy="5" fontSize="12" fontWeight="900" fill="white" style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}>
            {label}
          </text>
        </g>
      )}

      {/* Name Badge */}
      {name && (
        <g transform={`translate(0, ${hasPhoto ? r * 1.5 : r + 10})`}>
          <rect 
            x="-30" 
            y="0" 
            width="60" 
            height="14" 
            rx="4" 
            fill="rgba(0,0,0,0.6)" 
            className="pointer-events-none"
          />
          <text 
            textAnchor="middle" 
            dy="10" 
            fontSize="9" 
            fontWeight="800" 
            fill="white" 
            className="pointer-events-none"
            style={{ fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}
          >
            {name.split(' ')[0]}
          </text>
        </g>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <ellipse cx="0" cy={hasPhoto ? r * 1.2 : r} rx={r * 1.5} ry={r * 0.4} fill="rgba(0,255,135,0.2)" stroke="#00ff87" strokeWidth="1" strokeDasharray="3,2" className="pointer-events-none" />
      )}
    </g>
  );
}
