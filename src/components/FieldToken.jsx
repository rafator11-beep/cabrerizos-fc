import React from 'react';

const FieldToken = ({ jugador, x, y, dragging, onPointerDown }) => {
  const initials = jugador?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase() || '+';

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: jugador ? 'var(--c-surface2)' : 'rgba(255,255,255,0.1)',
        border: `2px solid ${dragging ? 'var(--c-accent)' : 'var(--c-border)'}`,
        boxShadow: dragging ? '0 0 15px var(--c-accent)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        touchAction: 'none',
        zIndex: dragging ? 100 : 1,
        transition: dragging ? 'none' : 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      {jugador?.foto ? (
        <img src={jugador.foto} alt={jugador.nombre} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
      ) : (
        <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: jugador ? 'var(--c-text)' : 'var(--c-muted)' }}>
          {initials}
        </span>
      )}
    </div>
  );
};

export default FieldToken;
