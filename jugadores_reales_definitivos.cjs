const fs = require('fs');

// JUGADORES REALES DE CABRERIZOS F.C. JUVENIL B (obtenidos de la base de datos)
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

function limpiarNombre(nombre) {
  // Quitar acentos y caracteres especiales para el email
  return nombre.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
    .replace(/\s+/g, ''); // quitar espacios
}

function generarEmail(nombre, apellidos, numero) {
  const nombreLimpio = limpiarNombre(nombre);
  const primerApellido = limpiarNombre(apellidos.split(' ')[0]);
  return `${nombreLimpio}.${primerApellido}${numero}@cabrerizosfc.com`;
}

function generarContrasenaFacil(nombre, numero) {
  // Contraseña súper fácil: primer nombre + numero + "cfc"
  const primerNombre = limpiarNombre(nombre.split(' ')[0]);
  return `${primerNombre}${numero}cfc`;
}

function crearCredencialesReales() {
  console.log('🏆 CABRERIZOS F.C. JUVENIL B - CREDENCIALES REALES');
  console.log('=' .repeat(80));
  
  const credenciales = [];
  
  jugadoresReales.forEach(jugador => {
    const nombreCompleto = `${jugador.nombre} ${jugador.apellidos}`;
    const email = generarEmail(jugador.nombre, jugador.apellidos, jugador.numero);
    const password = generarContrasenaFacil(jugador.nombre, jugador.numero);
    
    credenciales.push({
      nombreCompleto,
      numero: jugador.numero,
      email,
      password
    });
    
    console.log(`👤 ${nombreCompleto} (#${jugador.numero})`);
    console.log(`   📧 ${email}`);
    console.log(`   🔑 ${password}`);
    console.log('-'.repeat(60));
  });

  // Crear archivo principal para entregar
  let archivo = '🏆 CABRERIZOS F.C. - JUVENIL B\n';
  archivo += 'CREDENCIALES DE ACCESO AL PORTAL OFICIAL\n';
  archivo += '=' .repeat(60) + '\n\n';
  archivo += '🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n';
  
  credenciales.forEach(cred => {
    archivo += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
    archivo += `🔢 DORSAL: #${cred.numero}\n`;
    archivo += `📧 EMAIL: ${cred.email}\n`;
    archivo += `🔑 CONTRASEÑA: ${cred.password}\n`;
    archivo += '-'.repeat(50) + '\n\n';
  });
  
  archivo += '📱 CÓMO ACCEDER:\n';
  archivo += '1. Ir a la web del club\n';
  archivo += '2. Clic en "Iniciar Sesión"\n';
  archivo += '3. Introducir tu email y contraseña\n';
  archivo += '4. ¡Listo! Ya puedes ver tus entrenamientos\n\n';
  archivo += '🔒 IMPORTANTE:\n';
  archivo += '- Guarda bien tu contraseña\n';
  archivo += '- No la compartas con nadie\n';
  archivo += '- Si tienes problemas, habla con el entrenador\n\n';
  archivo += '⚽ En el portal podrás ver:\n';
  archivo += '- Tus entrenamientos personalizados\n';
  archivo += '- Alineaciones y convocatorias\n';
  archivo += '- Comentarios del entrenador\n';
  archivo += '- Tus estadísticas y progreso\n';
  
  fs.writeFileSync('CREDENCIALES_CABRERIZOS_FC_REALES.txt', archivo);

  // Crear versión para WhatsApp (más compacta)
  let whatsapp = '🏆 CABRERIZOS F.C. - ACCESOS\n\n';
  credenciales.forEach(cred => {
    whatsapp += `👤 ${cred.nombreCompleto} (#${cred.numero})\n`;
    whatsapp += `📧 ${cred.email}\n`;
    whatsapp += `🔑 ${cred.password}\n\n`;
  });
  whatsapp += '🌐 https://rafator11-beep.github.io/cabrerizos-fc/\n';
  whatsapp += '📱 Clic en "Iniciar Sesión" y usar tu email/contraseña\n';
  
  fs.writeFileSync('credenciales_whatsapp_reales.txt', whatsapp);

  // Crear CSV para Excel
  let csv = 'Nombre Completo,Numero,Email,Contraseña\n';
  credenciales.forEach(cred => {
    csv += `"${cred.nombreCompleto}",${cred.numero},"${cred.email}","${cred.password}"\n`;
  });
  fs.writeFileSync('jugadores_reales.csv', csv);

  // Crear script SQL para Supabase
  let sql = '-- CREAR USUARIOS REALES CABRERIZOS F.C. EN SUPABASE\n';
  sql += '-- Ejecutar en SQL Editor de Supabase Dashboard\n\n';
  
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
    sql += `  '${cred.email}',\n`;
    sql += `  crypt('${cred.password}', gen_salt('bf')),\n`;
    sql += `  NOW(),\n`;
    sql += `  NOW(),\n`;
    sql += `  NOW(),\n`;
    sql += `  '{"name": "${cred.nombreCompleto}", "role": "player", "number": ${cred.numero}}',\n`;
    sql += `  '{"provider": "email", "providers": ["email"]}'\n`;
    sql += `);\n\n`;
  });
  
  sql += '-- Crear perfiles en tabla profiles\n';
  credenciales.forEach(cred => {
    sql += `INSERT INTO profiles (id, name, email, role, created_at, updated_at)\n`;
    sql += `SELECT id, '${cred.nombreCompleto}', '${cred.email}', 'player', NOW(), NOW()\n`;
    sql += `FROM auth.users WHERE email = '${cred.email}';\n\n`;
  });
  
  fs.writeFileSync('crear_usuarios_reales_supabase.sql', sql);

  // Crear lista individual para cada jugador (para imprimir y entregar)
  credenciales.forEach(cred => {
    let individual = `🏆 CABRERIZOS F.C. - JUVENIL B\n`;
    individual += `CREDENCIALES PERSONALES\n`;
    individual += `${'='.repeat(40)}\n\n`;
    individual += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
    individual += `🔢 DORSAL: #${cred.numero}\n\n`;
    individual += `🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n`;
    individual += `📧 TU EMAIL: ${cred.email}\n`;
    individual += `🔑 TU CONTRASEÑA: ${cred.password}\n\n`;
    individual += `📱 PASOS PARA ENTRAR:\n`;
    individual += `1. Ir a la web del club\n`;
    individual += `2. Clic en "Iniciar Sesión"\n`;
    individual += `3. Escribir tu email y contraseña\n`;
    individual += `4. ¡Ya estás dentro!\n\n`;
    individual += `⚽ PODRÁS VER:\n`;
    individual += `- Tus entrenamientos\n`;
    individual += `- Alineaciones\n`;
    individual += `- Comentarios del míster\n`;
    individual += `- Tus estadísticas\n\n`;
    individual += `🔒 ¡GUARDA BIEN ESTA INFORMACIÓN!\n`;
    
    const nombreArchivo = `credencial_${cred.nombreCompleto.replace(/\s+/g, '_').toLowerCase()}.txt`;
    fs.writeFileSync(nombreArchivo, individual);
  });

  console.log('\n✅ ARCHIVOS CREADOS:');
  console.log('📄 CREDENCIALES_CABRERIZOS_FC_REALES.txt - Archivo principal');
  console.log('📱 credenciales_whatsapp_reales.txt - Para WhatsApp');
  console.log('📊 jugadores_reales.csv - Para Excel');
  console.log('🗄️ crear_usuarios_reales_supabase.sql - Para Supabase');
  console.log('📋 credencial_[nombre].txt - Archivos individuales para cada jugador');
  
  console.log('\n🎯 RESUMEN:');
  console.log(`👥 ${credenciales.length} jugadores reales procesados`);
  console.log('🔑 Contraseñas súper fáciles: nombre + número + "cfc"');
  console.log('📧 Emails sin acentos para compatibilidad');
  
  return credenciales;
}

// Ejecutar
const credenciales = crearCredencialesReales();

// Mostrar algunos ejemplos
console.log('\n📋 EJEMPLOS DE CREDENCIALES REALES:');
console.log('=' .repeat(60));
credenciales.slice(0, 5).forEach(cred => {
  console.log(`${cred.nombreCompleto}: ${cred.email} / ${cred.password}`);
});