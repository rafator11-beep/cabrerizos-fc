/*
MIGRACIÓN SQL:
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  player_id UUID REFERENCES players(id),
  voto TEXT NOT NULL,
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
*/

import { supabase } from '../lib/supabase';

export const useSupabaseFeedback = () => {
  const submitFeedback = async (sessionId, playerId, voto) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({ session_id: sessionId, player_id: playerId, voto });
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return { success: false, error: err };
    }
  };

  const getPlayerFeedback = async (playerId) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, sessions(titulo)')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting feedback:', err);
      return [];
    }
  };

  return { submitFeedback, getPlayerFeedback };
};
