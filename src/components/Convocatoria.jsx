import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Share2, Check, UserMinus } from 'lucide-react';

export default function Convocatoria({ lineup, onClose }) {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('roster').select('id, name, number, position').order('number');
      if (data) {
        setPlayers(data);
        // Pre-select starters from lineup
        if (lineup?.starters) {
          const starterIds = lineup.starters.filter(s => s.player_id).map(s => s.player_id);
          setSelected(starterIds);
        }
      }
    })();
  }, [lineup]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getConvocatoriaText = () => {
    const selectedPlayers = players.filter(p => selected.includes(p.id)).sort((a, b) => a.number - b.number);
    const excluded = players.filter(p => !selected.includes(p.id)).sort((a, b) => a.number - b.number);
    let text = `⚽ *CONVOCATORIA*\n`;
    text += `📋 ${lineup?.name || 'Partido'}\n`;
    text += `📅 ${lineup?.match_date || 'Fecha por confirmar'}\n\n`;
    text += `✅ *CONVOCADOS (${selectedPlayers.length}):*\n`;
    selectedPlayers.forEach(p => { text += `  ${p.number}. ${p.name}\n`; });
    if (excluded.length > 0) {
      text += `\n❌ *NO CONVOCADOS:*\n`;
      excluded.forEach(p => { text += `  ${p.number}. ${p.name}\n`; });
    }
    text += `\n🟢 *Cabrerizos F.C. — Juvenil B*`;
    return text;
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(getConvocatoriaText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(getConvocatoriaText());
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-sheet max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-white">Convocatoria</h2>
            <p className="text-[10px] text-muted font-bold">{selected.length} jugadores seleccionados</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"><X size={16}/></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 mb-4">
          {players.map(p => {
            const on = selected.includes(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${on ? 'bg-accent/10 border-accent/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${on ? 'bg-accent text-bg' : 'bg-white/10 text-white/30'}`}>
                  {on ? <Check size={16}/> : p.number}
                </div>
                <span className={`text-sm font-bold flex-1 text-left ${on ? 'text-white' : 'text-white/40 line-through'}`}>{p.name}</span>
                {!on && <UserMinus size={14} className="text-rose-500/50" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={shareWhatsApp} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Share2 size={14}/> {shared ? '¡Enviado!' : 'WhatsApp'}
          </button>
          <button onClick={copyToClipboard} className="py-3 px-5 rounded-xl bg-white/5 text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            {shared ? '✓' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
}
