const fs = require('fs');

// JUGADORES REALES DE CABRERIZOS F.C. JUVENIL B
const jugadoresReales = [
  { nombre: 'Haritz', apellidos: 'González Delgado', numero: 1 },
  { nombre: 'Álvaro', apellidos: 'Delgado González', numero: 2 },
  { nombre: 'Asier', apellidos: 'Marcos Riesco', numero: 4 },
  { nombre: 'Hugo', apellidos: 'López García', numero: 5 },
  { nombre: 'Gabriel', apellidos: 'Fraile Alguacil', numero: 6 },
  { nombre: 'Héctor', apellidos: 'Cáceres Marcos', numero: 7 },
  { nombre: 'Iván', apellidos: 'Martín Cañizal', numero: 9 },
  { nombre: 'Aarón Gabriel', apellidos: 'García', numero: 10 },
  { nombre: 'Ricardo André', apellidos: 'Romero Chiuz', numero: 11 },
  { nombre: 'David Mario', apellidos: 'Hidalgo Vizcaíno', numero: 12 },
  { nombre: 'Carlos', apellidos: 'Martín Silva', numero: 14 },
  { nombre: 'Unai', apellidos: 'Rodríguez Ríos', numero: 15 },
  { nombre: 'Daniel', apellidos: 'Alonso Gago', numero: 16 },
  { nombre: 'Álex', apellidos: 'Hernández Nicolás', numero: 17 },
  { nombre: 'Iván Matías', apellidos: 'González', numero: 18 },
  { nombre: 'Raúl', apellidos: 'Rodríguez Morán', numero: 19 },
  { nombre: 'Juan Vicente', apellidos: 'Hernández', numero: 20 },
  { nombre: 'Guillermo', apellidos: 'Domínguez García', numero: 21 },
  { nombre: 'Jorge', apellidos: 'Alonso Cordovilla', numero: 22 },
  { nombre: 'Carlos Jose', apellidos: 'Montes Ricse', numero: 23 }
];

function generarContrasenaFacil(nombre, numero) {
  // Contraseña súper fácil: primer nombre + numero
  const primerNombre = nombre.split(' ')[0].toLowerCase();
  return `${primerNombre}${numero}`;
}

function buildEmail(name, surname) {
  // Función igual que en AuthContext.jsx
  const n = name.trim().toLowerCase().replace(/\s+/g, '.');
  const s = surname.trim().toLowerCase().replace(/\s+/g, '.');
  return `${n}.${s}@cabrerizos-fc.app`;
}

function crearCredencialesParaSistema() {
  console.log('🏆 CABRERIZOS F.C. - CREDENCIALES PARA EL SISTEMA REAL');
  console.log('=' .repeat(80));
  
  const credenciales = [];
  
  jugadoresReales.forEach(jugador => {
    const nombreCompleto = `${jugador.nombre} ${jugador.apellidos}`;
    const password = generarContrasenaFacil(jugador.nombre, jugador.numero);
    const emailInterno = buildEmail(jugador.nombre, jugador.apellidos);
    
    credenciales.push({
      nombre: jugador.nombre,
      apellidos: jugador.apellidos,
      nombreCompleto,
      numero: jugador.numero,
      password,
      emailInterno
    });
    
    console.log(`👤 ${nombreCompleto} (#${jugador.numero})`);
    console.log(`   📝 Nombre: ${jugador.nombre}`);
    console.log(`   📝 Apellidos: ${jugador.apellidos}`);
    console.log(`   🔑 Contraseña: ${password}`);
    console.log(`   📧 Email interno: ${emailInterno}`);
    console.log('-'.repeat(60));
  });

  // Crear archivo principal para entregar a jugadores
  let archivo = '🏆 CABRERIZOS F.C. - JUVENIL B\n';
  archivo += 'CREDENCIALES DE ACCESO PERSONAL\n';
  archivo += '=' .repeat(60) + '\n\n';
  archivo += '🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n';
  archivo += '📱 CÓMO ACCEDER:\n';
  archivo += '1. Ir a la web del club\n';
  archivo += '2. Clic en "Inicia sesión" (abajo)\n';
  archivo += '3. Introducir TU NOMBRE y APELLIDOS\n';
  archivo += '4. Introducir TU CONTRASEÑA\n';
  archivo += '5. ¡Listo! Verás tu perfil personal\n\n';
  archivo += '=' .repeat(60) + '\n\n';
  
  credenciales.forEach(cred => {
    archivo += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
    archivo += `🔢 DORSAL: #${cred.numero}\n`;
    archivo += `📝 NOMBRE: ${cred.nombre}\n`;
    archivo += `📝 APELLIDOS: ${cred.apellidos}\n`;
    archivo += `🔑 CONTRASEÑA: ${cred.password}\n`;
    archivo += '-'.repeat(50) + '\n\n';
  });
  
  archivo += '🔒 IMPORTANTE:\n';
  archivo += '- Escribe EXACTAMENTE tu nombre y apellidos\n';
  archivo += '- La contraseña es tu nombre + tu número\n';
  archivo += '- Cada jugador tiene su perfil personal\n';
  archivo += '- Podrás ver TUS entrenamientos y alineaciones\n\n';
  archivo += '❓ ¿PROBLEMAS? Habla con el entrenador\n';
  
  fs.writeFileSync('CREDENCIALES_SISTEMA_REAL_CABRERIZOS.txt', archivo);

  // Crear versión para WhatsApp
  let whatsapp = '🏆 CABRERIZOS F.C. - ACCESOS PERSONALES\n\n';
  whatsapp += '🌐 https://rafator11-beep.github.io/cabrerizos-fc/\n';
  whatsapp += '📱 Clic en "Inicia sesión"\n\n';
  credenciales.forEach(cred => {
    whatsapp += `👤 ${cred.nombreCompleto} (#${cred.numero})\n`;
    whatsapp += `📝 Nombre: ${cred.nombre}\n`;
    whatsapp += `📝 Apellidos: ${cred.apellidos}\n`;
    whatsapp += `🔑 Contraseña: ${cred.password}\n\n`;
  });
  
  fs.writeFileSync('credenciales_whatsapp_sistema.txt', whatsapp);

  // Crear archivos individuales para cada jugador
  credenciales.forEach(cred => {
    let individual = `🏆 CABRERIZOS F.C. - JUVENIL B\n`;
    individual += `TUS CREDENCIALES PERSONALES\n`;
    individual += `${'='.repeat(40)}\n\n`;
    individual += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
    individual += `🔢 DORSAL: #${cred.numero}\n\n`;
    individual += `🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n`;
    individual += `📝 TU NOMBRE: ${cred.nombre}\n`;
    individual += `📝 TUS APELLIDOS: ${cred.apellidos}\n`;
    individual += `🔑 TU CONTRASEÑA: ${cred.password}\n\n`;
    individual += `📱 PASOS PARA ENTRAR:\n`;
    individual += `1. Ir a la web del club\n`;
    individual += `2. Clic en "Inicia sesión" (abajo)\n`;
    individual += `3. Escribir: ${cred.nombre}\n`;
    individual += `4. Escribir: ${cred.apellidos}\n`;
    individual += `5. Escribir: ${cred.password}\n`;
    individual += `6. ¡Ya estás en tu perfil!\n\n`;
    individual += `⚽ EN TU PERFIL VERÁS:\n`;
    individual += `- Tus entrenamientos personalizados\n`;
    individual += `- Si estás convocado\n`;
    individual += `- Comentarios del míster para ti\n`;
    individual += `- Tus estadísticas personales\n\n`;
    individual += `🔒 ¡GUARDA BIEN ESTA INFORMACIÓN!\n`;
    individual += `Es solo tuya, no la compartas.\n`;
    
    const nombreArchivo = `credencial_${cred.nombre.replace(/\s+/g, '_')}_${cred.numero}.txt`;
    fs.writeFileSync(nombreArchivo, individual);
  });

  // Crear script SQL para crear usuarios en Supabase
  let sql = '-- CREAR USUARIOS REALES EN SUPABASE AUTH\n';
  sql += '-- Ejecutar en SQL Editor de Supabase\n\n';
  
  credenciales.forEach(cred => {
    sql += `-- ${cred.nombreCompleto} (#${cred.numero})\n`;
    sql += `INSERT INTO auth.users (\n`;
    sql += `  instance_id,\n`;
    sql += `  id,\n`;
    sql += `  aud,\n`;
    sql += `  role,\n`;
    sql += `  email,\n`;
    sql += `  encrypted_password,\n`;
    sql += `  email_confirmed_at,\n`;
    sql += `  created_at,\n`;
    sql += `  updated_at,\n`;
    sql += `  raw_user_meta_data,\n`;
    sql += `  raw_app_meta_data\n`;
    sql += `) VALUES (\n`;
    sql += `  '00000000-0000-0000-0000-000000000000',\n`;
    sql += `  gen_random_uuid(),\n`;
    sql += `  'authenticated',\n`;
    sql += `  'authenticated',\n`;
    sql += `  '${cred.emailInterno}',\n`;
    sql += `  crypt('${cred.password}', gen_salt('bf')),\n`;
    sql += `  NOW(),\n`;
    sql += `  NOW(),\n`;
    sql += `  NOW(),\n`;
    sql += `  '{"name": "${cred.nombre}", "surname": "${cred.apellidos}", "role": "player"}',\n`;
    sql += `  '{"provider": "email", "providers": ["email"]}'\n`;
    sql += `);\n\n`;
  });
  
  sql += '-- Crear perfiles en tabla profiles\n';
  credenciales.forEach(cred => {
    sql += `INSERT INTO profiles (id, name, surname, role, created_at, updated_at)\n`;
    sql += `SELECT id, '${cred.nombre}', '${cred.apellidos}', 'player', NOW(), NOW()\n`;
    sql += `FROM auth.users WHERE email = '${cred.emailInterno}';\n\n`;
  });
  
  fs.writeFileSync('crear_usuarios_sistema_real.sql', sql);

  // Crear CSV
  let csv = 'Nombre,Apellidos,Numero,Contraseña,Email Interno\n';
  credenciales.forEach(cred => {
    csv += `"${cred.nombre}","${cred.apellidos}",${cred.numero},"${cred.password}","${cred.emailInterno}"\n`;
  });
  fs.writeFileSync('jugadores_sistema_real.csv', csv);

  console.log('\n✅ ARCHIVOS CREADOS:');
  console.log('📄 CREDENCIALES_SISTEMA_REAL_CABRERIZOS.txt - Archivo principal');
  console.log('📱 credenciales_whatsapp_sistema.txt - Para WhatsApp');
  console.log('📊 jugadores_sistema_real.csv - Para Excel');
  console.log('🗄️ crear_usuarios_sistema_real.sql - Para Supabase');
  console.log('📋 credencial_[nombre]_[numero].txt - Archivos individuales');
  
  console.log('\n🎯 CÓMO FUNCIONA EL SISTEMA:');
  console.log('1. Cada jugador usa su NOMBRE + APELLIDOS + CONTRASEÑA');
  console.log('2. El sistema genera automáticamente un email interno');
  console.log('3. Cada jugador ve solo SU perfil personal');
  console.log('4. Contraseñas súper fáciles: nombre + número');
  
  return credenciales;
}

// Ejecutar
const credenciales = crearCredencialesParaSistema();

// Mostrar ejemplos
console.log('\n📋 EJEMPLOS DE CREDENCIALES:');
console.log('=' .repeat(60));
credenciales.slice(0, 3).forEach(cred => {
  console.log(`${cred.nombreCompleto}:`);
  console.log(`  Nombre: ${cred.nombre}`);
  console.log(`  Apellidos: ${cred.apellidos}`);
  console.log(`  Contraseña: ${cred.password}`);
  console.log('');
});