# 🔍 DIAGNÓSTICO COMPLETO - ERROR 400 LOGIN

## RESUMEN DEL PROBLEMA
Los jugadores no pueden hacer login y reciben error 400. **La causa principal es que los usuarios no están creados en Supabase.**

## PASOS PARA SOLUCIONAR

### 1️⃣ EJECUTAR SQL EN SUPABASE (OBLIGATORIO)
```
1. Ir a: https://yaltxcmspsvnhnxomhwa.supabase.co
2. Entrar en "SQL Editor"
3. Copiar TODO el contenido de: crear_usuarios_supabase_6chars.sql
4. Pegar y hacer clic en "RUN"
5. Verificar que no hay errores
```

### 2️⃣ VERIFICAR CREACIÓN DE USUARIOS
```sql
-- Ejecutar esto en SQL Editor para verificar:
SELECT COUNT(*) as usuarios_creados 
FROM auth.users 
WHERE email LIKE '%@cabrerizos-fc.app';

-- Debe devolver: 20 usuarios
```

### 3️⃣ PROBAR LOGIN
```
Ir a: https://rafator11-beep.github.io/cabrerizos-fc/
Probar con:
- Nombre: Haritz
- Apellidos: González Delgado
- Contraseña: haritz1cfc
```

## CREDENCIALES DE PRUEBA RÁPIDA

### ✅ FÁCILES DE ESCRIBIR:
```
Hugo / López García / hugo5cfc
Unai / Rodríguez Ríos / unai15cfc  
Daniel / Alonso Gago / daniel16cfc
Jorge / Alonso Cordovilla / jorge22cfc
```

### ✅ CON ACENTOS (para probar caracteres especiales):
```
Álvaro / Delgado González / álvaro2cfc
Héctor / Cáceres Marcos / héctor7cfc
Álex / Hernández Nicolás / álex17cfc
```

## FORMATO EXACTO DE EMAILS GENERADOS
El sistema convierte automáticamente:
- **Haritz González Delgado** → `haritz.gonzález.delgado@cabrerizos-fc.app`
- **Juan Vicente Hernández** → `juan.vicente.hernández@cabrerizos-fc.app`
- **Carlos Jose Montes Ricse** → `carlos.jose.montes.ricse@cabrerizos-fc.app`

## DEBUGGING EN NAVEGADOR
Para ver qué está pasando:
1. Abrir DevTools (F12)
2. Ir a pestaña "Console"
3. Intentar login
4. Ver mensajes de error detallados

## ERRORES COMUNES Y SOLUCIONES

### Error 400: "Invalid login credentials"
- **Causa:** Usuario no existe en Supabase
- **Solución:** Ejecutar el SQL script

### Error: "Email not confirmed"  
- **Causa:** Usuario creado pero no confirmado
- **Solución:** En el SQL, `email_confirmed_at` debe ser `NOW()`

### Error: Campos vacíos
- **Causa:** Espacios extra o caracteres especiales
- **Solución:** Escribir exactamente como en credenciales

## VERIFICACIÓN FINAL
Después de ejecutar el SQL, estos comandos deben funcionar:

```sql
-- 1. Verificar usuarios (debe ser 20)
SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@cabrerizos-fc.app';

-- 2. Verificar perfiles (debe ser 20)  
SELECT COUNT(*) FROM profiles WHERE role = 'player';

-- 3. Verificar enlaces roster (debe ser 20)
SELECT COUNT(*) FROM roster WHERE auth_profile_id IS NOT NULL;
```

## SI SIGUE FALLANDO
1. **Limpiar caché:** Ctrl+Shift+R o Ctrl+F5
2. **Probar navegador incógnito**
3. **Verificar que el SQL se ejecutó sin errores**
4. **Comprobar que las credenciales son exactas**

---
**NOTA IMPORTANTE:** Este es un problema de configuración de base de datos. Una vez ejecutado correctamente el SQL, el login funcionará al 100%.