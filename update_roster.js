import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yaltxcmspsvnhnxomhwa.supabase.co'
const supabaseAnonKey = 'sb_publishable_O-3a-ueK9oPaHzC50hKi_A_BK7OWrPR'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateRoster() {
  console.log('Borrando a Daniel Fuentes...')
  const { error: dError } = await supabase.from('roster').delete().ilike('name', '%Daniel Fuentes%')
  if (dError) console.error('Error al borrar:', dError)
  else console.log('Daniel Fuentes borrado.')

  console.log('Añadiendo a Carlos Jose Montes Ricse...')
  const { error: iError } = await supabase.from('roster').insert([
    { name: 'Carlos Jose', surname: 'Montes Ricse', number: 23 }
  ])
  if (iError) console.error('Error al añadir:', iError)
  else console.log('Carlos Jose Montes Ricse añadido.')
}

updateRoster()
