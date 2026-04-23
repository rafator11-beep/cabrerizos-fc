import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, Pencil, Trash2, RotateCcw, Move, ArrowRight, Minus, MoreHorizontal } from 'lucide-react';
import { FieldToken } from '../components';

const TOOLS = [
  { id: 'mover', icon: Move, label: 'Mover' },
  { id: 'pase_corto', icon: Minus, label: 'Pase Corto', color: '#ffeb3b', width: 2 },
  { id: 'centro', icon: Minus, label: 'Centro', color: '#ff9800', width: 4 },
  { id: 'conduccion', icon: MoreHorizontal, label: 'Conducción', color: '#4caf50', width: 2, dashed: true },
  { id: 'presion', icon: ArrowRight, label: 'Presión', color: '#f44336', width: 3 },
  { id: 'libre', icon: Pencil, label: 'Libre', color: '#ffffff', width: 2 }
];

const Pizarra = () => {
  const [mode, setMode] = useState('mover'); // 'mover' or 'dibujar'
  const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
  const [tokens, setTokens] = useState([
    { id: 'h1', pos: { x: 40, y: 30 }, color: 'var(--c-accent)' },
    { id: 'h2', pos: { x: 60, y: 30 }, color: 'var(--c-accent)' },
    { id: 'a1', pos: { x: 50, y: 70 }, color: 'var(--c-accent2)' }
  ]);
  const [draggingId, setDraggingId] = useState(null);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  
  const containerRef = useRef(null);

  const handlePointerDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (mode === 'dibujar') {
      setCurrentLine({
        tool: selectedTool,
        points: [{ x, y }]
      });
      e.target.setPointerCapture(e.pointerId);
    } else {
      // Logic for selecting token to drag is handled in FieldToken's onPointerDown
    }
  };

  const handleTokenPointerDown = (id, e) => {
    if (mode === 'mover') {
      setDraggingId(id);
      e.target.setPointerCapture(e.pointerId);
      e.stopPropagation();
    }
  };

  const handlePointerMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (draggingId) {
      setTokens(prev => prev.map(t => 
        t.id === draggingId ? { ...t, pos: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } } : t
      ));
    } else if (currentLine) {
      setCurrentLine(prev => ({
        ...prev,
        points: [...prev.points, { x, y }]
      }));
    }
  };

  const handlePointerUp = (e) => {
    if (draggingId) {
      setDraggingId(null);
      e.target.releasePointerCapture(e.pointerId);
    } else if (currentLine) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const clearAll = () => {
    setLines([]);
    setTokens([
      { id: 'h1', pos: { x: 40, y: 30 }, color: 'var(--c-accent)' },
      { id: 'h2', pos: { x: 60, y: 30 }, color: 'var(--c-accent)' },
      { id: 'a1', pos: { x: 50, y: 70 }, color: 'var(--c-accent2)' }
    ]);
  };

  const undo = () => setLines(prev => prev.slice(0, -1));

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 bg-surface/50 border-b border-white/5">
        <h2 className="font-display text-xl">PIZARRA TÁCTICA</h2>
        <button 
          onClick={() => setMode(mode === 'mover' ? 'dibujar' : 'mover')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${mode === 'dibujar' ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}
        >
          {mode === 'mover' ? <Move size={14} /> : <Pencil size={14} />}
          {mode === 'mover' ? 'MODO MOVER' : 'MODO DIBUJO'}
        </button>
      </div>

      {/* Field Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 m-4 bg-surface2 rounded-3xl border border-white/5 overflow-hidden shadow-inner cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Field Markings */}
          <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" rx="20" />
          <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle cx="50%" cy="50%" r="10%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          
          {/* Drawn Lines */}
          {lines.map((line, i) => (
            <polyline
              key={i}
              points={line.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
              fill="none"
              stroke={line.tool.color}
              strokeWidth={line.tool.width}
              strokeDasharray={line.tool.dashed ? "5,5" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentLine && (
            <polyline
              points={currentLine.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
              fill="none"
              stroke={currentLine.tool.color}
              strokeWidth={currentLine.tool.width}
              strokeDasharray={currentLine.tool.dashed ? "5,5" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {tokens.map(t => (
          <FieldToken
            key={t.id}
            x={t.pos.x}
            y={t.pos.y}
            dragging={draggingId === t.id}
            onPointerDown={(e) => handleTokenPointerDown(t.id, e)}
          />
        ))}
      </div>

      {/* Bottom Tools */}
      <div className="bg-surface border-t border-white/5 p-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => { setSelectedTool(tool); setMode(tool.id === 'mover' ? 'mover' : 'dibujar'); }}
              className={`flex flex-col items-center gap-2 min-w-[64px] snap-start transition-all ${selectedTool.id === tool.id ? 'scale-110' : 'opacity-40'}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-surface2 border border-white/10 flex items-center justify-center shadow-lg">
                <tool.icon size={20} style={{ color: tool.color || 'white' }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tool.label}</span>
            </button>
          ))}
          
          <button onClick={undo} className="flex flex-col items-center gap-2 min-w-[64px] snap-start opacity-70">
            <div className="w-12 h-12 rounded-2xl bg-surface2 border border-white/10 flex items-center justify-center">
              <RotateCcw size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Deshacer</span>
          </button>

          <button onClick={clearAll} className="flex flex-col items-center gap-2 min-w-[64px] snap-start opacity-70">
            <div className="w-12 h-12 rounded-2xl bg-surface2 border border-white/10 flex items-center justify-center">
              <Trash2 size={20} color="#ff3d3d" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Borrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pizarra;
