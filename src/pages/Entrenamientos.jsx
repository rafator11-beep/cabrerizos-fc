import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Star, Trash2, Save, X, ChevronLeft, Users, PenTool, Dumbbell, Activity, ChevronRight, Target } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import FieldCanvas from '../components/FieldCanvas';

const INTENSITIES = [
  { id: 'baja', label: 'Baja', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: '🟢' },
  { id: 'media', label: 'Media', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: '🟡' },
  { id: 'alta', label: 'Alta', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: '🔴' },
];

export default function Entrenamientos() {
  const { isAdmin, profile, user } = useAuth();
  const isMobile = useIsMobile();
  const [trainings, setTrainings] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], intensity: 'media', duration: '90', objective: '' });

  useEffect(() => { fetchTrainings(); }, []);

  const createTraining = async () => {
    if (!form.title) return;
    const { data } = await supabase.from('trainings').insert([{ ...form, exercises: [], created_by: profile?.id }]).select().single();
    if (data) {
      setTrainings([data, ...trainings]);
      setActiveTraining(data);
      setShowForm(false);
      setForm({ title: '', date: new Date().toISOString().split('T')[0], intensity: 'media', duration: '90', objective: '' });
      if (isMobile) setMobileView('detail');
    }
  };

  const deleteTraining = async (id) => {
    if (!confirm('¿Eliminar sesión?')) return;
    await supabase.from('trainings').delete().eq('id', id);
    const rem = trainings.filter(t => t.id !== id);
    setTrainings(rem);
    if (activeTraining?.id === id) setActiveTraining(rem[0] || null);
    if (isMobile) setMobileView('list');
  };

  const fetchTrainings = async () => {
    setLoading(true);
    const { data } = await supabase.from('trainings').select('*').order('date', { ascending: false });
    if (data) {
      setTrainings(data);
      if (data.length > 0) setActiveTraining(data[0]);
    }
    setLoading(false);
  };

  const selectTraining = (t) => {
    setActiveTraining(t);
    if (isMobile) setMobileView('detail');
  };

  const getIntensity = (id) => INTENSITIES.find(i => i.id === id) || INTENSITIES[1];

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in relative">
      
      {showForm && (
        <div className="absolute inset-0 z-50 bg-bg/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Nueva Sesión</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <input className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" placeholder="Título de la sesión" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <input type="number" className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" placeholder="Minutos" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <select className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" value={form.intensity} onChange={e => setForm(f => ({ ...f, intensity: e.target.value }))}>
                {INTENSITIES.map(i => <option key={i.id} value={i.id} className="bg-bg">{i.label}</option>)}
              </select>
              <textarea className="w-full bg-surface-2/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none min-h-[100px]" placeholder="Objetivo de la sesión..." value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} />
              <button className="w-full py-4 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-accent/20" onClick={createTraining}>CREAR ENTRENAMIENTO</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Entrenamientos</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary !rounded-full !px-6 text-[10px] uppercase font-black tracking-widest shadow-lg shadow-accent/20"
        >
          <Plus size={14} className="mr-2" /> {isAdmin ? 'Nuevo' : 'Proponer'}
        </button>
      </div>

      <div className="flex flex-1 gap-8 min-h-0">
        
        {/* LIST PANEL */}
        <div className={`
          w-full md:w-[350px] flex-col gap-4 flex-shrink-0
          ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
        `}>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {loading ? (
              <div className="py-20 text-center text-muted animate-pulse font-black text-xs">CARGANDO...</div>
            ) : trainings.length === 0 ? (
              <div className="py-20 text-center text-muted/30 font-black text-xs uppercase tracking-[0.2em] italic">Sin registros</div>
            ) : trainings.map(t => {
              const intensity = getIntensity(t.intensity);
              return (
                <button 
                  key={t.id}
                  onClick={() => selectTraining(t)}
                  className={`
                    w-full flex flex-col p-5 rounded-[28px] border transition-all text-left group active:scale-95
                    ${activeTraining?.id === t.id ? 'bg-accent/5 border-accent/30 shadow-lg' : 'bg-surface-2/20 border-white/5 hover:border-white/10'}
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${intensity.bg} ${intensity.color}`}>
                      {intensity.icon} {intensity.label}
                    </div>
                    <span className="text-[10px] font-black text-muted/40">{t.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-3 group-hover:text-accent transition-colors leading-tight">{t.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {t.duration}'</span>
                    <span className="flex items-center gap-1.5"><Activity size={12} /> {(t.exercises || []).length} Ex.</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAIL PANEL */}
        <div className={`
          flex-1 flex flex-col gap-6 min-h-0
          ${mobileView === 'detail' ? 'flex' : 'hidden md:flex'}
        `}>
          {isMobile && (
            <button onClick={() => setMobileView('list')} className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest mb-2">
              <ChevronLeft size={16} /> Volver a la lista
            </button>
          )}

          {activeTraining ? (
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
              
              {/* Header Card */}
              <div className="glass-card">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white leading-tight">{activeTraining.title}</h2>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => deleteTraining(activeTraining.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 active:scale-90 transition-all"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">Fecha</span>
                      <span className="text-xs font-bold text-white">{activeTraining.date}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">Duración</span>
                      <span className="text-xs font-bold text-white">{activeTraining.duration} min</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">Intensidad</span>
                      <span className={`text-xs font-bold ${getIntensity(activeTraining.intensity).color}`}>
                        {getIntensity(activeTraining.intensity).label}
                      </span>
                    </div>
                  </div>
                  {activeTraining.objective && (
                    <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <div className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-widest mb-2">
                        <Target size={12} /> Objetivo de la sesión
                      </div>
                      <p className="text-sm font-medium text-white/80 leading-relaxed italic">"{activeTraining.objective}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] px-2">Secuencia de Ejercicios</h3>
                <div className="space-y-3">
                  {(activeTraining.exercises || []).map((ex, i) => (
                    <div key={i} className="glass-card !p-0 overflow-hidden group">
                      <div className="p-6 flex items-start gap-5">
                        <div className="w-10 h-10 rounded-2xl bg-surface-2 flex items-center justify-center text-lg font-black text-white/20 border border-white/5 group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{ex.name}</h4>
                            <span className="text-[11px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest">{ex.duration}'</span>
                          </div>
                          <p className="text-sm text-muted leading-relaxed opacity-60 font-medium">{ex.description}</p>
                        </div>
                      </div>
                      {ex.canvas_drawing && (
                        <div className="aspect-[550/366] bg-[#111827] border-t border-white/5 relative group-hover:opacity-100 opacity-90 transition-opacity">
                          <FieldCanvas 
                            tokens={ex.canvas_drawing.tokens || []}
                            arrows={ex.canvas_drawing.arrows || []}
                            zones={ex.canvas_drawing.zones || []}
                            viewMode="full"
                            presentationMode={true}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted/20 animate-pulse">
              <Dumbbell size={80} strokeWidth={1} />
              <span className="text-xs font-black uppercase tracking-[0.4em] mt-6">Selecciona una sesión</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
