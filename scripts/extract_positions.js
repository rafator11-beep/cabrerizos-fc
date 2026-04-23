import fs from 'fs';

const dataFile = 'src/exercises_data.json';
const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

let updatedCount = 0;

const newData = data.map(ex => {
  if (!ex.description) return ex;

  const positions = new Set();
  
  // Find uppercase letters that stand alone or represent positions
  // e.g., 'A', 'B', A, B, A1, B2, "A", "B", (A), (B)
  const regex = /['"\(]?\b([A-E][1-4]?)\b['"\)]?/g;
  let match;
  while ((match = regex.exec(ex.description)) !== null) {
    // Ignore normal words that happen to be single letters (like 'A' in English, but this is Spanish so 'A' means 'to', but usually it's lowercase 'a'. If uppercase 'A', it might be a position).
    // Let's ensure we only grab A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z if they look like positions.
    // The nomenclature says A, B, C, D, E, etc.
    const pos = match[1];
    
    // Avoid capturing 'A' if it's just the preposition at the start of a sentence.
    // E.g., "A la señal del entrenador..." vs "Pase de A a B".
    // We can assume if there are other letters like B, C, then A is a position.
    positions.add(pos);
  }

  // Filter out single 'A' if it's the only one and might be a preposition
  const posArray = Array.from(positions);
  const isA_Only = posArray.length === 1 && posArray[0] === 'A';
  
  // If we found valid positions
  if (posArray.length > 0 && !isA_Only) {
    ex.required_positions = posArray.sort();
    updatedCount++;
  } else if (posArray.length > 0 && isA_Only) {
    // Check if there's ' B ' or ' C ' etc.
  }

  return ex;
});

fs.writeFileSync(dataFile, JSON.stringify(newData, null, 2));
console.log(`Updated ${updatedCount} exercises with required_positions`);
