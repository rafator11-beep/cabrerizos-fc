import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Star, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const RATING_ITEMS = [
  { id: 'effort', label: 'Esfuerzo', icon: '💪' },
  { id: 'technique', label: 'Técnica', icon: '⚽' },
  { id: 'tactical', label: 'Táctica', icon: '🧠' },
  { id: 'attitude', label: 'Actitud', icon: '🔥' },
  { id: 'teamwork', label: 'Equipo', icon: '🤝' },
];

export default function PostMatchRating({ trainingId, onClose }) {
  const { profile, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [players, setPlayers] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [ratings, setRatings] = useState({});
  const [mvpVote, setMvpVote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('roster').select('id, name, number, photo_url').order('number');
      if (data) setPlayers(data);
    })();
  }, []);

  const currentPlayer = players[currentIdx];

  const setRating = (playerId, itemId, value) => {
    setRatings(prev => ({
      ...prev,
      [playerId]: { ...(prev[playerId] || {}), [itemId]: value }
    }));
  };

  const getAvg = (playerId) => {
    const r = ratings[playerId];
    if (!r) return 0;
    const vals = Object.values(r).filter(v => typeof v === 'number');
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(ratings).map(([playerId, items]) => ({
        training_id: trainingId || null,
        player_id: playerId,
        score: Math.round(Object.values(items).reduce((a, b) => a + b, 0) / Object.values(items).length),
        comment: mvpVote === playerId ? '⭐ MVP del partido' : '',
        items,
      }));
      if (entries.length > 0) {
        await supabase.from('training_scores').insert(entries);
      }
      setSaved(true);
      setTimeout(() => onClose?.(), 1500);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (saved) {
    return (
      <div className="modal-overlay animate-fade-in">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-black text-white">Valoraciones Guardadas</h3>
          <p className="text-muted text-sm mt-2">Se han registrado {Object.keys(ratings).length} valoraciones</p>
        </div>
      </div>
    );
  }

  if (!currentPlayer) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="bg-surface w-full max-w-lg max-h-[90vh] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-accent uppercase tracking-widest">Valoración Post-Partido</h2>
            <p className="text-[10px] text-muted font-bold mt-0.5">{currentIdx + 1} / {players.length}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"><X size={16}/></button>
        </div>

        {/* Player Card */}
        <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl font-black text-accent">
              {currentPlayer.number}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{currentPlayer.name}</h3>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Dorsal {currentPlayer.number}</p>
            </div>
            <button onClick={() => setMvpVote(mvpVote === currentPlayer.id ? null : currentPlayer.id)}
              className={`ml-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mvpVote === currentPlayer.id ? 'bg-amber-500 text-bg shadow-lg shadow-amber-500/20' : 'bg-white/5 text-muted'}`}>
              <Trophy size={18} />
            </button>
          </div>

          {/* Rating Items */}
          <div className="space-y-4">
            {RATING_ITEMS.map(item => {
              const val = ratings[currentPlayer.id]?.[item.id] || 0;
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">{item.icon} {item.label}</span>
                    <span className="text-xs font-black text-accent">{val || '-'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} onClick={() => setRating(currentPlayer.id, item.id, n)}
                        className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${n <= val ? 'bg-accent text-bg' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Average */}
          <div className="mt-4 p-4 rounded-2xl bg-accent/5 border border-accent/20 text-center">
            <span className="text-[9px] font-black text-muted uppercase tracking-widest">Media</span>
            <div className="text-3xl font-black text-accent">{getAvg(currentPlayer.id)}</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
            className="w-10 h-10 rounded-xl bg-white/5 text-muted flex items-center justify-center disabled:opacity-20"><ChevronLeft size={18}/></button>
          
          <div className="flex-1 flex gap-1 overflow-hidden">
            {players.map((p, i) => (
              <button key={p.id} onClick={() => setCurrentIdx(i)}
                className={`h-2 flex-1 rounded-full transition-all ${i === currentIdx ? 'bg-accent' : ratings[p.id] ? 'bg-accent/30' : 'bg-white/10'}`} />
            ))}
          </div>
          
          {currentIdx < players.length - 1 ? (
            <button onClick={() => setCurrentIdx(currentIdx + 1)}
              className="w-10 h-10 rounded-xl bg-white/5 text-muted flex items-center justify-center"><ChevronRight size={18}/></button>
          ) : (
            <button onClick={saveAll} disabled={saving}
              className="h-10 px-5 rounded-xl bg-accent text-bg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50">
              <Send size={14}/> Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
