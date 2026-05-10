import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function FloatingChat() {
  const { user, profile, isRealAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
          loadMessages();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, message, created_at, sender_id,
        sender:sender_id(name, photo_url)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id},receiver_id.is.null`)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) setMessages(data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      await supabase.from('messages').insert([{
        sender_id: user.id,
        message: msgText,
        receiver_id: null 
      }]);
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-20 md:bottom-8 md:right-28 z-[90] w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 border border-white/10 ${isOpen ? 'bg-rose-500 text-white' : 'bg-accent text-bg shadow-accent/20'}`}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-36 right-4 md:bottom-24 md:right-28 z-[90] w-[320px] h-[450px] bg-surface border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-white/5 bg-accent/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Chat del Equipo</h3>
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Mister Online</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-[#070b10]">
            {messages.length === 0 ? (
              <div className="text-center text-[10px] text-muted font-bold uppercase tracking-widest mt-10 opacity-50">
                No hay mensajes aún
              </div>
            ) : (
              messages.map(m => {
                const isMe = m.sender_id === user.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col max-w-[85%]">
                      {!isMe && (
                        <div className="flex items-center gap-1 mb-1 ml-1">
                          <div className="w-4 h-4 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/5">
                            {m.sender?.photo_url ? (
                              <img src={m.sender.photo_url} className="w-full h-full object-cover" />
                            ) : (
                              <User size={8} className="text-muted" />
                            )}
                          </div>
                          <span className="text-[8px] font-black uppercase text-white/40">{m.sender?.name || 'Usuario'}</span>
                        </div>
                      )}
                      <div className={`px-3 py-2 rounded-2xl text-xs ${isMe ? 'bg-accent text-bg rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm'}`}>
                        <p className="font-medium leading-tight">{m.message}</p>
                        <div className={`text-[7px] mt-1 font-black uppercase opacity-40 text-right`}>
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

          <form onSubmit={sendMessage} className="p-3 bg-surface border-t border-white/5 flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-muted focus:outline-none focus:border-accent"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-xl bg-accent text-bg flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
