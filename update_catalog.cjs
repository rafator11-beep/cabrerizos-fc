const fs = require('fs');
const targetDir = 'public/exercises';
const catalogPath = 'src/lib/exerciseCatalog.js';

const files = fs.readdirSync(targetDir).filter(f => f.startsWith('ejercicio_') && f.endsWith('.png'));

let catalogContent = fs.readFileSync(catalogPath, 'utf8');

const insertIndex = catalogContent.indexOf('];');

let newEntries = '';
let maxId = 107;

files.forEach((file, idx) => {
    maxId++;
    newEntries += `  { id: ${maxId}, name: 'Ejercicio Custom ${idx + 1}', cat: 'tactica', dur: 15, img: '${file}', desc: 'Ejercicio importado de la biblioteca personalizada.' },\n`;
});

const updatedContent = catalogContent.slice(0, insertIndex) + newEntries + catalogContent.slice(insertIndex);
fs.writeFileSync(catalogPath, updatedContent);
console.log('Added ' + files.length + ' new exercises to the catalog.');
