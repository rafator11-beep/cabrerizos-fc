import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function SeasonCalendar() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    (async () => {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-01`;
      
      const [{ data: trainings }, { data: lineups }] = await Promise.all([
        supabase.from('trainings').select('id, title, date, intensity').gte('date', startDate).lt('date', endDate),
        supabase.from('lineups').select('id, name, match_date').gte('match_date', startDate).lt('match_date', endDate),
      ]);
      
      const evts = [];
      (trainings || []).forEach(t => evts.push({ date: t.date, type: 'training', title: t.title, color: '#10b981' }));
      (lineups || []).forEach(l => evts.push({ date: l.match_date, type: 'match', title: l.name, color: '#ef4444' }));
      setEvents(evts);
    })();
  }, [month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  const monthName = new Date(year, month).toLocaleDateString('es-ES', { month: 'long' });
  const today = new Date();
  const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

  const getEventsForDay = (d) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
          className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-muted"><ChevronLeft size={14}/></button>
        <span className="text-[10px] font-black text-white uppercase tracking-widest">{monthName} {year}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
          className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-muted"><ChevronRight size={14}/></button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DAYS.map(d => <div key={d} className="text-center text-[8px] font-black text-muted/40 uppercase py-1">{d}</div>)}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          const hasTraining = dayEvents.some(e => e.type === 'training');
          const hasMatch = dayEvents.some(e => e.type === 'match');
          
          return (
            <div key={day} className={`relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${isToday(day) ? 'bg-accent/20 ring-1 ring-accent/40' : ''}`} title={dayEvents.map(e => e.title).join(', ')}>
              <span className={`text-[10px] font-bold ${isToday(day) ? 'text-accent' : 'text-white/60'}`}>{day}</span>
              {(hasTraining || hasMatch) && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasTraining && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  {hasMatch && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-white/5 flex gap-4">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-bold text-muted">Entreno</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[8px] font-bold text-muted">Partido</span></div>
      </div>
    </div>
  );
}
