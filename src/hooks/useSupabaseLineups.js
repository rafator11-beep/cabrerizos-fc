/*
MIGRACIÓN SQL:
CREATE TABLE lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formacion TEXT NOT NULL,
  posiciones JSONB NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
*/

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseLineups = () => {
  const [lineup, setLineup] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestLineup = async () => {
    try {
      const { data, error } = await supabase
        .from('lineups')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setLineup(data);
    } catch (err) {
      console.error('Error fetching lineup:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveLineup = async (formacion, posiciones) => {
    try {
      const { data, error } = await supabase
        .from('lineups')
        .upsert({ formacion, posiciones, fecha: new Date().toISOString().split('T')[0] });
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error saving lineup:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchLatestLineup();
  }, []);

  return { lineup, loading, saveLineup, refresh: fetchLatestLineup };
};
