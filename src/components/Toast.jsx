import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const Toast = () => {
  const { toast } = useAppContext();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let timeout;
    if (toast) {
      setVisible(true);
      setClosing(false);
    } else {
      setClosing(true);
      timeout = setTimeout(() => setVisible(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [toast]);

  if (!visible && !closing) return null;

  const colors = {
    success: '#00ff87',
    warning: '#ffb800',
    danger: '#ff3d3d',
    info: '#3d9eff'
  };

  const bgColor = colors[toast?.tipo] || colors.info;

  return (
    <div
      className={`fixed left-4 right-4 z-[2000] p-4 rounded-xl shadow-2xl flex items-center justify-between transition-all duration-300 transform ${
        closing ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{
        bottom: 'calc(var(--nav-h) + 12px)',
        backgroundColor: bgColor,
        color: '#0a0a0a',
        fontWeight: 'bold'
      }}
    >
      <span className="text-sm">{toast?.msg}</span>
      <div className="w-8 h-1 bg-black/20 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
    </div>
  );
};

export default Toast;
