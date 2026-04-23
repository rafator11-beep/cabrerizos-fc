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
  const { isAdmin, isRealAdmin, viewAsPlayer, profile } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  const isMobile = useIsMobile();
  
  const [trainings, setTrainings] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], intensity: 'media', duration: '90', objective: '' });

  useEffect(() => { fetchTrainings(); }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    const { data } = await supabase.from('trainings').select('*').order('date', { ascending: false });
    if (data) {
      setTrainings(data);
      if (data.length > 0) setActiveTraining(data[0]);
    }
    setLoading(false);
  };

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

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* List */}
        <div className={`flex-1 md:w-80 md:flex-shrink-0 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-24 ${isMobile && mobileView !== 'list' ? 'hidden' : 'flex'}`}>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-40 bg-surface-2 animate-pulse rounded-[32px] border border-white/5" />)
          ) : trainings.map(t => (
            <button key={t.id} onClick={() => { setActiveTraining(t); if(isMobile) setMobileView('detail'); }}
              className={`group relative p-6 rounded-[32px] border transition-all text-left overflow-hidden ${activeTraining?.id === t.id ? 'bg-surface-2 border-accent/30' : 'bg-surface border-white/5 hover:border-white/10'}`}>
              
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getIntensity(t.intensity).bg} ${getIntensity(t.intensity).color}`}>
                  {getIntensity(t.intensity).label}
                </div>
                {isAdmin && activeTraining?.id === t.id && (
                  <button onClick={(e) => { e.stopPropagation(); deleteTraining(t.id); }} className="text-rose-500/40 hover:text-rose-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>

              <h3 className="text-lg font-black text-white leading-tight mb-2 group-hover:text-accent transition-colors">{t.title}</h3>
              
              <div className="flex gap-4 items-center mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-muted">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold">{t.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold">{t.duration}'</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <Activity size={14} />
                  <span className="text-[10px] font-bold">{(t.exercises || []).length} Ejercicios</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className={`flex-[2] bg-surface rounded-[40px] border border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ${isMobile && mobileView !== 'detail' ? 'hidden' : 'flex'}`}>
          {activeTraining ? (
            <>
              <div className="p-8 border-b border-white/5 bg-gradient-to-br from-surface-2 to-surface">
                <div className="flex items-center justify-between mb-6">
                  {isMobile && <button onClick={() => setMobileView('list')} className="text-muted hover:text-white transition-colors"><ChevronLeft size={24}/></button>}
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      <Dumbbell size={20}/>
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">{activeTraining.title}</h2>
                <p className="text-muted text-sm font-medium leading-relaxed max-w-xl">{activeTraining.objective || 'Sin objetivo definido para esta sesión.'}</p>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 pb-32">
                {(activeTraining.exercises || []).length > 0 ? (
                  activeTraining.exercises.map((ex, i) => (
                    <div key={i} className="group flex flex-col gap-6 p-6 rounded-[32px] bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center text-xs font-black">{i + 1}</span>
                          <h4 className="text-lg font-black text-white">{ex.name}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-accent bg-accent/10 px-3 py-1 rounded-full">
                          <Clock size={12}/>
                          <span className="text-[10px] font-black">{ex.duration}'</span>
                        </div>
                      </div>
                      
                      {ex.description && <p className="text-sm text-muted font-medium px-1">{ex.description}</p>}
                      
                      {/* Drawing / Image Placeholder */}
                      <div className="aspect-video bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                        {ex.canvas_drawing ? (
                          <FieldCanvas 
                            tokens={ex.canvas_drawing.tokens || []} 
                            arrows={ex.canvas_drawing.arrows || []} 
                            zones={ex.canvas_drawing.zones || []} 
                            tool="move" 
                            presentationMode={true}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
                            <PenTool size={48}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">Sin pizarra disponible</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                    <Target size={64} className="mb-4" />
                    <h4 className="text-xl font-black text-white uppercase tracking-widest">Sesión Vacía</h4>
                    <p className="text-sm font-bold mt-2">No se han añadido ejercicios todavía.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
              <Plus size={64} className="mb-4" />
              <h4 className="text-xl font-black text-white uppercase tracking-widest">Selecciona una sesión</h4>
              <p className="text-sm font-bold mt-2">O crea una nueva pulsando el botón +</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
