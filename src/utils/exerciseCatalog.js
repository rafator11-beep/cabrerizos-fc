const GROUPS = [
  { id: 'posesion',        label: 'Posesión',        re: /\b(rondo|posesi[oó]n|conservaci[oó]n|mantener)\b/i },
  { id: 'cuadros',         label: 'Cuadros',         re: /\b(cuadro|cuadrado)\b/i },
  { id: 'rueda_pase',      label: 'Rueda de pase',   re: /\b(rueda|pases?|pared(es)?)\b/i },
  { id: 'finalizacion',    label: 'Finalización',    re: /\b(finaliz|tiro|remate|gol|definici[oó]n)\b/i },
  { id: 'presion',         label: 'Presión',         re: /\b(presi[oó]n|pressing|presionar)\b/i },
  { id: 'transiciones',    label: 'Transiciones',    re: /\b(transici[oó]n|transiciones)\b/i },
  { id: 'juegos_reducidos',label: 'Juegos reducidos',re: /\b(reducid|reducidos|partid(it)?o|juego reducido)\b/i },
  { id: 'activacion',      label: 'Activación',      re: /\b(activaci[oó]n|calentamiento|calentar)\b/i },
  { id: 'tecnica',         label: 'Técnica',         re: /\b(t[eé]cnica|control|regate|conducci[oó]n|pase|recepci[oó]n)\b/i },
  { id: 'tactica',         label: 'Táctica',         re: /\b(t[aá]ctica|pizarra|movimientos?)\b/i },
];

export const EXERCISE_GROUPS = [
  { id: 'all', label: 'Todos' },
  ...GROUPS.map(g => ({ id: g.id, label: g.label })),
];

const parseRecommendedPlayers = (name) => {
  if (!name || typeof name !== 'string') return null;
  const n = name.replace(/\s+/g, ' ').trim();

  // 4v2, 3V3, etc.
  let m = n.match(/\b(\d{1,2})\s*[vV]\s*(\d{1,2})\b/);
  if (m) return Number(m[1]) + Number(m[2]);

  // 3 vs 3
  m = n.match(/\b(\d{1,2})\s*(?:vs|VS)\s*(\d{1,2})\b/);
  if (m) return Number(m[1]) + Number(m[2]);

  // 3x3 (sometimes used)
  m = n.match(/\b(\d{1,2})\s*[xX]\s*(\d{1,2})\b/);
  if (m) return Number(m[1]) + Number(m[2]);

  return null;
};

export function deriveExerciseMeta(ex) {
  const name = ex?.name || '';
  const description = ex?.description || '';
  const text = `${name} ${description}`.trim();

  let group = null;
  for (const g of GROUPS) {
    if (g.re.test(text)) { group = g.id; break; }
  }

  const recommendedPlayers = parseRecommendedPlayers(name);

  // Minimal tags derived from existing info (no invented data).
  const tags = [];
  if (ex?.category) tags.push(String(ex.category));
  if (group) tags.push(group);
  if (/\bcomod[ií]n(es)?\b/i.test(text)) tags.push('comodines');
  if (/\btransici/i.test(text)) tags.push('transicion');
  if (/\bdefensa\b/i.test(text)) tags.push('defensa');
  if (/\bataque\b/i.test(text)) tags.push('ataque');

  return {
    group,
    subcategory: null,
    recommendedPlayers: Number.isFinite(recommendedPlayers) ? recommendedPlayers : null,
    structure: null,
    tags: Array.from(new Set(tags)),
  };
}

export function decorateExercise(ex) {
  const meta = deriveExerciseMeta(ex);
  return { ...ex, meta };
}

