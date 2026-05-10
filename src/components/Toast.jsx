import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const CFG = {
  success: { Icon: CheckCircle, color: 'text-emerald-400', bar: 'bg-emerald-500' },
  warning: { Icon: AlertTriangle, color: 'text-amber-400', bar: 'bg-amber-500' },
  danger:  { Icon: XCircle,      color: 'text-rose-400',   bar: 'bg-rose-500'   },
  info:    { Icon: Info,         color: 'text-blue-400',   bar: 'bg-blue-500'   },
};

const Toast = () => {
  const { toast } = useAppContext();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let timeout;
    if (toast) {
      setVisible(true);
      setClosing(false);
      setDismissed(false);
    } else {
      setClosing(true);
      timeout = setTimeout(() => setVisible(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [toast]);

  if (dismissed || (!visible && !closing)) return null;

  const cfg = CFG[toast?.tipo] || CFG.info;
  const { Icon } = cfg;

  return (
    <div
      className={`fixed left-3 right-3 z-[2000] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
        closing ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{ bottom: 'calc(var(--nav-h) + 12px)' }}
    >
      <div className={`h-1 w-full ${cfg.bar}`} />
      <div className="bg-[#0f1623] border border-white/10 px-4 py-3.5 flex items-center gap-3">
        <Icon size={22} className={`flex-shrink-0 ${cfg.color}`} />
        <span className="flex-1 text-sm font-bold text-white leading-snug">{toast?.msg}</span>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
