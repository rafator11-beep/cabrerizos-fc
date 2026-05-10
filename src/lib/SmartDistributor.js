/**
 * SmartDistributor — Parses exercise descriptions, extracts player counts,
 * and auto-distributes attendees into groups based on position.
 */

const WORD_TO_NUM = { 
  'pareja': 2, 'parejas': 2, 'pares': 2, 'par': 2, 
  'trío': 3, 'trio': 3, 'trios': 3, 'tríos': 3, 
  'cuarteto': 4, 'cuartetos': 4, 
  'quinteto': 5, 'quintetos': 5 
};

/**
 * Fisher-Yates Shuffle for unbiased randomization.
 */
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

/**
 * Parse an exercise description to extract team structure.
 */
export function parseExercise(description) {
  if (!description) return null;
  const text = description.toLowerCase();

  // 1. Check for "X v Y [+ Z]" patterns
  const vsMatch = text.match(/(\d+)\s*(?:v|vs|x|contra)\s*(\d+)(?:\s*\+\s*(\d+))?/i);
  if (vsMatch) {
    const a = parseInt(vsMatch[1]);
    const b = parseInt(vsMatch[2]);
    const c = vsMatch[3] ? parseInt(vsMatch[3]) : 0;
    return { teamA: a, teamB: b, extras: c, total: a + b + c };
  }

  // 2. Check for "N equipos de M"
  const teamsOfMatch = text.match(/(\d+)\s+equipos?\s+de\s+(\d+)/i);
  if (teamsOfMatch) {
    const numTeams = parseInt(teamsOfMatch[1]);
    const perTeam = parseInt(teamsOfMatch[2]);
    return { teamA: perTeam, teamB: perTeam, extras: (numTeams - 2) * perTeam, total: numTeams * perTeam };
  }

  // 3. Check for specific groupings (Rondo de 6, Tríos, etc.)
  const groupMatch = text.match(/(?:rondo|grupo|grupos|equipo)\s+(?:de\s+)?(\d+)/i);
  if (groupMatch) {
    const n = parseInt(groupMatch[1]);
    return { teamA: n, teamB: 0, extras: 0, total: n };
  }

  for (const [word, num] of Object.entries(WORD_TO_NUM)) {
    if (text.includes(word)) return { teamA: num, teamB: 0, extras: 0, total: num };
  }

  // 4. Fallback: "X jugadores"
  const jugMatch = text.match(/(\d+)\s*jugador/i);
  if (jugMatch) {
    const n = parseInt(jugMatch[1]);
    return { teamA: Math.ceil(n / 2), teamB: Math.floor(n / 2), extras: 0, total: n };
  }

  return null;
}

/**
 * Normalize and group players by tactical area.
 */
function groupByPosition(players) {
  const groups = { gk: [], def: [], mid: [], att: [], other: [] };
  
  players.forEach(p => {
    const pos = (p.position || '').toLowerCase();
    if (pos.match(/porter|gk|meta/)) groups.gk.push(p);
    else if (pos.match(/defen|central|lateral|df/)) groups.def.push(p);
    else if (pos.match(/centro|medio|mc|pivote|interior/)) groups.mid.push(p);
    else if (pos.match(/delant|extrem|punta|dc|att/)) groups.att.push(p);
    else groups.other.push(p);
  });

  return groups;
}

/**
 * Distribute players ensuring tactical balance (alternating positions).
 */
function balancedShuffle(players) {
  const byPos = groupByPosition(players);
  const pools = Object.values(byPos).filter(g => g.length > 0);
  
  // Shuffle each sub-pool properly
  pools.forEach(g => shuffle(g));
  
  const result = [];
  const maxLen = Math.max(...pools.map(g => g.length));
  
  for (let round = 0; round < maxLen; round++) {
    for (const pool of pools) {
      if (round < pool.length) result.push(pool[round]);
    }
  }
  return result;
}

export function distributeGroups(exercises, attendees) {
  if (!exercises?.length || !attendees?.length) return {};
  
  const sessionLineup = {};
  
  exercises.forEach(ex => {
    const parsed = parseExercise(ex.description || ex.name || '');
    if (!parsed) {
      sessionLineup[ex.id] = {
        equipoA: attendees.map(p => ({ id: p.id, name: p.name, number: p.number })),
        equipoB: [], comodines: [], rotacion: []
      };
      return;
    }
    
    const shuffled = balancedShuffle([...attendees]);
    const { teamA, teamB, extras } = parsed;
    
    let pointer = 0;
    const pick = (n) => {
      const slice = shuffled.slice(pointer, pointer + n).map(p => ({ id: p.id, name: p.name, number: p.number }));
      pointer += n;
      return slice;
    };
    
    sessionLineup[ex.id] = {
      equipoA: pick(Math.min(teamA, shuffled.length - pointer)),
      equipoB: pick(Math.min(teamB, shuffled.length - pointer)),
      comodines: pick(Math.min(extras, shuffled.length - pointer)),
      rotacion: shuffled.slice(pointer).map(p => ({ id: p.id, name: p.name, number: p.number })),
      parsed: `${teamA}v${teamB}${extras ? `+${extras}` : ''}`,
    };
  });
  
  return sessionLineup;
}

export function getPlayerAssignments(sessionLineup, exercises, playerId) {
  if (!sessionLineup || !exercises?.length || !playerId) return [];
  
  const assignments = [];
  const teams = [
    { key: 'equipoA', label: 'Equipo A', color: '#3b82f6' },
    { key: 'equipoB', label: 'Equipo B', color: '#ef4444' },
    { key: 'comodines', label: 'Comodín', color: '#f59e0b' },
    { key: 'rotacion', label: 'Rotación', color: '#6b7280' },
  ];
  
  exercises.forEach((ex, i) => {
    const lineup = sessionLineup[ex.id];
    if (!lineup) return;
    
    for (const t of teams) {
      if (lineup[t.key]?.some(p => p.id === playerId)) {
        assignments.push({
          exerciseName: ex.name,
          exerciseIndex: i,
          team: t.label,
          teamKey: t.key,
          color: t.color,
          parsed: lineup.parsed || '',
          image_url: ex.image_url,
        });
        break;
      }
    }
  });
  
  return assignments;
}

