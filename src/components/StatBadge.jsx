import React from 'react';

const StatBadge = ({ label, value, tipo }) => {
  const colors = {
    success: 'var(--c-accent)',
    warning: '#ffb800',
    danger: 'var(--c-accent2)',
    info: '#3d9eff'
  };

  const color = colors[tipo] || 'var(--c-muted)';

  return (
    <div className="flex flex-col items-center px-3 py-1 bg-white/5 rounded-full border border-white/10 min-w-[60px]">
      <span className="text-[10px] text-muted uppercase font-bold leading-tight">{label}</span>
      <span className="text-lg font-display leading-none" style={{ color, fontFamily: 'var(--font-display)' }}>{value}</span>
    </div>
  );
};

export default StatBadge;
