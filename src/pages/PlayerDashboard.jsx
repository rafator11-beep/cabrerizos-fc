import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Star, Send, Calendar, Clock, AlertCircle, CheckCircle, ChevronRight, User, Camera, Lock, Trophy, Activity, Settings, Edit3, Shield, Key, MessageSquare } from 'lucide-react';

const GRUPO_LABELS = {
  red: { label: 'Equipo A', peto: 'Peto Rojo', bg: 'rgba(220,38,38,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
  yellow: { label: 'Equipo B', peto: 'Peto Amarillo', bg: 'rgba(217,119,6,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  green: { label: 'Equipo C', peto: 'Peto Verde', bg: 'rgba(5,150,105,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
  blue: { label: 'Equipo D', peto: 'Peto Azul', bg: 'rgba(37,99,235,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
  pink: { label: 'Comodines', peto: 'Sin Peto', bg: 'rgba(219,39,119,0.1)', color: '#ec4899', border: 'rgba(236,72,153,0.2)' },
};

function resizeImage(file, maxSize = 200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { h = (h / w) * maxSize; w = maxSize; }
        else { w = (w / h) * maxSize; h = maxSize; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PlayerDashboard() {
  const { user, profile } = useAuth();
  const [training, setTraining] = useState(null);
  const [roster, setRoster] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [myScore, setMyScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview'); // overview, profile, notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Feedback form
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form
  const [passForm, setPassForm] = useState({ newPassword: '', confirm: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, msg: '', type: '' });
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user?.id) {
      load();
      loadNotifications();
    }
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: r } = await supabase
        .from('roster').select('*').eq('auth_profile_id', user.id).maybeSingle();
      setRoster(r);

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

  const loadNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (file) => {
    if (!file || !roster) return;
    setUploadingPhoto(true);
    const dataUrl = await resizeImage(file, 200);
    await supabase.from('roster').update({ photo_url: dataUrl }).eq('id', roster.id);
    await supabase.from('profiles').update({ photo_url: dataUrl }).eq('id', profile.id);
    setRoster({ ...roster, photo_url: dataUrl });
    setUploadingPhoto(false);
  };

  const changePassword = async () => {
    if (!passForm.newPassword || passForm.newPassword !== passForm.confirm) {
      setPassStatus({ loading: false, type: 'error', msg: 'Las contraseñas no coinciden o están vacías' });
      return;
    }
    setPassStatus({ loading: true, type: '', msg: '' });

    // Usar la nueva función RPC de Supabase
    const { data, error } = await supabase.rpc('change_user_password', {
      new_password: passForm.newPassword
    });

    if (error || (data && !data.success)) {
      setPassStatus({ loading: false, type: 'error', msg: error?.message || data?.message });
    } else {
      setPassStatus({ loading: false, type: 'success', msg: 'Contraseña actualizada correctamente' });
      setPassForm({ newPassword: '', confirm: '' });
      setTimeout(() => setPassStatus({ loading: false, type: '', msg: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-muted">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-black uppercase tracking-widest animate-pulse">Sincronizando Sistema...</div>
      </div>
    );
  }

  const stats = roster?.stats || {};
  const scoreColor = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-[540px] mx-auto flex flex-col gap-5 pb-8 animate-in fade-in duration-500">
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ''; }} />

      {/* PREMIUM HEADER - CABRERIZOS PRO */}
      <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#112a52] to-[#0a1628] border border-white/10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-accent text-[9px] font-black uppercase tracking-[0.3em] mb-1">
              <Shield size={12} />
              <span>Licencia Activa</span>
            </div>
            <h1 className="text-2xl font-black text-white leading-none mb-1 tracking-tight">
              {roster?.name || profile?.name} <span className="opacity-50 font-medium">{roster?.surname?.split(' ')[0] || ''}</span>
            </h1>
            <div className="text-xs font-bold text-muted flex items-center gap-3">
              {roster?.position && <span>{roster.position}</span>}
              {roster?.number && <span className="bg-white/10 px-2 py-0.5 rounded-md text-white">#{roster.number}</span>}
            </div>
          </div>

          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative backdrop-blur-xl shadow-2xl transition-transform active:scale-95">
              {roster?.photo_url ? (
                <img src={roster.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-muted" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={16} className="text-white" />
              </div>
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="mt-6 flex gap-2 relative z-10">
          <div className="flex-1 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5">
            <div className="text-[9px] font-black uppercase text-muted tracking-widest mb-1">Partidos</div>
            <div className="text-lg font-black text-white">{stats.matches_played || 0}</div>
          </div>
          <div className="flex-1 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5">
            <div className="text-[9px] font-black uppercase text-muted tracking-widest mb-1">Minutos</div>
            <div className="text-lg font-black text-accent">{stats.minutes || 0}</div>
          </div>
          <div className="flex-1 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5">
            <div className="text-[9px] font-black uppercase text-muted tracking-widest mb-1">Val.</div>
            <div className="text-lg font-black text-emerald-400">{stats.rating || '-'}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-2 p-1 rounded-xl border border-white/5 mx-2">
        <button onClick={() => setActiveTab('overview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white shadow-lg' : 'text-muted hover:text-white/70'}`}>
          <Activity size={14} /> Panel
        </button>
        <button onClick={() => setActiveTab('notifications')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'notifications' ? 'bg-white/10 text-white shadow-lg' : 'text-muted hover:text-white/70'}`}>
          <AlertCircle size={14} />
          Notificaciones
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-surface-2">
              {unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white/10 text-white shadow-lg' : 'text-muted hover:text-white/70'}`}>
          <Settings size={14} /> Ajustes
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 px-2">
          {/* Today's assignments */}
          {!training ? (
            <div className="bg-surface rounded-2xl border border-white/5 p-6 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={20} className="text-muted" />
              </div>
              <h3 className="text-sm font-black text-white mb-1">Sin Actividad Programada</h3>
              <p className="text-xs text-muted">El cuerpo técnico aún no ha planificado la siguiente sesión.</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-white/5 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent/20" />
              <div className="inline-flex items-center justify-center px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-muted mb-4">
                {training.date}
              </div>
              <h3 className="text-base font-black text-white mb-2 leading-tight">{training.title}</h3>
              <p className="text-xs text-muted mb-4">Los grupos de trabajo aún no están asignados para esta sesión.</p>
              {training.objective && (
                <div className="bg-black/20 rounded-xl p-3 text-left">
                  <div className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">Objetivo de la sesión</div>
                  <div className="text-xs font-medium text-white/80">{training.objective}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Siguiente Sesión: {training.title}
                </div>
              </div>

              {assignments.map((a, i) => {
                const g = GRUPO_LABELS[a.group] || { label: a.group, peto: '', bg: 'rgba(255,255,255,0.05)', color: '#fff', border: 'rgba(255,255,255,0.1)' };
                return (
                  <div key={i} className="rounded-2xl border p-4 flex items-center gap-4 transition-all" style={{ backgroundColor: g.bg, borderColor: g.border }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: g.border }}>
                      {a.group === 'red' ? '🔴' : a.group === 'yellow' ? '🟡' : a.group === 'green' ? '🟢' : a.group === 'blue' ? '🔵' : '🩷'}
                    </div>
                    <div className="flex-1">
                      <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: g.color, opacity: 0.8 }}>
                        Estación {i + 1} · {a.exerciseName}
                      </div>
                      <div className="text-lg font-black tracking-tight" style={{ color: g.color }}>
                        {g.label}
                      </div>
                      <div className="text-[10px] font-bold mt-0.5" style={{ color: g.color, opacity: 0.6 }}>
                        {g.peto}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback form */}
          {training && (
            <div className="bg-surface rounded-2xl border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity size={100} />
              </div>
              <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Star size={12} className="fill-accent text-accent" /> Feedback Post-Entreno
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-bold text-white/80">¿Cómo te has sentido hoy?</span>
                  <span className="text-2xl font-black" style={{ color: scoreColor }}>{score}</span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setScore(n)}
                      className="flex-1 h-10 rounded-lg text-xs font-black transition-all active:scale-90"
                      style={{
                        backgroundColor: score >= n ? (n >= 8 ? '#10b981' : n >= 6 ? '#f59e0b' : '#ef4444') : 'rgba(255,255,255,0.05)',
                        color: score >= n ? '#fff' : 'rgba(255,255,255,0.3)',
                        boxShadow: score === n ? `0 4px 12px ${score >= 8 ? 'rgba(16,185,129,0.3)' : score >= 6 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}` : 'none'
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all mb-4"
                placeholder="Observaciones, sensaciones físicas, molestias..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{ resize: 'none' }}
              />

              <button onClick={submitFeedback} disabled={saving || saved}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98]
                  ${saved ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-white text-bg shadow-white/10 hover:bg-white/90'}`}>
                {saved ? <><CheckCircle size={14} /> Registrado</> : saving ? 'Guardando...' : <><Send size={14} /> Enviar Reporte</>}
              </button>

              {myScore && !saved && (
                <div className="text-center mt-4 text-[9px] font-black uppercase tracking-widest text-muted">
                  Reporte previo enviado · Valoración: {myScore.score}/10
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300 px-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Centro de Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-white/5 p-10 text-center text-muted">
              <AlertCircle size={30} className="mx-auto mb-3 opacity-20" />
              <div className="text-xs font-bold uppercase tracking-widest">No tienes notificaciones</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`bg-surface rounded-2xl border p-4 transition-all relative overflow-hidden ${n.read ? 'border-white/5 opacity-60' : 'border-accent/30 shadow-lg shadow-accent/5'}`}
              >
                {!n.read && <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-pulse" />}
                <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">{n.type}</div>
                <h4 className="text-sm font-black text-white mb-1">{n.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                <div className="mt-3 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  {new Date(n.created_at).toLocaleDateString()} · {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 px-2">

          <div className="bg-surface rounded-2xl border border-white/5 p-5">
            <h3 className="text-sm font-black text-white mb-1">Ajustes de Seguridad</h3>
            <p className="text-xs text-muted mb-5">Actualiza tu contraseña de acceso a la plataforma.</p>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Key size={14} />
                </div>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={passForm.newPassword}
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm text-white placeholder-muted focus:border-accent focus:outline-none transition-all"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={passForm.confirm}
                  onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm text-white placeholder-muted focus:border-accent focus:outline-none transition-all"
                />
              </div>

              {passStatus.msg && (
                <div className={`p-3 rounded-lg text-xs font-bold ${passStatus.type === 'error' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {passStatus.msg}
                </div>
              )}

              <button
                onClick={changePassword}
                disabled={passStatus.loading || !passForm.newPassword}
                className="w-full py-3 mt-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {passStatus.loading ? 'Actualizando...' : 'Guardar Contraseña'}
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-white/5 p-5">
            <h3 className="text-sm font-black text-white mb-4">Información Deportiva</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Dorsal</div>
                <div className="text-base font-black text-white">{roster?.number || '-'}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Posición</div>
                <div className="text-base font-black text-white">{roster?.position || '-'}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Goles</div>
                <div className="text-base font-black text-white">{stats.goals || 0}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Asistencias</div>
                <div className="text-base font-black text-white">{stats.assists || 0}</div>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-muted text-center italic font-medium">
              Los datos deportivos solo pueden ser modificados por el cuerpo técnico.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
