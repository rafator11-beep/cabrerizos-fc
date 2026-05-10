import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Star, Send, Calendar, AlertCircle, CheckCircle,
  User, Camera, Lock, Activity, Settings, Shield, Key
} from 'lucide-react';
import StatBadge from '../components/StatBadge';

const GRUPO = {
  red:    { label: 'Equipo A', peto: 'Peto Rojo',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   emoji: '🔴' },
  yellow: { label: 'Equipo B', peto: 'Peto Amarillo', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  emoji: '🟡' },
  green:  { label: 'Equipo C', peto: 'Peto Verde',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  emoji: '🟢' },
  blue:   { label: 'Equipo D', peto: 'Peto Azul',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  emoji: '🔵' },
  pink:   { label: 'Comodín',  peto: 'Sin Peto',      color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.2)',  emoji: '🩷' },
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
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
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

  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [score, setScore] = useState(7);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [passForm, setPassForm] = useState({ newPassword: '', confirm: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, msg: '', type: '' });
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user?.id) { load(); loadNotifications(); }
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: r } = await supabase.from('roster').select('*').eq('auth_profile_id', user.id).maybeSingle();
      setRoster(r);

      const today = new Date().toISOString().split('T')[0];
      // Próxima sesión futura primero, fallback a la más reciente
      let { data: tr } = await supabase.from('trainings').select('*').gte('date', today).order('date', { ascending: true }).limit(1).maybeSingle();
      if (!tr) {
        const { data: last } = await supabase.from('trainings').select('*').order('date', { ascending: false }).limit(1).maybeSingle();
        tr = last;
      }
      setTraining(tr);

      if (tr && r) {
        const myGroups = [];
        for (const ex of (tr.exercises || [])) {
          const ga = ex.group_assignments || {};
          for (const [key, members] of Object.entries(ga)) {
            if (members.includes(r.id)) myGroups.push({ exerciseName: ex.name, group: key });
          }
        }
        setAssignments(myGroups);

        const { data: sc } = await supabase.from('training_scores').select('*')
          .eq('training_id', tr.id).eq('player_id', user.id).maybeSingle();
        setMyScore(sc);
        if (sc) { setScore(sc.score); setComment(sc.comment || ''); }
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadNotifications = async () => {
    try {
      const { data } = await supabase.from('notifications').select('*').eq('player_id', user.id).order('created_at', { ascending: false });
      if (data) { setNotifications(data); setUnreadCount(data.filter(n => !n.read).length); }
    } catch {}
  };

  const markAsRead = async (id) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(p => Math.max(0, p - 1));
    } catch {}
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
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
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
    const { data, error } = await supabase.rpc('change_user_password', { new_password: passForm.newPassword });
    if (error || (data && !data.success)) {
      setPassStatus({ loading: false, type: 'error', msg: error?.message || data?.message });
    } else {
      setPassStatus({ loading: false, type: 'success', msg: 'Contraseña actualizada correctamente' });
      setPassForm({ newPassword: '', confirm: '' });
      setTimeout(() => setPassStatus({ loading: false, type: '', msg: '' }), 3000);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted">
      <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <div className="text-sm font-black uppercase tracking-widest animate-pulse">Sincronizando...</div>
    </div>
  );

  const stats = roster?.stats || {};
  const scoreColor = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-[540px] mx-auto flex flex-col gap-5 pb-10 px-4 animate-in fade-in duration-500">
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ''; }} />

      {/* ═══ HERO CARD ═══ */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0d1f40] to-[#0a1628] border border-white/10 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-accent/15 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 p-5">

          {/* Nombre + avatar */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                <Shield size={11} /> Licencia Activa
              </div>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                {roster?.name || profile?.name}
              </h1>
              <div className="text-base font-bold text-white/35 mt-0.5">
                {roster?.surname?.split(' ')[0] || ''}
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {roster?.position && <span className="text-sm font-bold text-muted">{roster.position}</span>}
                {roster?.number && (
                  <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-lg text-base font-black text-white">
                    #{roster.number}
                  </span>
                )}
              </div>
            </div>

            <div className="relative group cursor-pointer flex-shrink-0 ml-3" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
                {roster?.photo_url ? (
                  <img src={roster.photo_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <User size={30} className="text-muted" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <Camera size={18} className="text-white" />
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats 4 columnas */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: stats.matches_played || 0, l: 'Partidos',    c: '#ffffff' },
              { v: stats.goals || 0,           l: 'Goles',       c: '#00ff87' },
              { v: stats.assists || 0,          l: 'Asistencias', c: '#f59e0b' },
              { v: stats.rating || '-',         l: 'Val.',        c: '#10b981' },
            ].map(s => (
              <div key={s.l} className="bg-black/25 backdrop-blur-md rounded-xl p-3 border border-white/5 text-center">
                <div className="text-2xl font-black leading-none" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted/60 mt-1.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="flex bg-surface border border-white/5 p-1 rounded-2xl">
        {[
          { id: 'overview',      label: 'Panel',   icon: <Activity size={15} /> },
          { id: 'notifications', label: 'Avisos',  icon: <AlertCircle size={15} />, badge: unreadCount },
          { id: 'profile',       label: 'Ajustes', icon: <Settings size={15} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-muted/60 hover:text-white/70'
            }`}>
            {tab.icon}
            <span className="hidden sm:block">{tab.label}</span>
            {tab.badge > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-surface font-black">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-4">

          {!training && (
            <div className="bg-surface rounded-3xl border border-white/5 p-8 text-center">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-muted/40" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">Sin Actividad</h3>
              <p className="text-sm text-muted leading-relaxed">El cuerpo técnico no ha planificado la siguiente sesión todavía.</p>
            </div>
          )}

          {training && assignments.length === 0 && (
            <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden">
              <div className="h-1 bg-accent/30" />
              <div className="p-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-xs font-black uppercase tracking-widest text-muted mb-4">
                  <Calendar size={12} /> {training.date}
                </div>
                <h3 className="text-xl font-black text-white mb-2">{training.title}</h3>
                <p className="text-sm text-muted mb-4 leading-relaxed">Los grupos aún no están asignados para esta sesión.</p>
                {training.objective && (
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Objetivo</div>
                    <div className="text-sm font-medium text-white/80 leading-relaxed">{training.objective}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {training && assignments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-black text-muted uppercase tracking-widest">
                  {training.title} · {training.date}
                </span>
              </div>
              {assignments.map((a, i) => {
                const g = GRUPO[a.group] || { label: a.group, peto: '', color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', emoji: '⚽' };
                return (
                  <div key={i} className="rounded-3xl border p-5 flex items-center gap-5 active:scale-[0.98] transition-all"
                    style={{ backgroundColor: g.bg, borderColor: g.border }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: g.border }}>
                      {g.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70" style={{ color: g.color }}>
                        Ejercicio {i + 1} · {a.exerciseName}
                      </div>
                      <div className="text-2xl font-black tracking-tight" style={{ color: g.color }}>{g.label}</div>
                      <div className="text-sm font-bold mt-1 opacity-60" style={{ color: g.color }}>{g.peto}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback */}
          {training && (
            <div className="bg-surface rounded-3xl border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-5 opacity-[0.03] pointer-events-none">
                <Activity size={120} />
              </div>
              <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <Star size={12} className="fill-accent text-accent" /> Feedback Post-Entreno
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-white/70">¿Cómo te has sentido hoy?</span>
                <span className="text-6xl font-black leading-none" style={{ color: scoreColor }}>{score}</span>
              </div>

              <div className="flex gap-1.5 mb-5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setScore(n)}
                    className="flex-1 h-14 rounded-xl text-sm font-black transition-all active:scale-90"
                    style={{
                      backgroundColor: score >= n ? (n >= 8 ? '#10b981' : n >= 6 ? '#f59e0b' : '#ef4444') : 'rgba(255,255,255,0.05)',
                      color: score >= n ? '#fff' : 'rgba(255,255,255,0.25)',
                    }}>
                    {n}
                  </button>
                ))}
              </div>

              <textarea
                className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-base text-white placeholder-muted focus:border-accent outline-none transition-all mb-4"
                placeholder="Sensaciones, molestias, nivel de fatiga..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{ resize: 'none' }}
              />

              <button onClick={submitFeedback} disabled={saving || saved}
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                  saved ? 'bg-emerald-500 text-black' : 'bg-white text-bg hover:bg-white/90 shadow-xl'
                }`}>
                {saved ? <><CheckCircle size={18} /> ¡Reporte Enviado!</> : saving ? 'Guardando...' : <><Send size={18} /> Enviar Reporte</>}
              </button>

              {myScore && !saved && (
                <p className="text-center mt-3 text-xs font-black uppercase tracking-widest text-muted/50">
                  Reporte previo · {myScore.score}/10
                </p>
              )}
            </div>
          )}

          {/* StatBadge row */}
          {roster && (
            <div className="flex gap-3">
              <StatBadge label="Goles"       value={stats.goals || 0}   tipo="success" size="md" />
              <StatBadge label="Asistencias" value={stats.assists || 0} tipo="warning" size="md" />
              <StatBadge label="Tarjetas"    value={stats.cards || 0}   tipo="danger"  size="md" />
            </div>
          )}
        </div>
      )}

      {/* ═══ NOTIFICACIONES ═══ */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Avisos del Club</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-black text-accent px-3 py-1 bg-accent/10 rounded-full">{unreadCount} nuevas</span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="bg-surface rounded-3xl border border-white/5 p-10 text-center">
              <AlertCircle size={36} className="mx-auto mb-3 text-muted/20" />
              <div className="text-sm font-black uppercase tracking-widest text-muted/40">Sin notificaciones</div>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} onClick={() => !n.read && markAsRead(n.id)}
              className={`bg-surface rounded-2xl border p-4 transition-all relative overflow-hidden ${
                n.read ? 'border-white/5 opacity-60' : 'border-accent/25 shadow-lg shadow-accent/5 cursor-pointer'
              }`}>
              {!n.read && <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />}
              <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">{n.type}</div>
              <h4 className="text-base font-black text-white mb-1">{n.title}</h4>
              <p className="text-sm text-muted leading-relaxed">{n.message}</p>
              <div className="mt-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                {new Date(n.created_at).toLocaleDateString('es-ES')} · {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ AJUSTES ═══ */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-surface rounded-3xl border border-white/5 p-5">
            <div className="text-[10px] font-black text-muted/50 uppercase tracking-widest mb-4">Información Deportiva</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Dorsal',      v: roster?.number || '-' },
                { l: 'Posición',    v: roster?.position || '-' },
                { l: 'Goles',       v: stats.goals || 0 },
                { l: 'Asistencias', v: stats.assists || 0 },
                { l: 'Partidos',    v: stats.matches_played || 0 },
                { l: 'Minutos',     v: stats.minutes || 0 },
              ].map(item => (
                <div key={item.l} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                  <div className="text-[10px] font-black text-muted/50 uppercase tracking-widest mb-1">{item.l}</div>
                  <div className="text-2xl font-black text-white">{item.v}</div>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-xs text-muted/40 italic">Solo el cuerpo técnico puede modificar estos datos.</p>
          </div>

          <div className="bg-surface rounded-3xl border border-white/5 p-5">
            <div className="text-[10px] font-black text-muted/50 uppercase tracking-widest mb-1">Seguridad</div>
            <h3 className="text-base font-black text-white mb-5">Cambiar Contraseña</h3>
            <div className="space-y-3">
              <div className="relative">
                <Key size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input type="password" placeholder="Nueva contraseña" value={passForm.newPassword}
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-base text-white placeholder-muted focus:border-accent outline-none transition-all" />
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input type="password" placeholder="Confirmar contraseña" value={passForm.confirm}
                  onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-base text-white placeholder-muted focus:border-accent outline-none transition-all" />
              </div>
              {passStatus.msg && (
                <div className={`p-4 rounded-2xl text-sm font-bold border ${
                  passStatus.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>{passStatus.msg}</div>
              )}
              <button onClick={changePassword} disabled={passStatus.loading || !passForm.newPassword}
                className="w-full py-4 mt-1 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-2xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-40">
                {passStatus.loading ? 'Actualizando...' : 'Guardar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
