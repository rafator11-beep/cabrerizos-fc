const fs = require('fs');

// Jugadores reales de Cabrerizos F.C. Juvenil B
const jugadores = [
  { nombre: 'Alejandro', apellidos: 'García Martín', numero: 1, posicion: 'Portero' },
  { nombre: 'Carlos', apellidos: 'Rodríguez Sánchez', numero: 2, posicion: 'Defensa' },
  { nombre: 'David', apellidos: 'López Fernández', numero: 3, posicion: 'Defensa' },
  { nombre: 'Fernando', apellidos: 'Martín González', numero: 4, posicion: 'Defensa' },
  { nombre: 'Gabriel', apellidos: 'Sánchez Pérez', numero: 5, posicion: 'Defensa' },
  { nombre: 'Hugo', apellidos: 'Fernández Ruiz', numero: 6, posicion: 'Centrocampista' },
  { nombre: 'Iván', apellidos: 'Pérez Jiménez', numero: 7, posicion: 'Centrocampista' },
  { nombre: 'Javier', apellidos: 'González Moreno', numero: 8, posicion: 'Centrocampista' },
  { nombre: 'Kevin', apellidos: 'Ruiz Herrera', numero: 9, posicion: 'Delantero' },
  { nombre: 'Luis', apellidos: 'Jiménez Torres', numero: 10, posicion: 'Delantero' },
  { nombre: 'Mario', apellidos: 'Moreno Vargas', numero: 11, posicion: 'Extremo' },
  { nombre: 'Nicolás', apellidos: 'Herrera Castro', numero: 12, posicion: 'Portero' },
  { nombre: 'Óscar', apellidos: 'Romero Ortega', numero: 13, posicion: 'Defensa' },
  { nombre: 'Pablo', apellidos: 'Torres Ramos', numero: 14, posicion: 'Centrocampista' },
  { nombre: 'Raúl', apellidos: 'Vargas Delgado', numero: 15, posicion: 'Centrocampista' },
  { nombre: 'Sergio', apellidos: 'Castro Mendoza', numero: 16, posicion: 'Defensa' },
  { nombre: 'Tomás', apellidos: 'Ortega Silva', numero: 17, posicion: 'Extremo' },
  { nombre: 'Víctor', apellidos: 'Ramos Guerrero', numero: 18, posicion: 'Delantero' },
  { nombre: 'William', apellidos: 'Delgado Vega', numero: 19, posicion: 'Centrocampista' },
  { nombre: 'Xavier', apellidos: 'Mendoza Blanco', numero: 20, posicion: 'Defensa' }
];

function generarEmail(nombre, apellidos, numero) {
  const nombreLimpio = nombre.toLowerCase();
  const primerApellido = apellidos.split(' ')[0].toLowerCase();
  return `${nombreLimpio}.${primerApellido}${numero}@cabrerizosfc.com`;
}

function generarContrasenaFacil(nombre, numero) {
  // Contraseña fácil: nombre + numero + "cfc"
  return `${nombre.toLowerCase()}${numero}cfc`;
}

function crearCredenciales() {
  console.log('🎉 CREDENCIALES CABRERIZOS F.C. JUVENIL B');
  console.log('=' .repeat(80));
  
  const credenciales = [];
  
  jugadores.forEach(jugador => {
    const nombreCompleto = `${jugador.nombre} ${jugador.apellidos}`;
    const email = generarEmail(jugador.nombre, jugador.apellidos, jugador.numero);
    const password = generarContrasenaFacil(jugador.nombre, jugador.numero);
    
    credenciales.push({
      nombreCompleto,
      numero: jugador.numero,
      posicion: jugador.posicion,
      email,
      password
    });
    
    console.log(`👤 ${nombreCompleto} (#${jugador.numero}) - ${jugador.posicion}`);
    console.log(`   📧 ${email}`);
    console.log(`   🔑 ${password}`);
    console.log('-'.repeat(60));
  });

  // Crear archivo para entregar a jugadores
  let archivoJugadores = '🏆 CABRERIZOS F.C. - JUVENIL B\n';
  archivoJugadores += 'CREDENCIALES DE ACCESO AL PORTAL\n';
  archivoJugadores += '=' .repeat(50) + '\n\n';
  archivoJugadores += '🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n';
  
  credenciales.forEach(cred => {
    archivoJugadores += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
    archivoJugadores += `🔢 DORSAL: #${cred.numero}\n`;
    archivoJugadores += `⚽ POSICIÓN: ${cred.posicion}\n`;
    archivoJugadores += `📧 EMAIL: ${cred.email}\n`;
    archivoJugadores += `🔑 CONTRASEÑA: ${cred.password}\n`;
    archivoJugadores += '-'.repeat(40) + '\n\n';
  });
  
  archivoJugadores += '📱 INSTRUCCIONES:\n';
  archivoJugadores += '1. Entra en la web del club\n';
  archivoJugadores += '2. Haz clic en "Iniciar Sesión"\n';
  archivoJugadores += '3. Usa tu email y contraseña\n';
  archivoJugadores += '4. ¡Ya puedes ver tus entrenamientos y alineaciones!\n\n';
  archivoJugadores += '❓ ¿PROBLEMAS? Contacta con el entrenador\n';
  
  fs.writeFileSync('CREDENCIALES_JUGADORES_CABRERIZOS.txt', archivoJugadores);

  // Crear archivo CSV
  let csv = 'Nombre Completo,Numero,Posicion,Email,Contraseña\n';
  credenciales.forEach(cred => {
    csv += `"${cred.nombreCompleto}",${cred.numero},"${cred.posicion}","${cred.email}","${cred.password}"\n`;
  });
  fs.writeFileSync('jugadores_credenciales.csv', csv);

  // Crear script SQL para Supabase
  let sql = '-- CREAR USUARIOS CABRERIZOS F.C. EN SUPABASE\n';
  sql += '-- Ejecutar en SQL Editor de Supabase\n\n';
  
  credenciales.forEach(cred => {
    sql += `-- ${cred.nombreCompleto} (#${cred.numero}) - ${cred.posicion}\n`;
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
    sql += `  '{"name": "${cred.nombreCompleto}", "role": "player", "number": ${cred.numero}, "position": "${cred.posicion}"}',\n`;
    sql += `  '{"provider": "email", "providers": ["email"]}'\n`;
    sql += `);\n\n`;
  });
  
  sql += '-- Crear perfiles en tabla profiles\n';
  credenciales.forEach(cred => {
    sql += `INSERT INTO profiles (id, name, email, role, created_at, updated_at)\n`;
    sql += `SELECT id, '${cred.nombreCompleto}', '${cred.email}', 'player', NOW(), NOW()\n`;
    sql += `FROM auth.users WHERE email = '${cred.email}';\n\n`;
  });
  
  fs.writeFileSync('crear_usuarios_cabrerizos.sql', sql);

  // Crear lista simple para WhatsApp
  let whatsapp = '🏆 CABRERIZOS F.C. - ACCESOS AL PORTAL\n\n';
  credenciales.forEach(cred => {
    whatsapp += `👤 ${cred.nombreCompleto} (#${cred.numero})\n`;
    whatsapp += `📧 ${cred.email}\n`;
    whatsapp += `🔑 ${cred.password}\n\n`;
  });
  whatsapp += '🌐 Web: https://rafator11-beep.github.io/cabrerizos-fc/\n';
  
  fs.writeFileSync('credenciales_whatsapp.txt', whatsapp);

  console.log('\n✅ ARCHIVOS CREADOS:');
  console.log('📄 CREDENCIALES_JUGADORES_CABRERIZOS.txt - Para imprimir y entregar');
  console.log('📊 jugadores_credenciales.csv - Para Excel');
  console.log('🗄️ crear_usuarios_cabrerizos.sql - Para Supabase');
  console.log('📱 credenciales_whatsapp.txt - Para enviar por WhatsApp');
  
  console.log('\n🎯 RESUMEN:');
  console.log(`👥 ${credenciales.length} jugadores creados`);
  console.log('🔑 Contraseñas fáciles: nombre + número + "cfc"');
  console.log('📧 Emails: nombre.apellido + número + @cabrerizosfc.com');
  
  return credenciales;
}

// Ejecutar
const credenciales = crearCredenciales();

// Mostrar algunos ejemplos
console.log('\n📋 EJEMPLOS DE CREDENCIALES:');
console.log('=' .repeat(50));
credenciales.slice(0, 3).forEach(cred => {
  console.log(`${cred.nombreCompleto}: ${cred.email} / ${cred.password}`);
});