const FieldToken = ({ jugador, x, y, dragging, onPointerDown }) => {
  const initials = jugador?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase() || '+';
  const hasPhoto = !!jugador?.foto;

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: hasPhoto ? '52px' : '44px',
        height: hasPhoto ? '66px' : '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        touchAction: 'none',
        zIndex: dragging ? 100 : 1,
        transition: dragging ? 'none' : 'all 0.2s ease',
        ...(hasPhoto ? {} : {
          borderRadius: '50%',
          backgroundColor: jugador ? 'var(--c-surface2)' : 'rgba(255,255,255,0.1)',
          border: `2px solid ${dragging ? 'var(--c-accent)' : 'var(--c-border)'}`,
          boxShadow: dragging ? '0 0 15px var(--c-accent)' : 'none',
          overflow: 'hidden',
        }),
      }}
    >
      {hasPhoto ? (
        <img
          src={jugador.foto}
          alt={jugador.nombre}
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            mixBlendMode: 'lighten',
            filter: `drop-shadow(0 10px 15px rgba(0,0,0,0.5))${dragging ? ' drop-shadow(0 0 8px rgba(0,255,135,0.7))' : ''}`,
          }}
        />
      ) : (
        <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: jugador ? 'var(--c-text)' : 'var(--c-muted)' }}>
          {initials}
        </span>
      )}
    </div>
  );
};

export default FieldToken;
