import { useState, useEffect } from 'react';
import { Plus, X, Clock, Trash2, Search, Users, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EXERCISE_CATALOG, CATEGORIES } from '../lib/exerciseCatalog';

export default function ExerciseBuilder({ training, onUpdate, roster = [], isAdmin = true, currentPlayerId = null }) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', duration: '10', description: '' });
  const [showCustom, setShowCustom] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [expandedAssign, setExpandedAssign] = useState(null); // exercise index

  const exercises = training?.exercises || [];

  const addExercise = async (ex) => {
    const newEx = {
      id: Date.now(),
      name: ex.name,
      duration: ex.dur || ex.duration || 15,
      description: ex.desc || ex.description || '',
      image_url: ex.image_url || null,
      roles: ex.roles || null,
      assignments: {},
    };
    const updated = [...exercises, newEx];
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

  const assignPlayer = async (exIndex, role, player) => {
    const updated = [...exercises];
    if (!updated[exIndex].assignments) updated[exIndex].assignments = {};
    updated[exIndex].assignments[role] = player ? { id: player.id, name: player.name, number: player.number } : null;
    await saveExercises(updated);
  };

  const addCustom = () => {
    if (!customForm.name) return;
    addExercise({ name: customForm.name, duration: parseInt(customForm.duration) || 10, description: customForm.description });
    setCustomForm({ name: '', duration: '10', description: '' });
    setShowCustom(false);
  };

  const totalDuration = exercises.reduce((sum, ex) => sum + (parseInt(ex.duration) || 0), 0);

  // Filter catalog
  const filteredCatalog = EXERCISE_CATALOG.filter(ex => {
    if (catFilter !== 'all' && ex.cat !== catFilter) return false;
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase()) && !ex.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">Ejercicios</h4>
          <span className="text-[9px] font-bold text-muted bg-white/5 px-2 py-0.5 rounded-full">{exercises.length} · {totalDuration}'</span>
        </div>
        {isAdmin && (
          <div className="flex gap-1.5">
            <button onClick={() => { setShowTemplates(!showTemplates); setShowCustom(false); }} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${showTemplates ? 'bg-accent text-bg' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}>
              📋 Catálogo ({EXERCISE_CATALOG.length})
            </button>
            <button onClick={() => { setShowCustom(!showCustom); setShowTemplates(false); }} className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              <Plus size={12} className="inline mr-1" /> Libre
            </button>
          </div>
        )}
      </div>

      {/* Templates Catalog */}
      {showTemplates && (
        <div className="bg-surface-2 rounded-2xl border border-white/5 overflow-hidden animate-fade-in">
          {/* Search + Filters */}
          <div className="p-3 border-b border-white/5 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 !py-2 text-xs"
                autoFocus
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCatFilter(c.id)}
                  className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${catFilter === c.id ? 'bg-accent text-bg' : 'bg-white/5 text-muted hover:text-white'}`}>
                  {c.icon} {c.label}
                </button>
              ))}
              <span className="text-[8px] font-bold text-muted self-center ml-auto">{filteredCatalog.length} resultados</span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3 max-h-[60vh] overflow-y-auto no-scrollbar">
            {filteredCatalog.map(tmpl => (
              <button key={tmpl.id} onClick={() => addExercise(tmpl)}
                className="flex flex-col gap-2 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 text-left transition-all group active:scale-[0.98]">
                {/* Image */}
                <div className="aspect-[16/10] bg-black/30 rounded-lg overflow-hidden relative">
                  <img src={tmpl.image_url} alt={tmpl.name} className="w-full h-full object-contain" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[8px] font-black text-accent uppercase tracking-widest">+ Añadir</span>
                  </div>
                  {tmpl.roles && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-purple-500/80 rounded text-[7px] font-black text-white">
                      <Users size={8} className="inline mr-0.5" />{tmpl.roles.length} roles
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="min-w-0 px-1">
                  <div className="text-[10px] font-bold text-white truncate">{tmpl.name}</div>
                  <div className="text-[8px] text-muted font-medium line-clamp-1">{tmpl.desc}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[7px] font-bold text-accent flex items-center gap-0.5"><Clock size={8} /> {tmpl.dur}'</span>
                    <span className="text-[7px] font-bold text-muted uppercase">{tmpl.cat}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
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
      {exercises.length > 0 && (
        <div className="space-y-3">
          {exercises.map((ex, i) => {
            const isAssignedToMe = currentPlayerId && ex.assignments && Object.values(ex.assignments).some(a => a?.id === currentPlayerId);
            const isExpanded = expandedAssign === i;

            return (
              <div key={ex.id || i} className={`rounded-2xl border transition-all overflow-hidden ${isAssignedToMe ? 'border-accent/40 bg-accent/5' : 'border-white/5 bg-white/[0.03]'}`}>
                {/* Exercise Header */}
                <div className="flex items-center gap-3 p-3">
                  <span className="w-8 h-8 rounded-xl bg-accent text-bg flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>

                  {/* Thumbnail */}
                  {ex.image_url && (
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-black/30 flex-shrink-0 cursor-pointer border border-white/5 hover:border-accent/30 transition-all" onClick={() => setLightboxImg(ex.image_url)}>
                      <img src={ex.image_url} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{ex.name}</div>
                    {ex.description && <div className="text-[9px] text-muted truncate">{ex.description}</div>}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Duration badge */}
                    <span className="flex items-center gap-1 text-[9px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-full">
                      <Clock size={10} /> {ex.duration}'
                    </span>

                    {/* Player assignment badge */}
                    {isAssignedToMe && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-bg text-[8px] font-black uppercase tracking-widest animate-pulse">
                        TU ROL
                      </span>
                    )}

                    {/* Roles indicator */}
                    {ex.roles && isAdmin && (
                      <button onClick={() => setExpandedAssign(isExpanded ? null : i)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[8px] font-bold hover:bg-purple-500/20 transition-all">
                        <Users size={10} />
                        {Object.keys(ex.assignments || {}).filter(k => ex.assignments[k]).length}/{(ex.roles || []).length}
                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                    )}

                    {/* Non-admin: show who's assigned */}
                    {ex.roles && !isAdmin && ex.assignments && (
                      <div className="flex -space-x-1">
                        {Object.entries(ex.assignments).filter(([,v]) => v).map(([role, p]) => (
                          <span key={role} title={`${role}: ${p.name}`}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black border-2 ${p.id === currentPlayerId ? 'bg-accent text-bg border-accent' : 'bg-white/10 text-white border-surface'}`}>
                            {p.number || role}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Delete */}
                    {isAdmin && (
                      <button onClick={() => removeExercise(i)} className="text-transparent hover:text-rose-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Image (full width if expanded or on detail) */}
                {ex.image_url && (
                  <div className="px-3 pb-2">
                    <div className="bg-black/20 rounded-xl border border-white/5 p-1 cursor-pointer hover:border-accent/20 transition-all" onClick={() => setLightboxImg(ex.image_url)}>
                      <img src={ex.image_url} alt={ex.name} className="w-full max-h-[250px] object-contain rounded-lg" loading="lazy" />
                    </div>
                  </div>
                )}

                {/* Player Assignment Panel */}
                {isExpanded && ex.roles && isAdmin && (
                  <div className="px-3 pb-3 animate-fade-in">
                    <div className="bg-surface-2 rounded-xl border border-purple-500/10 p-3 space-y-2">
                      <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-2">
                        <Users size={10} className="inline mr-1" /> Asignar jugadores a roles
                      </div>
                      {ex.roles.map(role => {
                        const assigned = ex.assignments?.[role];
                        return (
                          <div key={role} className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">{role}</span>
                            <select
                              value={assigned?.id || ''}
                              onChange={e => {
                                const player = roster.find(p => p.id === e.target.value);
                                assignPlayer(i, role, player || null);
                              }}
                              className="input-field !py-1.5 text-xs flex-1"
                            >
                              <option value="">— Sin asignar —</option>
                              {roster.map(p => (
                                <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                              ))}
                            </select>
                            {assigned && (
                              <span className="text-[8px] font-bold text-emerald-400">✓ #{assigned.number}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Player-facing: show my role */}
                {!isAdmin && isAssignedToMe && (
                  <div className="px-3 pb-3">
                    <div className="bg-accent/5 rounded-xl border border-accent/10 p-2 flex items-center gap-2">
                      <span className="text-[9px] font-black text-accent uppercase tracking-widest">Tu posición:</span>
                      {Object.entries(ex.assignments || {}).filter(([,v]) => v?.id === currentPlayerId).map(([role]) => (
                        <span key={role} className="px-2 py-0.5 bg-accent text-bg text-[10px] font-black rounded-lg">{role}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {exercises.length === 0 && !isAdmin && (
        <div className="text-center py-8 opacity-30">
          <Image size={32} className="mx-auto mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest">Sin ejercicios todavía</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all" onClick={() => setLightboxImg(null)}>
            <X size={20} />
          </button>
          <img src={lightboxImg} alt="Exercise" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
