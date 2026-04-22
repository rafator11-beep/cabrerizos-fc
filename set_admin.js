require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Updating all users to admin...");
  const { data, error } = await supabase.from('profiles').update({ role: 'admin' }).neq('role', 'admin');
  
  if (error) {
    console.error("Error updating:", error);
  } else {
    console.log("Success! Updated rows.");
  }
}

run();
