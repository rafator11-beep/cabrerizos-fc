/*
MIGRACIÓN SQL:
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  duracion TEXT,
  intensidad INTEGER CHECK (intensidad >= 1 AND intensidad <= 5),
  lugar TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
*/

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const useSupabaseSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { online } = useAppContext();

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('fecha', { ascending: false });
      
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
      .channel('sessions_changes')
      .on('postgres_changes', { event: '*', table: 'sessions' }, fetchSessions)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { sessions, loading, refresh: fetchSessions };
};
