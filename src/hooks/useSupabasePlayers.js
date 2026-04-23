/*
MIGRACIÓN SQL:
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dorsal TEXT,
  posicion TEXT,
  foto TEXT,
  estado TEXT DEFAULT 'ok',
  updated_at TIMESTAMPTZ DEFAULT now()
);
*/

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const useSupabasePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { online } = useAppContext();

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('dorsal', { ascending: true });
      
      if (error) throw error;
      setPlayers(data);
      localStorage.setItem('cabrerizos_players_cache', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching players:', err);
      const cached = localStorage.getItem('cabrerizos_players_cache');
      if (cached) setPlayers(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();

    const subscription = supabase
      .channel('players_changes')
      .on('postgres_changes', { event: '*', table: 'players' }, fetchPlayers)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { players, loading, refresh: fetchPlayers };
};
