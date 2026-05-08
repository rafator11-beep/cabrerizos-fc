import { useState, useEffect } from 'react';
import { StickyNote, Plus, X, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'cfc_quick_notes';

export default function QuickNotes() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setNotes(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { }
  }, []);

  const save = (n) => { setNotes(n); localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); };

  const addNote = () => {
    if (!input.trim()) return;
    const n = [{ id: Date.now(), text: input.trim(), date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }, ...notes];
    save(n);
    setInput('');
  };

  const removeNote = (id) => save(notes.filter(n => n.id !== id));

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <StickyNote size={14} className="text-amber-500" />
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Notas rápidas</span>
        </div>
        <span className="text-[9px] font-bold text-muted">{notes.length}</span>
      </div>

      {open && (
        <div className="p-3 space-y-2 animate-fade-in">
          <div className="flex gap-2">
            <input className="input-field flex-1 !py-2 !text-xs" placeholder="Nueva nota..." value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addNote(); }} />
            <button onClick={addNote} className="w-9 h-9 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0"><Plus size={14}/></button>
          </div>
          <div className="max-h-[200px] overflow-y-auto no-scrollbar space-y-1.5">
            {notes.map(n => (
              <div key={n.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 group">
                <span className="text-xs text-white/80 flex-1 font-medium">{n.text}</span>
                <span className="text-[8px] text-muted flex-shrink-0 mt-0.5">{n.date}</span>
                <button onClick={() => removeNote(n.id)} className="text-rose-500/0 group-hover:text-rose-500/50 transition-colors flex-shrink-0"><Trash2 size={10}/></button>
              </div>
            ))}
            {notes.length === 0 && <p className="text-center text-[9px] text-muted/40 py-4">Sin notas</p>}
          </div>
        </div>
      )}
    </div>
  );
}
