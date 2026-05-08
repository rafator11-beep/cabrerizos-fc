import { useState } from 'react';
import { Plus, X, GripVertical, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EXERCISE_TEMPLATES = [
  { name: 'Rondo 4v2', duration: 10, description: 'Rondo clásico de posesión. 4 jugadores fuera intentan mantener la posesión contra 2 dentro.' },
  { name: 'Posesión 5v5 + Comodines', duration: 15, description: 'Juego de posesión con 2 comodines que juegan con el equipo que tenga el balón.' },
  { name: 'Circuito Físico', duration: 20, description: 'Estaciones: escalera coordinación, vallas, sprint, core, saltos.' },
  { name: 'Tiros a puerta', duration: 15, description: 'Rematamos desde dentro y fuera del área. Series desde la derecha e izquierda.' },
  { name: 'Partido reducido 7v7', duration: 25, description: 'Partido en medio campo con normas: máximo 3 toques o gol vale doble si viene de banda.' },
  { name: 'Calentamiento con balón', duration: 10, description: 'Movilidad articular + pases cortos en parejas + conducción suave.' },
  { name: 'Presión alta (simulación)', duration: 15, description: 'Equipo defiende arriba. Cuando recupera, tiene 8 seg para tirar a puerta.' },
  { name: 'Salida de balón', duration: 15, description: 'Portero + 4 defensas practican salida jugada contra 3 presionadores.' },
  { name: 'Centros y remates', duration: 15, description: 'Extremos centran desde banda. Delanteros atacan primer y segundo palo.' },
  { name: 'Estiramientos + vuelta a la calma', duration: 10, description: 'Estiramientos estáticos guiados. Trote suave final.' },
];

export default function ExerciseBuilder({ training, onUpdate }) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', duration: '10', description: '' });
  const [showCustom, setShowCustom] = useState(false);

  const exercises = training?.exercises || [];

  const addExercise = async (ex) => {
    const updated = [...exercises, { ...ex, id: Date.now() }];
    await saveExercises(updated);
  };

  const removeExercise = async (index) => {
    const updated = exercises.filter((_, i) => i !== index);
    await saveExercises(updated);
  };

  const saveExercises = async (updated) => {
    const { error } = await supabase.from('trainings').update({ exercises: updated }).eq('id', training.id);
    if (!error) onUpdate({ ...training, exercises: updated });
  };

  const addCustom = () => {
    if (!customForm.name) return;
    addExercise({ name: customForm.name, duration: parseInt(customForm.duration) || 10, description: customForm.description });
    setCustomForm({ name: '', duration: '10', description: '' });
    setShowCustom(false);
  };

  const totalDuration = exercises.reduce((sum, ex) => sum + (parseInt(ex.duration) || 0), 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">Ejercicios</h4>
          <span className="text-[9px] font-bold text-muted bg-white/5 px-2 py-0.5 rounded-full">{exercises.length} · {totalDuration}'</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setShowTemplates(!showTemplates)} className="px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest hover:bg-accent/20 transition-all">
            📋 Plantillas
          </button>
          <button onClick={() => setShowCustom(!showCustom)} className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <Plus size={12} className="inline mr-1" /> Libre
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {showTemplates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-surface-2 rounded-2xl border border-white/5 animate-fade-in">
          {EXERCISE_TEMPLATES.map((tmpl, i) => (
            <button key={i} onClick={() => { addExercise(tmpl); }} 
              className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 text-left transition-all group active:scale-[0.98]">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 group-hover:bg-accent group-hover:text-bg transition-all">
                <Plus size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{tmpl.name}</div>
                <div className="text-[9px] text-muted font-medium line-clamp-1">{tmpl.description}</div>
                <div className="flex items-center gap-1 mt-1 text-[8px] text-accent font-bold">
                  <Clock size={8} /> {tmpl.duration}'
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Custom Exercise Form */}
      {showCustom && (
        <div className="p-4 bg-surface-2 rounded-2xl border border-white/5 space-y-2 animate-fade-in">
          <input className="input-field" placeholder="Nombre del ejercicio" value={customForm.name} onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          <div className="flex gap-2">
            <input type="number" className="input-field w-24" placeholder="Min" value={customForm.duration} onChange={e => setCustomForm(f => ({ ...f, duration: e.target.value }))} />
            <input className="input-field flex-1" placeholder="Descripción breve" value={customForm.description} onChange={e => setCustomForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={addCustom} className="px-4 py-2 rounded-lg bg-accent text-bg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Añadir</button>
            <button onClick={() => setShowCustom(false)} className="px-4 py-2 rounded-lg bg-white/5 text-muted text-[10px] font-black">Cancelar</button>
          </div>
        </div>
      )}

      {/* Exercise List */}
      {exercises.length > 0 ? (
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={ex.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-accent/20 transition-all">
              <span className="w-7 h-7 rounded-lg bg-accent text-bg flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{ex.name}</div>
                {ex.description && <div className="text-[9px] text-muted truncate">{ex.description}</div>}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-accent font-bold flex-shrink-0">
                <Clock size={10} /> {ex.duration}'
              </div>
              <button onClick={() => removeExercise(i)} className="text-transparent group-hover:text-rose-500/50 hover:text-rose-500 transition-colors flex-shrink-0">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
