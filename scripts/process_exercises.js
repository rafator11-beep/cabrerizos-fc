import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = 'c:\\Users\\Rafa\\Desktop\\futbol';
const outputDir = path.join(__dirname, '..', 'public', 'exercises');
const outputFile = path.join(__dirname, '..', 'src', 'exercises_data.json');

// Crear la carpeta de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processImages() {
  console.log("Iniciando motor de OCR Tesseract.js...");
  const worker = await createWorker('spa');
  
  const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg'));
  console.log(`Se han encontrado ${files.length} imágenes. Comenzando procesamiento...`);

  const exercises = [];
  let count = 0;

  for (const file of files) {
    count++;
    const inputPath = path.join(inputDir, file);
    const cleanFilename = `ejercicio_${Date.now()}_${count}.png`;
    const outputPath = path.join(outputDir, cleanFilename);

    console.log(`[${count}/${files.length}] Procesando ${file}...`);
    
    // 1. Copiar imagen a public/exercises
    fs.copyFileSync(inputPath, outputPath);

    // 2. Extraer texto con Tesseract
    try {
      const { data: { text } } = await worker.recognize(inputPath);
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let name = `Ejercicio ${count}`;
      let description = "";
      
      if (lines.length > 0) {
        // Asumimos que la primera línea relevante puede ser el título
        name = lines[0].substring(0, 50);
        description = lines.slice(1, 4).join(" ");
      }

      // Inferir categoría
      const textLower = text.toLowerCase();
      let category = 'tactica';
      if (textLower.includes('calentamiento')) category = 'calentamiento';
      else if (textLower.includes('físico') || textLower.includes('fisico')) category = 'fisico';
      else if (textLower.includes('técnica') || textLower.includes('tecnica') || textLower.includes('pase')) category = 'tecnica';

      exercises.push({
        id: `ex_${Date.now()}_${count}`,
        name: name || `Ejercicio ${count}`,
        description: description || "Extraído automáticamente del gráfico.",
        duration: 15,
        category,
        image: cleanFilename
      });

    } catch (e) {
      console.log(`Error leyendo ${file}: ${e.message}. Añadiendo con valores por defecto.`);
      exercises.push({
        id: `ex_${Date.now()}_${count}`,
        name: `Ejercicio ${count}`,
        description: "Error al extraer texto. Edita la descripción.",
        duration: 15,
        category: 'tactica',
        image: cleanFilename
      });
    }
  }

  await worker.terminate();

  fs.writeFileSync(outputFile, JSON.stringify(exercises, null, 2));
  console.log(`✅ ¡Proceso completado! Base de datos guardada en ${outputFile}`);
}

processImages().catch(console.error);
