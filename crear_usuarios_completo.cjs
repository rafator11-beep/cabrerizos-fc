const { createClient } = require('@supabase/supabase-js');

// CONFIGURACIÓN REAL DE SUPABASE
const supabaseUrl = 'https://yaltxcmspsvnhnxomhwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbHR4Y21zcHN2bmhueG9taHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc2NzI5NCwiZXhwIjoyMDQ5MzQzMjk0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // REEMPLAZAR CON LA REAL

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  return `${primerNombre}${numero}cfc`;
}

function buildEmail(name, surname) {
  // Función igual que en AuthContext.jsx
  const n = name.trim().toLowerCase().replace(/\s+/g, '.');
  const s = surname.trim().toLowerCase().replace(/\s+/g, '.');
  return `${n}.${s}@cabrerizos-fc.app`;
}

async function crearUsuariosCompleto() {
  try {
    console.log('🏆 CREANDO USUARIOS COMPLETOS EN CABRERIZOS F.C.');
    console.log('=' .repeat(80));
    
    const credenciales = [];
    const errores = [];

    // Paso 1: Obtener jugadores existentes en roster
    console.log('📋 Obteniendo jugadores existentes...');
    const { data: playersExistentes, error: playersError } = await supabase
      .from('roster')
      .select('*')
      .order('number');

    if (playersError) {
      console.error('❌ Error obteniendo jugadores:', playersError);
      return;
    }

    console.log(`✅ Encontrados ${playersExistentes.length} jugadores en roster\n`);

    // Paso 2: Crear usuarios para cada jugador
    for (const jugador of jugadoresReales) {
      const nombreCompleto = `${jugador.nombre} ${jugador.apellidos}`;
      const email = buildEmail(jugador.nombre, jugador.apellidos);
      const password = generarContrasenaSegura(jugador.nombre, jugador.numero);
      
      console.log(`🔄 Procesando: ${nombreCompleto} (#${jugador.numero})`);
      
      try {
        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: jugador.nombre,
            surname: jugador.apellidos,
            role: 'player'
          }
        });

        if (authError) {
          console.error(`❌ Error auth para ${nombreCompleto}:`, authError.message);
          errores.push({ jugador: nombreCompleto, error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Crear perfil en profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: jugador.nombre,
            surname: jugador.apellidos,
            role: 'player',
            stats: {},
            photo_url: '',
            position: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ Error perfil para ${nombreCompleto}:`, profileError.message);
          errores.push({ jugador: nombreCompleto, error: profileError.message });
        }

        // Buscar jugador en roster y enlazarlo
        const jugadorRoster = playersExistentes.find(p => 
          p.number === jugador.numero || 
          p.name?.toLowerCase().includes(jugador.nombre.toLowerCase())
        );

        if (jugadorRoster) {
          // Enlazar usuario con roster
          const { error: rosterError } = await supabase
            .from('roster')
            .update({ auth_profile_id: userId })
            .eq('id', jugadorRoster.id);

          if (rosterError) {
            console.error(`❌ Error enlazando roster para ${nombreCompleto}:`, rosterError.message);
          } else {
            console.log(`✅ Enlazado con roster ID: ${jugadorRoster.id}`);
          }
        } else {
          console.log(`⚠️ No encontrado en roster: ${nombreCompleto}`);
        }

        credenciales.push({
          nombre: jugador.nombre,
          apellidos: jugador.apellidos,
          nombreCompleto,
          numero: jugador.numero,
          email,
          password,
          userId,
          rosterId: jugadorRoster?.id || null
        });

        console.log(`✅ Usuario creado: ${nombreCompleto}`);
        
      } catch (error) {
        console.error(`❌ Error procesando ${nombreCompleto}:`, error.message);
        errores.push({ jugador: nombreCompleto, error: error.message });
      }
    }

    // Generar archivos de credenciales
    console.log('\n📄 Generando archivos de credenciales...');
    
    // Archivo principal
    let archivo = '🏆 CABRERIZOS F.C. - JUVENIL B\n';
    archivo += 'CREDENCIALES DE ACCESO PERSONAL\n';
    archivo += '=' .repeat(60) + '\n\n';
    archivo += '🌐 WEB: https://rafator11-beep.github.io/cabrerizos-fc/\n\n';
    archivo += '📱 CÓMO ACCEDER:\n';
    archivo += '1. Ir a la web del club\n';
    archivo += '2. Clic en "Inicia sesión" (abajo)\n';
    archivo += '3. Introducir TU NOMBRE y APELLIDOS exactos\n';
    archivo += '4. Introducir TU CONTRASEÑA (mínimo 6 caracteres)\n';
    archivo += '5. ¡Listo! Verás tu perfil personal\n\n';
    archivo += '=' .repeat(60) + '\n\n';
    
    credenciales.forEach(cred => {
      archivo += `👤 JUGADOR: ${cred.nombreCompleto}\n`;
      archivo += `🔢 DORSAL: #${cred.numero}\n`;
      archivo += `📝 NOMBRE: ${cred.nombre}\n`;
      archivo += `📝 APELLIDOS: ${cred.apellidos}\n`;
      archivo += `🔑 CONTRASEÑA: ${cred.password} (${cred.password.length} caracteres)\n`;
      archivo += `🆔 USER ID: ${cred.userId}\n`;
      if (cred.rosterId) archivo += `⚽ ROSTER ID: ${cred.rosterId}\n`;
      archivo += '-'.repeat(50) + '\n\n';
    });
    
    archivo += '🔒 IMPORTANTE:\n';
    archivo += '- Escribe EXACTAMENTE tu nombre y apellidos\n';
    archivo += '- Las contraseñas tienen mínimo 6 caracteres\n';
    archivo += '- Cada jugador tiene su perfil personal enlazado\n';
    archivo += '- Podrás ver TUS entrenamientos y alineaciones\n\n';
    archivo += '❓ ¿PROBLEMAS? Habla con el entrenador\n';
    
    const fs = require('fs');
    fs.writeFileSync('CREDENCIALES_FINALES_CABRERIZOS.txt', archivo);

    // Archivo para WhatsApp
    let whatsapp = '🏆 CABRERIZOS F.C. - ACCESOS\n\n';
    whatsapp += '🌐 https://rafator11-beep.github.io/cabrerizos-fc/\n';
    whatsapp += '📱 Clic en "Inicia sesión"\n\n';
    credenciales.forEach(cred => {
      whatsapp += `👤 ${cred.nombreCompleto} (#${cred.numero})\n`;
      whatsapp += `📝 Nombre: ${cred.nombre}\n`;
      whatsapp += `📝 Apellidos: ${cred.apellidos}\n`;
      whatsapp += `🔑 Contraseña: ${cred.password}\n\n`;
    });
    
    fs.writeFileSync('credenciales_whatsapp_finales.txt', whatsapp);

    // Archivos individuales
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
      individual += `   (${cred.password.length} caracteres - cumple requisitos)\n\n`;
      individual += `📱 PASOS PARA ENTRAR:\n`;
      individual += `1. Ir a la web del club\n`;
      individual += `2. Clic en "Inicia sesión" (abajo)\n`;
      individual += `3. Escribir: ${cred.nombre}\n`;
      individual += `4. Escribir: ${cred.apellidos}\n`;
      individual += `5. Escribir: ${cred.password}\n`;
      individual += `6. ¡Ya estás en tu perfil personal!\n\n`;
      individual += `⚽ EN TU PERFIL VERÁS:\n`;
      individual += `- Tus entrenamientos personalizados\n`;
      individual += `- Si estás convocado\n`;
      individual += `- Comentarios del míster para ti\n`;
      individual += `- Tus estadísticas personales\n\n`;
      individual += `🔒 ¡GUARDA BIEN ESTA INFORMACIÓN!\n`;
      individual += `Es solo tuya, no la compartas.\n`;
      
      const nombreArchivo = `credencial_${cred.nombre.replace(/\s+/g, '_')}_${cred.numero}_FINAL.txt`;
      fs.writeFileSync(nombreArchivo, individual);
    });

    // Resumen final
    console.log('\n🎉 PROCESO COMPLETADO');
    console.log('=' .repeat(60));
    console.log(`✅ Usuarios creados: ${credenciales.length}`);
    console.log(`❌ Errores: ${errores.length}`);
    
    if (errores.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      errores.forEach(err => {
        console.log(`- ${err.jugador}: ${err.error}`);
      });
    }

    console.log('\n📁 ARCHIVOS GENERADOS:');
    console.log('📄 CREDENCIALES_FINALES_CABRERIZOS.txt - Archivo principal');
    console.log('📱 credenciales_whatsapp_finales.txt - Para WhatsApp');
    console.log('📋 credencial_[nombre]_[numero]_FINAL.txt - Individuales');
    
    console.log('\n🔑 CARACTERÍSTICAS DE LAS CONTRASEÑAS:');
    console.log('- Mínimo 6 caracteres (cumple requisitos)');
    console.log('- Formato: nombre + número + "cfc"');
    console.log('- Ejemplos: haritz1cfc, álvaro2cfc, hugo5cfc');
    
    console.log('\n🔗 ENLACES REALIZADOS:');
    console.log('- Usuarios creados en Supabase Auth');
    console.log('- Perfiles creados en tabla profiles');
    console.log('- Enlaces con tabla roster (auth_profile_id)');
    
    return credenciales;

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar solo si se proporciona la service key real
if (supabaseServiceKey.includes('Ej8Ej8')) {
  console.log('⚠️ IMPORTANTE: Debes reemplazar supabaseServiceKey con la clave real de Supabase');
  console.log('📋 Busca en Supabase Dashboard > Settings > API > service_role key');
} else {
  crearUsuariosCompleto();
}