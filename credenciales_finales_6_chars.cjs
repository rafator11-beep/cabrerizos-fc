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

function generarContrasenaSegura(nombre, numero) {
  // Contraseña de mínimo 6 caracteres: nombre + numero + "cfc"
  const primerNombre = nombre.split(' ')[0].toLowerCase();
  const password = `${primerNombre}${numero}cfc`;
  
  // Asegurar mínimo 6 caracteres
  if (password.length < 6) {
    return `${primerNombre}${numero}cfc2026`;
  }
  
  return password;
}

function buildEmail(name, surname) {
  // Función igual que en AuthContext.jsx
  const n = name.trim().toLowerCase().replace(/\s+/g, '.');
  const s = surname.trim().toLowerCase().replace(/\s+/g, '.');
  return `${n}.${s}@cabrerizos-fc.app`;
}

function crearCredencialesFinales() {
  console.log('🏆 CABRERIZOS F.C. - CREDENCIALES FINALES (6+ CARACTERES)');
  console.log('=' .repeat(80));
  
  const credenciales = [];
  
  jugadoresReales.forEach(jugador => {
    const nombreCompleto = `${jugador.nombre} ${jugador.apellidos}`;
    const email = buildEmail(jugador.nombre, jugador.apellidos);
    const password = generarContrasenaSegura(jugador.nombre, jugador.numero);
    
    credenciales.push({
      nombre: jugador.nombre,
      apellidos: jugador.apellidos,
      nombreCompleto,
      numero: jugador.numero,
      email,
      password
    });
    
    console.log(`👤 ${nombreCompleto} (#${jugador.numero})`);
    console.log(`   📝 Nombre: ${jugador.nombre}`);
    console.log(`   📝 Apellidos: ${jugador.apellidos}`);
    console.log(`   🔑 Contraseña: ${password} (${password.length} chars)`);
    console.log(`   📧 Email: ${email}`);
    console.log('-'.repeat(60));
  });

  // Archivo principal para entregar
  let archivo = '🏆 CABRERIZOS F.C. - JUVENIL B\n';
  archivo += 'CREDENCIALES DE ACCESO PERSONAL\n';
  archivo += 'CONTRASEÑAS SEGURAS (6+ CARACTERES)\n';
  archivo += '=' .repeat(60) + '\n\n';
  archivo += '🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n';
  archivo += '📱 CÓMO ACCEDER:\n';
  archivo += '1. Ir a la web del club\n';
  archivo += '2. Clic en "Inicia sesión" (abajo)\n';
  archivo += '3. Introducir TU NOMBRE exacto\n';
  archivo += '4. Introducir TUS APELLIDOS exactos\n';
  archivo += '5. Introducir TU CONTRASEÑA (6+ caracteres)\n';
  archivo += '6. ¡Listo! Verás tu perfil personal\n\n';
  archivo += '=' .repeat(60) + '\n\n';
  
  credenciales.forEach(cred => {
    archivo += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
    archivo += `🔢 DORSAL: #${cred.numero}\n`;
    archivo += `📝 NOMBRE: ${cred.nombre}\n`;
    archivo += `📝 APELLIDOS: ${cred.apellidos}\n`;
    archivo += `🔑 CONTRASEÑA: ${cred.password}\n`;
    archivo += `   ✅ ${cred.password.length} caracteres (cumple requisitos)\n`;
    archivo += '-'.repeat(50) + '\n\n';
  });
  
  archivo += '🔒 IMPORTANTE:\n';
  archivo += '- Escribe EXACTAMENTE tu nombre y apellidos\n';
  archivo += '- Todas las contraseñas tienen 6+ caracteres\n';
  archivo += '- Cada jugador tiene su perfil personal\n';
  archivo += '- Podrás ver TUS entrenamientos y alineaciones\n';
  archivo += '- Si estás convocado y comentarios del míster\n\n';
  archivo += '❓ ¿PROBLEMAS? Habla con el entrenador\n';
  
  fs.writeFileSync('CREDENCIALES_FINALES_CABRERIZOS_6CHARS.txt', archivo);

  // Archivo para WhatsApp (compacto)
  let whatsapp = '🏆 CABRERIZOS F.C. - ACCESOS SEGUROS\n\n';
  whatsapp += '🌐 https://rafator11-beep.github.io/cabrerizos-fc/\n';
  whatsapp += '📱 Clic en "Inicia sesión"\n';
  whatsapp += '🔒 Contraseñas seguras (6+ caracteres)\n\n';
  
  credenciales.forEach(cred => {
    whatsapp += `👤 ${cred.nombreCompleto} (#${cred.numero})\n`;
    whatsapp += `📝 Nombre: ${cred.nombre}\n`;
    whatsapp += `📝 Apellidos: ${cred.apellidos}\n`;
    whatsapp += `🔑 Contraseña: ${cred.password}\n\n`;
  });
  
  fs.writeFileSync('credenciales_whatsapp_6chars.txt', whatsapp);

  // Archivos individuales para cada jugador
  credenciales.forEach(cred => {
    let individual = `🏆 CABRERIZOS F.C. - JUVENIL B\n`;
    individual += `TUS CREDENCIALES PERSONALES\n`;
    individual += `${'='.repeat(40)}\n\n`;
    individual += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
    individual += `🔢 DORSAL: #${cred.numero}\n\n`;
    individual += `🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n`;
    individual += `📝 TU NOMBRE: ${cred.nombre}\n`;
    individual += `📝 TUS APELLIDOS: ${cred.apellidos}\n`;
    individual += `🔑 TU CONTRASEÑA: ${cred.password}\n`;
    individual += `   ✅ ${cred.password.length} caracteres (segura)\n\n`;
    individual += `📱 PASOS PARA ENTRAR:\n`;
    individual += `1. Ir a la web del club\n`;
    individual += `2. Clic en "Inicia sesión" (abajo)\n`;
    individual += `3. Escribir exactamente: ${cred.nombre}\n`;
    individual += `4. Escribir exactamente: ${cred.apellidos}\n`;
    individual += `5. Escribir exactamente: ${cred.password}\n`;
    individual += `6. ¡Ya estás en tu perfil personal!\n\n`;
    individual += `⚽ EN TU PERFIL VERÁS:\n`;
    individual += `- Tus entrenamientos personalizados\n`;
    individual += `- Si estás convocado para partidos\n`;
    individual += `- Comentarios del míster para ti\n`;
    individual += `- Tus estadísticas y progreso\n`;
    individual += `- Ejercicios técnicos asignados\n\n`;
    individual += `🔒 ¡GUARDA BIEN ESTA INFORMACIÓN!\n`;
    individual += `Es solo tuya, no la compartas con nadie.\n`;
    
    const nombreArchivo = `credencial_${cred.nombre.replace(/\s+/g, '_')}_${cred.numero}_6CHARS.txt`;
    fs.writeFileSync(nombreArchivo, individual);
  });

  // Script SQL para Supabase (manual)
  let sql = '-- SCRIPT PARA CREAR USUARIOS EN SUPABASE\n';
  sql += '-- URL: https://yaltxcmspsvnhnxomhwa.supabase.co\n';
  sql += '-- Ejecutar en SQL Editor de Supabase Dashboard\n\n';
  
  credenciales.forEach(cred => {
    sql += `-- ${cred.nombreCompleto} (#${cred.numero})\n`;
    sql += `-- Contraseña: ${cred.password} (${cred.password.length} chars)\n`;
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
    sql += `  '${cred.email}',\n`;
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
    sql += `FROM auth.users WHERE email = '${cred.email}';\n\n`;
  });

  sql += '-- Enlazar con tabla roster (ejecutar después de crear usuarios)\n';
  credenciales.forEach(cred => {
    sql += `-- Enlazar ${cred.nombreCompleto} con roster\n`;
    sql += `UPDATE roster SET auth_profile_id = (\n`;
    sql += `  SELECT id FROM auth.users WHERE email = '${cred.email}'\n`;
    sql += `) WHERE number = ${cred.numero};\n\n`;
  });
  
  fs.writeFileSync('crear_usuarios_supabase_6chars.sql', sql);

  // CSV para Excel
  let csv = 'Nombre,Apellidos,Numero,Contraseña,Longitud,Email\n';
  credenciales.forEach(cred => {
    csv += `"${cred.nombre}","${cred.apellidos}",${cred.numero},"${cred.password}",${cred.password.length},"${cred.email}"\n`;
  });
  fs.writeFileSync('jugadores_6chars.csv', csv);

  console.log('\n✅ ARCHIVOS GENERADOS:');
  console.log('📄 CREDENCIALES_FINALES_CABRERIZOS_6CHARS.txt - Principal');
  console.log('📱 credenciales_whatsapp_6chars.txt - Para WhatsApp');
  console.log('📊 jugadores_6chars.csv - Para Excel');
  console.log('🗄️ crear_usuarios_supabase_6chars.sql - Para Supabase');
  console.log('📋 credencial_[nombre]_[numero]_6CHARS.txt - Individuales');
  
  console.log('\n🔑 CARACTERÍSTICAS DE CONTRASEÑAS:');
  console.log('✅ Todas tienen 6+ caracteres');
  console.log('✅ Formato: nombre + número + "cfc"');
  console.log('✅ Cumplen requisitos de seguridad');
  
  console.log('\n📋 EJEMPLOS:');
  credenciales.slice(0, 3).forEach(cred => {
    console.log(`${cred.nombreCompleto}: ${cred.password} (${cred.password.length} chars)`);
  });
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. Ejecutar crear_usuarios_supabase_6chars.sql en Supabase');
  console.log('2. Entregar credenciales individuales a jugadores');
  console.log('3. Probar accesos con algunos jugadores');
  console.log('4. Verificar que cada uno ve su perfil personal');
  
  return credenciales;
}

// Ejecutar
crearCredencialesFinales();