import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Star, Send, MessageSquare, Plus, Activity, CheckCircle } from 'lucide-react';

export default function Feedback() {
  const { profile, user } = useAuth();
  const [training, setTraining] = useState(null);
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState('');
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [myScore, setMyScore] = useState(null);

  useEffect(() => {
    loadLatestTraining();
  }, [user]);

  const loadLatestTraining = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('trainings')
      .select('*')
      .lte('date', today)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setTraining(data);
      const { data: sc } = await supabase
        .from('training_scores')
        .select('*')
        .eq('training_id', data.id)
        .eq('player_id', user.id)
        .maybeSingle();
      if (sc) {
        setMyScore(sc);
        setScore(sc.score);
        setComment(sc.comment || '');
      }
    }
  };

  const submitFeedback = async () => {
    if (!training || loading) return;
    setLoading(true);
    try {
      const payload = { 
        training_id: training.id, 
        player_id: user.id, 
        score, 
        comment 
      };
      
      if (myScore) {
        await supabase.from('training_scores').update({ score, comment }).eq('id', myScore.id);
      } else {
        await supabase.from('training_scores').insert([payload]);
      }
      
      if (proposal.trim()) {
        await supabase.from('feedback').insert([{
          player_id: user.id,
          type: 'exercise_suggestion',
          content: proposal,
          session_id: training.id
        }]);
      }

      setSaved(true);
      setProposal('');
      setTimeout(() => setSaved(false), 3000);
      loadLatestTraining();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const scoreColor = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Feedback & Propuestas</h1>
          <p className="text-xs text-muted uppercase tracking-widest font-bold">Tu opinión cuenta para mejorar</p>
        </div>
      </div>

      {training ? (
        <div className="bg-surface rounded-3xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Star size={80} className="fill-white" />
          </div>

          <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Valoración del Entrenamiento</div>
          <h2 className="text-lg font-black text-white mb-6">{training.title}</h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-bold text-white/70">¿Qué te ha parecido la sesión?</span>
                <span className="text-3xl font-black" style={{ color: scoreColor }}>{score}</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setScore(n)}
                    className="flex-1 h-10 rounded-xl text-xs font-black transition-all active:scale-90"
                    style={{
                      backgroundColor: score >= n ? (n >= 8 ? '#10b981' : n >= 6 ? '#f59e0b' : '#ef4444') : 'rgba(255,255,255,0.05)',
                      color: score >= n ? '#fff' : 'rgba(255,255,255,0.3)',
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-muted focus:border-accent outline-none transition-all"
              placeholder="¿Cómo te has sentido? (cansancio, molestias, sensaciones...)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl border border-white/5 p-10 text-center text-muted text-xs font-bold uppercase tracking-widest">
          No hay entrenamientos recientes para valorar
        </div>
      )}

      <div className="bg-surface rounded-3xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Plus size={80} />
        </div>
        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Propuesta de Ejercicios</div>
        <h2 className="text-lg font-black text-white mb-4">¿Qué te gustaría entrenar?</h2>
        <textarea
          className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-muted focus:border-emerald-400 outline-none transition-all"
          placeholder="Describe un ejercicio o aspecto que te gustaría trabajar en las próximas sesiones..."
          value={proposal}
          onChange={e => setProposal(e.target.value)}
          rows={3}
        />
      </div>

      <button 
        onClick={submitFeedback}
        disabled={loading || saved}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all ${saved ? 'bg-emerald-500 text-bg' : 'bg-accent text-bg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95'}`}
      >
        {saved ? <><CheckCircle size={18} /> ¡Enviado correctamente!</> : <><Send size={18} /> Guardar Feedback</>}
      </button>
    </div>
  );
}
