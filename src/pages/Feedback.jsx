import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  MessageSquare, Send, Star, Activity, CheckCircle,
  User, ClipboardList, Lightbulb
} from 'lucide-react';

export default function Feedback() {
  const { user, isRealAdmin, viewAsPlayer } = useAuth();
  const isPlayerMode = !isRealAdmin || viewAsPlayer;
  const [tab, setTab] = useState('chat');

  // ── Chat ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Feedback / Valoraciones ───────────────────────────────────────────
  const [training, setTraining] = useState(null);
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState('');
  const [proposal, setProposal] = useState('');
  const [myScore, setMyScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Admin only
  const [playerScores, setPlayerScores] = useState([]);
  const [proposals, setProposals] = useState([]);

  // ── Load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    loadMessages();
    loadTraining();

    const channel = supabase
      .channel('team-chat-v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => {
          const next = [...prev, payload.new].slice(-60);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          return next;
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  useEffect(() => {
    if (tab === 'chat') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 80);
    }
  }, [tab]);

  const loadMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('id, message, created_at, sender_id, sender:sender_id(name, photo_url)')
      .is('receiver_id', null)
      .order('created_at', { ascending: true })
      .limit(60);
    if (data) {
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 80);
    }
  };

  const loadTraining = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data: tr } = await supabase
      .from('trainings')
      .select('id, title, date')
      .lte('date', today)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!tr) return;
    setTraining(tr);

    if (isPlayerMode) {
      const { data: sc } = await supabase
        .from('training_scores')
        .select('*')
        .eq('training_id', tr.id)
        .eq('player_id', user.id)
        .maybeSingle();
      if (sc) { setMyScore(sc); setScore(sc.score); setComment(sc.comment || ''); }
    } else {
      const [{ data: scores }, { data: props }] = await Promise.all([
        supabase.from('training_scores')
          .select('score, comment, player:player_id(name, photo_url)')
          .eq('training_id', tr.id)
          .order('score', { ascending: false }),
        supabase.from('feedback')
          .select('content, player:player_id(name)')
          .eq('session_id', tr.id)
          .order('created_at', { ascending: false }),
      ]);
      setPlayerScores(scores || []);
      setProposals(props || []);
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setNewMessage('');
    await supabase.from('messages').insert([{ sender_id: user.id, message: text, receiver_id: null }]);
    setSending(false);
    inputRef.current?.focus();
  };

  const submitFeedback = async () => {
    if (!training || saving) return;
    setSaving(true);
    try {
      const payload = { training_id: training.id, player_id: user.id, score, comment };
      if (myScore) {
        await supabase.from('training_scores').update({ score, comment }).eq('id', myScore.id);
      } else {
        const { data } = await supabase.from('training_scores').insert([payload]).select().single();
        setMyScore(data);
      }
      if (proposal.trim()) {
        await supabase.from('feedback').insert([{
          player_id: user.id, type: 'exercise_suggestion',
          content: proposal, session_id: training.id,
        }]);
        setProposal('');
      }
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const scoreColor = (s) => s >= 8 ? '#10b981' : s >= 6 ? '#f59e0b' : '#ef4444';
  const avgScore = playerScores.length
    ? (playerScores.reduce((acc, s) => acc + s.score, 0) / playerScores.length).toFixed(1)
    : null;

  // ── UI ────────────────────────────────────────────────────────────────
  const tabBtn = (id, icon, label) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
        tab === id
          ? 'text-accent border-accent bg-accent/5'
          : 'text-muted/60 border-transparent hover:text-muted hover:border-white/10'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      {/* ── Tab Bar ── */}
      <div className="flex-shrink-0 flex border-b border-white/5 bg-surface/40 px-2">
        {tabBtn('chat', <MessageSquare size={12} />, 'Chat Equipo')}
        {tabBtn(
          'feedback',
          isPlayerMode ? <Star size={12} /> : <ClipboardList size={12} />,
          isPlayerMode ? 'Valorar Sesión' : 'Valoraciones'
        )}
      </div>

      {/* ══════════════════════════════════════
          CHAT TAB
      ══════════════════════════════════════ */}
      {tab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                <MessageSquare size={40} />
                <p className="text-xs font-black uppercase tracking-widest">
                  {isRealAdmin ? 'Escribe el primer mensaje al equipo' : 'Aún no hay mensajes del mister'}
                </p>
              </div>
            ) : (
              messages.map((m, i) => {
                const isMe = m.sender_id === user?.id;
                const prevSame = i > 0 && messages[i - 1].sender_id === m.sender_id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${prevSame ? 'mt-0.5' : 'mt-3'}`}>
                    <div className="flex flex-col max-w-[80%]">
                      {!isMe && !prevSame && (
                        <div className="flex items-center gap-1.5 mb-1 ml-1">
                          {m.sender?.photo_url ? (
                            <img src={m.sender.photo_url} className="w-5 h-5 rounded-full object-cover border border-white/10" alt="" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                              <User size={9} className="text-muted" />
                            </div>
                          )}
                          <span className="text-[9px] font-black uppercase text-white/40">{m.sender?.name || 'Usuario'}</span>
                        </div>
                      )}
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-accent text-bg rounded-tr-none font-medium'
                          : 'bg-surface-2 text-white rounded-tl-none border border-white/5'
                      }`}>
                        {m.message}
                        <div className={`text-[7px] mt-1 font-black uppercase opacity-40 ${isMe ? 'text-left' : 'text-right'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex-shrink-0 flex gap-2 p-3 border-t border-white/5 bg-surface/80 backdrop-blur-xl"
          >
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={isRealAdmin ? 'Mensaje al equipo...' : 'Escribe al mister o al equipo...'}
              className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-12 h-12 rounded-2xl bg-accent text-bg flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-lg shadow-accent/20 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════
          FEEDBACK TAB — jugador
      ══════════════════════════════════════ */}
      {tab === 'feedback' && isPlayerMode && (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-lg mx-auto p-4 space-y-4 pb-8">
            {training ? (
              <>
                {/* Rating card */}
                <div className="bg-surface rounded-2xl border border-white/5 p-5 space-y-4">
                  <div>
                    <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-0.5">Última sesión</div>
                    <h2 className="text-base font-black text-white">{training.title}</h2>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-white/60">¿Cómo ha ido?</span>
                      <span className="text-2xl font-black" style={{ color: scoreColor(score) }}>{score}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          onClick={() => setScore(n)}
                          className="flex-1 h-9 rounded-xl text-[10px] font-black transition-all active:scale-90"
                          style={{
                            backgroundColor: score >= n ? scoreColor(n) : 'rgba(255,255,255,0.05)',
                            color: score >= n ? '#fff' : 'rgba(255,255,255,0.2)',
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-muted/50 focus:border-accent/50 outline-none transition-all resize-none"
                    placeholder="Cómo te has sentido... (cansancio, molestias, sensaciones...)"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Proposal card */}
                <div className="bg-surface rounded-2xl border border-white/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={14} className="text-emerald-400" />
                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Tu Voz</div>
                  </div>
                  <h2 className="text-base font-black text-white">¿Qué quieres entrenar?</h2>
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-muted/50 focus:border-emerald-400/50 outline-none transition-all resize-none"
                    placeholder="Propón un ejercicio, situación de juego o aspecto a mejorar..."
                    value={proposal}
                    onChange={e => setProposal(e.target.value)}
                    rows={2}
                  />
                </div>

                <button
                  onClick={submitFeedback}
                  disabled={saving || savedOk}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    savedOk ? 'bg-emerald-500 text-bg' : 'bg-accent text-bg shadow-xl shadow-accent/20'
                  }`}
                >
                  {savedOk ? <><CheckCircle size={16} /> ¡Guardado!</> : <><Send size={16} /> Enviar Feedback</>}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                <Activity size={36} />
                <p className="text-xs font-black uppercase tracking-widest text-center">No hay entrenamiento reciente para valorar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          FEEDBACK TAB — admin
      ══════════════════════════════════════ */}
      {tab === 'feedback' && !isPlayerMode && (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">
            {training ? (
              <>
                {/* Summary */}
                <div className="bg-surface rounded-2xl border border-white/5 p-5">
                  <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">Resumen</div>
                  <h2 className="text-base font-black text-white mb-4">{training.title}</h2>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-black" style={{ color: avgScore ? scoreColor(parseFloat(avgScore)) : '#8a99ae' }}>
                        {avgScore ?? '—'}
                      </div>
                      <div className="text-[8px] font-black text-muted uppercase tracking-widest mt-0.5">Media</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{playerScores.length}</div>
                      <div className="text-[8px] font-black text-muted uppercase tracking-widest mt-0.5">Valoraciones</div>
                    </div>
                    {proposals.length > 0 && (
                      <div className="text-center">
                        <div className="text-3xl font-black text-emerald-400">{proposals.length}</div>
                        <div className="text-[8px] font-black text-muted uppercase tracking-widest mt-0.5">Propuestas</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player scores */}
                {playerScores.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-black text-muted uppercase tracking-[0.2em] px-1">Valoraciones individuales</h3>
                    {playerScores.map((s, i) => (
                      <div key={i} className="bg-surface rounded-xl border border-white/5 p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                          {s.player?.photo_url
                            ? <img src={s.player.photo_url} className="w-full h-full object-cover" alt="" />
                            : <User size={14} className="text-muted" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-white">{s.player?.name || 'Jugador'}</div>
                          {s.comment && <div className="text-[10px] text-muted/80 truncate mt-0.5">{s.comment}</div>}
                        </div>
                        <div className="text-xl font-black flex-shrink-0 w-8 text-center" style={{ color: scoreColor(s.score) }}>
                          {s.score}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Proposals */}
                {proposals.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                      <Lightbulb size={10} /> Propuestas de los jugadores
                    </h3>
                    {proposals.map((p, i) => (
                      <div key={i} className="bg-surface rounded-xl border border-emerald-500/15 p-4">
                        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">{p.player?.name || 'Jugador'}</div>
                        <p className="text-xs text-white/80 leading-relaxed">{p.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {playerScores.length === 0 && proposals.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-25">
                    <ClipboardList size={40} />
                    <p className="text-xs font-black uppercase tracking-widest text-center">Los jugadores aún no han enviado feedback</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-25">
                <Activity size={36} />
                <p className="text-xs font-black uppercase tracking-widest text-center">No hay entrenamiento reciente</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
