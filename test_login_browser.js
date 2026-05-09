// SCRIPT DE PRUEBA PARA EJECUTAR EN CONSOLA DEL NAVEGADOR
// Abrir DevTools (F12) → Console → Pegar este código → Enter

console.log('🔍 INICIANDO DIAGNÓSTICO DE LOGIN...');

// Función para construir email como lo hace la app
function buildEmail(name, surname, surname2 = '') {
  const n = name.trim().toLowerCase().replace(/\s+/g, '.');
  const s = surname.trim().toLowerCase().replace(/\s+/g, '.');
  const s2 = surname2 ? surname2.trim().toLowerCase().replace(/\s+/g, '.') : '';
  return s2 ? `${n}.${s}.${s2}@cabrerizos-fc.app` : `${n}.${s}@cabrerizos-fc.app`;
}

// Casos de prueba
const testCases = [
  { name: 'Haritz', surname: 'González Delgado', password: 'haritz1cfc' },
  { name: 'Hugo', surname: 'López García', password: 'hugo5cfc' },
  { name: 'Juan', surname: 'Vicente Hernández', password: 'juan20cfc' },
  { name: 'Carlos Jose', surname: 'Montes Ricse', password: 'carlos23cfc' }
];

console.log('📧 EMAILS GENERADOS:');
testCases.forEach(test => {
  const email = buildEmail(test.name, test.surname);
  console.log(`${test.name} ${test.surname} → ${email}`);
});

// Función de prueba de login
async function testLogin(name, surname, password) {
  const email = buildEmail(name, surname);
  
  console.log(`\n🔐 Probando login: ${name} ${surname}`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password} (${password.length} chars)`);
  
  try {
    // Acceder al cliente Supabase desde la app
    const supabase = window.supabase || (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current?.memoizedProps?.supabase);
    
    if (!supabase) {
      console.error('❌ No se puede acceder al cliente Supabase');
      return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error(`❌ Error ${error.status || 'NO_STATUS'}:`, error.message);
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 Probable causa: Usuario no existe en Supabase');
      }
    } else {
      console.log('✅ Login exitoso!', data.user.email);
    }
  } catch (err) {
    console.error('❌ Error de red:', err.message);
  }
}

// Ejecutar pruebas
console.log('\n🧪 EJECUTANDO PRUEBAS DE LOGIN...');
console.log('(Esto puede tardar unos segundos)');

// Probar el primer caso
setTimeout(() => {
  testLogin(testCases[0].name, testCases[0].surname, testCases[0].password);
}, 1000);

console.log('\n📋 INSTRUCCIONES:');
console.log('1. Si ves "Usuario no existe en Supabase" → Ejecutar SQL script');
console.log('2. Si ves "Login exitoso" → El sistema funciona correctamente');
console.log('3. Si ves "Error de red" → Problema de conexión');

console.log('\n🔧 Para probar manualmente:');
console.log('testLogin("Haritz", "González Delgado", "haritz1cfc")');