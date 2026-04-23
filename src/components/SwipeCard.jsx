import React, { useState, useRef } from 'react';

const SwipeCard = ({ children, onSwipeLeft, onSwipeRight, onSwipeUp }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    setDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setPos({ x: dx, y: dy });
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    e.target.releasePointerCapture(e.pointerId);

    const thresholdX = 60;
    const thresholdY = 80;

    if (pos.x > thresholdX) {
      onSwipeRight && onSwipeRight();
    } else if (pos.x < -thresholdX) {
      onSwipeLeft && onSwipeLeft();
    } else if (pos.y < -thresholdY) {
      onSwipeUp && onSwipeUp();
    }

    setPos({ x: 0, y: 0 });
  };

  const rotation = pos.x * 0.1;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : 'transform 0.3s ease',
        touchAction: 'none',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {children}
      {/* Overlay indicators */}
      {pos.x > 20 && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent/20 rounded-2xl pointer-events-none">
          <span className="text-6xl" style={{ opacity: Math.min(pos.x / 100, 1) }}>🔥</span>
        </div>
      )}
      {pos.x < -20 && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-2xl pointer-events-none">
          <span className="text-6xl" style={{ opacity: Math.min(-pos.x / 100, 1) }}>❄️</span>
        </div>
      )}
      {pos.y < -20 && Math.abs(pos.x) < 20 && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 rounded-2xl pointer-events-none">
          <span className="text-6xl" style={{ opacity: Math.min(-pos.y / 100, 1) }}>💪</span>
        </div>
      )}
    </div>
  );
};

export default SwipeCard;
