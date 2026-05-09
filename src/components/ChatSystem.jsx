import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageCircle, Send, X, User, ChevronDown, Plus } from 'lucide-react';

export default function ChatSystem() {
  const { user, profile, isRealAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedPlayer = players.find(p => p.id === parseInt(selectedPlayerId));
  
  // Debug mejorado
  useEffect(() => {
    if (selectedPlayerId) {
      console.log('=== DEBUG CHAT ===');
      console.log('selectedPlayerId:', selectedPlayerId, typeof selectedPlayerId);
      console.log('players:', players);
      console.log('selectedPlayer:', selectedPlayer);
      console.log('isRealAdmin:', isRealAdmin);
      console.log('==================');
    }
  }, [selectedPlayerId, selectedPlayer, isRealAdmin, players]);

  useEffect(() => {
    if (isRealAdmin) {
      loadPlayers();
    }
  }, [isRealAdmin]);

  useEffect(() => {
    if (isRealAdmin && players.length > 0) {
      loadConversations();
    }
  }, [isRealAdmin, players]);

  useEffect(() => {
    if (isOpen) {
      if (isRealAdmin) {
        loadConversations();
      }
      loadMessages();
      const subscription = subscribeToMessages();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isOpen, selectedPlayerId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('roster')
        .select('id, name, surname, number, photo_url, auth_profile_id')
        .order('number');
      
      if (error) {
        console.error('Error loading players:', error);
        return;
      }
      
      console.log('Players loaded:', data);
      console.log('First player:', data[0]);
      console.log('First player ID:', data[0]?.id, typeof data[0]?.id);
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadConversations = async () => {
    try {
      // Obtener todos los mensajes donde el admin es sender o receiver
      const { data: allMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!allMessages || allMessages.length === 0) {
        setConversations([]);
        return;
      }

      // Agrupar mensajes por jugador
      const conversationsMap = {};
      
      for (const msg of allMessages) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap[otherUserId]) {
          // Buscar el jugador en roster
          const player = players.find(p => p.auth_profile_id === otherUserId);
          
          if (player) {
            conversationsMap[otherUserId] = {
              player,
              lastMessage: msg.message,
              lastMessageTime: msg.created_at,
              unreadCount: 0
            };
          }
        }
        
        // Contar mensajes no leídos
        if (msg.receiver_id === user.id && !msg.read) {
          conversationsMap[otherUserId].unreadCount++;
        }
      }

      setConversations(Object.values(conversationsMap));
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (isRealAdmin && selectedPlayer) {
        // Admin ve mensajes con un jugador específico
        query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${selectedPlayer.auth_profile_id},receiver_id.eq.${selectedPlayer.auth_profile_id}`);
      } else if (!isRealAdmin) {
        // Jugador ve sus mensajes con el admin
        query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      const { data } = await query;
      setMessages(data || []);

      // Marcar mensajes como leídos
      if (data && data.length > 0) {
        const unreadIds = data
          .filter(m => m.receiver_id === user.id && !m.read)
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadIds);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadMessages();
          if (isRealAdmin) {
            loadConversations();
          }
        }
      )
      .subscribe();

    return channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        sender_id: user.id,
        receiver_id: isRealAdmin ? selectedPlayer?.auth_profile_id : null,
        message: newMessage.trim(),
        read: false,
        created_at: new Date().toISOString()
      };

      await supabase.from('messages').insert([messageData]);
      setNewMessage('');
      
      // Recargar conversaciones para actualizar la lista
      if (isRealAdmin) {
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Error al enviar el mensaje');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-20 md:bottom-8 md:right-24 w-14 h-14 bg-accent text-bg rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-96 h-[600px] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <MessageCircle size={20} className="text-accent" />
          <div>
            <h3 className="text-sm font-black text-white">
              {isRealAdmin ? 'Chat con Jugadores' : 'Chat con Entrenador'}
            </h3>
            {isRealAdmin && selectedPlayer && (
              <p className="text-xs text-muted">{selectedPlayer.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón para nueva conversación */}
          {isRealAdmin && !selectedPlayerId && (
            <button
              onClick={() => setShowAllPlayers(!showAllPlayers)}
              className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center hover:bg-accent/30 transition-all"
              title="Nueva conversación"
            >
              <Plus size={16} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Lista de conversaciones O lista de todos los jugadores */}
      {isRealAdmin && !selectedPlayerId && (
        <div className="flex-1 overflow-y-auto">
          {showAllPlayers ? (
            /* Lista de TODOS los jugadores para iniciar conversación */
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted">Selecciona un jugador ({players.length} disponibles)</p>
                <button 
                  onClick={() => setShowAllPlayers(false)}
                  className="text-xs text-accent hover:underline"
                >
                  Ver conversaciones
                </button>
              </div>
              <div className="space-y-2">
                {players.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      console.log('Clicking player:', p, 'ID:', p.id);
                      const playerId = String(p.id);
                      console.log('Setting playerId to:', playerId);
                      setSelectedPlayerId(playerId);
                      setShowAllPlayers(false);
                    }}
                    className="w-full p-3 bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/40 rounded-xl text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {p.photo_url ? (
                        <img 
                          src={p.photo_url} 
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover bg-transparent"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-black">
                          {p.number}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{p.name}</div>
                        <div className="text-xs text-muted">{p.surname}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : conversations.length === 0 ? (
            /* Sin conversaciones */
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageCircle size={40} className="text-muted opacity-20 mb-3" />
              <p className="text-sm text-muted mb-2">No hay conversaciones aún</p>
              <p className="text-xs text-muted mb-4">Haz clic en el botón + arriba para iniciar una conversación</p>
              <button
                onClick={() => setShowAllPlayers(true)}
                className="px-4 py-2 bg-accent text-bg rounded-xl text-sm font-black hover:scale-105 transition-all"
              >
                Nueva conversación
              </button>
            </div>
          ) : (
            /* Lista de conversaciones existentes */
            <div className="divide-y divide-white/5">
              {conversations.map((conv) => (
                <button
                  key={conv.player.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(String(conv.player.id))}
                  className="w-full p-4 hover:bg-white/5 transition-colors flex items-center gap-3 text-left"
                >
                  {/* Foto del jugador */}
                  <div className="relative flex-shrink-0">
                    {conv.player.photo_url ? (
                      <img 
                        src={conv.player.photo_url} 
                        alt={conv.player.name}
                        className="w-12 h-12 rounded-full object-cover bg-transparent"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center font-black">
                        {conv.player.number}
                      </div>
                    )}
                    {/* Badge de mensajes no leídos */}
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-black text-bg">{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Info de la conversación */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-bold text-white truncate">
                        {conv.player.name} {conv.player.surname}
                      </span>
                      <span className="text-[10px] text-muted ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat activo con jugador seleccionado */}
      {isRealAdmin && selectedPlayerId && selectedPlayer ? (
        <>
          {/* Header del jugador seleccionado */}
          <div className="p-3 border-b border-white/10 bg-accent/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-black">
                  {selectedPlayer.number}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{selectedPlayer.name} {selectedPlayer.surname}</div>
                  <div className="text-xs text-accent">✓ Conectado</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlayerId('')}
                className="text-muted hover:text-white text-xs"
              >
                Cambiar
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle size={40} className="text-muted opacity-20 mb-3" />
                <p className="text-sm text-muted">No hay mensajes aún</p>
                <p className="text-xs text-muted mt-1">Envía el primer mensaje</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMine
                            ? 'bg-accent text-bg'
                            : 'bg-white/5 text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-bg/60' : 'text-muted'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </>
      ) : !isRealAdmin ? (
        /* Messages para jugadores */
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle size={40} className="text-muted opacity-20 mb-3" />
              <p className="text-sm text-muted">No hay mensajes aún</p>
              <p className="text-xs text-muted mt-1">Envía un mensaje al entrenador</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMine
                          ? 'bg-accent text-bg'
                          : 'bg-white/5 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-bg/60' : 'text-muted'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      ) : null}

      {/* Input - SIEMPRE VISIBLE */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1 text-sm"
            placeholder={isRealAdmin && !selectedPlayerId ? "Selecciona un jugador primero..." : "Escribe un mensaje..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isRealAdmin && !selectedPlayerId}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!newMessage.trim() || (isRealAdmin && !selectedPlayerId)}
            className="w-10 h-10 bg-accent text-bg rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
