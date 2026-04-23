import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, ShieldAlert, FileText, X } from 'lucide-react';
import { PlayerCard } from '../components';
import { useAppContext } from '../context/AppContext';

const ElEquipo = () => {
  const { rol } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const players = [
    { id: 1, nombre: 'Rafa Torres', dorsal: '10', posicion: 'MCO', estado: 'ok', foto: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, nombre: 'Dani Gómez', dorsal: '1', posicion: 'POR', estado: 'duda', foto: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, nombre: 'Luis M.', dorsal: '4', posicion: 'DFC', estado: 'ok', foto: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, nombre: 'Carlos S.', dorsal: '7', posicion: 'ED', estado: 'lesion', foto: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, nombre: 'Javi R.', dorsal: '9', posicion: 'DC', estado: 'ok', foto: 'https://i.pravatar.cc/150?u=5' },
    { id: 6, nombre: 'Miki', dorsal: '6', posicion: 'MCD', estado: 'ok', foto: 'https://i.pravatar.cc/150?u=6' }
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.dorsal.includes(search);
      const matchesFilter = filter === 'Todos' || p.posicion.includes(filter);
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const POSITIONS = ['Todos', 'POR', 'DEF', 'MCD', 'MCO', 'DC'];

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Search and Filter */}
      <div className="p-4 space-y-4 sticky top-0 bg-bg z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o dorsal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface2 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/30 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {POSITIONS.map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filter === p ? 'bg-accent text-bg' : 'bg-surface2 text-muted border border-white/5'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-24">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(p => (
            <PlayerCard 
              key={p.id} 
              jugador={p} 
              onLongPress={(player) => setSelectedPlayer(player)}
            />
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 bg-surface2 rounded-full flex items-center justify-center">
              <Search size={32} className="text-muted" />
            </div>
            <p className="text-muted text-sm font-bold uppercase tracking-widest">No se encontraron jugadores</p>
          </div>
        )}
      </div>

      {/* FAB - Only for Coach */}
      {rol === 'coach' && (
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-bg rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-20">
          <Plus size={32} />
        </button>
      )}

      {/* Bottom Sheet */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedPlayer(null)}>
          <div 
            className="bg-surface rounded-t-[32px] p-6 pb-12 space-y-6 border-t border-white/10 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto" />
            
            <div className="flex items-center gap-4">
              <img src={selectedPlayer.foto} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h3 className="font-display text-2xl leading-none">{selectedPlayer.nombre}</h3>
                <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1">{selectedPlayer.posicion} · #{selectedPlayer.dorsal}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center gap-3 w-full p-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors">
                <Edit2 size={18} className="text-accent" />
                <span className="font-bold text-sm uppercase">Editar Datos</span>
              </button>
              <button className="flex items-center gap-3 w-full p-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors">
                <ShieldAlert size={18} className="text-warning" />
                <span className="font-bold text-sm uppercase">Marcar Lesión</span>
              </button>
              <button className="flex items-center gap-3 w-full p-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors">
                <FileText size={18} className="text-info" />
                <span className="font-bold text-sm uppercase">Añadir Nota</span>
              </button>
            </div>

            <button 
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-4 bg-surface2 text-muted font-bold rounded-2xl"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElEquipo;
