import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, Clock, BarChart3, ChevronRight } from 'lucide-react';

const Sesiones = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef(null);
  const startY = useRef(0);

  const fetchSessions = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSessions([
        { id: 1, titulo: 'Presión tras pérdida', fecha: '23 Abr', duracion: '90min', intensidad: 4 },
        { id: 2, titulo: 'Finalización lateral', fecha: '21 Abr', duracion: '75min', intensidad: 3 },
        { id: 3, titulo: 'Transiciones rápidas', fecha: '19 Abr', duracion: '60min', intensidad: 5 }
      ]);
      setLoading(false);
      setRefreshing(false);
    }, 1500);
  };

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchSessions();
    });
    return () => { active = false; };
  }, []);

  const handleTouchStart = (e) => {
    if (scrollRef.current.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
    }
  };

  const handleTouchMove = (e) => {
    const y = e.touches[0].pageY;
    if (scrollRef.current.scrollTop === 0 && y > startY.current + 80 && !refreshing) {
      setRefreshing(true);
      fetchSessions();
    }
  };

  const IntensityBar = ({ value }) => {
    const colors = ['#00ff87', '#aaff00', '#ffff00', '#ffaa00', '#ff3d3d'];
    return (
      <div className="flex gap-1 h-1 w-full mt-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div 
            key={i} 
            className="flex-1 rounded-full" 
            style={{ backgroundColor: i <= value ? colors[value - 1] : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
    );
  };

  if (loading && !refreshing) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-surface2 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div 
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="h-full overflow-y-auto p-4 space-y-4 no-scrollbar"
      >
        {refreshing && (
          <div className="flex justify-center p-2">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60dvh] text-center gap-4">
            <div className="w-24 h-24 bg-surface2 rounded-full flex items-center justify-center">
              <BarChart3 size={48} className="text-muted" />
            </div>
            <h3 className="font-display text-2xl">Sin sesiones aún</h3>
            <p className="text-muted text-sm max-w-[200px]">¡Crea la primera para empezar a entrenar!</p>
            <button className="mt-4 px-8 py-3 bg-accent text-bg font-bold rounded-full">CREAR SESIÓN</button>
          </div>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="bg-surface2 rounded-2xl p-4 border border-white/5 active:scale-98 transition-transform">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg leading-tight">{s.titulo}</h4>
                  <div className="flex gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-muted font-bold uppercase">
                      <Calendar size={10} /> {s.fecha}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted font-bold uppercase">
                      <Clock size={10} /> {s.duracion}
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted" />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span className="text-muted">Intensidad</span>
                  <span style={{ color: ['#00ff87', '#aaff00', '#ffff00', '#ffaa00', '#ff3d3d'][s.intensidad - 1] }}>Nivel {s.intensidad}</span>
                </div>
                <IntensityBar value={s.intensidad} />
              </div>
            </div>
          ))
        )}
      </div>

      <button className="absolute bottom-6 right-6 w-14 h-14 bg-accent text-bg rounded-full shadow-[0_8px_24px_rgba(0,255,135,0.4)] flex items-center justify-center active:scale-90 transition-transform">
        <Plus size={32} />
      </button>
    </div>
  );
};

export default Sesiones;
