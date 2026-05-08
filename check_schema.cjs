const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yaltxcmspsvnhnxomhwa.supabase.co',
  'sb_publishable_O-3a-ueK9oPaHzC50hKi_A_BK7OWrPR'
);

async function checkRoster() {
  const { data, error } = await supabase.from('roster').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Roster columns:', Object.keys(data[0] || {}));
  }
}

checkRoster();
