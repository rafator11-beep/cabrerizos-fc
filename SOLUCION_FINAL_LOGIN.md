# 🎯 SOLUCIÓN FINAL - ERROR 400 LOGIN

## ❌ PROBLEMA ACTUAL
Los jugadores no pueden hacer login y reciben **error 400** porque los usuarios no están creados en la base de datos de Supabase.

## ✅ SOLUCIÓN COMPLETA

### PASO 1: CREAR USUARIOS EN SUPABASE
```
1. Ir a: https://yaltxcmspsvnhnxomhwa.supabase.co
2. Hacer login con tu cuenta de Supabase
3. Ir a "SQL Editor" (icono de base de datos)
4. Crear nueva query
5. Copiar TODO el contenido del archivo: crear_usuarios_supabase_6chars.sql
6. Pegar en el editor
7. Hacer clic en "RUN" (botón verde)
8. Verificar que dice "Success. No rows returned" o similar
```

### PASO 2: VERIFICAR CREACIÓN
```sql
-- Ejecutar esto para verificar:
SELECT COUNT(*) as total FROM auth.users WHERE email LIKE '%@cabrerizos-fc.app';
-- Debe devolver: 20
```

### PASO 3: PROBAR LOGIN
```
1. Ir a: https://rafator11-beep.github.io/cabrerizos-fc/
2. Hacer clic en "Inicia sesión"
3. Probar con cualquier jugador:

EJEMPLO FÁCIL:
- Nombre: Hugo
- Apellidos: López García  
- Contraseña: hugo5cfc
```

## 📋 CREDENCIALES COMPLETAS

### JUGADORES PRINCIPALES (20 usuarios):
```
Haritz / González Delgado / haritz1cfc
Álvaro / Delgado González / álvaro2cfc
Asier / Marcos Riesco / asier4cfc
Hugo / López García / hugo5cfc
Gabriel / Fraile Alguacil / gabriel6cfc
Héctor / Cáceres Marcos / héctor7cfc
Iván / Martín Cañizal / iván9cfc
Aarón Gabriel / García / aarón10cfc
Ricardo André / Romero Chiuz / ricardo11cfc
David Mario / Hidalgo Vizcaíno / david12cfc
Carlos / Martín Silva / carlos14cfc
Unai / Rodríguez Ríos / unai15cfc
Daniel / Alonso Gago / daniel16cfc
Álex / Hernández Nicolás / álex17cfc
Iván Matías / González / iván18cfc
Raúl / Rodríguez Morán / raúl19cfc
Juan / Vicente Hernández / juan20cfc
Guillermo / Domínguez García / guillermo21cfc
Jorge / Alonso Cordovilla / jorge22cfc
Carlos Jose / Montes Ricse / carlos23cfc
```

## 🔧 QUÉ HACE EL SCRIPT SQL

1. **Crea 20 usuarios** en `auth.users` con:
   - Emails automáticos: `nombre.apellidos@cabrerizos-fc.app`
   - Contraseñas encriptadas con bcrypt
   - Confirmación automática de email

2. **Crea perfiles** en tabla `profiles` con:
   - Nombre y apellidos
   - Rol de jugador
   - Vinculación con auth.users

3. **Enlaza con roster** existente:
   - Conecta usuarios con jugadores por número de dorsal
   - Mantiene estadísticas y datos existentes

## 🚀 RESULTADO ESPERADO

Después de ejecutar el SQL:
- ✅ 20 jugadores pueden hacer login
- ✅ Cada uno ve su perfil personal
- ✅ Sistema de autenticación 100% funcional
- ✅ Rafa e Ibon tienen acceso de entrenador
- ✅ Jugadores ven sus estadísticas y convocatorias

## 🆘 SI ALGO FALLA

### Error en SQL Editor:
- Verificar que estás en el proyecto correcto
- Comprobar permisos de administrador
- Ejecutar por partes si es muy largo

### Login sigue fallando:
- Limpiar caché del navegador (Ctrl+F5)
- Probar en navegador incógnito
- Verificar que escribes exactamente las credenciales
- Usar DevTools (F12) para ver errores en consola

### Verificar usuarios creados:
```sql
SELECT email, created_at FROM auth.users WHERE email LIKE '%@cabrerizos-fc.app' ORDER BY email;
```

---

## 📞 CONTACTO
Si necesitas ayuda ejecutando el SQL o hay algún error, contacta con el desarrollador con:
- Captura de pantalla del error
- Mensaje exacto que aparece
- Credenciales que estás probando

**Una vez ejecutado el SQL correctamente, el sistema funcionará perfectamente para todos los jugadores.**