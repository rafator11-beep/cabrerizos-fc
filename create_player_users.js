import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ixqhqjqjqjqjqjqjqjqj.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'tu_service_role_key'; // Reemplaza con tu service role key

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para generar contraseña segura
function generatePassword(playerName, playerNumber) {
  // Formato: CFC + Nombre + Número + año actual
  const name = playerName.split(' ')[0].toLowerCase();
  const year = new Date().getFullYear();
  return `CFC${name}${playerNumber}${year}`;
}

// Función para generar email
function generateEmail(playerName, playerNumber) {
  const name = playerName.split(' ')[0].toLowerCase();
  const surname = playerName.split(' ')[1]?.toLowerCase() || '';
  return `${name}.${surname}.${playerNumber}@cabrerizosfc.com`;
}

async function createPlayerUsers() {
  try {
    console.log('🔄 Obteniendo jugadores de la base de datos...');
    
    // Obtener todos los jugadores
    const { data: players, error: playersError } = await supabase
      .from('roster')
      .select('*')
      .order('number');

    if (playersError) {
      console.error('❌ Error al obtener jugadores:', playersError);
      return;
    }

    console.log(`📋 Encontrados ${players.length} jugadores`);
    
    const userCredentials = [];

    for (const player of players) {
      const email = generateEmail(player.name, player.number || 99);
      const password = generatePassword(player.name, player.number || 99);
      
      console.log(`🔄 Creando usuario para ${player.name}...`);
      
      try {
        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: player.name,
            role: 'player',
            player_id: player.id,
            number: player.number
          }
        });

        if (authError) {
          console.error(`❌ Error creando usuario para ${player.name}:`, authError.message);
          continue;
        }

        // Crear perfil en la tabla profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: player.name,
            email: email,
            role: 'player',
            player_id: player.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ Error creando perfil para ${player.name}:`, profileError.message);
        }

        userCredentials.push({
          name: player.name,
          number: player.number,
          email: email,
          password: password,
          user_id: authData.user.id
        });

        console.log(`✅ Usuario creado para ${player.name}`);
        
      } catch (error) {
        console.error(`❌ Error procesando ${player.name}:`, error.message);
      }
    }

    // Mostrar resumen de credenciales
    console.log('\n🎉 PROCESO COMPLETADO');
    console.log('📋 CREDENCIALES DE ACCESO PARA JUGADORES:');
    console.log('=' .repeat(80));
    
    userCredentials.forEach(cred => {
      console.log(`👤 ${cred.name} (#${cred.number})`);
      console.log(`   📧 Email: ${cred.email}`);
      console.log(`   🔑 Contraseña: ${cred.password}`);
      console.log(`   🆔 ID Usuario: ${cred.user_id}`);
      console.log('-'.repeat(50));
    });

    // Guardar credenciales en archivo
    const fs = await import('fs');
    const credentialsText = userCredentials.map(cred => 
      `${cred.name} (#${cred.number})\nEmail: ${cred.email}\nContraseña: ${cred.password}\nID: ${cred.user_id}\n${'='.repeat(50)}`
    ).join('\n');
    
    fs.writeFileSync('credenciales_jugadores.txt', credentialsText);
    console.log('\n💾 Credenciales guardadas en: credenciales_jugadores.txt');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
createPlayerUsers();