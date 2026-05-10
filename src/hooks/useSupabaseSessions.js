import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Apunta a la tabla `trainings` que usa el resto de la app.
// La tabla `sessions` del esquema antiguo está descontinuada.
export const useSupabaseSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setSessions(data);
      localStorage.setItem('cabrerizos_sessions_cache', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching sessions:', err);
      const cached = localStorage.getItem('cabrerizos_sessions_cache');
      if (cached) setSessions(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    const subscription = supabase
      .channel('trainings_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trainings' }, fetchSessions)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  return { sessions, loading, refresh: fetchSessions };
};
