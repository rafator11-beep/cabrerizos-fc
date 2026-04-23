/*
MIGRACIÓN SQL:
CREATE TABLE tactics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT,
  tokens JSONB,
  lineas JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
*/

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseTactics = () => {
  const saveTactic = async (titulo, tokens, lineas) => {
    try {
      const { data, error } = await supabase
        .from('tactics')
        .insert({ titulo, tokens, lineas });
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error saving tactic:', err);
      return { success: false, error: err };
    }
  };

  const fetchTactics = async () => {
    try {
      const { data, error } = await supabase
        .from('tactics')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching tactics:', err);
      return [];
    }
  };

  return { saveTactic, fetchTactics };
};
