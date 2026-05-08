import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yaltxcmspsvnhnxomhwa.supabase.co'
const supabaseAnonKey = 'sb_publishable_O-3a-ueK9oPaHzC50hKi_A_BK7OWrPR'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getPlayers() {
  const { data: roster, error: rError } = await supabase.from('roster').select('*').order('number')
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*')

  if (rError) console.error('Roster error:', rError)
  if (pError) console.error('Profiles error:', pError)

  console.log('--- ROSTER (PLANTILLA) ---')
  roster?.forEach(p => {
    const isRegistered = profiles?.some(pr => pr.id === p.auth_profile_id)
    console.log(`${p.number || '?'}. ${p.name} ${p.surname || ''} [${isRegistered ? 'REGISTRADO' : 'PENDIENTE'}]`)
  })

  console.log('\n--- PROFILES (CUENTAS) ---')
  profiles?.forEach(p => {
    console.log(`${p.name} ${p.surname} (${p.role})`)
  })
}

getPlayers()
