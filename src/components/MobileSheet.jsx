export default function MobileSheet({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.55)',
          zIndex: 80,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          background: 'white',
          boxShadow: '0 -20px 60px rgba(0,0,0,.35)',
          paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
          maxHeight: '78vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e2e8f0', margin: '0 auto 8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', flex: 1 }}>{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm"
              style={{ minHeight: 32 }}
            >
              Cerrar
            </button>
          </div>
        </div>
        <div style={{ padding: 14, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  );
}

