import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import FieldCanvas from '../components/FieldCanvas';
import Heatmap from '../components/Heatmap';
import { useRealtimePizarra, useRealtimeBroadcast, useRealtimeDraft } from '../hooks/useRealtimePizarra';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Plus, Move, ArrowRight, Trash2, Undo2, Save, FolderOpen, Play, Monitor, Spline, X, Layers, Minus, Wifi, WifiOff, Thermometer, Download, Activity, Target } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const CATEGORIES = [
  { id: 'corners', label: '⛳ Córners', color: '#f59e0b' },
  { id: 'free_kicks_for', label: '🎯 Faltas a favor', color: '#10b981' },
  { id: 'free_kicks_against', label: '🛡️ Faltas en contra', color: '#ef4444' },
  { id: 'build_up', label: '⚡ Salida de balón', color: '#3b82f6' },
  { id: 'set_pieces', label: '📐 Jugadas ensayadas', color: '#8b5cf6' },
  { id: 'pressing', label: '💪 Presión', color: '#f97316' },
  { id: 'general', label: '📋 General', color: '#6b7280' },
];

const ELEM_BTNS = [
  { id: "ball", label: "Balón", icon: "⚽" },
  { id: "cone", label: "Cono", icon: "🔺" },
  { id: "cone_blue", label: "Cono Azul", icon: "🔷" },
  { id: "goal", label: "Portería", icon: "🥅" },
  { id: "mannequin", label: "Maniquí", icon: "🧍" },
  { id: "pole", label: "Poste", icon: "🚩" },
  { id: "ladder", label: "Escalera", icon: "🪜" },
  { id: "hurdle", label: "Valla", icon: "🚧" },
  { id: "zone", label: "Zona", icon: "⬜" },
  { id: "player", label: "Jugador X", icon: "❌" }
];

const VECTOR_COLORS = [
  { id: '#3b82f6', label: 'Ofensivo', hex: '#3b82f6' },
  { id: '#ef4444', label: 'Defensa', hex: '#ef4444' },
  { id: '#fbbf24', label: 'Pase Clave', hex: '#fbbf24' },
];
const QUICK_TOOL_BTNS = [
  { id: 'player', label: 'X', title: 'Jugador' },
  { id: 'ball', label: '⚽', title: 'Balón' },
  { id: 'cone', label: '🟧', title: 'Cono' },
  { id: 'cone_blue', label: '🔷', title: 'Cono azul' },
  { id: 'goal', label: '🥅', title: 'Portería' },
  { id: 'mannequin', label: '🧍', title: 'Maniquí' },
  { id: 'pole', label: '🚩', title: 'Poste' },
  { id: 'ladder', label: '🪜', title: 'Escalera' },
  { id: 'hurdle', label: '▭', title: 'Valla' },
];
const VECTOR_STYLES = [
  { id: 'solid',   label: 'Pase corto',    icon: <Minus size={14} /> },
  { id: 'curved',  label: 'Centro/Largo',  icon: <Spline size={14} /> },
  { id: 'zigzag',  label: 'Conducción',    icon: <Activity size={14} /> },
  { id: 'dashed',  label: 'Desmarque',     icon: <div style={{width:14, borderBottom:'2px dashed currentColor'}} /> },
  { id: 'shoot',   label: 'Tiro/Remate',   icon: <Target size={14} /> },
];

const DARK_PANEL = {
  background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.96))',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 24px 60px rgba(2,6,23,0.32)',
  borderRadius: 24,
  color: '#e2e8f0',
};

const DARK_CARD = {
  background: 'rgba(15,23,42,0.72)',
  border: '1px solid rgba(148,163,184,0.12)',
  borderRadius: 18,
  color: '#e2e8f0',
};

export default function Tactica() {
  const { isAdmin, profile } = useAuth();
  const isMobile = useIsMobile();
  const [plays, setPlays] = useState([]);
  const [activePlay, setActivePlay] = useState(null);
  const [activeCategory, setActiveCategory] = useState('corners');

  const isPersistedId = (id) =>
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  
  // Canvas Tools
  const [tool, setTool] = useState("move");
  const [arrowColor, setArrowColor] = useState("#3b82f6");
  const [arrowStyle, setArrowStyle] = useState("solid");
  const [drawPt, setDrawPt] = useState(null);
  const [zoneColor, setZoneColor] = useState("red");
  
  // Sequences & Playback
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Selection & View
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [presentationMode, setPresentationMode] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [fieldView, setFieldView] = useState('full');
 const [mobileTab, setMobileTab] = useState('jugadas');// 'jugadas' | 'campo'
  const [playerSheetOpen, setPlayerSheetOpen] = useState(true);
  const [playerCatOpen, setPlayerCatOpen] = useState(false);

  // Pilar 1 — Live indicator for realtime updates
  const [liveFlash, setLiveFlash] = useState(false);
  // Pilar 2 — Online state tracked reactively
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Pilar 3 — Heatmap toggle
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [allPlays, setAllPlays] = useState([]); // full-category plays for heatmap
  // Pilar 4 — Export state
  const [exporting, setExporting] = useState(false);
  const fieldSvgRef = useRef(null);
const autosaveRef = useRef(null);
const lastAutosavedRef = useRef('');
  const { queueUpdate } = useOfflineSync();

  const VIEWS = [
    { id: 'full', label: 'Campo completo', ratio: '550/366' },
    { id: 'half', label: 'Medio campo', ratio: '360/366' },
    { id: 'left', label: 'Lado izquierdo', ratio: '385/366' },
    { id: 'right', label: 'Lado derecho', ratio: '385/366' },
  ];

  // Aspect ratio of the current view so the container never distorts the field
  const fieldRatio = VIEWS.find(v => v.id === fieldView)?.ratio ?? '550/366';
  
  const myRosterId = players.find(p => p.auth_profile_id === profile?.id)?.id;

  const cycleView = () => {
    const idx = VIEWS.findIndex(v => v.id === fieldView);
    setFieldView(VIEWS[(idx + 1) % VIEWS.length].id);
  };

  const persistedPlayId = isPersistedId(activePlay?.id) ? activePlay.id : null;

  // Pilar 1 — receive live updates when admin saves a play from another device
  useRealtimePizarra(persistedPlayId, useCallback((updated) => {
    const isMigrated = updated.tokens?.[0]?.step !== undefined;
    const safe = isMigrated
      ? updated
      : { ...updated, tokens: [{ step: 1, tokens: updated.tokens || [], arrows: updated.arrows || [], zones: updated.zones || [] }] };
    sync(safe);
    setLiveFlash(true);
    setTimeout(() => setLiveFlash(false), 1800);
  }, [])); // eslint-disable-line react-hooks/exhaustive-deps

  // Near real-time "draft" updates while editing (broadcast; no DB writes)
  const { broadcast: broadcastDraft } = useRealtimeBroadcast(persistedPlayId, { prefix: 'draft' });
  const lastDraftTsRef = useRef(0);
  const lastDraftSentRef = useRef('');
  const draftTimerRef = useRef(null);

  useRealtimeDraft(persistedPlayId, useCallback((draft) => {
    if (isAdmin) return;
    if (!draft || !draft.tokens) return;
    if (!activePlay?.id || activePlay.id !== persistedPlayId) return;

    const ts = typeof draft.ts === 'number' ? draft.ts : Date.now();
    if (ts <= lastDraftTsRef.current) return;
    lastDraftTsRef.current = ts;

    sync({ ...activePlay, tokens: draft.tokens });
    setLiveFlash(true);
    setTimeout(() => setLiveFlash(false), 800);
  }, [isAdmin, activePlay, persistedPlayId])); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAdmin || !persistedPlayId) return;

    const snapshot = JSON.stringify(activePlay?.tokens || []);
    if (snapshot === lastDraftSentRef.current) return;

    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      lastDraftSentRef.current = snapshot;
      broadcastDraft('draft', { ts: Date.now(), tokens: activePlay?.tokens || [] });
    }, 120);

    return () => clearTimeout(draftTimerRef.current);
  }, [isAdmin, persistedPlayId, activePlay?.tokens, broadcastDraft]);

  // Pilar 2 — track connectivity for the offline badge
  useEffect(() => {
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  useEffect(() => {
    fetchPlays();
    fetchPlayers();

    // Suggest an initial focus, but keep the 4 admin view modes predictable.
    if (activeCategory === 'corners' || activeCategory === 'free_kicks_for') {
      setFieldView('right');
    } else if (activeCategory === 'build_up' || activeCategory === 'free_kicks_against') {
      setFieldView('left');
    } else {
      setFieldView('full');
    }
  }, [activeCategory]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('roster').select('*').order('number');
    if (data) setPlayers(data);
  };

  const fetchPlays = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('plays')
        .select('*')
        .eq('category', activeCategory)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Migrate legacy data (tokens/arrows on root) to steps array on the fly
        const safePlays = data.map(p => {
          const isMigrated = p.tokens && Array.isArray(p.tokens) && p.tokens.length > 0 && p.tokens[0].step !== undefined;
          if (!isMigrated) {
            return { ...p, tokens: [{ step: 1, tokens: p.tokens || [], arrows: p.arrows || [], zones: p.zones || [], playComment: '' }] };
          }
          if (typeof p.tokens?.[0]?.playComment === 'undefined') {
            const next = [...p.tokens];
            next[0] = { ...next[0], playComment: '' };
            return { ...p, tokens: next };
          }
          return p;
        });
        setPlays(safePlays);
        setAllPlays(safePlays); // Pilar 3 — feed all plays to heatmap
        setActivePlay(safePlays[0]);
      } else {
        setPlays([]);
        setAllPlays([]);
        setActivePlay(null);
      }
    } catch (err) {
      console.error('Error fetching plays:', err);
      setPlays([]);
      setActivePlay(null);
    }
    setLoading(false);
    setActiveStepIndex(0);
  };

  // Steps handling
  const steps = activePlay?.tokens?.[0]?.step !== undefined 
    ? activePlay.tokens 
    : [{ step: 1, tokens: [], arrows: [], zones: [] }];
    
  const currentStep = steps[activeStepIndex] || { tokens: [], arrows: [], zones: [] };
  const effectiveArrowType = arrowStyle === 'shoot' ? '_shoot' : 'pass';
  const shouldOpenFieldView =
    activeCategory === 'corners' ||
    activeCategory === 'free_kicks_for' ||
    activeCategory === 'free_kicks_against' ||
    (currentStep.tokens || []).length >= 8 ||
    (currentStep.arrows || []).length >= 4;
  const selectedToken = (currentStep.tokens || []).find(t => t.id === selectedTokenId) || null;
  const selectedPlayerToken = selectedToken?.kind === 'player' ? selectedToken : null;
  const playComment = steps[0]?.playComment || '';
  const squadTokens = (currentStep.tokens || []).filter(t => t.kind === 'player' && !t.isRival);
  const rivalTokens = (currentStep.tokens || []).filter(t => t.kind === 'player' && t.isRival);
  const myInstructionToken = !isAdmin
    ? (currentStep.tokens || []).find(t => t.kind === 'player' && t.assigned_player_id === myRosterId)
    : null;

  const updatePlayComment = (value) => {
    const nextSteps = [...steps];
    const base = nextSteps[0] || { step: 1, tokens: [], arrows: [], zones: [] };
    nextSteps[0] = { ...base, playComment: value };
    sync({ ...activePlay, tokens: nextSteps });
  };

  const updateCurrentStep = (updates) => {
    if (!activePlay) return;
    const newSteps = [...steps];
    newSteps[activeStepIndex] = { ...currentStep, ...updates };
    sync({ ...activePlay, tokens: newSteps });
  };

  const sync = (upd) => {
    setActivePlay(upd);
    setPlays(ps => ps.map(p => p.id === upd.id ? upd : p));
  };

  // Autosave (single debounced effect, no duplicate timers)
  useEffect(() => {
    if (!activePlay?.id) return;
    lastAutosavedRef.current = JSON.stringify({ tokens: activePlay.tokens || [] });
  }, [activePlay?.id]);

  useEffect(() => {
    if (!isAdmin || !isPersistedId(activePlay?.id)) return;

    const snapshot = JSON.stringify({ tokens: activePlay.tokens || [] });
    if (snapshot === lastAutosavedRef.current) return;

    clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(async () => {
      const { error } = await queueUpdate('plays', activePlay.id, {
        tokens: activePlay.tokens || [],
        arrows: [],
      });

      if (!error) lastAutosavedRef.current = snapshot;
    }, 450);

    return () => clearTimeout(autosaveRef.current);
  }, [activePlay?.id, activePlay?.tokens, isAdmin, queueUpdate]);

  const addStep = () => {
    const newSteps = [...steps, { 
      step: steps.length + 1, 
      tokens: JSON.parse(JSON.stringify(currentStep.tokens || [])), 
      arrows: [], 
      zones: JSON.parse(JSON.stringify(currentStep.zones || []))
    }];
    sync({ ...activePlay, tokens: newSteps });
    setActiveStepIndex(newSteps.length - 1);
    setSelectedTokenId(null);
  };

  const deleteCurrentStep = () => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== activeStepIndex);
    sync({ ...activePlay, tokens: newSteps });
    setActiveStepIndex(Math.max(0, activeStepIndex - 1));
  };

  // Playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      setAnimating(true);
      interval = setInterval(() => {
        setActiveStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            setTimeout(() => setAnimating(false), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  // Canvas Handlers
  const onMove = (id, x, y) => {
    updateCurrentStep({ tokens: (currentStep.tokens || []).map(t => t.id === id ? { ...t, x, y } : t) });
  };

  const onArrow = (a) => {
    updateCurrentStep({ arrows: [...(currentStep.arrows || []), { ...a, color: arrowColor, lineStyle: arrowStyle, dash: arrowStyle === 'dashed' ? '6,4' : '' }] });
  };
  const clearArrows = () => updateCurrentStep({ arrows: [] });
  const undoArrow = () => updateCurrentStep({ arrows: (currentStep.arrows || []).slice(0, -1) });
  
  const onPlace = (kind, x, y) => {
    let t = { id: kind + Date.now(), kind, x, y };
    if (kind === 'player') {
      t = { ...t, label: 'X', color: '#333' };
    }
    updateCurrentStep({ tokens: [...(currentStep.tokens || []), t] });
  };

  const onDeleteToken = (id) => {
    updateCurrentStep({ tokens: (currentStep.tokens || []).filter(t => t.id !== id) });
    if (selectedTokenId === id) setSelectedTokenId(null);
  };

  const onZoneAdd = (z) => updateCurrentStep({ zones: [...(currentStep.zones || []), z] });
  const onZoneDelete = (zid) => updateCurrentStep({ zones: (currentStep.zones || []).filter(z => z.id !== zid) });

  const updateSelectedToken = (updates) => {
    if (!selectedTokenId) return;
    updateCurrentStep({
      tokens: (currentStep.tokens || []).map(t => t.id === selectedTokenId ? { ...t, ...updates } : t)
    });
  };

  const togglePlayer = (p, isRival = false) => {
    if (!activePlay) return;
    const label = String(p.number || '?');
    const has = (currentStep.tokens || []).find(t => t.kind === "player" && t.label === label && !!t.isRival === isRival);
    if (has) {
      updateCurrentStep({ tokens: (currentStep.tokens || []).filter(t => t.id !== has.id) });
    } else {
      const fullName = [p.name, p.surname].filter(Boolean).join(' ').trim();
      updateCurrentStep({
        tokens: [...(currentStep.tokens || []), {
          id: `pl${label}${isRival ? 'R' : ''}t${Date.now()}`,
          kind: "player",
          x: 80 + Math.random() * 390,
          y: 40 + Math.random() * 280,
          color: isRival ? '#ef4444' : '#0057ff',
          label,
          name: isRival ? null : fullName || p.name,
          photo_url: isRival ? '' : (p.photo_url || ''),
          assigned_player_id: isRival ? null : p.id,
          tactical_role: '',
          tactical_note: '',
          isRival,
        }]
      });
    }
  };

  const createNewPlay = async () => {
    const name = prompt("Nombre de la nueva jugada:");
    if (!name) return;
    const np = { name, category: activeCategory, type: "Táctica", tokens: [{ step: 1, tokens: [], arrows: [], zones: [], playComment: '' }], arrows: [] };
    
    try {
      const { data, error } = await supabase.from('plays').insert([
        { ...np, created_by: profile?.id }
      ]).select().single();

      if (error) throw error;
      if (data) {
        setPlays([data, ...plays]);
        setActivePlay(data);
      }
    } catch (err) {
      console.error('Error creating play:', err);
      alert('Error al crear la jugada. Revisa tu conexion o permisos.');
      return;
    }
    setActiveStepIndex(0);
  };

  const deletePlay = async () => {
    if (!activePlay) return;
    if (!confirm('¿Eliminar esta jugada?')) return;
    
    try {
      await supabase.from('plays').delete().eq('id', activePlay.id);
    } catch {}
    
    const remaining = plays.filter(p => p.id !== activePlay.id);
    setPlays(remaining);
    setActivePlay(remaining[0] || null);
    setActiveStepIndex(0);
  };

  // Pilar 2 — offline-aware save (queues to IndexedDB when no connection)
  const savePlay = async () => {
    if (!activePlay) return;
    if (!isPersistedId(activePlay.id)) {
      alert('Esta jugada aun no esta guardada en Supabase.');
      return;
    }
    const { error } = await queueUpdate('plays', activePlay.id, {
      tokens: activePlay.tokens,
      arrows: [],
    });
    if (error) {
      alert('⚠️ Sin conexión. La jugada se guardará cuando vuelva la red.');
    } else if (navigator.onLine) {
      alert('✅ Jugada guardada.');
    } else {
      alert('📴 Guardado localmente. Se sincronizará al recuperar la conexión.');
    }
  };

  // Pilar 4 — export active play steps as a WebM video using SVG → canvas → MediaRecorder
  const exportPlay = useCallback(async () => {
    if (!activePlay || exporting) return;
    const svgEl = fieldSvgRef.current;
    if (!svgEl) return;

    setExporting(true);

    const W_OUT = 1080;
    const H_OUT = Math.round(W_OUT * (366 / 550));

    const offCanvas = document.createElement('canvas');
    offCanvas.width = W_OUT;
    offCanvas.height = H_OUT;
    const ctx = offCanvas.getContext('2d');

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const stream = offCanvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
    const chunks = [];
    recorder.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activePlay.name || 'jugada'}-CFC.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    };

    const captureSvgToCanvas = () => new Promise(resolve => {
      const clone = svgEl.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', W_OUT);
      clone.setAttribute('height', H_OUT);
      const svgStr = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#2a6118';
        ctx.fillRect(0, 0, W_OUT, H_OUT);
        ctx.drawImage(img, 0, 0, W_OUT, H_OUT);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
      img.src = url;
    });

    recorder.start();

    for (let i = 0; i < steps.length; i++) {
      setActiveStepIndex(i);
      await new Promise(r => setTimeout(r, 120)); // let React re-render the SVG
      await captureSvgToCanvas();
      await new Promise(r => setTimeout(r, 1500)); // hold each step 1.5 s
    }

    recorder.stop();
  }, [activePlay, exporting, steps]); // eslint-disable-line react-hooks/exhaustive-deps

  const catInfo = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[6];

  // ── Sidebar content (shared between mobile and desktop) ─────────────────
  const SidebarContent = () => (
    <>
      {/* Category Tabs */}
      <div className="card" style={{ padding: 8 }}>
        <div className="label" style={{ marginBottom: 6 }}>
          <FolderOpen size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Categorías
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setActivePlay(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 8px', borderRadius: 7, border: 'none', background: activeCategory === cat.id ? `${cat.color}18` : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: activeCategory === cat.id ? 700 : 500, color: activeCategory === cat.id ? cat.color : '#64748b', transition: 'all .12s' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, opacity: activeCategory === cat.id ? 1 : 0.3 }} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plays List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 12, color: catInfo.color }}>{catInfo.label}</span>
        {isAdmin && <button className="btn btn-outline btn-sm" onClick={createNewPlay}><Plus size={14}/></button>}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#96a0b5', fontSize: 11 }}>Cargando...</div>
      ) : plays.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#96a0b5', fontSize: 11 }}>
          No hay jugadas en esta categoría.
          {isAdmin && <div style={{ marginTop: 6 }}>Pulsa <strong>+</strong> para crear una.</div>}
        </div>
      ) : (
        plays.map(p => (
          <div key={p.id}
            onClick={() => { setActivePlay(p); setActiveStepIndex(0); if (isMobile) setMobileTab('campo'); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${activePlay?.id === p.id ? catInfo.color : "#e0e4ed"}`, background: activePlay?.id === p.id ? `${catInfo.color}0d` : "white", cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "#96a0b5", marginTop: 1 }}>{p.tokens?.length || 1} pasos</div>
          </div>
        ))
      )}

      {/* Admin tools */}
      {isAdmin && activePlay && (
        <>
          <div className="card" style={{ padding: 10 }}>
            <div className="label">Cabrerizos FC</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {players.map(p => {
                const label = String(p.number || '?');
                const on = (currentStep.tokens || []).some(t => t.kind === "player" && t.label === label && !t.isRival);
                return (
                  <div key={p.id} onClick={() => togglePlayer(p, false)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 8, border: `1.5px solid ${on ? "#0057ff" : "#e0e4ed"}`, background: on ? "#eef3ff" : "white", cursor: "pointer", transition: 'all .1s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                      {p.number || '?'}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, flex: 1 }}>{p.name || 'Jugador'}</span>
                    {on && <span style={{ fontSize: 9, color: '#0057ff', fontWeight: 700 }}>✓</span>}
                  </div>
                );
              })}
            </div>
            <div className="label" style={{ marginTop: 10 }}>Equipo Rival</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {Array.from({ length: 11 }).map((_, i) => {
                const num = String(i + 1);
                const on = (currentStep.tokens || []).some(t => t.kind === "player" && t.label === num && t.isRival);
                return (
                  <div key={`rival-${i}`} onClick={() => togglePlayer({ number: i + 1 }, true)}
                    style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${on ? "#ef4444" : "#fca5a5"}`, background: on ? "#ef4444" : "#fee2e2", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, cursor: "pointer", color: on ? 'white' : '#ef4444' }}>
                    {num}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 9, color: '#96a0b5', marginTop: 6, padding: '4px 6px', background: '#f8f9fb', borderRadius: 6 }}>
              💡 Selecciona una ficha y usa la papelera (o doble clic / clic derecho) para eliminarla
            </div>
          </div>

          <div className="card" style={{ padding: 10 }}>
            <div className="label">Fichas</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {ELEM_BTNS.map(e => (
                <button key={e.id} onClick={() => setTool(t => t === e.id ? "move" : e.id)}
                  title={e.label}
                  style={{ height: 32, borderRadius: 7, border: `1.5px solid ${tool === e.id ? "#0057ff" : "#e0e4ed"}`, background: tool === e.id ? "#eef3ff" : "#f5f6f9", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <span>{e.icon}</span>
                  <span style={{ fontSize: 9 }}>{e.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Panel de Balón si está seleccionado */}
          {selectedTokenId && (currentStep.tokens || []).find(t => t.id === selectedTokenId)?.kind === 'ball' && (
            <div className="card" style={{ padding: 10, background: '#fffbeb', borderColor: '#fcd34d' }}>
              <div className="label">Efecto / Rotación</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {['top', 'bottom', 'left', 'right', 'curve-l', 'curve-r'].map(eff => (
                  <button key={eff} onClick={() => updateSelectedToken({ ballEffect: eff })}
                    style={{ fontSize: 9, padding: '4px 0', borderRadius: 4, border: '1px solid #fcd34d', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                    {eff.toUpperCase()}
                  </button>
                ))}
                <button onClick={() => updateSelectedToken({ ballEffect: null })}
                  style={{ fontSize: 9, padding: 4, borderRadius: 4, border: '1px solid #fca5a5', background: '#fee2e2', gridColumn: 'span 2', fontWeight: 700, cursor: 'pointer' }}>
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Panel de Jugador si está seleccionado */}
          {selectedTokenId && (currentStep.tokens || []).find(t => t.id === selectedTokenId)?.kind === 'player' && !(currentStep.tokens || []).find(t => t.id === selectedTokenId)?.isRival && (
            <div className="card" style={{ padding: 10, background: '#f0f9ff', borderColor: '#bae6fd' }}>
              <div className="label">Instrucciones Tácticas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <select 
                  className="input-field" 
                  style={{ padding: '6px 8px', fontSize: 11 }}
                  value={(currentStep.tokens || []).find(t => t.id === selectedTokenId)?.assigned_player_id || ''}
                  onChange={e => updateSelectedToken({ assigned_player_id: e.target.value })}
                >
                  <option value="">-- Vincular Jugador --</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name} {p.surname}</option>)}
                </select>
                <input 
                  className="input-field" 
                  placeholder="Rol (Ej: Bloqueo ciego)" 
                  style={{ fontSize: 11, padding: '6px 8px' }}
                  value={(currentStep.tokens || []).find(t => t.id === selectedTokenId)?.tactical_role || ''}
                  onChange={e => updateSelectedToken({ tactical_role: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 10 }}>
            <div className="label">Trazos (Flechas)</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {VECTOR_STYLES.map(s => (
                <button key={s.id} onClick={() => { setArrowStyle(s.id); setTool('arrow'); }} title={s.label}
                  style={{ flex: 1, padding: 4, borderRadius: 6, border: `1.5px solid ${arrowStyle === s.id ? '#0057ff' : '#e0e4ed'}`, background: arrowStyle === s.id ? '#eef3ff' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                  {s.icon}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {VECTOR_COLORS.map(c => (
                <div key={c.id} onClick={() => { setArrowColor(c.id); setTool('arrow'); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: 6, cursor: "pointer", background: arrowColor === c.id ? "#f5f6f9" : "transparent" }}>
                  <div style={{ width: 14, height: 14, background: c.hex, borderRadius: '50%' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: arrowColor === c.id ? "#111" : "#4a5568" }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );

  const DesktopLibraryPanel = () => (
    <div style={{ ...DARK_PANEL, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: catInfo.color, marginBottom: 4 }}>Biblioteca táctica</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: '#f8fafc' }}>{catInfo.label}</div>
        </div>
        {isAdmin && (
          <button onClick={createNewPlay} style={{ width: 38, height: 38, borderRadius: 14, border: '1px solid rgba(96,165,250,.25)', background: 'rgba(59,130,246,.16)', color: '#93c5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} />
          </button>
        )}
      </div>

      <div style={{ ...DARK_CARD, padding: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Categorías</div>
        <div style={{ display: 'grid', gap: 6 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setActivePlay(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                border: `1px solid ${activeCategory === cat.id ? `${cat.color}55` : 'rgba(148,163,184,0.08)'}`,
                background: activeCategory === cat.id ? `${cat.color}20` : 'rgba(15,23,42,0.45)',
                color: activeCategory === cat.id ? '#fff' : '#cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: activeCategory === cat.id ? 800 : 600,
                textAlign: 'left',
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8' }}>Jugadas</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#e2e8f0' }}>{plays.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingRight: 4 }}>
        {loading ? (
          <div style={{ ...DARK_CARD, padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Cargando...</div>
        ) : plays.length === 0 ? (
          <div style={{ ...DARK_CARD, padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>No hay jugadas en esta categoría.</div>
        ) : (
          plays.map(p => (
            <button
              key={p.id}
              onClick={() => { setActivePlay(p); setActiveStepIndex(0); }}
              style={{
                ...DARK_CARD,
                padding: '14px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                border: `1px solid ${activePlay?.id === p.id ? catInfo.color : 'rgba(148,163,184,0.12)'}`,
                background: activePlay?.id === p.id ? `${catInfo.color}1f` : 'rgba(15,23,42,0.7)',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 13, color: '#f8fafc' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{p.tokens?.length || 1} pasos</div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const DesktopRosterPanel = () => (
    <div style={{ ...DARK_PANEL, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Plantilla</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#f8fafc' }}>Jugadores en campo</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ padding: '8px 10px', borderRadius: 14, background: 'rgba(59,130,246,.12)', color: '#93c5fd', fontSize: 11, fontWeight: 800 }}>{squadTokens.length} CFC</div>
          <div style={{ padding: '8px 10px', borderRadius: 14, background: 'rgba(239,68,68,.12)', color: '#fca5a5', fontSize: 11, fontWeight: 800 }}>{rivalTokens.length} Rival</div>
        </div>
      </div>

      <div style={{ ...DARK_CARD, padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.map((p) => {
          const label = String(p.number || '?');
          const on = squadTokens.some(t => t.label === label && !t.isRival);
          return (
            <button
              key={p.id}
              onClick={() => togglePlayer(p, false)}
              style={{
                display: 'grid',
                gridTemplateColumns: '42px minmax(0,1fr) auto',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 16,
                border: `1px solid ${on ? 'rgba(96,165,250,.45)' : 'rgba(148,163,184,0.12)'}`,
                background: on ? 'rgba(37,99,235,.16)' : 'rgba(15,23,42,0.5)',
                cursor: 'pointer',
                color: '#e2e8f0',
                textAlign: 'left',
              }}
            >
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name || 'Jugador'} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,.12)' }} />
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: 12, background: on ? '#2563eb' : 'rgba(30,41,59,0.9)', border: '1px solid rgba(148,163,184,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff' }}>
                  {p.number || (p.name?.[0] || '?')}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name} {p.surname}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>#{p.number || '?'} {on ? 'en el campo' : 'añadir'}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 900, color: on ? '#93c5fd' : '#64748b' }}>{on ? 'QUITAR' : 'PONER'}</div>
            </button>
          );
        })}
      </div>

      <div style={{ ...DARK_CARD, padding: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fca5a5', marginBottom: 10 }}>Rival</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8 }}>
          {Array.from({ length: 11 }).map((_, i) => {
            const num = String(i + 1);
            const on = rivalTokens.some(t => t.label === num);
            return (
              <button
                key={`r-${num}`}
                onClick={() => togglePlayer({ number: i + 1 }, true)}
                style={{
                  height: 42,
                  borderRadius: 14,
                  border: `1px solid ${on ? 'rgba(248,113,113,.58)' : 'rgba(248,113,113,.22)'}`,
                  background: on ? 'rgba(127,29,29,.85)' : 'rgba(69,10,10,.35)',
                  color: on ? '#fff' : '#fca5a5',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Canvas toolbar (shared) ───────────────────────────────────────────
  const Toolbar = () => (
    isAdmin && activePlay ? (
      <div style={{ display: "flex", alignItems: "center", gap: 5, background: "white", border: "1px solid #e0e4ed", borderRadius: 9, padding: "6px 8px", flexWrap: 'wrap' }}>
        {/* Live indicator */}
        <div title={isOnline ? 'En línea — cambios en tiempo real' : 'Sin conexión — guardado local'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 20, background: isOnline ? (liveFlash ? '#d1fae5' : '#f0fdf4') : '#fff7ed', border: `1px solid ${isOnline ? '#6ee7b7' : '#fed7aa'}`, transition: 'background .4s' }}>
          {isOnline
            ? <Wifi size={11} color="#059669" />
            : <WifiOff size={11} color="#f97316" />}
          <span style={{ fontSize: 9, fontWeight: 700, color: isOnline ? '#059669' : '#f97316' }}>
            {liveFlash ? '¡LIVE!' : isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: "#e0e4ed", margin: "0 2px" }} />

        <button onClick={() => setTool('move')} title="Mover"
          style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "move" ? "#0057ff" : "#e0e4ed"}`, background: tool === "move" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "move" ? "#0057ff" : "#4a5568" }}>
          <Move size={16} />
        </button>
        <button onClick={() => setTool('arrow')} title="Flecha"
          style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "arrow" ? "#0057ff" : "#e0e4ed"}`, background: tool === "arrow" ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "arrow" ? "#0057ff" : "#4a5568" }}>
          <ArrowRight size={16} />
        </button>
        <button onClick={() => { setTool('zone'); setZoneColor('red'); }} title="Zona Peligro"
          style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${tool === "zone" && zoneColor === 'red' ? "#0057ff" : "#e0e4ed"}`, background: tool === "zone" && zoneColor === 'red' ? "#eef3ff" : "#f5f6f9", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === "zone" && zoneColor === 'red' ? "#0057ff" : "#ef4444" }}>
          <Layers size={16} />
        </button>

        <div style={{ display: 'flex', gap: 4, paddingLeft: 2 }}>
          {QUICK_TOOL_BTNS.map(btn => (
            <button
              key={btn.id}
              onClick={() => setTool(btn.id)}
              title={btn.title}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: `1.5px solid ${tool === btn.id ? "#0057ff" : "#e0e4ed"}`,
                background: tool === btn.id ? "#eef3ff" : "#f5f6f9",
                cursor: "pointer",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tool === btn.id ? "#0057ff" : "#4a5568",
                fontSize: 14,
                fontWeight: 700
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => { if (selectedTokenId) onDeleteToken(selectedTokenId); }}
          disabled={!selectedTokenId}
          title={selectedTokenId ? 'Borrar ficha seleccionada' : 'Selecciona una ficha para borrar'}
          className="btn btn-outline btn-sm"
          style={{ color: selectedTokenId ? '#ef4444' : '#94a3b8' }}
        >
          <Trash2 size={12} />
        </button>

        <div style={{ width: 1, height: 20, background: "#e0e4ed", margin: "0 2px" }} />
        <button onClick={undoArrow} className="btn btn-outline btn-sm"><Undo2 size={12}/></button>
        <button onClick={clearArrows} className="btn btn-outline btn-sm"><Trash2 size={12}/></button>
        <button onClick={deletePlay} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }}><Trash2 size={12}/></button>
        <button onClick={cycleView}
          style={{ padding: '0 8px', height: 32, borderRadius: 6, border: '1.5px solid #e0e4ed', background: fieldView !== 'full' ? '#eef3ff' : '#f5f6f9', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: fieldView !== 'full' ? '#0057ff' : '#4a5568', whiteSpace: 'nowrap' }}>
          {VIEWS.find(v => v.id === fieldView)?.label}
        </button>

        {/* Pilar 3 — Heatmap toggle */}
        <button onClick={() => setShowHeatmap(h => !h)} title="Mapa de Calor"
          style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${showHeatmap ? '#f97316' : '#e0e4ed'}`, background: showHeatmap ? '#fff7ed' : '#f5f6f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showHeatmap ? '#f97316' : '#4a5568' }}>
          <Thermometer size={16} />
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {/* Pilar 4 — Export video */}
          <button onClick={exportPlay} disabled={exporting || steps.length < 2} className="btn btn-outline btn-sm" title="Exportar jugada como video">
            <Download size={12}/> {exporting ? 'Grabando...' : 'Exportar'}
          </button>
          <button onClick={() => setPresentationMode(true)} className="btn btn-outline btn-sm">
            <Monitor size={14}/> TV Mode
          </button>
          <button onClick={savePlay} className="btn btn-primary btn-sm"><Save size={12}/> Guardar</button>
        </div>
      </div>
    ) : null
  );

  const Timeline = () => (
    activePlay ? (
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", border: "1px solid #e0e4ed", borderRadius: 9, padding: "8px 12px" }}>
        <button onClick={() => { setIsPlaying(true); setActiveStepIndex(0); }} className="btn btn-primary btn-sm" disabled={steps.length < 2 || isPlaying}>
          <Play size={14} /> Reproducir
        </button>
        <div style={{ width: 1, height: 20, background: "#e0e4ed", margin: "0 4px" }} />
        
        <div style={{ display: 'flex', gap: 6, flex: 1, overflowX: 'auto', paddingBottom: 2 }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => { setActiveStepIndex(i); setIsPlaying(false); }}
              style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1.5px solid ${activeStepIndex === i ? '#0057ff' : '#e0e4ed'}`, background: activeStepIndex === i ? '#eef3ff' : 'white', color: activeStepIndex === i ? '#0057ff' : '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Paso {i + 1}
            </button>
          ))}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.length > 1 && (
              <button onClick={deleteCurrentStep} className="btn btn-outline btn-sm" title="Borrar Paso" style={{ color: '#ef4444' }}>
                <Trash2 size={14} />
              </button>
            )}
            <button onClick={addStep} className="btn btn-outline btn-sm">
              <Plus size={14} /> Añadir Paso
            </button>
          </div>
        )}
      </div>
    ) : null
  );

  const MobileAdminSteps = () => activePlay ? (
    <div style={{ borderRadius: 18, background: 'rgba(15,23,42,.92)', border: '1px solid rgba(148,163,184,.18)', padding: 10, boxShadow: '0 16px 36px rgba(2,6,23,.22)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <button
          onClick={() => { setIsPlaying(true); setActiveStepIndex(0); }}
          disabled={steps.length < 2 || isPlaying}
          style={{ minHeight: 42, padding: '0 13px', borderRadius: 14, border: '1px solid rgba(96,165,250,.35)', background: steps.length < 2 || isPlaying ? 'rgba(148,163,184,.12)' : 'linear-gradient(135deg,#2563eb,#38bdf8)', color: '#f8fafc', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Play size={15} /> Play
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f8fafc', fontWeight: 950, fontSize: 13 }}>Paso {activeStepIndex + 1} de {steps.length}</div>
          <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>Duplica posiciones y crea variantes sin perder el campo.</div>
        </div>
        {steps.length > 1 && (
          <button
            onClick={deleteCurrentStep}
            style={{ width: 42, height: 42, borderRadius: 14, border: '1px solid rgba(248,113,113,.35)', background: 'rgba(127,29,29,.2)', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Borrar paso actual"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveStepIndex(i); setIsPlaying(false); }}
            style={{ flex: '0 0 auto', minWidth: 58, minHeight: 38, borderRadius: 13, border: `1px solid ${activeStepIndex === i ? 'rgba(96,165,250,.65)' : 'rgba(148,163,184,.2)'}`, background: activeStepIndex === i ? 'rgba(37,99,235,.24)' : 'rgba(255,255,255,.06)', color: activeStepIndex === i ? '#bfdbfe' : '#cbd5e1', fontWeight: 900, fontSize: 12 }}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={addStep}
          style={{ flex: '0 0 auto', minHeight: 38, padding: '0 14px', borderRadius: 13, border: '1px solid rgba(52,211,153,.45)', background: 'rgba(6,78,59,.36)', color: '#86efac', fontWeight: 950, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Paso
        </button>
      </div>
    </div>
  ) : null;

  const MobileAdminTools = () => activePlay ? (
    <div style={{ borderRadius: 18, background: 'rgba(15,23,42,.88)', border: '1px solid rgba(148,163,184,.16)', padding: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 9 }}>
        {[
          { id: 'move', label: 'Mover', icon: <Move size={16} /> },
          { id: 'arrow', label: 'Flecha', icon: <ArrowRight size={16} /> },
          { id: 'zone', label: 'Zona', icon: <Layers size={16} /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => { setTool(item.id); if (item.id === 'zone') setZoneColor('red'); }}
            style={{ minHeight: 44, borderRadius: 14, border: `1px solid ${tool === item.id ? 'rgba(96,165,250,.62)' : 'rgba(148,163,184,.18)'}`, background: tool === item.id ? 'rgba(37,99,235,.28)' : 'rgba(255,255,255,.06)', color: tool === item.id ? '#bfdbfe' : '#e2e8f0', fontWeight: 900, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {ELEM_BTNS.filter(e => e.id !== 'zone' && e.id !== 'player').map(e => (
          <button
            key={e.id}
            onClick={() => setTool(t => t === e.id ? 'move' : e.id)}
            style={{ flex: '0 0 auto', minWidth: 58, minHeight: 44, borderRadius: 14, border: `1px solid ${tool === e.id ? 'rgba(52,211,153,.55)' : 'rgba(148,163,184,.16)'}`, background: tool === e.id ? 'rgba(6,95,70,.32)' : 'rgba(255,255,255,.06)', color: '#f8fafc', fontWeight: 900, fontSize: 18 }}
            title={e.label}
          >
            {e.icon}
          </button>
        ))}
        <button onClick={() => { if (selectedTokenId) onDeleteToken(selectedTokenId); }} disabled={!selectedTokenId} style={{ flex: '0 0 auto', minWidth: 54, minHeight: 44, borderRadius: 14, border: '1px solid rgba(248,113,113,.3)', background: selectedTokenId ? 'rgba(127,29,29,.3)' : 'rgba(148,163,184,.08)', color: selectedTokenId ? '#fca5a5' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  ) : null;

  const MobilePlayerStrip = () => activePlay ? (
    <div style={{ borderRadius: 18, background: 'rgba(15,23,42,.9)', border: '1px solid rgba(148,163,184,.16)', padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ color: '#f8fafc', fontWeight: 950, fontSize: 13 }}>Plantilla</div>
          <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>Toca para poner o quitar del campo.</div>
        </div>
        <button onClick={savePlay} style={{ minHeight: 38, padding: '0 12px', borderRadius: 13, border: '1px solid rgba(52,211,153,.42)', background: 'rgba(6,78,59,.35)', color: '#86efac', fontWeight: 950, fontSize: 12 }}>
          Guardar
        </button>
      </div>
      <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 4 }}>
        {players.map(p => {
          const label = String(p.number || '?');
          const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === label && !t.isRival);
          return (
            <button
              key={p.id}
              onClick={() => togglePlayer(p, false)}
              style={{ flex: '0 0 76px', borderRadius: 15, border: `1px solid ${on ? 'rgba(96,165,250,.65)' : 'rgba(148,163,184,.16)'}`, background: on ? 'rgba(37,99,235,.24)' : 'rgba(255,255,255,.06)', color: '#f8fafc', padding: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
            >
              <div style={{ width: 36, height: 48, borderRadius: 10, overflow: 'hidden', background: on ? '#1d4ed8' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfdbfe', fontWeight: 950, boxShadow: '0 8px 18px rgba(0,0,0,.2)' }}>
                {p.photo_url ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.number || '?')}
              </div>
              <span style={{ width: '100%', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            </button>
          );
        })}
        {Array.from({ length: 11 }).map((_, i) => {
          const num = String(i + 1);
          const on = (currentStep.tokens || []).some(t => t.kind === 'player' && t.label === num && t.isRival);
          return (
            <button key={`rival-mobile-${i}`} onClick={() => togglePlayer({ number: i + 1 }, true)} style={{ flex: '0 0 46px', minHeight: 48, borderRadius: 14, border: `1px solid ${on ? 'rgba(248,113,113,.68)' : 'rgba(248,113,113,.2)'}`, background: on ? 'rgba(220,38,38,.3)' : 'rgba(127,29,29,.12)', color: on ? '#fecaca' : '#fca5a5', fontWeight: 950 }}>
              R{num}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  const DesktopToolbar = () => (
    isAdmin && activePlay ? (
      <div style={{ ...DARK_PANEL, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div title={isOnline ? 'En línea — cambios en tiempo real' : 'Sin conexión — guardado local'} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 999, background: isOnline ? (liveFlash ? 'rgba(16,185,129,.18)' : 'rgba(15,118,110,.18)') : 'rgba(249,115,22,.14)', border: `1px solid ${isOnline ? 'rgba(52,211,153,.28)' : 'rgba(251,146,60,.28)'}` }}>
          {isOnline ? <Wifi size={11} color="#059669" /> : <WifiOff size={11} color="#f97316" />}
          <span style={{ fontSize: 9, fontWeight: 700, color: isOnline ? '#34d399' : '#fb923c' }}>{liveFlash ? '¡LIVE!' : isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(148,163,184,0.14)' }} />
        {[
          { id: 'move', icon: <Move size={16} />, title: 'Mover' },
          { id: 'arrow', icon: <ArrowRight size={16} />, title: 'Flecha' },
          { id: 'zone', icon: <Layers size={16} />, title: 'Zona' },
        ].map(item => (
          <button key={item.id} onClick={() => { setTool(item.id); if (item.id === 'zone') setZoneColor('red'); }} title={item.title}
            style={{ width: 36, height: 36, borderRadius: 12, border: `1px solid ${tool === item.id ? 'rgba(96,165,250,.45)' : 'rgba(148,163,184,0.14)'}`, background: tool === item.id ? 'rgba(37,99,235,.18)' : 'rgba(15,23,42,.62)', color: item.id === 'zone' && tool !== item.id ? '#f87171' : tool === item.id ? '#93c5fd' : '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.icon}
          </button>
        ))}
        <div style={{ display: 'flex', gap: 4 }}>
          {QUICK_TOOL_BTNS.map(btn => (
            <button key={btn.id} onClick={() => setTool(btn.id)} title={btn.title}
              style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${tool === btn.id ? 'rgba(96,165,250,.45)' : 'rgba(148,163,184,0.14)'}`, background: tool === btn.id ? 'rgba(37,99,235,.18)' : 'rgba(15,23,42,.62)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool === btn.id ? '#93c5fd' : '#cbd5e1', fontSize: 14, fontWeight: 700 }}>
              {btn.label}
            </button>
          ))}
        </div>
        <button onClick={() => { if (selectedTokenId) onDeleteToken(selectedTokenId); }} disabled={!selectedTokenId} className="btn btn-outline btn-sm" style={{ color: selectedTokenId ? '#f87171' : '#94a3b8', background: 'rgba(15,23,42,.62)', borderColor: 'rgba(148,163,184,0.16)' }}>
          <Trash2 size={12} />
        </button>
        <div style={{ width: 1, height: 24, background: 'rgba(148,163,184,0.14)' }} />
        <button onClick={undoArrow} className="btn btn-outline btn-sm" style={{ background: 'rgba(15,23,42,.62)', borderColor: 'rgba(148,163,184,0.16)', color: '#cbd5e1' }}><Undo2 size={12}/></button>
        <button onClick={clearArrows} className="btn btn-outline btn-sm" style={{ background: 'rgba(15,23,42,.62)', borderColor: 'rgba(148,163,184,0.16)', color: '#cbd5e1' }}><Trash2 size={12}/></button>
        <button onClick={deletePlay} className="btn btn-outline btn-sm" style={{ color: '#f87171', background: 'rgba(15,23,42,.62)', borderColor: 'rgba(248,113,113,.2)' }}><Trash2 size={12}/></button>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => setFieldView(v.id)}
              style={{ padding: '0 12px', height: 34, borderRadius: 999, border: `1px solid ${fieldView === v.id ? 'rgba(96,165,250,.42)' : 'rgba(148,163,184,0.14)'}`, background: fieldView === v.id ? 'rgba(37,99,235,.22)' : 'rgba(15,23,42,.62)', color: fieldView === v.id ? '#bfdbfe' : '#cbd5e1', cursor: 'pointer', fontSize: 11, fontWeight: 800 }}>
              {v.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowHeatmap(h => !h)} title="Mapa de calor"
          style={{ width: 36, height: 36, borderRadius: 12, border: `1px solid ${showHeatmap ? 'rgba(251,146,60,.42)' : 'rgba(148,163,184,0.14)'}`, background: showHeatmap ? 'rgba(194,65,12,.24)' : 'rgba(15,23,42,.62)', color: showHeatmap ? '#fdba74' : '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Thermometer size={16} />
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={exportPlay} disabled={exporting || steps.length < 2} className="btn btn-outline btn-sm" title="Exportar jugada como video" style={{ background: 'rgba(15,23,42,.62)', borderColor: 'rgba(148,163,184,0.16)', color: '#cbd5e1' }}>
            <Download size={12}/> {exporting ? 'Grabando...' : 'Exportar'}
          </button>
          <button onClick={() => setPresentationMode(true)} className="btn btn-outline btn-sm" style={{ background: 'rgba(15,23,42,.62)', borderColor: 'rgba(148,163,184,0.16)', color: '#cbd5e1' }}>
            <Monitor size={14}/> TV Mode
          </button>
          <button onClick={savePlay} className="btn btn-primary btn-sm"><Save size={12}/> Guardar</button>
        </div>
      </div>
    ) : null
  );

  const DesktopEditorRail = () => (
    <div style={{ ...DARK_PANEL, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Editor</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#f8fafc' }}>{activePlay?.name || 'Sin jugada'}</div>
      </div>

      <div style={{ ...DARK_CARD, padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Comentario general</div>
        <textarea
          value={playComment}
          onChange={(e) => updatePlayComment(e.target.value)}
          placeholder="Objetivo, variantes, puntos clave y consignas colectivas de la jugada..."
          style={{ width: '100%', minHeight: 120, resize: 'vertical', borderRadius: 14, border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(15,23,42,0.76)', color: '#f8fafc', padding: '12px 14px', fontSize: 13, lineHeight: 1.5, outline: 'none' }}
        />
      </div>

      <div style={{ ...DARK_CARD, padding: 14, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Jugador seleccionado</div>
        {selectedPlayerToken ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '44px minmax(0,1fr)', gap: 10, alignItems: 'center' }}>
              {selectedPlayerToken.photo_url ? (
                <img src={selectedPlayerToken.photo_url} alt={selectedPlayerToken.name || 'Jugador'} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,.14)' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: selectedPlayerToken.isRival ? '#991b1b' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                  {selectedPlayerToken.label}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPlayerToken.name || `Jugador ${selectedPlayerToken.label}`}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{selectedPlayerToken.isRival ? 'Rival' : 'Cabrerizos FC'} {selectedPlayerToken.tactical_note ? '• con instrucción' : ''}</div>
              </div>
            </div>
            {!selectedPlayerToken.isRival && (
              <select className="input-field" style={{ padding: '10px 12px', fontSize: 12, background: 'rgba(15,23,42,0.76)', color: '#f8fafc', borderColor: 'rgba(148,163,184,0.18)' }}
                value={selectedPlayerToken.assigned_player_id || ''}
                onChange={e => updateSelectedToken({ assigned_player_id: e.target.value })}
              >
                <option value="">-- Vincular jugador --</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} {p.surname}</option>)}
              </select>
            )}
            <input className="input-field" placeholder="Rol corto (Ej: Bloqueo primer palo)" style={{ padding: '10px 12px', fontSize: 12, background: 'rgba(15,23,42,0.76)', color: '#f8fafc', borderColor: 'rgba(148,163,184,0.18)' }}
              value={selectedPlayerToken.tactical_role || ''}
              onChange={e => updateSelectedToken({ tactical_role: e.target.value })}
            />
            <textarea
              value={selectedPlayerToken.tactical_note || ''}
              onChange={e => updateSelectedToken({ tactical_note: e.target.value })}
              placeholder="Instrucción individual: qué hace, cuándo salta, a qué zona va, variante si cambia el rival..."
              style={{ width: '100%', minHeight: 118, resize: 'vertical', borderRadius: 14, border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(15,23,42,0.76)', color: '#f8fafc', padding: '12px 14px', fontSize: 13, lineHeight: 1.45, outline: 'none' }}
            />
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>Selecciona un jugador del campo para añadirle una instrucción individual persistida dentro de la jugada.</div>
        )}
      </div>

      <div style={{ ...DARK_CARD, padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Trazos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 6, marginBottom: 10 }}>
          {VECTOR_STYLES.map(styleItem => (
            <button key={styleItem.id} onClick={() => { setArrowStyle(styleItem.id); setTool('arrow'); }}
              style={{ height: 36, borderRadius: 12, border: `1px solid ${arrowStyle === styleItem.id ? 'rgba(96,165,250,.42)' : 'rgba(148,163,184,0.14)'}`, background: arrowStyle === styleItem.id ? 'rgba(37,99,235,.18)' : 'rgba(15,23,42,.62)', color: arrowStyle === styleItem.id ? '#bfdbfe' : '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {styleItem.icon}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {VECTOR_COLORS.map(colorItem => (
            <button key={colorItem.id} onClick={() => { setArrowColor(colorItem.id); setTool('arrow'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: `1px solid ${arrowColor === colorItem.id ? 'rgba(96,165,250,.42)' : 'rgba(148,163,184,0.14)'}`, background: arrowColor === colorItem.id ? 'rgba(37,99,235,.12)' : 'rgba(15,23,42,.55)', color: '#e2e8f0', cursor: 'pointer' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: colorItem.hex }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{colorItem.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (presentationMode) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => setPresentationMode(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.2)', color: 'white', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <div style={{ width: '100%', maxWidth: 800, aspectRatio: '550/366', background: "#2a6118", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
          <FieldCanvas 
            tokens={currentStep.tokens} arrows={currentStep.arrows} zones={currentStep.zones}
            animating={animating} presentationMode={true} viewMode={fieldView} adaptiveView={true}
          />
        </div>
        <div style={{ position: 'absolute', bottom: 30, display: 'flex', gap: 10 }}>
          <button onClick={() => { setIsPlaying(true); setActiveStepIndex(0); }} className="btn btn-primary"><Play size={16}/> Reproducir</button>
        </div>
      </div>
    );
  }

  // ── Mobile layout (player-first) ──────────────────────────────────────
  if (isMobile && !isAdmin) {
    const activeLabel = (CATEGORIES.find(c => c.id === activeCategory)?.label) || 'Categoría';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Selector bar */}
        <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPlayerSheetOpen(true)}
            style={{ flex: 1, justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 950 }}>
              {activePlay ? activePlay.name : 'Elige jugada'}
            </span>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 900 }}>{activeLabel}</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowHeatmap(h => !h)} title="Mapa de calor">
            <Thermometer size={14} />
          </button>
        </div>

        {/* Field first */}
        <div style={{ aspectRatio: fieldRatio, width: '100%', background: "#2a6118", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 26px rgba(0,0,0,.25)", position: 'relative' }}>
          {showHeatmap ? (
            <Heatmap plays={allPlays} includeArrows />
          ) : activePlay ? (
            <FieldCanvas
              ref={fieldSvgRef}
              tokens={currentStep.tokens || []}
              arrows={currentStep.arrows || []}
              zones={currentStep.zones || []}
              tool="move"
              arrowType={effectiveArrowType}
              drawPt={drawPt}
              setDrawPt={setDrawPt}
              viewMode={fieldView}
              animating={animating}
              selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId}
              myRosterId={myRosterId}
              presentationMode={true}
              adaptiveView={true}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.78)', padding: '48px 20px' }}>
              <div style={{ fontSize: 42, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 950, marginBottom: 6 }}>Elige una jugada</div>
              <div style={{ fontSize: 12, opacity: 0.95 }}>Pulsa “Elige jugada” para ver categorías y jugadas.</div>
            </div>
          )}
        </div>

        {(playComment || myInstructionToken?.tactical_note || myInstructionToken?.tactical_role) && (
          <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {playComment && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#64748b', marginBottom: 6 }}>Explicación de la jugada</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: '#1e293b', fontWeight: 600 }}>{playComment}</div>
              </div>
            )}
            {(myInstructionToken?.tactical_role || myInstructionToken?.tactical_note) && (
              <div style={{ padding: '12px 14px', background: '#eff6ff', borderRadius: 14, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#1d4ed8', marginBottom: 6 }}>Tu instrucción</div>
                {myInstructionToken?.tactical_role && <div style={{ fontSize: 12, fontWeight: 800, color: '#1e3a8a', marginBottom: myInstructionToken?.tactical_note ? 6 : 0 }}>{myInstructionToken.tactical_role}</div>}
                {myInstructionToken?.tactical_note && <div style={{ fontSize: 13, lineHeight: 1.5, color: '#1e293b', fontWeight: 600 }}>{myInstructionToken.tactical_note}</div>}
              </div>
            )}
          </div>
        )}

        <Timeline />

        {/* Bottom sheet selector */}
        {playerSheetOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div onClick={() => setPlayerSheetOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'white', borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden', maxHeight: '78vh', boxShadow: '0 -24px 70px rgba(0,0,0,.35)' }}>
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e2e8f0', margin: '0 auto 8px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 950, color: '#0f172a', flex: 1 }}>Jugadas</div>
                  <button className="btn btn-outline btn-sm" onClick={() => setPlayerSheetOpen(false)}>Listo</button>
                </div>
              </div>
              <div style={{ padding: 14, overflowY: 'auto' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setPlayerCatOpen(o => !o)} style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 950 }}>{activeLabel}</span>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>Cambiar</span>
                </button>

                {playerCatOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {CATEGORIES.map(c => (
                      <button
                        key={c.id}
                        className="btn btn-outline"
                        onClick={() => { setActiveCategory(c.id); setActivePlay(null); setActiveStepIndex(0); setPlayerCatOpen(false); }}
                        style={{ justifyContent: 'space-between' }}
                      >
                        <span style={{ fontWeight: 950 }}>{c.label}</span>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 900 }}>
                          {allPlays.filter(p => p.category === c.id).length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {loading ? (
                    <div className="card" style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>Cargando...</div>
                  ) : plays.length === 0 ? (
                    <div className="card" style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>No hay jugadas en esta categoría.</div>
                  ) : (
                    plays.map(p => (
                      <button
                        key={p.id}
                        className="btn btn-outline"
                        onClick={() => { setActivePlay(p); setActiveStepIndex(0); setPlayerSheetOpen(false); }}
                        style={{ justifyContent: 'space-between', padding: '12px 14px', borderColor: activePlay?.id === p.id ? catInfo.color : '#dbe1ea' }}
                      >
                        <span style={{ fontWeight: 950, color: '#0f172a' }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 900 }}>{(p.steps || []).length} pasos</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div style={{ paddingBottom: `calc(12px + env(safe-area-inset-bottom))` }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Mobile layout (admin) ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 'calc(100dvh - 78px)', margin: -4, padding: 8, background: 'linear-gradient(180deg,#05070a,#0f172a 48%,#111827)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'rgba(15,23,42,.82)', border: '1px solid rgba(148,163,184,.16)', borderRadius: 18, padding: 5, position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(14px)' }}>
          <button onClick={() => setMobileTab('jugadas')}
            style={{ minHeight: 46, borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 950, fontSize: 14, background: mobileTab === 'jugadas' ? '#f8fafc' : 'transparent', color: mobileTab === 'jugadas' ? '#0f172a' : '#cbd5e1', boxShadow: mobileTab === 'jugadas' ? '0 10px 24px rgba(15,23,42,.22)' : 'none', transition: 'all .15s' }}>
            📋 Jugadas
          </button>
          <button onClick={() => setMobileTab('campo')}
            style={{ minHeight: 46, borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 950, fontSize: 14, background: mobileTab === 'campo' ? '#f8fafc' : 'transparent', color: mobileTab === 'campo' ? '#0f172a' : '#cbd5e1', boxShadow: mobileTab === 'campo' ? '0 10px 24px rgba(15,23,42,.22)' : 'none', transition: 'all .15s' }}>
            ⚽ Campo
          </button>
        </div>

        {mobileTab === 'jugadas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ borderRadius: 20, background: '#f8fafc', padding: 10, boxShadow: '0 18px 44px rgba(2,6,23,.28)' }}>
              <SidebarContent />
            </div>
            {activePlay && (
              <button onClick={() => setMobileTab('campo')} style={{ minHeight: 52, borderRadius: 16, border: '1px solid rgba(96,165,250,.35)', background: 'linear-gradient(135deg,#2563eb,#38bdf8)', color: '#f8fafc', fontWeight: 950, fontSize: 14, boxShadow: '0 18px 35px rgba(37,99,235,.28)' }}>
                Editar en campo: {activePlay.name}
              </button>
            )}
          </div>
        )}

        {mobileTab === 'campo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, color: '#f8fafc' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 950, letterSpacing: '.14em', textTransform: 'uppercase', color: catInfo.color }}>Editor movil</div>
                <div style={{ fontSize: 18, fontWeight: 950, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activePlay?.name || 'Selecciona una jugada'}</div>
              </div>
              <button onClick={() => setMobileTab('jugadas')} style={{ minHeight: 40, padding: '0 13px', borderRadius: 14, border: '1px solid rgba(148,163,184,.18)', background: 'rgba(255,255,255,.08)', color: '#e2e8f0', fontWeight: 900 }}>
                Cambiar
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 7 }}>
              {VIEWS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setFieldView(v.id)}
                  style={{ minHeight: 42, borderRadius: 14, border: `1px solid ${fieldView === v.id ? 'rgba(96,165,250,.65)' : 'rgba(148,163,184,.18)'}`, background: fieldView === v.id ? 'rgba(37,99,235,.28)' : 'rgba(255,255,255,.07)', color: fieldView === v.id ? '#bfdbfe' : '#e2e8f0', fontWeight: 950, fontSize: 12 }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div style={{ width: '100%', height: fieldView === 'full' ? '44dvh' : '58dvh', minHeight: fieldView === 'full' ? 300 : 390, maxHeight: fieldView === 'full' ? 430 : 560, background: "#2a6118", borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,.38)", position: 'relative', border: '1px solid rgba(255,255,255,.08)' }}>
              {showHeatmap ? (
                <Heatmap plays={allPlays} includeArrows />
              ) : activePlay ? (
                <FieldCanvas
                  ref={fieldSvgRef}
                  tokens={currentStep.tokens || []}
                  arrows={currentStep.arrows || []}
                  zones={currentStep.zones || []}
                  onMove={isAdmin ? onMove : undefined}
                  tool={isAdmin ? tool : 'move'}
                  arrowType={effectiveArrowType}
                  onArrow={isAdmin ? onArrow : undefined}
                  drawPt={drawPt}
                  setDrawPt={setDrawPt}
                  onPlace={isAdmin ? onPlace : undefined}
                  onDelete={isAdmin ? onDeleteToken : undefined}
                  onZoneAdd={isAdmin ? onZoneAdd : undefined}
                  onZoneDelete={isAdmin ? onZoneDelete : undefined} zoneColor={zoneColor}
                  viewMode={fieldView}
                  animating={animating}
                  selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId}
                  myRosterId={myRosterId}
                  adaptiveView={false}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.5)', padding: '40px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Selecciona una jugada en la pestaña "Jugadas"</div>
                </div>
              )}
            </div>
            <MobileAdminSteps />
            <MobileAdminTools />
            <MobilePlayerStrip />
          </div>
        )}
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0,1fr) 320px', gap: 16, height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'grid', gridTemplateRows: 'minmax(0,0.95fr) minmax(0,1.05fr)', gap: 16, minHeight: 0 }}>
        <DesktopLibraryPanel />
        <DesktopRosterPanel />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0, minHeight: 0 }}>
        <DesktopToolbar />
        <div style={{ ...DARK_PANEL, padding: 18, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: catInfo.color, marginBottom: 4 }}>Vista táctica</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#f8fafc' }}>{activePlay?.name || 'Selecciona una jugada'}</div>
            </div>
            {playComment && (
              <div style={{ maxWidth: 360, fontSize: 12, lineHeight: 1.45, color: '#cbd5e1', background: 'rgba(15,23,42,.64)', border: '1px solid rgba(148,163,184,0.1)', padding: '10px 12px', borderRadius: 14 }}>
                {playComment}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ aspectRatio: fieldRatio, height: '100%', width: 'auto', maxWidth: '100%', background: '#2a6118', borderRadius: 28, overflow: 'hidden', boxShadow: '0 32px 90px rgba(2,6,23,.45)', position: 'relative', border: '1px solid rgba(255,255,255,.06)' }}>
            {showHeatmap ? (
              <Heatmap plays={allPlays} includeArrows />
            ) : activePlay ? (
              <FieldCanvas
                ref={fieldSvgRef}
                tokens={currentStep.tokens || []}
                arrows={currentStep.arrows || []}
                zones={currentStep.zones || []}
                onMove={isAdmin ? onMove : undefined}
                tool={isAdmin ? tool : 'move'}
                arrowType={effectiveArrowType}
                onArrow={isAdmin ? onArrow : undefined}
                drawPt={drawPt}
                setDrawPt={setDrawPt}
                onPlace={isAdmin ? onPlace : undefined}
                onDelete={isAdmin ? onDeleteToken : undefined}
                onZoneAdd={isAdmin ? onZoneAdd : undefined}
                onZoneDelete={isAdmin ? onZoneDelete : undefined} zoneColor={zoneColor}
                viewMode={fieldView}
                animating={animating}
                selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId}
                myRosterId={myRosterId}
                adaptiveView={false}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.5)', padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#f8fafc' }}>Selecciona una categoría y una jugada</div>
                <div style={{ fontSize: 12, marginTop: 6, opacity: 0.75 }}>
                  {isAdmin ? 'Elige una acción de la biblioteca o crea una nueva.' : 'El entrenador irá subiendo jugadas.'}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
        <Timeline />
      </div>
      <DesktopEditorRail />
    </div>
  );
}
