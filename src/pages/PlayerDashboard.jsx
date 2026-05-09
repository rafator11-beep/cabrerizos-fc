import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Star, Send, Calendar, Clock, AlertCircle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';

const GRUPO_LABELS = {
  red:    { label: 'Equipo A',   peto: 'Peto Rojo',     bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  yellow: { label: 'Equipo B',   peto: 'Peto Amarillo',  bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  green:  { label: 'Equipo C',   peto: 'Peto Verde',     bg: '#dcfce7', color: '#166534', border: '#86efac' },
  blue:   { label: 'Equipo D',   peto: 'Peto Azul',      bg: '#dbeafe', color: '#1e3a8a', border: '#93c5fd' },
  pink:   { label: 'Comodines',  peto: 'Sin Peto',       bg: '#fce7f3', color: '#831843', border: '#f9a8d4' },
};

export default function PlayerDashboard() {
  const { user, profile } = useAuth();
  const [training, setTraining]     = useState(null);
  const [roster, setRoster]         = useState(null);
  const [assignments, setAssignments] = useState([]); // [{exerciseName, group}]
  const [myScore, setMyScore]       = useState(null);
  const [loading, setLoading]       = useState(true);

  // Feedback form
  const [score, setScore]     = useState(7);
  const [comment, setComment] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [showAI, setShowAI]   = useState(false);

  useEffect(() => {
    if (user?.id) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      // 1. Get my roster entry
      const { data: r } = await supabase
        .from('roster').select('*').eq('auth_profile_id', user.id).maybeSingle();
      setRoster(r);

      // 2. Get today's or most-recent training
      const today = new Date().toISOString().split('T')[0];
      let { data: tr } = await supabase
        .from('trainings').select('*')
        .lte('date', today)
        .order('date', { ascending: false })
        .limit(1).maybeSingle();
      if (!tr) {
        const { data: next } = await supabase
          .from('trainings').select('*')
          .order('date', { ascending: true })
          .limit(1).maybeSingle();
        tr = next;
      }
      setTraining(tr);

      // 3. Find my group assignments across exercises
      if (tr && r) {
        const myGroups = [];
        for (const ex of (tr.exercises || [])) {
          const ga = ex.group_assignments || {};
          for (const [groupKey, members] of Object.entries(ga)) {
            if (members.includes(r.id)) {
              myGroups.push({ exerciseName: ex.name, group: groupKey });
            }
          }
        }
        setAssignments(myGroups);
      }

      // 4. Check if I already left feedback
      if (tr) {
        const { data: sc } = await supabase
          .from('training_scores')
          .select('*')
          .eq('training_id', tr.id)
          .eq('player_id', user.id)
          .maybeSingle();
        setMyScore(sc);
        if (sc) { setScore(sc.score); setComment(sc.comment || ''); }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitFeedback = async () => {
    if (!training || saving) return;
    setSaving(true);
    try {
      const payload = {
        training_id: training.id,
        player_id: user.id,
        score,
        comment,
      };
      if (myScore) {
        await supabase.from('training_scores').update({ score, comment }).eq('id', myScore.id);
      } else {
        const { data } = await supabase.from('training_scores').insert([payload]).select().single();
        setMyScore(data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 10, color: '#96a0b5' }}>
        <div style={{ fontSize: 32 }}>⚽</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Cargando tu sesión...</div>
      </div>
    );
  }

  const scoreColor = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';

  // AI Analysis Functions
  const getMainImprovement = () => {
    const stats = roster?.stats || {};
    const position = roster?.position || '';
    
    if (position.includes('Portero')) {
      return "Mejorar posicionamiento y reflejos. Practicar paradas a balones altos y salidas del área.";
    }
    if (position.includes('Defensa') || position.includes('Central') || position.includes('Lateral')) {
      if (stats.yellow_cards > 3) {
        return "Reducir tarjetas amarillas mejorando el timing en las entradas y la disciplina táctica.";
      }
      return "Mejorar salida de balón y pase largo. Trabajar marcaje en balones aéreos.";
    }
    if (position.includes('Medio')) {
      return "Aumentar creatividad y precisión en pases. Trabajar visión de juego y último pase.";
    }
    if (position.includes('Delantero') || position.includes('Extremo')) {
      return "Mejorar definición y movimientos en el área. Practicar remates de primera y cabeceo.";
    }
    return "Continuar desarrollando habilidades técnicas básicas y comprensión táctica del juego.";
  };

  const getRecommendedExercise = () => {
    const position = roster?.position || '';
    
    if (position.includes('Portero')) {
      return "Circuito de agilidad con conos + paradas reflejas. 3 series de 8 repeticiones.";
    }
    if (position.includes('Defensa') || position.includes('Central')) {
      return "Ejercicio de marcaje 1vs1 + salida de balón bajo presión. 15 minutos.";
    }
    if (position.includes('Lateral')) {
      return "Subidas por banda con centros + repliegue defensivo. Circuito de 20 minutos.";
    }
    if (position.includes('Medio')) {
      return "Rondo 4vs2 + pases largos a portería contraria. 3 series de 5 minutos.";
    }
    if (position.includes('Delantero')) {
      return "Finalización desde diferentes ángulos + movimientos sin balón. 20 remates.";
    }
    if (position.includes('Extremo')) {
      return "Regates 1vs1 + centros al área. Trabajar cambios de ritmo. 15 minutos.";
    }
    return "Trabajo técnico individual con balón. Controles, pases y conducción.";
  };

  const getMainStrength = () => {
    const stats = roster?.stats || {};
    const position = roster?.position || '';
    
    if (stats.goals > stats.matches_played * 0.5) {
      return "Excelente capacidad goleadora. Mantén tu instinto de definición y sigue buscando espacios.";
    }
    if (stats.assists > stats.matches_played * 0.3) {
      return "Gran visión de juego y capacidad de asistencia. Tu creatividad es clave para el equipo.";
    }
    if (stats.minutes > stats.matches_played * 80) {
      return "Resistencia física sobresaliente. Tu capacidad para mantener el nivel durante todo el partido es fundamental.";
    }
    if (stats.yellow_cards === 0 && stats.matches_played > 5) {
      return "Disciplina táctica ejemplar. Juegas limpio y con inteligencia.";
    }
    return `Tu compromiso y dedicación en el ${position} son tu mayor fortaleza. Sigue así.`;
  };

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(130deg,#0a1628,#0d2248)', borderRadius: 13, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,87,255,.2),transparent 70%)' }} />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Mi Panel</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 2 }}>
          ¡Hola, {profile?.name || 'Jugador'}! 👋
        </div>
        {training && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,.55)', fontSize: 11 }}>
              <Calendar size={11} /> {training.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,.55)', fontSize: 11 }}>
              <Clock size={11} /> {training.duration} min
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Card */}
      {roster && (
        <div className="card" style={{ padding: 16, background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))' }}>
          <button 
            onClick={() => setShowAI(!showAI)}
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 0
            }}
          >
            {/* Player Photo as AI Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                overflow: 'hidden', 
                border: '2px solid rgba(139, 92, 246, 0.4)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))'
              }}>
                {roster.photo_url ? (
                  <img 
                    src={roster.photo_url} 
                    alt={roster.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#a78bfa',
                    fontSize: 20,
                    fontWeight: 800
                  }}>
                    {roster.number || '?'}
                  </div>
                )}
              </div>
              {/* AI Indicator */}
              <div style={{ 
                position: 'absolute', 
                bottom: -2, 
                right: -2, 
                width: 20, 
                height: 20, 
                background: '#8b5cf6', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0a1628'
              }}>
                <span style={{ fontSize: 10 }}>🤖</span>
              </div>
              {/* Speaking Animation */}
              {showAI && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  borderRadius: '50%', 
                  border: '2px solid rgba(139, 92, 246, 0.6)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
              )}
            </div>
            
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 800, 
                color: '#a78bfa',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Sparkles size={14} />
                Tu Asistente IA Personal
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginTop: 2 }}>
                Recomendaciones personalizadas para {roster.position || 'tu desarrollo'}
              </div>
            </div>

            <div style={{ 
              fontSize: 20,
              color: '#a78bfa',
              transform: showAI ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}>
              ▼
            </div>
          </button>

          {/* AI Recommendations Panel */}
          {showAI && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Main Improvement */}
              <div style={{ 
                padding: 12, 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1))',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 12
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  🎯 Área de Mejora Principal
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
                  {getMainImprovement()}
                </p>
              </div>

              {/* Recommended Exercise */}
              <div style={{ 
                padding: 12, 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 12
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  💪 Ejercicio Recomendado
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
                  {getRecommendedExercise()}
                </p>
              </div>

              {/* Main Strength */}
              <div style={{ 
                padding: 12, 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 12
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  ⭐ Fortaleza Destacada
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
                  {getMainStrength()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's assignments */}
      {!training ? (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: '#96a0b5' }}>
          <AlertCircle size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: .4 }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>No hay entrenamiento próximo</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>El entrenador aún no ha creado ninguna sesión.</div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
            {training.title}
          </div>
          <div style={{ fontSize: 11, color: '#96a0b5' }}>
            El entrenador aún no ha asignado grupos para este entrenamiento.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#96a0b5', textTransform: 'uppercase', letterSpacing: 1 }}>
            🏟️ {training.title} — Tus grupos
          </div>
          {assignments.map((a, i) => {
            const g = GRUPO_LABELS[a.group] || { label: a.group, peto: '', bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };
            return (
              <div key={i} style={{ background: g.bg, border: `2px solid ${g.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: g.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20 }}>
                    {a.group === 'red' ? '🔴' : a.group === 'yellow' ? '🟡' : a.group === 'green' ? '🟢' : a.group === 'blue' ? '🔵' : '🩷'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, color: g.color, opacity: .7, marginBottom: 2 }}>
                    Ejercicio {i + 1}: {a.exerciseName}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: g.color }}>
                    {g.label} — {g.peto}
                  </div>
                </div>
                <ChevronRight size={16} color={g.color} style={{ opacity: .5 }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Training objectives */}
      {training?.objective && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, color: '#96a0b5', marginBottom: 6 }}>🎯 Objetivo del día</div>
          <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{training.objective}</div>
        </div>
      )}

      {/* Feedback form */}
      {training && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, color: '#96a0b5', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" /> Mis sensaciones del entrenamiento
          </div>

          {/* Score picker 1–10 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
              ¿Cómo te has sentido? <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor }}>{score}</span>/10
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setScore(n)}
                  style={{
                    flex: 1, height: 34, borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12,
                    background: score >= n
                      ? (n >= 8 ? '#10b981' : n >= 6 ? '#f59e0b' : '#ef4444')
                      : '#f1f5f9',
                    color: score >= n ? 'white' : '#94a3b8',
                    transition: 'all .1s',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <textarea
            className="input-field"
            placeholder="Observaciones, sensaciones físicas, notas para el entrenador..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            style={{ resize: 'none', marginBottom: 10, fontSize: 13 }}
          />

          <button onClick={submitFeedback} disabled={saving || saved} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', background: saved ? '#10b981' : undefined }}>
            {saved
              ? <><CheckCircle size={14} /> ¡Enviado!</>
              : saving
                ? 'Guardando...'
                : <><Send size={14} /> Enviar feedback</>}
          </button>

          {myScore && !saved && (
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#96a0b5' }}>
              Ya enviaste feedback para este entreno · Puntuación anterior: {myScore.score}/10
            </div>
          )}
        </div>
      )}
    </div>
  );
}
