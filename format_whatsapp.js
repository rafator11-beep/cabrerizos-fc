import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://yaltxcmspsvnhnxomhwa.supabase.co';
const supabaseAnonKey = 'sb_publishable_O-3a-ueK9oPaHzC50hKi_A_BK7OWrPR';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateMessages() {
  const { data: roster, error } = await supabase.from('roster').select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log("Aquí tienes los mensajes listos para copiar y pegar a cada jugador por WhatsApp:\n");

  for (const player of roster) {
    if (player.name.toLowerCase() === 'rafa' || player.name.toLowerCase() === 'ibon') continue;

    const surnameParts = player.surname.split(' ');
    const apellido1 = surnameParts[0] || '';
    const apellido2 = surnameParts.slice(1).join(' ') || '';
    
    const baseName = player.name.split(' ')[0];
    const password = `${baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase()}2026!`;

    console.log(`=================================`);
    console.log(`📱 PARA: ${player.name} ${player.surname}`);
    console.log(`=================================`);
    console.log(`¡Hola ${baseName}! Ya puedes acceder a la app del Cabrerizos F.C.\n`);
    console.log(`Entra en la app y rellena las casillas EXACTAMENTE con estos datos (no importa si pones tildes o no):`);
    console.log(`👤 Nombre: ${player.name}`);
    console.log(`👤 Primer apellido: ${apellido1}`);
    console.log(`👤 Segundo apellido: ${apellido2}`);
    console.log(`🔑 Contraseña: ${password}`);
    console.log(`=================================\n`);
  }
}

generateMessages();
