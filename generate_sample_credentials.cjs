// Generar credenciales de ejemplo para jugadores de Cabrerizos F.C.
const fs = require('fs');

// Jugadores de ejemplo (reemplazar con los reales)
const players = [
  { name: 'Alejandro García', number: 1 },
  { name: 'Carlos Rodríguez', number: 2 },
  { name: 'David López', number: 3 },
  { name: 'Fernando Martín', number: 4 },
  { name: 'Gabriel Sánchez', number: 5 },
  { name: 'Hugo Fernández', number: 6 },
  { name: 'Iván Pérez', number: 7 },
  { name: 'Javier González', number: 8 },
  { name: 'Kevin Ruiz', number: 9 },
  { name: 'Luis Jiménez', number: 10 },
  { name: 'Mario Moreno', number: 11 },
  { name: 'Nicolás Herrera', number: 12 },
  { name: 'Óscar Romero', number: 13 },
  { name: 'Pablo Torres', number: 14 },
  { name: 'Raúl Vargas', number: 15 },
  { name: 'Sergio Castro', number: 16 },
  { name: 'Tomás Ortega', number: 17 },
  { name: 'Víctor Ramos', number: 18 },
  { name: 'William Delgado', number: 19 },
  { name: 'Xavier Mendoza', number: 20 }
];

function generatePassword(playerName, playerNumber) {
  const name = playerName.split(' ')[0].toLowerCase();
  const year = new Date().getFullYear();
  return `CFC${name}${playerNumber}${year}`;
}

function generateEmail(playerName, playerNumber) {
  const name = playerName.split(' ')[0].toLowerCase();
  const surname = playerName.split(' ')[1]?.toLowerCase() || 'player';
  return `${name}.${surname}.${playerNumber}@cabrerizosfc.com`;
}

function generateCredentials() {
  console.log('🎉 GENERANDO CREDENCIALES PARA CABRERIZOS F.C.');
  console.log('=' .repeat(80));
  
  const credentials = [];
  
  players.forEach(player => {
    const email = generateEmail(player.name, player.number);
    const password = generatePassword(player.name, player.number);
    
    credentials.push({
      name: player.name,
      number: player.number,
      email: email,
      password: password
    });
    
    console.log(`👤 ${player.name} (#${player.number})`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Contraseña: ${password}`);
    console.log('-'.repeat(50));
  });

  // Guardar en archivo de texto
  let fileContent = 'CREDENCIALES DE ACCESO - CABRERIZOS F.C. JUVENIL B\n';
  fileContent += '=' .repeat(60) + '\n\n';
  
  credentials.forEach(cred => {
    fileContent += `JUGADOR: ${cred.name} (#${cred.number})\n`;
    fileContent += `EMAIL: ${cred.email}\n`;
    fileContent += `CONTRASEÑA: ${cred.password}\n`;
    fileContent += `URL: https://rafator11-beep.github.io/cabrerizos-fc/\n`;
    fileContent += '-'.repeat(40) + '\n\n';
  });
  
  fileContent += '\nINSTRUCCIONES PARA JUGADORES:\n';
  fileContent += '=' .repeat(30) + '\n';
  fileContent += '1. Ir a: https://rafator11-beep.github.io/cabrerizos-fc/\n';
  fileContent += '2. Hacer clic en "Iniciar Sesión"\n';
  fileContent += '3. Usar tu email y contraseña personal\n';
  fileContent += '4. Una vez dentro, podrás ver:\n';
  fileContent += '   - Tus entrenamientos personalizados\n';
  fileContent += '   - Alineaciones y convocatorias\n';
  fileContent += '   - Comentarios del entrenador\n';
  fileContent += '   - Tu progreso y estadísticas\n';
  fileContent += '5. Puedes cambiar tu contraseña en el perfil\n\n';
  
  fileContent += 'FORMATO DE CONTRASEÑAS:\n';
  fileContent += 'CFC + tu_nombre + tu_numero + 2026\n';
  fileContent += 'Ejemplo: CFCalejandro12026\n\n';
  
  fileContent += 'SOPORTE TÉCNICO:\n';
  fileContent += 'Si tienes problemas para acceder, contacta al entrenador.\n';
  
  fs.writeFileSync('CREDENCIALES_JUGADORES_CABRERIZOS_FC.txt', fileContent);
  
  // Crear archivo CSV para importar
  let csvContent = 'Nombre,Numero,Email,Contraseña\n';
  credentials.forEach(cred => {
    csvContent += `"${cred.name}",${cred.number},"${cred.email}","${cred.password}"\n`;
  });
  fs.writeFileSync('credenciales_jugadores.csv', csvContent);
  
  // Crear script SQL para Supabase
  let sqlContent = '-- SCRIPT PARA CREAR USUARIOS EN SUPABASE AUTH\n';
  sqlContent += '-- Ejecutar en el SQL Editor de Supabase Dashboard\n\n';
  
  credentials.forEach(cred => {
    sqlContent += `-- Usuario: ${cred.name} (#${cred.number})\n`;
    sqlContent += `INSERT INTO auth.users (\n`;
    sqlContent += `  instance_id,\n`;
    sqlContent += `  id,\n`;
    sqlContent += `  aud,\n`;
    sqlContent += `  role,\n`;
    sqlContent += `  email,\n`;
    sqlContent += `  encrypted_password,\n`;
    sqlContent += `  email_confirmed_at,\n`;
    sqlContent += `  created_at,\n`;
    sqlContent += `  updated_at,\n`;
    sqlContent += `  raw_user_meta_data,\n`;
    sqlContent += `  raw_app_meta_data\n`;
    sqlContent += `) VALUES (\n`;
    sqlContent += `  '00000000-0000-0000-0000-000000000000',\n`;
    sqlContent += `  gen_random_uuid(),\n`;
    sqlContent += `  'authenticated',\n`;
    sqlContent += `  'authenticated',\n`;
    sqlContent += `  '${cred.email}',\n`;
    sqlContent += `  crypt('${cred.password}', gen_salt('bf')),\n`;
    sqlContent += `  NOW(),\n`;
    sqlContent += `  NOW(),\n`;
    sqlContent += `  NOW(),\n`;
    sqlContent += `  '{"name": "${cred.name}", "role": "player", "number": ${cred.number}}',\n`;
    sqlContent += `  '{"provider": "email", "providers": ["email"]}'\n`;
    sqlContent += `);\n\n`;
  });
  
  fs.writeFileSync('crear_usuarios_supabase.sql', sqlContent);
  
  console.log('\n✅ ARCHIVOS GENERADOS:');
  console.log('📄 CREDENCIALES_JUGADORES_CABRERIZOS_FC.txt - Para entregar a jugadores');
  console.log('📊 credenciales_jugadores.csv - Para importar en Excel');
  console.log('🗄️ crear_usuarios_supabase.sql - Para ejecutar en Supabase');
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Ejecutar crear_usuarios_supabase.sql en Supabase SQL Editor');
  console.log('2. Ejecutar supabase_notifications_schema.sql para notificaciones');
  console.log('3. Entregar credenciales individuales a cada jugador');
  console.log('4. Probar el acceso con algunos jugadores');
}

// Ejecutar
generateCredentials();