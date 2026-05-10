import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Inicializar Supabase con las credenciales públicas
const supabaseUrl = 'https://yaltxcmspsvnhnxomhwa.supabase.co';
const supabaseAnonKey = 'sb_publishable_O-3a-ueK9oPaHzC50hKi_A_BK7OWrPR';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const buildEmail = (name, surname, surname2 = '') => {
  // Normalizar quitando tildes para evitar problemas en el email
  const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const n = normalize(name).trim().toLowerCase().replace(/\s+/g, '.');
  const s = normalize(surname).trim().toLowerCase().replace(/\s+/g, '.');
  const s2 = surname2 ? normalize(surname2).trim().toLowerCase().replace(/\s+/g, '.') : '';
  return s2 ? `${n}.${s}.${s2}@cabrerizos-fc.app` : `${n}.${s}@cabrerizos-fc.app`;
};

async function createUsers() {
  console.log('Obteniendo plantilla (roster)...');
  const { data: roster, error: rosterError } = await supabase.from('roster').select('*');
  
  if (rosterError) {
    console.error('Error obteniendo la plantilla:', rosterError);
    return;
  }

  let credentials = '=== CREDENCIALES CABRERIZOS FC ===\n\n';

  for (const player of roster) {
    // Si el jugador no es Rafa o Ibon (entrenadores), procedemos
    if (player.name.toLowerCase() === 'rafa' || player.name.toLowerCase() === 'ibon') continue;

    // Dividir apellidos
    const surnameParts = player.surname.split(' ');
    const apellido1 = surnameParts[0] || '';
    const apellido2 = surnameParts.slice(1).join(' ') || '';

    const email = buildEmail(player.name, apellido1, apellido2);
    // Crear una contraseña segura pero fácil de recordar
    // Capitalizamos el primer nombre y añadimos 2026!
    const baseName = player.name.split(' ')[0];
    const password = `${baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase()}2026!`;

    console.log(`Intentando registrar a ${player.name} ${player.surname}...`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: player.name,
          surname: player.surname,
          role: 'player'
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`[!] ${player.name} ya estaba registrado. Guardando sus credenciales supuestas.`);
        credentials += `Jugador: ${player.name} ${player.surname}\nEmail/Usuario: ${email}\nContraseña: ${password} (Asumiendo que se creó con este script)\n\n`;
      } else {
        console.error(`Error al registrar a ${player.name}:`, authError.message);
      }
      continue;
    }

    if (authData?.user) {
      console.log(`[OK] Registrado en Auth: ${email}`);
      
      // Crear perfil si no existe (el signUp a veces no lo crea automáticamente según la configuración)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: player.name,
        surname: player.surname,
        role: 'player',
        device_id: null,
        stats: {},
        photo_url: '',
        position: player.position || ''
      }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Error al crear perfil para ${player.name}:`, profileError);
      }

      // Actualizar auth_profile_id en roster
      await supabase.from('roster').update({ auth_profile_id: authData.user.id }).eq('id', player.id);

      credentials += `Jugador: ${player.name} ${player.surname}\nEmail/Usuario: ${email}\nContraseña: ${password}\n\n`;
    }
  }

  // Guardar archivo
  fs.writeFileSync('credenciales_jugadores.txt', credentials, 'utf-8');
  console.log('Proceso finalizado. Credenciales guardadas en credenciales_jugadores.txt');
}

createUsers();
