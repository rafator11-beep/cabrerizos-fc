import React, { useState } from 'react';
import { Lightbulb, Target, Activity, Zap, Info } from 'lucide-react';

const AI_SUGGESTIONS = {
  'tecnica': 'Periodización Táctica: Para Juveniles (16-18), reduce el espacio un 15% para forzar toques rápidos y aumenta la presión tras pérdida a 3 segundos.',
  'fisico': 'Variante de Carga: Sustituye el sprint lineal por aceleraciones con cambios de dirección bruscos simulando transición defensiva.',
  'tactica': 'Sub-principio: Añade una regla de "máximo 2 toques en campo propio, libre en campo rival" para acelerar la salida de balón.',
  'default': 'Consejo: Mantén la intensidad alta con descansos cortos. Relación trabajo-descanso 1:2 o 1:3 máximo.'
};

export default function MethodologySidebar({ exercise }) {
  const [suggestion, setSuggestion] = useState(null);

  const suggestVariant = () => {
    if (!exercise) return;
    setSuggestion(AI_SUGGESTIONS[exercise.cat] || AI_SUGGESTIONS.default);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar relative animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
          <Lightbulb size={24} />
        </div>
        <div>
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Asistente Metodológico</h2>
          <p className="text-xl font-bold text-white tracking-tight">Consejos del Míster</p>
        </div>
      </div>

      {!exercise ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
          <Target size={40} className="mb-4 text-white/50" />
          <p className="text-sm font-bold">Selecciona un ejercicio del banco para ver el análisis metodológico.</p>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white">{exercise.name}</h3>
            <p className="text-xs text-muted leading-relaxed">{exercise.desc}</p>
            
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded bg-white/5 text-[9px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1">
                <Activity size={10} /> {exercise.cat}
              </span>
              <span className="px-2.5 py-1 rounded bg-white/5 text-[9px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1">
                <Zap size={10} /> {exercise.dur}' min
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
              <Info size={12} /> Puntos Clave (Inteligencia)
            </h4>
            <ul className="space-y-2">
              <li className="text-xs font-medium text-white/80 bg-white/5 p-3 rounded-xl border-l-2 border-accent">
                {exercise.cat === 'tecnica' ? 'Prioriza la orientación corporal antes del control.' : 'Mantén la tensión competitiva durante todo el bloque.'}
              </li>
              <li className="text-xs font-medium text-white/80 bg-white/5 p-3 rounded-xl border-l-2 border-accent">
                {exercise.roles ? `Atención especial a los roles: ${exercise.roles.join(', ')}` : 'Vigila las transiciones.'}
              </li>
            </ul>
          </div>

          <button 
            onClick={suggestVariant}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:brightness-110"
          >
            Sugerir Variante IA
          </button>

          {suggestion && (
            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 animate-slide-up">
              <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Zap size={12} /> Sugerencia Táctica
              </div>
              <p className="text-xs font-bold text-blue-100 leading-relaxed">
                {suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
