import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Trash2, X, ChevronLeft, Dumbbell, Activity, Target, Download, Filter, Star } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import PostMatchRating from '../components/PostMatchRating';
import ExerciseBuilder from '../components/ExerciseBuilder';

const INTENSITIES = [
  { id: 'baja', label: 'Baja', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: '🟢' },
  { id: 'media', label: 'Media', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: '🟡' },
  { id: 'alta', label: 'Alta', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: '🔴' },
];

const TRAINING_TYPES = [
  { id: 'all', label: 'Todos', icon: '📋', color: '#6b7280' },
  { id: 'fisico', label: 'Físico', icon: '💪', color: '#ef4444' },
  { id: 'tecnico', label: 'Técnico', icon: '⚽', color: '#3b82f6' },
  { id: 'tactico', label: 'Táctico', icon: '🧠', color: '#8b5cf6' },
  { id: 'porteros', label: 'Porteros', icon: '🧤', color: '#facc15' },
  { id: 'reducido', label: 'Reducido', icon: '🏟️', color: '#10b981' },
  { id: 'calentamiento', label: 'Calent.', icon: '🔥', color: '#f97316' },
  { id: 'recuperacion', label: 'Recup.', icon: '🩹', color: '#06b6d4' },
];

export default function Entrenamientos() {
  const { isAdmin, isRealAdmin, viewAsPlayer, profile } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  const isMobile = useIsMobile();
  
  const [trainings, setTrainings] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [showRating, setShowRating] = useState(false);
  const [roster, setRoster] = useState([]);
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], intensity: 'media', duration: '90', objective: '', type: 'tecnico' });

  useEffect(() => { fetchTrainings(); fetchRoster(); }, []);

  const fetchRoster = async () => {
    const { data } = await supabase.from('roster').select('id, name, number, position');
    if (data) setRoster(data);
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

  const createTraining = async () => {
    if (!form.title) return;
    const payload = {
      title: form.title,
      date: form.date,
      intensity: form.intensity,
      duration: parseInt(form.duration) || 90,
      objective: form.objective,
      notes: form.type ? `[${form.type}]` : '',
      exercises: [],
      created_by: profile?.id
    };
    const { data, error } = await supabase.from('trainings').insert([payload]).select().single();
    if (error) { console.error('Create training error:', error); alert('Error al crear: ' + error.message); return; }
    if (data) {
      setTrainings([data, ...trainings]);
      setActiveTraining(data);
      setShowForm(false);
      setForm({ title: '', date: new Date().toISOString().split('T')[0], intensity: 'media', duration: '90', objective: '', type: 'tecnico' });
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
  const extractType = (t) => {
    const match = (t.notes || '').match(/^\[(\w+)\]/);
    return match ? match[1] : (t.type || null);
  };
  const getType = (id) => TRAINING_TYPES.find(t => t.id === id) || TRAINING_TYPES[0];

  const filteredTrainings = activeType === 'all' 
    ? trainings 
    : trainings.filter(t => extractType(t) === activeType);

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      
      {/* PostMatch Rating */}
      {showRating && <PostMatchRating trainingId={activeTraining?.id} onClose={() => setShowRating(false)} />}

      {/* Create Form Modal */}
      {showForm && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">Nueva Sesión</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <input className="input-field" placeholder="Título de la sesión" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <input type="number" className="input-field" placeholder="Minutos" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} onFocus={e => e.target.select()} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={form.intensity} onChange={e => setForm(f => ({ ...f, intensity: e.target.value }))}>
                  {INTENSITIES.map(i => <option key={i.id} value={i.id} className="bg-bg">{i.icon} {i.label}</option>)}
                </select>
                <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TRAINING_TYPES.filter(t => t.id !== 'all').map(t => <option key={t.id} value={t.id} className="bg-bg">{t.icon} {t.label}</option>)}
                </select>
              </div>
              <textarea className="input-field min-h-[80px]" placeholder="Objetivo de la sesión..." value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} />
              <button className="w-full py-4 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 active:scale-95 transition-all" onClick={createTraining}>CREAR ENTRENAMIENTO</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:px-10 md:pt-8 flex-shrink-0">
        <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter">Entrenamientos</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary !rounded-full !px-4 text-[9px]">
          <Plus size={14} /> {isAdmin ? 'Nuevo' : 'Proponer'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 px-4 md:px-10 pb-3 overflow-x-auto no-scrollbar flex-shrink-0">
        {TRAINING_TYPES.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)}
            className={`chip flex-shrink-0 ${activeType === t.id ? 'chip-active' : 'chip-inactive'}`}>
            <span>{t.icon}</span> <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden px-4 md:px-10 pb-4">
        {/* List */}
        <div className={`md:w-80 md:flex-shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar ${isMobile && mobileView !== 'list' ? 'hidden' : 'flex'}`}>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-32 bg-surface-2 animate-pulse rounded-[24px] border border-white/5" />)
          ) : filteredTrainings.length === 0 ? (
            <div className="py-16 text-center opacity-30">
              <Filter size={32} className="mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sin sesiones en esta categoría</p>
            </div>
          ) : filteredTrainings.map(t => (
            <div key={t.id} onClick={() => { setActiveTraining(t); if(isMobile) setMobileView('detail'); }}
              className={`group relative p-4 rounded-[24px] border transition-all text-left cursor-pointer ${activeTraining?.id === t.id ? 'bg-surface-2 border-accent/30' : 'bg-surface border-white/5 hover:border-white/10'}`}>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getIntensity(t.intensity).bg} ${getIntensity(t.intensity).color}`}>
                    {getIntensity(t.intensity).label}
                  </span>
                  {extractType(t) && (
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/5 text-muted">
                      {getType(extractType(t)).icon}
                    </span>
                  )}
                </div>
                {isAdmin && activeTraining?.id === t.id && (
                  <button onClick={(e) => { e.stopPropagation(); deleteTraining(t.id); }} className="text-rose-500/40 hover:text-rose-500 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                )}
              </div>

              <h3 className="text-sm font-black text-white leading-tight mb-2 group-hover:text-accent transition-colors">{t.title}</h3>
              
              <div className="flex gap-3 items-center pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 text-muted">
                  <Calendar size={12} />
                  <span className="text-[9px] font-bold">{t.date}</span>
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <Clock size={12} />
                  <span className="text-[9px] font-bold">{t.duration}'</span>
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <Activity size={12} />
                  <span className="text-[9px] font-bold">{(t.exercises || []).length} Ej.</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className={`flex-1 bg-surface rounded-[32px] border border-white/5 flex flex-col overflow-hidden ${isMobile && mobileView !== 'detail' ? 'hidden' : 'flex'}`}>
          {activeTraining ? (
            <>
              <div className="p-6 border-b border-white/5 bg-gradient-to-br from-surface-2 to-surface flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  {isMobile && <button onClick={() => setMobileView('list')} className="text-muted"><ChevronLeft size={20}/></button>}
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center text-accent"><Dumbbell size={16}/></div>
                    {extractType(activeTraining) && (
                      <div className="h-8 px-3 bg-white/5 rounded-xl flex items-center text-[9px] font-black text-muted uppercase tracking-widest">
                        {getType(extractType(activeTraining)).icon} {getType(extractType(activeTraining)).label}
                      </div>
                    )}
                    {isAdmin && (
                      <button onClick={() => setShowRating(true)} className="h-8 px-3 bg-amber-500/10 rounded-xl flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                        <Star size={12}/> Valorar
                      </button>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">{activeTraining.title}</h2>
                <p className="text-muted text-xs font-medium leading-relaxed max-w-xl">{activeTraining.objective || 'Sin objetivo definido.'}</p>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-24">
                {/* Exercise Builder — renders exercises for admin AND player */}
                <ExerciseBuilder 
                  training={activeTraining} 
                  onUpdate={(updated) => {
                    setActiveTraining(updated);
                    setTrainings(trainings.map(t => t.id === updated.id ? updated : t));
                  }}
                  roster={roster}
                  isAdmin={isAdmin}
                  currentPlayerId={profile?.id}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-30">
              <Plus size={48} className="mb-3" />
              <h4 className="text-base font-black text-white uppercase tracking-widest">Selecciona una sesión</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
