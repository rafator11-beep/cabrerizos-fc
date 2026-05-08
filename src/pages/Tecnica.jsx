import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Play, Trash2, X, ChevronRight, User } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { getEmbedUrl } from '../utils/ExportHelper';

const TECH_CATEGORIES = [
  { id: 'control', label: 'Control', icon: '🎯', color: '#3b82f6' },
  { id: 'passing', label: 'Pase', icon: '➡️', color: '#10b981' },
  { id: 'shooting', label: 'Disparo', icon: '⚽', color: '#ef4444' },
  { id: 'dribbling', label: 'Regate', icon: '💨', color: '#f59e0b' },
  { id: 'defending', label: 'Defensa', icon: '🛡️', color: '#6366f1' },
  { id: 'heading', label: 'Cabeza', icon: '🧠', color: '#8b5cf6' },
  { id: 'general', label: 'General', icon: '📋', color: '#6b7280' },
];

export default function Tecnica() {
  const { isAdmin, profile } = useAuth();
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('control');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [players, setPlayers] = useState([]);
  const [filterPlayer, setFilterPlayer] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'control', video_url: '', tips: [], assigned_players: [] });
  const [tipInput, setTipInput] = useState('');

  useEffect(() => { fetchItems(); }, [activeCategory]);
  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('roster').select('id, name, number').order('number');
    if (data) setPlayers(data);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('technique').select('*').eq('category', activeCategory).order('created_at', { ascending: false });
      setItems(data || []);
    } catch { }
    setLoading(false);
  };

  const addTip = () => {
    if (!tipInput.trim()) return;
    setForm(f => ({ ...f, tips: [...f.tips, tipInput.trim()] }));
    setTipInput('');
  };

  const removeTip = (i) => setForm(f => ({ ...f, tips: f.tips.filter((_, idx) => idx !== i) }));

  const togglePlayerAssign = (pid) => {
    setForm(f => ({
      ...f,
      assigned_players: f.assigned_players.includes(pid)
        ? f.assigned_players.filter(id => id !== pid)
        : [...f.assigned_players, pid]
    }));
  };

  const createItem = async () => {
    if (!form.title) return;
    try {
      const payload = {
        title: form.title,
        description: form.description || '',
        category: activeCategory,
        video_url: form.video_url || '',
        tips: form.tips || [],
      };
      const { data, error } = await supabase.from('technique').insert([payload]).select().single();
      if (error) { console.error('Create technique error:', error); alert('Error: ' + error.message); return; }
      if (data) {
        setItems([data, ...items]);
        setShowForm(false);
        setForm({ title: '', description: '', category: activeCategory, video_url: '', tips: [], assigned_players: [] });
      }
    } catch (e) { console.error(e); }
  };

  const deleteItem = async (id) => {
    if (!confirm('¿Eliminar este ejercicio?')) return;
    await supabase.from('technique').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  const catInfo = TECH_CATEGORIES.find(c => c.id === activeCategory) || TECH_CATEGORIES[6];

  const filteredItems = filterPlayer
    ? items.filter(item => (item.assigned_players || []).includes(filterPlayer))
    : items;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Expanded Item Modal */}
      {expandedItem && (
        <div className="modal-overlay animate-fade-in" onClick={() => setExpandedItem(null)}>
          <div className="bg-surface w-full max-w-2xl max-h-[90vh] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }} onClick={e => e.stopPropagation()}>
            {/* Video embed */}
            {expandedItem.video_url && getEmbedUrl(expandedItem.video_url) && (
              <div className="video-embed flex-shrink-0">
                <iframe src={getEmbedUrl(expandedItem.video_url)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )}
            <div className="p-6 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{catInfo.icon}</span>
                  <h3 className="text-xl font-black text-white">{expandedItem.title}</h3>
                </div>
                <button onClick={() => setExpandedItem(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"><X size={16}/></button>
              </div>
              {expandedItem.description && <p className="text-sm text-muted font-medium leading-relaxed mb-4">{expandedItem.description}</p>}
              {expandedItem.video_url && !getEmbedUrl(expandedItem.video_url) && (
                <a href={expandedItem.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-xs font-black mb-4">
                  <Play size={14} /> Ver vídeo externo
                </a>
              )}
              {(expandedItem.tips || []).length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">Consejos</h4>
                  {expandedItem.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-accent text-sm">💡</span>
                      <span className="text-xs text-muted font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && isAdmin && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="modal-sheet max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white mb-4">Nuevo ejercicio de {catInfo.label}</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="Título del ejercicio" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
              <textarea className="input-field min-h-[80px]" placeholder="Descripción detallada..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input className="input-field" placeholder="URL de vídeo (YouTube, Vimeo...)" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
              
              {/* Tips */}
              <div>
                <label className="text-[9px] font-black text-muted uppercase tracking-widest mb-1 block">Consejos</label>
                {form.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2 items-center mb-1 p-2 bg-white/5 rounded-lg text-xs text-muted">
                    <span className="flex-1">💡 {tip}</span>
                    <button onClick={() => removeTip(i)} className="text-rose-500 text-xs">✕</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input className="input-field flex-1" placeholder="Añadir consejo..." value={tipInput} onChange={e => setTipInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addTip(); }} />
                  <button className="btn btn-outline btn-sm" onClick={addTip}>+</button>
                </div>
              </div>

              {/* Assign to players */}
              <div>
                <label className="text-[9px] font-black text-muted uppercase tracking-widest mb-2 block">Asignar a jugadores</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {players.map(p => {
                    const on = form.assigned_players.includes(p.id);
                    return (
                      <button key={p.id} onClick={() => togglePlayerAssign(p.id)}
                        className={`p-1.5 rounded-lg text-center border transition-all ${on ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-white/30'}`}>
                        <div className="text-xs font-black">{p.number}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 rounded-xl bg-accent text-bg font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all" onClick={createItem}>Crear</button>
                <button className="py-3 px-6 rounded-xl bg-white/5 text-white font-black uppercase tracking-widest text-[10px]" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:px-10 md:pt-8 flex-shrink-0">
        <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter">🎯 Técnica</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> Nuevo
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-4 md:px-10 pb-2 overflow-x-auto no-scrollbar flex-shrink-0">
        {TECH_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setFilterPlayer(null); }}
            className={`chip flex-shrink-0 ${activeCategory === cat.id ? 'chip-active' : 'chip-inactive'}`}>
            <span>{cat.icon}</span> <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Player filter row */}
      <div className="flex gap-1.5 px-4 md:px-10 pb-3 overflow-x-auto no-scrollbar flex-shrink-0 items-center">
        <span className="text-[8px] font-black text-muted uppercase tracking-widest flex-shrink-0 mr-1"><User size={10} className="inline mr-1"/>Filtrar:</span>
        <button onClick={() => setFilterPlayer(null)} className={`chip flex-shrink-0 ${!filterPlayer ? 'chip-active' : 'chip-inactive'}`}>Todos</button>
        {players.slice(0, 15).map(p => (
          <button key={p.id} onClick={() => setFilterPlayer(p.id)}
            className={`chip flex-shrink-0 ${filterPlayer === p.id ? 'chip-active' : 'chip-inactive'}`}>
            {p.number}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-10 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-surface-2 animate-pulse rounded-[24px] border border-white/5" />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center opacity-30">
            <div className="text-4xl mb-3">{catInfo.icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest">No hay ejercicios de {catInfo.label}</p>
            {isAdmin && <p className="text-[9px] mt-2 text-muted">Pulsa <strong>Nuevo</strong> para añadir uno.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map(item => {
              const embedUrl = getEmbedUrl(item.video_url);
              return (
                <div key={item.id} className="card !p-0 overflow-hidden group cursor-pointer hover:border-accent/20 transition-all" onClick={async () => {
                  // Pre-load exercise data from Supabase
                  try {
                    const { data: exerciseData } = await supabase.from('technique').select('*').eq('id', item.id).single();
                    if (exerciseData) {
                      setExpandedItem(exerciseData);
                    } else {
                      setExpandedItem(item);
                    }
                  } catch (error) {
                    console.error('Error loading exercise:', error);
                    setExpandedItem(item);
                  }
                }}>
                  {/* Video preview */}
                  {embedUrl ? (
                    <div className="relative aspect-video bg-black/40 overflow-hidden">
                      <img src={`https://img.youtube.com/vi/${item.video_url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}/mqdefault.jpg`}
                        alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-accent/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play size={20} className="text-bg ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : item.video_url ? (
                    <div className="h-20 bg-gradient-to-br from-surface-2 to-surface flex items-center justify-center">
                      <Play size={24} className="text-muted/30" />
                    </div>
                  ) : null}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{catInfo.icon}</span>
                        <h4 className="text-sm font-black text-white leading-tight">{item.title}</h4>
                      </div>
                      {isAdmin && (
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="text-muted/30 hover:text-rose-500 transition-colors flex-shrink-0">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    {item.description && <p className="text-[11px] text-muted font-medium line-clamp-2 mb-2">{item.description}</p>}
                    {(item.tips || []).length > 0 && (
                      <div className="flex items-center gap-1 text-[9px] text-accent font-bold">
                        💡 {item.tips.length} consejo{item.tips.length > 1 ? 's' : ''}
                      </div>
                    )}
                    {(item.assigned_players || []).length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {(item.assigned_players || []).slice(0, 5).map(pid => {
                          const p = players.find(pl => pl.id === pid);
                          return p ? (
                            <span key={pid} className="px-1.5 py-0.5 bg-accent/10 text-accent text-[8px] font-black rounded">{p.number}</span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
