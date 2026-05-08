import React, { useState } from 'react';
import { Search, FolderOpen, ChevronRight, Activity, Zap } from 'lucide-react';
import { EXERCISE_CATALOG, CATEGORIES } from '../lib/exerciseCatalog';

export default function ExerciseBank({ onSelectExercise }) {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = EXERCISE_CATALOG.filter(ex => {
    const matchCat = activeCat === 'all' || ex.cat === activeCat;
    const matchQuery = ex.name.toLowerCase().includes(query.toLowerCase()) || ex.desc.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5 space-y-5 flex-shrink-0">
        <div>
          <h1 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] leading-none mb-1">Command Center</h1>
          <p className="text-lg font-black text-white">Banco de Ejercicios</p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text"
            placeholder="Buscar en +100 ejercicios..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${
                activeCat === c.id ? 'bg-accent text-bg shadow-lg shadow-accent/20' : 'bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <FolderOpen size={32} className="mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sin resultados</p>
          </div>
        ) : (
          filtered.map(ex => (
            <div 
              key={ex.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('exerciseId', ex.id);
              }}
              onClick={() => onSelectExercise(ex)}
              className="group flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-accent/5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="w-20 h-16 rounded-xl bg-black/50 border border-white/5 overflow-hidden flex-shrink-0">
                <img src={ex.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-white truncate mb-1">{ex.name}</h4>
                <div className="flex gap-2 text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-accent flex items-center gap-1"><Activity size={10} /> {ex.cat}</span>
                  <span className="text-white/40 flex items-center gap-1"><Zap size={10} /> {ex.dur}'</span>
                </div>
              </div>
              
              <div className="flex items-center text-muted group-hover:text-accent transition-colors pr-1">
                <ChevronRight size={16} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
