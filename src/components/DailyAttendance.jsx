import { useState, useEffect } from 'react';
import { Check, Search, UserCheck, UserX } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DailyAttendance({ roster = [], trainingId, onAttendanceChange, initialAttendance = [] }) {
  const [attendance, setAttendance] = useState(new Set(initialAttendance.map(a => a.id || a)));
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialAttendance.length > 0) {
      setAttendance(new Set(initialAttendance.map(a => a.id || a)));
    }
  }, [initialAttendance]);

  const toggle = (playerId) => {
    const next = new Set(attendance);
    if (next.has(playerId)) next.delete(playerId);
    else next.add(playerId);
    setAttendance(next);
    onAttendanceChange?.(roster.filter(p => next.has(p.id)));
  };

  const selectAll = () => {
    const all = new Set(roster.map(p => p.id));
    setAttendance(all);
    onAttendanceChange?.(roster);
  };

  const clearAll = () => {
    setAttendance(new Set());
    onAttendanceChange?.([]);
  };

  const saveAttendance = async () => {
    if (!trainingId) return;
    setSaving(true);
    const ids = [...attendance];
    await supabase.from('trainings').update({
      attendance: ids,
      session_lineup: null,
    }).eq('id', trainingId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filtered = roster.filter(p => {
    if (!search) return true;
    return p.name?.toLowerCase().includes(search.toLowerCase()) || String(p.number).includes(search);
  });

  const presentCount = attendance.size;
  const absentCount = roster.length - presentCount;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Asistencia</h4>
          <div className="flex gap-1.5">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <UserCheck size={10} /> {presentCount}
            </span>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <UserX size={10} /> {absentCount}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase hover:bg-emerald-500/20 transition-all active:scale-95"
          >
            Todos
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-black uppercase hover:bg-rose-500/20 transition-all active:scale-95"
          >
            Ninguno
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase active:scale-95 transition-all disabled:opacity-60 ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-accent text-bg'
            }`}
          >
            {saving ? 'Guardando...' : saved ? '¡Guardado! ✓' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Search */}
      {roster.length > 10 && (
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-8 !py-2 text-xs"
          />
        </div>
      )}

      {/* Player Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filtered.map(p => {
          const isPresent = attendance.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all active:scale-90 ${
                isPresent
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/5 text-white/30 hover:text-white/50'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black transition-all ${
                isPresent ? 'bg-emerald-500/20' : 'bg-white/5'
              }`}>
                {isPresent ? <Check size={17} /> : p.number}
              </div>
              <span className="text-[10px] font-bold truncate w-full text-center">
                {(p.name || '').split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
