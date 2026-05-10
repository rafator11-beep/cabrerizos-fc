import React from 'react';

const TYPE_STYLES = {
  success: { color: '#00ff87', bg: 'rgba(0,255,135,0.08)',   border: 'rgba(0,255,135,0.15)'   },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)'  },
  danger:  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.15)'   },
  info:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)'  },
  neutral: { color: '#8a99ae', bg: 'rgba(138,153,174,0.06)',border: 'rgba(138,153,174,0.12)' },
};

// size: 'sm' | 'md' | 'lg'
const StatBadge = ({ label, value, tipo = 'neutral', size = 'md', icon }) => {
  const s = TYPE_STYLES[tipo] || TYPE_STYLES.neutral;
  const valueSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-3xl';
  const padding   = size === 'lg' ? 'p-5' : size === 'sm' ? 'p-3' : 'p-4';

  return (
    <div
      className={`flex flex-col items-center justify-center ${padding} rounded-2xl flex-1 border`}
      style={{ background: s.bg, borderColor: s.border }}
    >
      {icon && <div className="mb-1 opacity-60" style={{ color: s.color }}>{icon}</div>}
      <span className={`${valueSize} font-black leading-none`} style={{ color: s.color }}>
        {value}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-muted mt-2 text-center leading-tight">
        {label}
      </span>
    </div>
  );
};

export default StatBadge;
