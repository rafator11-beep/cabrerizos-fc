const { createClient } = require('@supabase/supabase-js');

// CONFIGURACIÓN REAL DE SUPABASE
const supabaseUrl = 'https://yaltxcmspsvnhnxomhwa.supabase.co';
// NECESITAS PONER AQUÍ TU SERVICE ROLE KEY REAL
const supabaseServiceKey = 'TU_SERVICE_ROLE_KEY_AQUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function crearUsuarioPrueba() {
  try {
    console.log('🔧 CREANDO USUARIO DE PRUEBA...');
    
    // Usuario de prueba sin acentos
    const testUser = {
      nombre: 'Hugo',
      apellidos: 'Lopez Garcia',
      numero: 5,
      password: 'hugo5cfc'
    };
    
    const email = `${testUser.nombre.toLowerCase()}.${testUser.apellidos.toLowerCase().replace(/\s+/g, '.')}@cabrerizos-fc.app`;
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${testUser.password}`);
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        name: testUser.nombre,
        surname: testUser.apellidos,
        role: 'player'
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario:', authError.message);
      return;
    }

    console.log('✅ Usuario creado en auth.users');
    const userId = authData.user.id;

    // Crear perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: testUser.nombre,
        surname: testUser.apellidos,
        role: 'player',
        stats: {},
        photo_url: '',
        position: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError.message);
      return;
    }

    console.log('✅ Perfil creado en profiles');

    // Buscar en roster y enlazar
    const { data: rosterData, error: rosterError } = await supabase
      .from('roster')
      .select('*')
      .eq('number', testUser.numero)
      .single();

    if (rosterData && !rosterError) {
      const { error: updateError } = await supabase
        .from('roster')
        .update({ auth_profile_id: userId })
        .eq('id', rosterData.id);

      if (updateError) {
        console.error('❌ Error enlazando roster:', updateError.message);
      } else {
        console.log('✅ Enlazado con roster');
      }
    }

    console.log('\n🎉 USUARIO DE PRUEBA CREADO');
    console.log('=' .repeat(40));
    console.log(`👤 Nombre: ${testUser.nombre}`);
    console.log(`📝 Apellidos: ${testUser.apellidos}`);
    console.log(`🔑 Contraseña: ${testUser.password}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log('\n🧪 PRUEBA AHORA:');
    console.log('1. Ir a la web');
    console.log('2. Clic en "Inicia sesión"');
    console.log(`3. Nombre: ${testUser.nombre}`);
    console.log(`4. Primer apellido: Lopez`);
    console.log(`5. Segundo apellido: Garcia`);
    console.log(`6. Contraseña: ${testUser.password}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Verificar si se ha puesto la service key
if (supabaseServiceKey === 'TU_SERVICE_ROLE_KEY_AQUI') {
  console.log('⚠️ IMPORTANTE: Debes poner tu SERVICE ROLE KEY real');
  console.log('📋 Ve a Supabase Dashboard > Settings > API > service_role key');
  console.log('🔧 Reemplaza "TU_SERVICE_ROLE_KEY_AQUI" con la clave real');
} else {
  crearUsuarioPrueba();
}