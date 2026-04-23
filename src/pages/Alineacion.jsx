import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1'];

const FORMATION_POSITIONS = {
  '4-3-3': [
    { x: 50, y: 270 },
    { x: 130, y: 80 }, { x: 130, y: 170 }, { x: 130, y: 260 }, { x: 130, y: 350 },
    { x: 270, y: 120 }, { x: 270, y: 215 }, { x: 270, y: 310 },
    { x: 410, y: 100 }, { x: 410, y: 215 }, { x: 410, y: 330 },
  ],
  '4-4-2': [
    { x: 50, y: 270 },
    { x: 150, y: 80 }, { x: 150, y: 170 }, { x: 150, y: 260 }, { x: 150, y: 350 },
    { x: 290, y: 80 }, { x: 290, y: 170 }, { x: 290, y: 260 }, { x: 290, y: 350 },
    { x: 420, y: 160 }, { x: 420, y: 280 },
  ],
  '4-2-3-1': [
    { x: 50, y: 270 },
    { x: 140, y: 80 }, { x: 140, y: 170 }, { x: 140, y: 260 }, { x: 140, y: 350 },
    { x: 250, y: 170 }, { x: 250, y: 260 },
    { x: 360, y: 100 }, { x: 360, y: 215 }, { x: 360, y: 330 },
    { x: 440, y: 215 },
  ],
  '3-5-2': [
    { x: 50, y: 270 },
    { x: 140, y: 130 }, { x: 140, y: 215 }, { x: 140, y: 300 },
    { x: 270, y: 60 }, { x: 270, y: 140 }, { x: 270, y: 215 }, { x: 270, y: 290 }, { x: 270, y: 370 },
    { x: 420, y: 160 }, { x: 420, y: 280 },
  ],
};

const W = 500;
const H = 370;

export default function Alineacion() {
  const { isAdmin, profile } = useAuth();
  const isMobile = useIsMobile();
  const [lineups, setLineups] = useState([]);
  const [activeLineup, setActiveLineup] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', formation: '4-3-3', match_date: '' });
 const [mobileTab, setMobileTab] = useState('field');
  const svgRef = useRef(null);
const drag = useRef(null);
const autosaveRef = useRef(null);
const lastAutosavedRef = useRef('');

 const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const toSVG = useCallback((cx, cy) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM?.();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

const applyLineupUpdate = (patch) => {
  if (!activeLineup) return;
  const next = { ...activeLineup, ...patch };
  setActiveLineup(next);
  setLineups(ls => ls.map(l => l.id === next.id ? next : l));
};

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
  if (!activeLineup?.id) return;
  lastAutosavedRef.current = JSON.stringify({
    starters: activeLineup.starters || [],
    substitutes: activeLineup.substitutes || [],
  });
}, [activeLineup?.id]);

useEffect(() => {
  if (!isAdmin || !activeLineup?.id) return;

  const snapshot = JSON.stringify({
    starters: activeLineup.starters || [],
    substitutes: activeLineup.substitutes || [],
  });

  if (snapshot === lastAutosavedRef.current) return;

  clearTimeout(autosaveRef.current);

  autosaveRef.current = setTimeout(async () => {
    const { error } = await supabase
      .from('lineups')
      .update({
        starters: activeLineup.starters || [],
        substitutes: activeLineup.substitutes || [],
      })
      .eq('id', activeLineup.id);

    if (!error) {
      lastAutosavedRef.current = snapshot;
    }
  }, 450);

  return () => clearTimeout(autosaveRef.current);
}, [activeLineup?.id, activeLineup?.starters, activeLineup?.substitutes, isAdmin]);
  

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: l }, { data: p }] = await Promise.all([
        supabase.from('lineups').select('*').order('created_at', { ascending: false }),
        supabase.from('roster').select('*').order('number'),
      ]);
      setLineups(l || []);
      setPlayers(p || []);
      if (l?.length > 0) setActiveLineup(l[0]);
    } catch { }
    setLoading(false);
  };

  const createLineup = async () => {
    if (!form.name) { alert('Pon un nombre'); return; }
    const positions = FORMATION_POSITIONS[form.formation] || FORMATION_POSITIONS['4-3-3'];
    const starters = positions.map((pos, i) => ({ slot: i, player_id: null, x: pos.x, y: pos.y, number: null }));
    try {
      const { data } = await supabase.from('lineups').insert([{
        ...form, starters, substitutes: [], created_by: profile?.id
      }]).select().single();
      if (data) {
        setLineups([data, ...lineups]);
        setActiveLineup(data);
        setShowForm(false);
        setForm({ name: '', formation: '4-3-3', match_date: '' });
        if (isMobile) setMobileTab('field');
      }
    } catch { alert('Error al crear.'); }
  };

  const deleteLineup = async () => {
    if (!activeLineup || !confirm('¿Eliminar esta alineación?')) return;
    await supabase.from('lineups').delete().eq('id', activeLineup.id);
    const remaining = lineups.filter(l => l.id !== activeLineup.id);
    setLineups(remaining);
    setActiveLineup(remaining[0] || null);
    if (isMobile) setMobileTab('list');
  };

  const saveLineup = async () => {
    if (!activeLineup) return;
    try {
      await supabase.from('lineups').update({
        starters: activeLineup.starters || [],
        substitutes: activeLineup.substitutes || [],
      }).eq('id', activeLineup.id);
      alert('✅ Alineación guardada.');
    } catch { alert('❌ Error al guardar.'); }
  };

 const assignPlayer = (slotIndex, playerId) => {
  if (!activeLineup) return;

  const cleanPlayerId = playerId || null;
  const p = players.find(pl => pl.id === cleanPlayerId);

  const starters = (activeLineup.starters || []).map((s, i) => {
    if (i === slotIndex) {
      return {
        ...s,
        player_id: cleanPlayerId,
        number: p?.number || null,
        name: p ? `${p.name}` : null,
      };
    }

    if (cleanPlayerId && s.player_id === cleanPlayerId) {
      return { ...s, player_id: null, number: null, name: null };
    }

    return s;
  });

  const substitutes = (activeLineup.substitutes || []).filter(
    s => s.player_id !== cleanPlayerId
  );

  applyLineupUpdate({ starters, substitutes });
};

const clearSlot = (slotIndex) => {
  if (!activeLineup) return;

  const starters = (activeLineup.starters || []).map((s, i) =>
    i === slotIndex
      ? { ...s, player_id: null, number: null, name: null }
      : s
  );

  applyLineupUpdate({ starters });
};

const toggleSubstitute = (playerId) => {
  if (!activeLineup) return;

  const subs = activeLineup.substitutes || [];
  const exists = subs.find(s => s.player_id === playerId);

  const starters = (activeLineup.starters || []).map(s =>
    s.player_id === playerId
      ? { ...s, player_id: null, number: null, name: null }
      : s
  );

  let substitutes;
  if (exists) {
    substitutes = subs.filter(s => s.player_id !== playerId);
  } else {
    const p = players.find(pl => pl.id === playerId);
    substitutes = [...subs, { player_id: playerId, number: p?.number || null }];
  }

  applyLineupUpdate({ starters, substitutes });
};
  const onMD = (e, idx) => { if (!isAdmin) return; e.preventDefault(); drag.current = idx; };
 const onMM = useCallback((e) => {
  if (drag.current === null || !activeLineup) return;

  const pt = e.touches ? e.touches[0] : e;
  const c = toSVG(pt.clientX, pt.clientY);

  const nextX = clamp(c.x, 28, W - 28);
  const nextY = clamp(c.y, 28, H - 28);

  const starters = (activeLineup.starters || []).map((s, i) =>
    i === drag.current ? { ...s, x: nextX, y: nextY } : s
  );

  applyLineupUpdate({ starters });
}, [activeLineup]);
  
  const onMU = () => { drag.current = null; };

  const assignedIds = new Set((activeLineup?.starters || []).filter(s => s.player_id).map(s => s.player_id));
  const subIds = new Set((activeLineup?.substitutes || []).map(s => s.player_id));
  const unassigned = players.filter(p => !assignedIds.has(p.id) && !subIds.has(p.id));

  if (loading) return <div style={{ padding: 20, color: '#96a0b5' }}>Cargando...</div>;

  // ── Field SVG (shared between mobile and desktop) ──────────────────────
  const FieldSVG = () => (
    <div style={{ background: '#2a6118', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,.06)', aspectRatio: `${W}/${H}` }}>
      {activeLineup ? (
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
          onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
          onTouchMove={e => { e.preventDefault(); onMM(e); }} onTouchEnd={onMU}>
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={i * (W / 10)} y={0} width={W / 10} height={H} fill={i % 2 === 0 ? '#2a6118' : '#2f6e1c'} />
          ))}
          <rect x={10} y={10} width={W - 20} height={H - 20} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" rx="2" />
          <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10} stroke="rgba(255,255,255,.3)" strokeWidth="1.2" />
          <circle cx={W / 2} cy={H / 2} r={40} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.2" />
          <circle cx={W / 2} cy={H / 2} r={3} fill="rgba(255,255,255,.5)" />
          <rect x={10} y={H / 2 - 60} width={65} height={120} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.2" />
          <rect x={10} y={H / 2 - 30} width={25} height={60} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2" />
          <rect x={W - 75} y={H / 2 - 60} width={65} height={120} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.2" />
          <rect x={W - 35} y={H / 2 - 30} width={25} height={60} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2" />
          <rect x={0} y={H / 2 - 20} width={10} height={40} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
          <rect x={W - 10} y={H / 2 - 20} width={10} height={40} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
          <defs>
            {(activeLineup.starters || []).map((s, i) => {
              const p = s.player_id ? players.find(pl => pl.id === s.player_id) : null;
              if (!p?.photo_url) return null;
              return <clipPath key={`clip-${i}`} id={`clip-alin-${i}`}><circle cx={s.x} cy={s.y} r={15} /></clipPath>;
            })}
          </defs>
          {(activeLineup.starters || []).map((s, i) => {
            const p = s.player_id ? players.find(pl => pl.id === s.player_id) : null;
            const hasPhoto = !!p?.photo_url;
            return (
              <g key={i} onMouseDown={e => onMD(e, i)} onTouchStart={e => onMD(e, i)} style={{ cursor: isAdmin ? 'grab' : 'default' }}>
                <circle cx={s.x} cy={s.y} r={17}
                  fill={hasPhoto ? '#1a1a2e' : (p ? '#0057ff' : 'rgba(255,255,255,.2)')}
                  stroke="white" strokeWidth="2.5" />
                {hasPhoto ? (
                  <image href={p.photo_url} x={s.x - 15} y={s.y - 15} width={30} height={30} clipPath={`url(#clip-alin-${i})`} preserveAspectRatio="xMidYMid slice" />
                ) : (
                  <text x={s.x} y={s.y} textAnchor="middle" dy="4" fontSize="11" fontWeight="800" fill="white">
                    {p ? (p.number || p.name?.[0]) : '?'}
                  </text>
                )}
                {hasPhoto && <circle cx={s.x} cy={s.y} r={17} fill="none" stroke="white" strokeWidth="2.5" />}
                {hasPhoto && p?.number && (
                  <g>
                    <circle cx={s.x + 11} cy={s.y - 11} r={7} fill="#0057ff" stroke="white" strokeWidth="1.5" />
                    <text x={s.x + 11} y={s.y - 11} textAnchor="middle" dy="3.5" fontSize="7" fontWeight="800" fill="white">{p.number}</text>
                  </g>
                )}
                {p && (
                  <text x={s.x} y={s.y + 27} textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(255,255,255,.9)">
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'rgba(255,255,255,.5)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Selecciona o crea una alineación</div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Player assignment panel (shared) ───────────────────────────────────
  const PlayersPanel = () => (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#96a0b5', textTransform: 'uppercase', marginBottom: 4 }}>Titulares</div>
      {(activeLineup?.starters || []).map((s, i) => {
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3, padding: '4px 6px', background: '#f8f9fb', borderRadius: 6, fontSize: 10 }}>
            <span style={{ fontWeight: 700, width: 16 }}>{i + 1}.</span>
            <select className="input-field" style={{ flex: 1, padding: '2px 4px', fontSize: 12 }}
              value={s.player_id || ''} onChange={e => assignPlayer(i, e.target.value || null)}>
              <option value="">-- Vacío --</option>
              {players
                .filter(pl => !assignedIds.has(pl.id) || s.player_id === pl.id)
                .map(pl => <option key={pl.id} value={pl.id}>{pl.number ? `#${pl.number} ` : ''}{pl.name} {pl.surname?.[0]}.</option>)}
            </select>
            {s.player_id && <button onClick={() => clearSlot(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 10 }}>✕</button>}
          </div>
        );
      })}

      <div style={{ fontSize: 10, fontWeight: 700, color: '#96a0b5', textTransform: 'uppercase', marginTop: 10, marginBottom: 4 }}>Suplentes</div>
      {unassigned.map(p => (
        <div key={p.id} onClick={() => toggleSubstitute(p.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: subIds.has(p.id) ? '#ecfdf5' : '#f8f9fb', marginBottom: 3, fontSize: 11, border: `1px solid ${subIds.has(p.id) ? '#a7f3d0' : 'transparent'}` }}>
          <span>{p.number ? `#${p.number}` : '·'}</span>
          <span style={{ fontWeight: 600 }}>{p.name}</span>
          {subIds.has(p.id) && <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: 700 }}>SUP</span>}
        </div>
      ))}
      {(activeLineup?.substitutes || []).map(s => {
        const p = players.find(pl => pl.id === s.player_id);
        if (!p || unassigned.find(u => u.id === p.id)) return null;
        return (
          <div key={s.player_id} onClick={() => toggleSubstitute(s.player_id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: '#ecfdf5', marginBottom: 3, fontSize: 11, border: '1px solid #a7f3d0' }}>
            <span>{p.number ? `#${p.number}` : '·'}</span>
            <span style={{ fontWeight: 600 }}>{p.name}</span>
            <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: 700 }}>SUP</span>
          </div>
        );
      })}
    </div>
  );

  // ── Mobile layout ──────────────────────────────────────────────────────
  if (isMobile) {
    const TABS = [
      { id: 'list', label: '📋 Listas' },
      { id: 'field', label: '⚽ Campo' },
      ...(isAdmin && activeLineup ? [{ id: 'players', label: '👥 Jugadores' }] : []),
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, background: '#f0f2f5', borderRadius: 10, padding: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)}
              style={{ flex: 1, padding: '8px 4px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11, background: mobileTab === tab.id ? 'white' : 'transparent', color: mobileTab === tab.id ? '#0057ff' : '#64748b', boxShadow: mobileTab === tab.id ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition: 'all .15s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* LIST tab */}
        {mobileTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>📋 Alineaciones</span>
              {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /></button>}
            </div>
            {showForm && isAdmin && (
              <div className="card" style={{ padding: 10 }}>
                <input className="input-field" placeholder="Nombre (ej: J12 vs Villamayor)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginBottom: 6 }} />
                <select className="input-field" value={form.formation} onChange={e => setForm(f => ({ ...f, formation: e.target.value }))} style={{ marginBottom: 6 }}>
                  {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <input type="date" className="input-field" value={form.match_date} onChange={e => setForm(f => ({ ...f, match_date: e.target.value }))} style={{ marginBottom: 6 }} />
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={createLineup}>Crear</button>
              </div>
            )}
            {lineups.map(l => (
              <div key={l.id} onClick={() => { setActiveLineup(l); setMobileTab('field'); }}
                style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${activeLineup?.id === l.id ? '#0057ff' : '#e0e4ed'}`, background: activeLineup?.id === l.id ? '#eef3ff' : 'white' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</div>
                <div style={{ fontSize: 10, color: '#96a0b5' }}>{l.formation} {l.match_date && `· ${l.match_date}`}</div>
              </div>
            ))}
          </div>
        )}

        {/* FIELD tab */}
        {mobileTab === 'field' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeLineup && isAdmin && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary btn-sm" onClick={saveLineup}><Save size={12} /> Guardar</button>
                <button className="btn btn-outline btn-sm" onClick={deleteLineup} style={{ color: '#ef4444' }}><Trash2 size={12} /> Eliminar</button>
                <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#64748b' }}>{activeLineup.formation}</div>
              </div>
            )}
            <FieldSVG />
          </div>
        )}

        {/* PLAYERS tab */}
        {mobileTab === 'players' && activeLineup && isAdmin && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Asignar jugadores</div>
            <PlayersPanel />
          </div>
        )}
      </div>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 100px)' }}>
      {/* Left: Lineups list */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>📋 Alineaciones</span>
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /></button>}
        </div>
        {showForm && isAdmin && (
          <div className="card" style={{ padding: 10 }}>
            <input className="input-field" placeholder="Nombre (ej: J12 vs Villamayor)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginBottom: 6 }} />
            <select className="input-field" value={form.formation} onChange={e => setForm(f => ({ ...f, formation: e.target.value }))} style={{ marginBottom: 6 }}>
              {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <input type="date" className="input-field" value={form.match_date} onChange={e => setForm(f => ({ ...f, match_date: e.target.value }))} style={{ marginBottom: 6 }} />
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={createLineup}>Crear</button>
          </div>
        )}
        {lineups.map(l => (
          <div key={l.id} onClick={() => setActiveLineup(l)}
            style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${activeLineup?.id === l.id ? '#0057ff' : '#e0e4ed'}`, background: activeLineup?.id === l.id ? '#eef3ff' : 'white' }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{l.name}</div>
            <div style={{ fontSize: 10, color: '#96a0b5' }}>{l.formation} {l.match_date && `· ${l.match_date}`}</div>
          </div>
        ))}
      </div>

      {/* Center: Field */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeLineup && isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={saveLineup}><Save size={12} /> Guardar</button>
            <button className="btn btn-outline btn-sm" onClick={deleteLineup} style={{ color: '#ef4444' }}><Trash2 size={12} /> Eliminar</button>
            <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#64748b' }}>{activeLineup.formation}</div>
          </div>
        )}
        <div style={{ flex: 1, background: '#2a6118', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          <FieldSVG />
        </div>
      </div>

      {/* Right: Player assignment */}
      {activeLineup && isAdmin && (
        <div style={{ width: 200, flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Asignar jugadores</div>
          <PlayersPanel />
        </div>
      )}
    </div>
  );
}
