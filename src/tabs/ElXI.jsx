import React, { useState, useEffect, useRef } from 'react';
import { FieldToken } from '../components';
import { useToast } from '../hooks/useToast';

const FORMATIONS = {
  '4-3-3': [
    { id: 1, pos: { x: 50, y: 85 }, label: 'POR' },
    { id: 2, pos: { x: 20, y: 70 }, label: 'LD' },
    { id: 3, pos: { x: 40, y: 70 }, label: 'DFC' },
    { id: 4, pos: { x: 60, y: 70 }, label: 'DFC' },
    { id: 5, pos: { x: 80, y: 70 }, label: 'LI' },
    { id: 6, pos: { x: 50, y: 50 }, label: 'MC' },
    { id: 7, pos: { x: 30, y: 40 }, label: 'MC' },
    { id: 8, pos: { x: 70, y: 40 }, label: 'MC' },
    { id: 9, pos: { x: 20, y: 20 }, label: 'ED' },
    { id: 10, pos: { x: 50, y: 15 }, label: 'DC' },
    { id: 11, pos: { x: 80, y: 20 }, label: 'EI' }
  ],
  '4-4-2': [
    { id: 1, pos: { x: 50, y: 85 }, label: 'POR' },
    { id: 2, pos: { x: 20, y: 70 }, label: 'LD' },
    { id: 3, pos: { x: 40, y: 70 }, label: 'DFC' },
    { id: 4, pos: { x: 60, y: 70 }, label: 'DFC' },
    { id: 5, pos: { x: 80, y: 70 }, label: 'LI' },
    { id: 6, pos: { x: 20, y: 45 }, label: 'MD' },
    { id: 7, pos: { x: 40, y: 45 }, label: 'MC' },
    { id: 8, pos: { x: 60, y: 45 }, label: 'MC' },
    { id: 9, pos: { x: 80, y: 45 }, label: 'MI' },
    { id: 10, pos: { x: 40, y: 20 }, label: 'DC' },
    { id: 11, pos: { x: 60, y: 20 }, label: 'DC' }
  ]
  // Add more as needed
};

const ElXI = () => {
  const { showToast } = useToast();
  const [formation, setFormation] = useState('4-3-3');
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('cabrerizos_xi');
    return saved ? JSON.parse(saved) : FORMATIONS['4-3-3'];
  });
  const [draggingId, setDraggingId] = useState(null);
  const containerRef = useRef(null);

  const handlePointerDown = (id, e) => {
    setDraggingId(id);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (draggingId === null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPositions(prev => prev.map(p => 
      p.id === draggingId ? { ...p, pos: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } } : p
    ));
  };

  const handlePointerUp = (e) => {
    if (draggingId === null) return;
    setDraggingId(null);
    e.target.releasePointerCapture(e.pointerId);
  };

  const saveXI = () => {
    localStorage.setItem('cabrerizos_xi', JSON.stringify(positions));
    navigator.vibrate && navigator.vibrate(40);
    showToast('XI guardado 🔥', 'success');
  };

  return (
    <div className="flex flex-col gap-4 p-4 min-h-full">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {Object.keys(FORMATIONS).map(f => (
          <button
            key={f}
            onClick={() => { setFormation(f); setPositions(FORMATIONS[f]); }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${formation === f ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[2/3] bg-surface2 rounded-3xl border border-white/5 overflow-hidden shadow-inner"
        style={{ touchAction: 'none' }}
      >
        {/* Field markings */}
        <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/10 rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b border-x border-white/10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-x border-white/10" />
        </div>

        {positions.map(p => (
          <FieldToken
            key={p.id}
            x={p.pos.x}
            y={p.pos.y}
            dragging={draggingId === p.id}
            onPointerDown={(e) => handlePointerDown(p.id, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        ))}
      </div>

      <button
        onClick={saveXI}
        className="mt-auto w-full py-4 bg-accent text-bg font-display text-xl rounded-2xl shadow-[0_0_20px_rgba(0,255,135,0.3)] active:scale-95 transition-transform"
      >
        GUARDAR XI
      </button>
    </div>
  );
};

export default ElXI;
