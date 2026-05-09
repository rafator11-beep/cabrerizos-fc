const { createClient } = require('@supabase/supabase-js');

// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS REALES
const supabaseUrl = 'https://ixqhqjqjqjqjqjqjqjqj.supabase.co'; // Tu URL de Supabase
const supabaseServiceKey = 'tu_service_role_key_aqui'; // Tu Service Role Key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para generar contraseña segura
function generatePassword(playerName, playerNumber) {
  const name = playerName.split(' ')[0].toLowerCase();
  const year = new Date().getFullYear();
  return `CFC${name}${playerNumber || 99}${year}`;
}

// Función para generar email
function generateEmail(playerName, playerNumber) {
  const name = playerName.split(' ')[0].toLowerCase();
  const surname = playerName.split(' ')[1]?.toLowerCase() || 'player';
  return `${name}.${surname}.${playerNumber || 99}@cabrerizosfc.com`;
}

async function generateCredentials() {
  try {
    console.log('🔄 Obteniendo jugadores...');
    
    // Obtener jugadores
    const { data: players, error } = await supabase
      .from('roster')
      .select('*')
      .order('number');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📋 Encontrados ${players.length} jugadores\n`);
    
    const credentials = [];

    // Generar credenciales para cada jugador
    players.forEach(player => {
      const email = generateEmail(player.name, player.number);
      const password = generatePassword(player.name, player.number);
      
      credentials.push({
        name: player.name,
        number: player.number || 99,
        email: email,
        password: password
      });
    });

    // Mostrar credenciales
    console.log('🎉 CREDENCIALES GENERADAS PARA CABRERIZOS F.C.');
    console.log('=' .repeat(80));
    
    credentials.forEach(cred => {
      console.log(`👤 ${cred.name} (#${cred.number})`);
      console.log(`   📧 Email: ${cred.email}`);
      console.log(`   🔑 Contraseña: ${cred.password}`);
      console.log('-'.repeat(50));
    });

    // Guardar en archivo
    const fs = require('fs');
    let fileContent = 'CREDENCIALES DE ACCESO - CABRERIZOS F.C.\n';
    fileContent += '=' .repeat(50) + '\n\n';
    
    credentials.forEach(cred => {
      fileContent += `JUGADOR: ${cred.name} (#${cred.number})\n`;
      fileContent += `EMAIL: ${cred.email}\n`;
      fileContent += `CONTRASEÑA: ${cred.password}\n`;
      fileContent += '-'.repeat(30) + '\n\n';
    });
    
    fileContent += '\nINSTRUCCIONES:\n';
    fileContent += '1. Cada jugador debe usar su email y contraseña para acceder\n';
    fileContent += '2. La contraseña sigue el formato: CFC + nombre + número + año\n';
    fileContent += '3. El email sigue el formato: nombre.apellido.numero@cabrerizosfc.com\n';
    fileContent += '4. Los jugadores pueden cambiar su contraseña una vez dentro\n';
    
    fs.writeFileSync('CREDENCIALES_JUGADORES.txt', fileContent);
    console.log('\n💾 Credenciales guardadas en: CREDENCIALES_JUGADORES.txt');
    
    // Crear script SQL para insertar usuarios
    let sqlContent = '-- SCRIPT PARA CREAR USUARIOS EN SUPABASE\n';
    sqlContent += '-- Ejecutar en el SQL Editor de Supabase\n\n';
    
    credentials.forEach(cred => {
      sqlContent += `-- Usuario para ${cred.name}\n`;
      sqlContent += `INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)\n`;
      sqlContent += `VALUES (\n`;
      sqlContent += `  gen_random_uuid(),\n`;
      sqlContent += `  '${cred.email}',\n`;
      sqlContent += `  crypt('${cred.password}', gen_salt('bf')),\n`;
      sqlContent += `  NOW(),\n`;
      sqlContent += `  NOW(),\n`;
      sqlContent += `  NOW(),\n`;
      sqlContent += `  '{"name": "${cred.name}", "role": "player", "number": ${cred.number}}'\n`;
      sqlContent += `);\n\n`;
    });
    
    fs.writeFileSync('create_users.sql', sqlContent);
    console.log('📄 Script SQL guardado en: create_users.sql');
    
    console.log('\n✅ PROCESO COMPLETADO');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecutar create_users.sql en Supabase SQL Editor');
    console.log('2. Ejecutar supabase_notifications_schema.sql para las notificaciones');
    console.log('3. Entregar credenciales a los jugadores');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
generateCredentials();