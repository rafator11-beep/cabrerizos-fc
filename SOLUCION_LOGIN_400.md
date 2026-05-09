# 🚨 SOLUCIÓN ERROR 400 - LOGIN NO FUNCIONA

## PROBLEMA IDENTIFICADO
Los usuarios intentan hacer login pero reciben error 400 porque **los usuarios no existen en Supabase todavía**.

## CAUSA
- ✅ El sistema de autenticación está bien configurado
- ✅ Las credenciales están correctas (6+ caracteres)
- ✅ El formulario funciona correctamente
- ❌ **Los usuarios NO están creados en la base de datos de Supabase**

## SOLUCIÓN INMEDIATA

### PASO 1: Ejecutar SQL en Supabase
1. Ir a: https://yaltxcmspsvnhnxomhwa.supabase.co
2. Entrar en **SQL Editor**
3. Copiar y pegar el contenido completo del archivo: `crear_usuarios_supabase_6chars.sql`
4. Hacer clic en **RUN** para ejecutar

### PASO 2: Verificar que funciona
1. Ir a la web: https://rafator11-beep.github.io/cabrerizos-fc/
2. Probar login con cualquier jugador, por ejemplo:
   - **Nombre:** Haritz
   - **Apellidos:** González Delgado  
   - **Contraseña:** haritz1cfc

## QUÉ HACE EL SCRIPT SQL
1. **Crea 20 usuarios** en `auth.users` con emails automáticos
2. **Crea perfiles** en tabla `profiles` 
3. **Enlaza usuarios** con la tabla `roster` existente
4. **Configura contraseñas** con el formato: `nombre + número + "cfc"`

## CREDENCIALES FINALES
Ver archivo: `CREDENCIALES_FINALES_CABRERIZOS_6CHARS.txt`

## FORMATO DE LOGIN
- **Nombre:** Exactamente como aparece en credenciales
- **Apellidos:** Exactamente como aparece en credenciales  
- **Contraseña:** Mínimo 6 caracteres (todas cumplen)

## DESPUÉS DE EJECUTAR EL SQL
- ✅ Todos los jugadores podrán hacer login
- ✅ Cada uno verá su perfil personal
- ✅ Los entrenadores (Rafa/Ibon) tendrán acceso admin
- ✅ Sistema completamente funcional

## SI SIGUE FALLANDO
1. Verificar que el SQL se ejecutó sin errores
2. Comprobar que los usuarios aparecen en Authentication > Users
3. Revisar que las credenciales se escriben exactamente igual
4. Limpiar caché del navegador (Ctrl+F5)

---
**IMPORTANTE:** Este es un problema de configuración de base de datos, no de código. Una vez ejecutado el SQL, todo funcionará perfectamente.