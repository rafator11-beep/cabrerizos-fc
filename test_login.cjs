const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://yaltxcmspsvnhnxomhwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbHR4Y21zcHN2bmhueG9taHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NjcyOTQsImV4cCI6MjA0OTM0MzI5NH0.YOUR_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para construir email (igual que en AuthContext)
function buildEmail(name, surname, surname2 = '') {
  const n = name.trim().toLowerCase().replace(/\s+/g, '.');
  const s = surname.trim().toLowerCase().replace(/\s+/g, '.');
  const s2 = surname2 ? surname2.trim().toLowerCase().replace(/\s+/g, '.') : '';
  return s2 ? `${n}.${s}.${s2}@cabrerizos-fc.app` : `${n}.${s}@cabrerizos-fc.app`;
}

async function testLogin() {
  console.log('🧪 PROBANDO LOGIN CON DIFERENTES COMBINACIONES...\n');
  
  // Casos de prueba
  const testCases = [
    {
      name: 'Álvaro',
      surname: 'Delgado',
      surname2: 'González',
      password: 'álvaro2cfc'
    },
    {
      name: 'Alvaro',
      surname: 'Delgado',
      surname2: 'Gonzalez',
      password: 'alvaro2cfc'
    },
    {
      name: 'Hugo',
      surname: 'López',
      surname2: 'García',
      password: 'hugo5cfc'
    },
    {
      name: 'Hugo',
      surname: 'Lopez',
      surname2: 'Garcia',
      password: 'hugo5cfc'
    }
  ];

  for (const testCase of testCases) {
    const email = buildEmail(testCase.name, testCase.surname, testCase.surname2);
    
    console.log(`🔄 Probando: ${testCase.name} ${testCase.surname} ${testCase.surname2}`);
    console.log(`📧 Email generado: ${email}`);
    console.log(`🔑 Contraseña: ${testCase.password}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: testCase.password
      });

      if (error) {
        console.log(`❌ Error: ${error.message}\n`);
      } else {
        console.log(`✅ ¡LOGIN EXITOSO!`);
        console.log(`👤 Usuario: ${data.user.email}`);
        console.log(`🆔 ID: ${data.user.id}\n`);
        
        // Cerrar sesión para la siguiente prueba
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ Error de conexión: ${err.message}\n`);
    }
  }
}

// Verificar usuarios existentes
async function checkExistingUsers() {
  console.log('📋 VERIFICANDO USUARIOS EXISTENTES...\n');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'player');

    if (error) {
      console.log('❌ Error obteniendo perfiles:', error.message);
      return;
    }

    if (profiles && profiles.length > 0) {
      console.log(`✅ Encontrados ${profiles.length} jugadores:`);
      profiles.forEach(p => {
        console.log(`👤 ${p.name} ${p.surname} (ID: ${p.id})`);
      });
    } else {
      console.log('⚠️ No se encontraron jugadores en la base de datos');
      console.log('💡 Necesitas crear los usuarios primero');
    }
  } catch (err) {
    console.log('❌ Error de conexión:', err.message);
  }
}

async function main() {
  if (supabaseAnonKey.includes('YOUR_ANON_KEY_HERE')) {
    console.log('⚠️ IMPORTANTE: Debes poner la ANON KEY real de Supabase');
    console.log('📋 Ve a Supabase Dashboard > Settings > API > anon public key');
    return;
  }

  await checkExistingUsers();
  console.log('\n' + '='.repeat(50) + '\n');
  await testLogin();
  
  console.log('🔧 SOLUCIONES POSIBLES:');
  console.log('1. Los usuarios no están creados en Supabase');
  console.log('2. Problema con acentos en nombres/apellidos');
  console.log('3. Contraseña incorrecta');
  console.log('4. Email generado incorrectamente');
}

main();