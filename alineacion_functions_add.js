// FUNCIONES ADICIONALES PARA ALINEACION.JSX
// Añadir estas funciones después de sendLineupNotifications

const deleteLineup = async (lineupId) => {
  if (isPlayerMode || !lineupId) return;
  
  const confirmed = confirm('¿Estás seguro de que quieres eliminar esta alineación? Esta acción no se puede deshacer.');
  if (!confirmed) return;

  try {
    await supabase.from('lineups').delete().eq('id', lineupId);
    
    // Actualizar la lista de alineaciones
    const updatedLineups = lineups.filter(l => l.id !== lineupId);
    setLineups(updatedLineups);
    
    // Si era la alineación activa, seleccionar otra o limpiar
    if (activeLineup?.id === lineupId) {
      setActiveLineup(updatedLineups.length > 0 ? updatedLineups[0] : null);
    }
    
    alert('✅ Alineación eliminada correctamente');
  } catch (error) {
    console.error('Error deleting lineup:', error);
    alert('❌ Error al eliminar la alineación');
  }
};

const editLineup = async (lineupId, newData) => {
  if (isPlayerMode || !lineupId) return;

  try {
    await supabase.from('lineups').update(newData).eq('id', lineupId);
    
    // Actualizar la lista local
    const updatedLineups = lineups.map(l => 
      l.id === lineupId ? { ...l, ...newData } : l
    );
    setLineups(updatedLineups);
    
    // Actualizar la alineación activa si es la que se editó
    if (activeLineup?.id === lineupId) {
      setActiveLineup({ ...activeLineup, ...newData });
    }
    
    alert('✅ Alineación actualizada correctamente');
  } catch (error) {
    console.error('Error updating lineup:', error);
    alert('❌ Error al actualizar la alineación');
  }
};

const duplicateLineup = async (lineup) => {
  if (isPlayerMode || !lineup) return;

  try {
    const newLineup = {
      name: `${lineup.name} (Copia)`,
      formation: lineup.formation,
      match_date: lineup.match_date,
      starters: lineup.starters || [],
      substitutes: lineup.substitutes || [],
      captain_id: lineup.captain_id,
      player_comments: lineup.player_comments || {},
      notes: lineup.notes || ''
    };

    const { data, error } = await supabase
      .from('lineups')
      .insert([newLineup])
      .select()
      .single();

    if (error) throw error;

    // Añadir a la lista y seleccionar
    const updatedLineups = [data, ...lineups];
    setLineups(updatedLineups);
    setActiveLineup(data);
    
    alert('✅ Alineación duplicada correctamente');
  } catch (error) {
    console.error('Error duplicating lineup:', error);
    alert('❌ Error al duplicar la alineación');
  }
};

// COMPONENTE DE MENÚ CONTEXTUAL PARA ALINEACIONES
const LineupContextMenu = ({ lineup, onEdit, onDelete, onDuplicate, onClose }) => {
  return (
    <div className="absolute top-8 right-0 bg-surface border border-border rounded-lg shadow-xl z-50 py-2 min-w-[160px]">
      <button
        onClick={() => { onEdit(lineup); onClose(); }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-surface-2 flex items-center gap-2"
      >
        <Edit3 size={14} />
        Editar
      </button>
      <button
        onClick={() => { onDuplicate(lineup); onClose(); }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-surface-2 flex items-center gap-2"
      >
        <Copy size={14} />
        Duplicar
      </button>
      <hr className="my-1 border-border" />
      <button
        onClick={() => { onDelete(lineup.id); onClose(); }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/10 text-red-500 flex items-center gap-2"
      >
        <Trash2 size={14} />
        Eliminar
      </button>
    </div>
  );
};

// COMPONENTE DE MODAL PARA EDITAR ALINEACIÓN
const EditLineupModal = ({ lineup, onSave, onClose }) => {
  const [editForm, setEditForm] = useState({
    name: lineup?.name || '',
    formation: lineup?.formation || '4-3-3',
    match_date: lineup?.match_date || '',
    notes: lineup?.notes || ''
  });

  const handleSave = () => {
    if (!editForm.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    onSave(lineup.id, editForm);
    onClose();
  };

  if (!lineup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-border max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text">Editar Alineación</h3>
          <button onClick={onClose} className="text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input-field"
              value={editForm.name}
              onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Jornada 12 vs Villamayor"
            />
          </div>

          <div>
            <label className="label">Formación</label>
            <select
              className="input-field"
              value={editForm.formation}
              onChange={e => setEditForm(prev => ({ ...prev, formation: e.target.value }))}
            >
              {FORMATIONS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Fecha del partido</label>
            <input
              type="date"
              className="input-field"
              value={editForm.match_date}
              onChange={e => setEditForm(prev => ({ ...prev, match_date: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Notas</label>
            <textarea
              className="input-field"
              rows={3}
              value={editForm.notes}
              onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales sobre la alineación..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn btn-primary flex-1">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};