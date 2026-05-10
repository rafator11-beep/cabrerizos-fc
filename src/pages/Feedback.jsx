import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Dumbbell, Send, Star, CheckCircle, User } from 'lucide-react';

export default function Feedback() {
  const { profile, user, isRealAdmin, viewAsPlayer } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;

  // Feedback / suggestions
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [type, setType] = useState('exercise_suggestion');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Training rating
  const [training, setTraining] = useState(null);
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState('');
  const [myScore, setMyScore] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSaved, setRatingSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchFeedbacks();
    loadLatestTraining();
  }, [user]);

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    let query = supabase
      .from('feedback')
      .select('id, type, content, created_at, player_id, profiles(name, surname, number, photo_url)')
      .order('created_at', { ascending: false });

    if (isPlayerMode && profile?.id) {
      query = query.eq('player_id', profile.id);
    }

    const { data } = await query;
    setFeedbacks(data || []);
    setFeedbackLoading(false);
  };

  const loadLatestTraining = async () => {
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
      if (user) {
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
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!content.trim() || !profile?.id || sending) return;
    setSending(true);
    const { data } = await supabase
      .from('feedback')
      .insert([{ player_id: profile.id, type, content }])
      .select('id, type, content, created_at, player_id, profiles(name, surname, number, photo_url)')
      .single();

    if (data) {
      setFeedbacks([data, ...feedbacks]);
    }
    setContent('');
    setSent(true);
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  const submitRating = async () => {
    if (!training || ratingLoading) return;
    setRatingLoading(true);
    const payload = { training_id: training.id, player_id: user.id, score, comment };
    if (myScore) {
      await supabase.from('training_scores').update({ score, comment }).eq('id', myScore.id);
    } else {
      await supabase.from('training_scores').insert([payload]);
    }
    setRatingSaved(true);
    setRatingLoading(false);
    loadLatestTraining();
    setTimeout(() => setRatingSaved(false), 3000);
  };

  const scoreColor = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';

  const typeLabel = (t) => {
    if (t === 'exercise_suggestion') return 'Sugerencia';
    if (t === 'session_comment') return 'Comentario';
    return t;
  };

  const typeColor = (t) => {
    if (t === 'exercise_suggestion') return '#6366f1';
    if (t === 'session_comment') return '#10b981';
    return '#94a3b8';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
          <MessageSquare size={22} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Feedback & Propuestas</h1>
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Tu opinión cuenta para mejorar</p>
        </div>
      </div>

      {/* ── VALORACIÓN ENTRENAMIENTO (jugadores) ─── */}
      {isPlayerMode && training && (
        <div className="bg-surface rounded-3xl border border-white/5 p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
            <Star size={72} className="fill-white" />
          </div>
          <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">Valoración del Entrenamiento</div>
          <h2 className="text-base font-black text-white mb-4">{training.title}</h2>

          <div className="mb-4">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-bold text-white/60">¿Qué te ha parecido la sesión?</span>
              <span className="text-3xl font-black" style={{ color: scoreColor }}>{score}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  className="flex-1 h-9 rounded-xl text-xs font-black transition-all active:scale-90"
                  style={{
                    backgroundColor: score >= n ? (n >= 8 ? '#10b981' : n >= 6 ? '#f59e0b' : '#ef4444') : 'rgba(255,255,255,0.05)',
                    color: score >= n ? '#fff' : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="w-full bg-black/20 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder-muted focus:border-accent outline-none mb-3"
            placeholder="¿Cómo te has sentido? (cansancio, molestias, sensaciones...)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
          />

          <button
            onClick={submitRating}
            disabled={ratingLoading || ratingSaved}
            className={`w-full py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 transition-all ${
              ratingSaved ? 'bg-emerald-500 text-bg' : 'bg-accent text-bg shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {ratingSaved ? <><CheckCircle size={16} /> ¡Valoración enviada!</> : <><Star size={16} /> Enviar Valoración</>}
          </button>
        </div>
      )}

      {/* ── FORMULARIO DE SUGERENCIAS (jugadores) ─── */}
      {isPlayerMode && (
        <div className="bg-surface rounded-3xl border border-white/5 p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
            <Dumbbell size={72} />
          </div>
          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Propuesta al Cuerpo Técnico</div>
          <h2 className="text-base font-black text-white mb-4">¿Qué quieres trabajar?</h2>

          <form onSubmit={handleSubmitFeedback}>
            {/* Type selector */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setType('exercise_suggestion')}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: type === 'exercise_suggestion' ? '#6366f1' : 'rgba(255,255,255,0.04)',
                  color: type === 'exercise_suggestion' ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${type === 'exercise_suggestion' ? '#6366f1' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <Dumbbell size={12} /> Ejercicio
              </button>
              <button
                type="button"
                onClick={() => setType('session_comment')}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: type === 'session_comment' ? '#10b981' : 'rgba(255,255,255,0.04)',
                  color: type === 'session_comment' ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${type === 'session_comment' ? '#10b981' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <MessageSquare size={12} /> Comentario
              </button>
            </div>

            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder-muted focus:border-indigo-400 outline-none mb-3"
              placeholder={
                type === 'exercise_suggestion'
                  ? 'Me gustaría practicar tiros a puerta, rondos, pressing...'
                  : 'El entrenamiento de ayer me pareció muy intenso...'
              }
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
            />

            <button
              type="submit"
              disabled={!content.trim() || sending || sent}
              className={`w-full py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 transition-all ${
                sent
                  ? 'bg-emerald-500 text-bg'
                  : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-40'
              }`}
            >
              {sent ? <><CheckCircle size={16} /> ¡Enviado!</> : <><Send size={16} /> Enviar al Cuerpo Técnico</>}
            </button>
          </form>
        </div>
      )}

      {/* ── BUZÓN DE FEEDBACK (admin + jugadores ven historial) ─── */}
      <div className="bg-surface rounded-3xl border border-white/5 p-5 shadow-2xl">
        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">
          {isPlayerMode ? 'Tus Propuestas Enviadas' : 'Buzón del Equipo'}
        </div>
        <h2 className="text-base font-black text-white mb-4">
          {isPlayerMode ? 'Historial' : 'Propuestas y Comentarios'}
        </h2>

        {feedbackLoading ? (
          <div className="text-xs text-muted font-bold uppercase tracking-widest text-center py-6">Cargando...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-xs text-muted font-bold uppercase tracking-widest text-center py-8 opacity-50">
            {isPlayerMode ? 'Aún no has enviado propuestas' : 'No hay mensajes todavía'}
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map(f => (
              <div key={f.id} className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Player photo */}
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                      {f.profiles?.photo_url ? (
                        <img src={f.profiles.photo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <User size={12} className="text-muted" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-black text-white">
                        {f.profiles?.name} {f.profiles?.surname}
                      </span>
                      {f.profiles?.number && (
                        <span className="text-[9px] text-muted font-bold ml-1">#{f.profiles.number}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: `${typeColor(f.type)}20`, color: typeColor(f.type) }}
                    >
                      {typeLabel(f.type)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/80 leading-relaxed mb-1">{f.content}</p>
                <span className="text-[9px] text-muted font-bold">
                  {new Date(f.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
