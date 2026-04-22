import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Dumbbell, Send } from 'lucide-react';

export default function Feedback() {
  const { profile, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [type, setType] = useState('exercise_suggestion');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    let query = supabase.from('feedback').select(`
      id, type, content, created_at,
      profiles ( name, surname, number )
    `).order('created_at', { ascending: false });

    // If not admin, only show own feedback
    if (!isAdmin && profile?.id) {
      query = query.eq('player_id', profile.id);
    }

    const { data, error } = await query;
    if (data) {
      setFeedbacks(data);
    } else {
      // Mock data
      setFeedbacks([
        { id: '1', type: 'exercise_suggestion', content: 'Estaría genial hacer un torneo de fut-tenis el viernes.', profiles: { name: 'Luis', surname: 'Campos', number: 7 }, created_at: new Date().toISOString() },
        { id: '2', type: 'session_comment', content: 'Me costó un poco entender la presión 4-3-3 de ayer, necesito repasarlo.', profiles: { name: 'Diego', surname: 'Soto', number: 4 }, created_at: new Date().toISOString() }
      ]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !profile?.id) return;

    const newFeedback = {
      player_id: profile.id,
      type,
      content
    };

    const { data, error } = await supabase.from('feedback').insert([newFeedback]).select(`
      id, type, content, created_at,
      profiles ( name, surname, number )
    `).single();

    if (data) {
      setFeedbacks([data, ...feedbacks]);
      setContent('');
    } else {
      // Mock insert
      const mock = { ...newFeedback, id: Date.now().toString(), profiles: { name: profile.name, surname: profile.surname, number: 10 }, created_at: new Date().toISOString() };
      setFeedbacks([mock, ...feedbacks]);
      setContent('');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 800, fontSize: 17 }}>Comentarios y Sugerencias</span>
      </div>

      {!isAdmin && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>¿Tienes alguna sugerencia para el próximo entreno?</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button 
                type="button"
                onClick={() => setType('exercise_suggestion')}
                style={{ 
                  flex: 1, padding: '10px', borderRadius: 8, border: '2px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  borderColor: type === 'exercise_suggestion' ? '#0057ff' : '#e2e6ed',
                  background: type === 'exercise_suggestion' ? '#eef3ff' : 'white',
                  color: type === 'exercise_suggestion' ? '#0057ff' : '#4a5568',
                  fontWeight: 600
                }}
              >
                <Dumbbell size={16} /> Sugerir Ejercicio
              </button>
              <button 
                type="button"
                onClick={() => setType('session_comment')}
                style={{ 
                  flex: 1, padding: '10px', borderRadius: 8, border: '2px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  borderColor: type === 'session_comment' ? '#00b96b' : '#e2e6ed',
                  background: type === 'session_comment' ? '#ecfdf5' : 'white',
                  color: type === 'session_comment' ? '#059669' : '#4a5568',
                  fontWeight: 600
                }}
              >
                <MessageSquare size={16} /> Comentar Entreno
              </button>
            </div>
            
            <textarea 
              className="input-field" 
              style={{ minHeight: 80, resize: 'vertical', marginBottom: 10 }}
              placeholder={type === 'exercise_suggestion' ? 'Me gustaría practicar tiros a puerta desde fuera del área...' : 'El entrenamiento de ayer me pareció muy intenso...'}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <Send size={14} /> Enviar al cuerpo técnico
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#4a5568' }}>
        {isAdmin ? 'Buzón del equipo' : 'Tus mensajes enviados'}
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : feedbacks.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#96a0b5' }}>
          No hay comentarios todavía.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {feedbacks.map(f => (
            <div key={f.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f5f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                    #{f.profiles?.number || '-'}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{f.profiles?.name} {f.profiles?.surname}</span>
                  <span style={{ fontSize: 10, color: '#96a0b5' }}>{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: f.type === 'exercise_suggestion' ? '#eef3ff' : '#ecfdf5',
                  color: f.type === 'exercise_suggestion' ? '#0057ff' : '#059669'
                }}>
                  {f.type === 'exercise_suggestion' ? <><Dumbbell size={10}/> Sugerencia</> : <><MessageSquare size={10}/> Comentario</>}
                </span>
              </div>
              <div style={{ color: '#111', fontSize: 13, lineHeight: '1.5' }}>
                {f.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
