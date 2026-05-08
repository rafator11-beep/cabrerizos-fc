/**
 * SmartDistributor — Parses exercise descriptions, extracts player counts,
 * and auto-distributes attendees into groups based on position.
 */

// Regex patterns to extract team sizes from exercise descriptions
const PATTERNS = [
  // "Rondo 4v2", "Partido 5v5", "4x4+2", "3 contra 3"
  /(\d+)\s*(?:v|vs|x|contra)\s*(\d+)(?:\s*\+\s*(\d+))?/i,
  // "Rondo de 6", "Grupos de 4"
  /(?:rondo|grupo|grupos|equipo|equipos)\s+(?:de\s+)?(\d+)/i,
  // "Tríos", "Parejas", "Cuartetos"
  /\b(par(?:eja|es))\b/i,
  /\b(tr[ií]os?)\b/i,
  /\b(cuarteto|cuartetos)\b/i,
  /\b(quinteto|quintetos)\b/i,
  // "2 equipos de 5"
  /(\d+)\s+equipos?\s+de\s+(\d+)/i,
  // Fallback: just a number like "6 jugadores"
  /(\d+)\s*jugador/i,
];

const WORD_TO_NUM = { 'parejas': 2, 'pares': 2, 'pareja': 2, 'par': 2, 'tríos': 3, 'trio': 3, 'trios': 3, 'trío': 3, 'cuarteto': 4, 'cuartetos': 4, 'quinteto': 5, 'quintetos': 5 };

/**
 * Parse an exercise description to extract team structure.
 * Returns { teamA: number, teamB: number, extras: number, total: number }
 */
export function parseExercise(description) {
  if (!description) return null;
  const text = description.toLowerCase();

  // Pattern 1: "4v2", "5v5+2", "3 contra 3"
  const vsMatch = text.match(/(\d+)\s*(?:v|vs|x|contra)\s*(\d+)(?:\s*\+\s*(\d+))?/i);
  if (vsMatch) {
    const a = parseInt(vsMatch[1]);
    const b = parseInt(vsMatch[2]);
    const c = vsMatch[3] ? parseInt(vsMatch[3]) : 0;
    return { teamA: a, teamB: b, extras: c, total: a + b + c };
  }

  // Pattern 2: "2 equipos de 5"
  const teamsOfMatch = text.match(/(\d+)\s+equipos?\s+de\s+(\d+)/i);
  if (teamsOfMatch) {
    const numTeams = parseInt(teamsOfMatch[1]);
    const perTeam = parseInt(teamsOfMatch[2]);
    return { teamA: perTeam, teamB: perTeam, extras: (numTeams - 2) * perTeam, total: numTeams * perTeam };
  }

  // Pattern 3: "Rondo de 6", "Grupos de 4"
  const groupMatch = text.match(/(?:rondo|grupo|grupos|equipo)\s+(?:de\s+)?(\d+)/i);
  if (groupMatch) {
    const n = parseInt(groupMatch[1]);
    return { teamA: n, teamB: 0, extras: 0, total: n };
  }

  // Pattern 4: Word-based ("Tríos", "Parejas")
  for (const [word, num] of Object.entries(WORD_TO_NUM)) {
    if (text.includes(word)) {
      return { teamA: num, teamB: 0, extras: 0, total: num };
    }
  }

  // Pattern 5: "X jugadores"
  const jugMatch = text.match(/(\d+)\s*jugador/i);
  if (jugMatch) {
    const n = parseInt(jugMatch[1]);
    return { teamA: Math.ceil(n / 2), teamB: Math.floor(n / 2), extras: 0, total: n };
  }

  return null;
}

/**
 * Group players by position for balanced distribution.
 */
function groupByPosition(players) {
  const groups = {
    portero: [],
    defensa: [],
    centrocampista: [],
    delantero: [],
    otro: [],
  };

  players.forEach(p => {
    const pos = (p.position || '').toLowerCase();
    if (pos.includes('porter') || pos.includes('gk') || pos.includes('meta')) {
      groups.portero.push(p);
    } else if (pos.includes('defen') || pos.includes('central') || pos.includes('lateral') || pos.includes('df')) {
      groups.defensa.push(p);
    } else if (pos.includes('centro') || pos.includes('medio') || pos.includes('mc') || pos.includes('pivote') || pos.includes('interior')) {
      groups.centrocampista.push(p);
    } else if (pos.includes('delant') || pos.includes('extrem') || pos.includes('punta') || pos.includes('dc') || pos.includes('att')) {
      groups.delantero.push(p);
    } else {
      groups.otro.push(p);
    }
  });

  return groups;
}

/**
 * Distribute players into a balanced pool, alternating positions.
 */
function balancedShuffle(players) {
  const byPos = groupByPosition(players);
  const pools = Object.values(byPos).filter(g => g.length > 0);
  
  // Shuffle each position group
  pools.forEach(g => g.sort(() => Math.random() - 0.5));
  
  // Interleave: pick one from each position group in round-robin
  const result = [];
  let idx = 0;
  let maxLen = Math.max(...pools.map(g => g.length));
  for (let round = 0; round < maxLen; round++) {
    for (const pool of pools) {
      if (round < pool.length) {
        result.push(pool[round]);
      }
    }
  }
  return result;
}

/**
 * Main distribution function with multi-station support.
 * @param {Array} exercises - Array of exercise objects with { id, name, description }
 * @param {Array} attendees - Array of player objects with { id, name, number, position }
 * @returns {Object} session_lineup - { [exercise_id]: { estaciones: [{ equipoA: [...], equipoB: [...], comodines: [...] }], rotacion: [...] } }
 */
export function distributeGroups(exercises, attendees) {
  if (!exercises?.length || !attendees?.length) return {};
  
  const sessionLineup = {};
  
  exercises.forEach(ex => {
    const parsed = parseExercise(ex.description || ex.name || '');
    
    if (!parsed) {
      // No pattern found — assign all attendees as a single group
      sessionLineup[ex.id] = {
        estaciones: [{
          equipoA: attendees.map(p => ({ id: p.id, name: p.name, number: p.number })),
          equipoB: [],
          comodines: [],
        }],
        rotacion: [],
      };
      return;
    }
    
    const shuffled = balancedShuffle([...attendees]);
    const { teamA, teamB, extras, total } = parsed;
    
    // Calculate how many stations we can create
    const playersPerStation = total;
    const numStations = Math.max(1, Math.floor(shuffled.length / playersPerStation));
    
    const estaciones = [];
    let pointer = 0;
    
    for (let station = 0; station < numStations; station++) {
      const pick = (n) => {
        const slice = shuffled.slice(pointer, pointer + n).map(p => ({ id: p.id, name: p.name, number: p.number }));
        pointer += n;
        return slice;
      };
      
      const groupA = pick(Math.min(teamA, shuffled.length - pointer));
      const groupB = pick(Math.min(teamB, shuffled.length - pointer));
      const comodines = pick(Math.min(extras, shuffled.length - pointer));
      
      estaciones.push({
        equipoA: groupA,
        equipoB: groupB,
        comodines,
        parsed: `${teamA}v${teamB}${extras ? `+${extras}` : ''}`,
      });
    }
    
    // Remaining players go to rotation
    const rotacion = shuffled.slice(pointer).map(p => ({ id: p.id, name: p.name, number: p.number }));
    
    sessionLineup[ex.id] = {
      estaciones,
      rotacion,
      parsed: `${teamA}v${teamB}${extras ? `+${extras}` : ''}`,
    };
  });
  
  return sessionLineup;
}

/**
 * Get a player's assignments across all exercises with multi-station support.
 * @returns {Array} [{ exerciseName, exerciseIndex, team, parsed, stationIndex }]
 */
export function getPlayerAssignments(sessionLineup, exercises, playerId) {
  if (!sessionLineup || !exercises?.length || !playerId) return [];
  
  const assignments = [];
  
  exercises.forEach((ex, i) => {
    const lineup = sessionLineup[ex.id];
    if (!lineup) return;
    
    const teams = [
      { key: 'equipoA', label: 'Equipo A', color: '#3b82f6' },
      { key: 'equipoB', label: 'Equipo B', color: '#ef4444' },
      { key: 'comodines', label: 'Comodín', color: '#f59e0b' },
    ];
    
    // Check each station
    if (lineup.estaciones) {
      lineup.estaciones.forEach((estacion, stationIndex) => {
        for (const t of teams) {
          if (estacion[t.key]?.some(p => p.id === playerId)) {
            assignments.push({
              exerciseName: ex.name,
              exerciseIndex: i,
              team: t.label,
              teamKey: t.key,
              color: t.color,
              parsed: estacion.parsed || lineup.parsed || '',
              image_url: ex.image_url,
              stationIndex: stationIndex + 1,
              stationLabel: `Posta ${stationIndex + 1}`,
            });
          }
        }
      });
    }
    
    // Check rotation
    if (lineup.rotacion?.some(p => p.id === playerId)) {
      assignments.push({
        exerciseName: ex.name,
        exerciseIndex: i,
        team: 'Rotación',
        teamKey: 'rotacion',
        color: '#6b7280',
        parsed: lineup.parsed || '',
        image_url: ex.image_url,
        stationIndex: null,
        stationLabel: 'Rotación',
      });
    }
  });
  
  return assignments;
}
