import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Play, Target, Footprints, Shield, Crosshair, Brain, Trash2 } from 'lucide-react';

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
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('control');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'control', video_url: '', tips: [] });
  const [tipInput, setTipInput] = useState('');

  useEffect(() => { fetchItems(); }, [activeCategory]);

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

  const createItem = async () => {
    if (!form.title) { alert('Pon un título'); return; }
    try {
      const { data } = await supabase.from('technique').insert([{
        ...form, category: activeCategory, created_by: profile?.id
      }]).select().single();
      if (data) {
        setItems([data, ...items]);
        setShowForm(false);
        setForm({ title: '', description: '', category: activeCategory, video_url: '', tips: [] });
      }
    } catch { alert('Error al crear.'); }
  };

  const deleteItem = async (id) => {
    if (!confirm('¿Eliminar este ejercicio?')) return;
    await supabase.from('technique').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  const catInfo = TECH_CATEGORIES.find(c => c.id === activeCategory) || TECH_CATEGORIES[6];

  return (
    <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>🎯 Técnica Individual</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> Nuevo ejercicio
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TECH_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '6px 12px', borderRadius: 20, border: 'none',
              background: activeCategory === cat.id ? `${cat.color}15` : '#f1f5f9',
              color: activeCategory === cat.id ? cat.color : '#64748b',
              fontWeight: activeCategory === cat.id ? 700 : 500,
              fontSize: 12, cursor: 'pointer', transition: 'all .12s',
            }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && isAdmin && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Nuevo ejercicio de {catInfo.label}</div>
          <input className="input-field" placeholder="Título del ejercicio" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ marginBottom: 8 }} />
          <textarea className="input-field" placeholder="Descripción detallada..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ marginBottom: 8, resize: 'vertical' }} />
          <input className="input-field" placeholder="URL de vídeo (YouTube, etc.)" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} style={{ marginBottom: 8 }} />
          
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Consejos:</div>
          {form.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 3, fontSize: 11, padding: '4px 8px', background: '#f8f9fb', borderRadius: 6 }}>
              <span style={{ flex: 1 }}>💡 {tip}</span>
              <button onClick={() => removeTip(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            <input className="input-field" placeholder="Añadir consejo..." value={tipInput} onChange={e => setTipInput(e.target.value)} style={{ flex: 1 }}
              onKeyDown={e => { if (e.key === 'Enter') addTip(); }} />
            <button className="btn btn-outline btn-sm" onClick={addTip}>+</button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={createItem}>Crear</button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#96a0b5' }}>Cargando...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#96a0b5' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{catInfo.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>No hay ejercicios de {catInfo.label} todavía.</div>
          {isAdmin && <div style={{ fontSize: 11, marginTop: 6 }}>Pulsa <strong>Nuevo ejercicio</strong> para añadir uno.</div>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ padding: 16, position: 'relative' }}>
              {isAdmin && (
                <button onClick={() => deleteItem(item.id)}
                  style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <Trash2 size={14} />
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${catInfo.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {catInfo.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
              </div>
              {item.description && (
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 8 }}>{item.description}</div>
              )}
              {item.video_url && (
                <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#0057ff', fontWeight: 600, textDecoration: 'none', padding: '4px 8px', background: '#eef3ff', borderRadius: 6, marginBottom: 8 }}>
                  <Play size={12} /> Ver vídeo
                </a>
              )}
              {(item.tips || []).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {(item.tips || []).map((tip, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#475569', padding: '3px 0', lineHeight: 1.4 }}>💡 {tip}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
