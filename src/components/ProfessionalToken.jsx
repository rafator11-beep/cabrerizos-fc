import React, { useState } from 'react';

export default function ProfessionalToken({ token, isSelected, onPointerDown, onDoubleClick }) {
  const { id, x = 0, y = 0, photo_url, name, label, isRival } = token;
  const [imgError, setImgError] = useState(false);

  const tokenColor = isRival ? '#ef4444' : (token.color || '#0057ff');
  const hasPhoto = !!photo_url && !imgError;

  const r = 20;
  const clipId = `clip-${id}`;
  const shadowId = `shadow-${id}`;
  const glowId = `glow-${id}`;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className="cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle r={r} />
        </clipPath>
        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00ff87" floodOpacity="0.9" />
        </filter>
      </defs>

      {/* Token body */}
      <g filter={`url(#${isSelected ? glowId : shadowId})`}>
        {hasPhoto ? (
          <>
            {/* Background circle */}
            <circle
              r={r}
              fill="#1a2030"
              stroke={isSelected ? '#00ff87' : 'rgba(255,255,255,0.4)'}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            {/* Native SVG image — much more reliable than foreignObject */}
            <image
              href={photo_url}
              x={-r} y={-r}
              width={r * 2} height={r * 2}
              clipPath={`url(#${clipId})`}
              preserveAspectRatio="xMidYMid slice"
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <>
            <circle r={r} fill={tokenColor} stroke="white" strokeWidth="2" />
            <text
              textAnchor="middle"
              dy="5"
              fontSize="11"
              fontWeight="900"
              fill="white"
              style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}
            >
              {label}
            </text>
          </>
        )}
      </g>

      {/* Name badge */}
      {name && (
        <g transform={`translate(0, ${r + 6})`}>
          <rect x="-28" y="0" width="56" height="13" rx="4" fill="rgba(0,0,0,0.7)" className="pointer-events-none" />
          <text
            textAnchor="middle"
            dy="9"
            fontSize="8"
            fontWeight="800"
            fill="white"
            className="pointer-events-none"
            style={{ fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}
          >
            {name.split(' ')[0]}
          </text>
        </g>
      )}

      {/* Selection ring */}
      {isSelected && (
        <circle
          r={r + 5}
          fill="none"
          stroke="#00ff87"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          className="pointer-events-none"
        />
      )}
    </g>
  );
}
