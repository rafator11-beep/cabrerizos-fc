# INSTRUCCIONES PARA VER LOS CAMBIOS

El navegador está cacheando agresivamente la aplicación. Sigue estos pasos:

## Opción 1: Desinstalar PWA y limpiar todo (RECOMENDADO)

### En Chrome/Edge:
1. Ve a `chrome://apps` (o `edge://apps`)
2. Busca "Cabrerizos F.C."
3. Click derecho → "Desinstalar"
4. Luego ve a `chrome://settings/content/all` (o `edge://settings/content/all`)
5. Busca "rafator11-beep.github.io"
6. Click en el icono de la papelera para eliminar todos los datos
7. Cierra TODAS las ventanas del navegador
8. Abre el navegador de nuevo
9. Ve a: https://rafator11-beep.github.io/cabrerizos-fc/
10. Presiona Ctrl + Shift + R (recarga forzada)

## Opción 2: Modo Incógnito (MÁS RÁPIDO)

1. Presiona **Ctrl + Shift + N** (Chrome/Edge) o **Ctrl + Shift + P** (Firefox)
2. Ve a: https://rafator11-beep.github.io/cabrerizos-fc/
3. Inicia sesión normalmente

## Opción 3: Limpiar Service Workers manualmente

1. Abre la consola de desarrollador (F12)
2. Ve a la pestaña "Application" (Chrome) o "Almacenamiento" (Firefox)
3. En el menú izquierdo, busca "Service Workers"
4. Click en "Unregister" en todos los service workers
5. Luego ve a "Storage" → "Clear site data"
6. Marca todas las opciones y click en "Clear data"
7. Cierra la consola y recarga con Ctrl + Shift + R

## Opción 4: Probar en otro navegador

Si usas Chrome, prueba en:
- Firefox
- Edge
- Brave
- Opera

## ¿Qué deberías ver?

Cuando abras el chat (botón verde abajo a la izquierda del cronómetro):

1. **Pantalla inicial**: "No hay conversaciones aún" con botón "Nueva conversación"
2. **Botón "+"** en el header (arriba a la derecha)
3. **Al hacer clic**: Lista de 20 jugadores con fotos
4. **Al seleccionar un jugador**: Se abre el chat individual
5. **Puedes escribir y enviar mensajes**
6. **Los mensajes aparecen en burbujas** (verdes los tuyos, grises los del jugador)

## Si NADA funciona:

Espera 5-10 minutos (GitHub Pages tarda en actualizar) y vuelve a intentar con modo incógnito.
