# 📱 INSTRUCCIONES RÁPIDAS - CHAT SYSTEM

## ⚠️ PASO 1: EJECUTAR SQL EN SUPABASE (OBLIGATORIO)

**Si no haces esto, el chat NO funcionará.**

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `yaltxcmspsvnhnxomhwa`
3. Haz clic en **"SQL Editor"** en el menú lateral izquierdo
4. Haz clic en **"New query"**
5. Copia y pega este código:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their sent messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);
```

6. Haz clic en **"Run"** (o presiona Ctrl+Enter)
7. Debe aparecer: **"Success. No rows returned"**

✅ **Listo! La tabla está creada.**

---

## 🔄 PASO 2: LIMPIAR CACHÉ DEL NAVEGADOR

**Elige UNA de estas opciones:**

### Opción A: Modo Incógnito (MÁS FÁCIL) ⭐
1. Abre una ventana de incógnito:
   - **Chrome/Edge**: Presiona `Ctrl + Shift + N`
   - **Firefox**: Presiona `Ctrl + Shift + P`
2. Ve a: https://rafator11-beep.github.io/cabrerizos-fc/
3. Inicia sesión normalmente

### Opción B: Limpiar Caché (Recomendado)
1. Ve a: https://rafator11-beep.github.io/cabrerizos-fc/
2. Presiona `F12` (se abre DevTools)
3. Haz **clic derecho** en el botón de recargar (🔄)
4. Selecciona: **"Vaciar caché y recargar de forma forzada"**
5. Cierra DevTools (F12 otra vez)

### Opción C: Borrar Datos del Navegador
**Chrome/Edge:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona: **"Imágenes y archivos en caché"**
3. Haz clic en **"Borrar datos"**

**Firefox:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona: **"Caché"**
3. Haz clic en **"Aceptar"**

---

## 💬 PASO 3: USAR EL CHAT

### Como ENTRENADOR:

1. **Abrir el chat:**
   - Busca el botón 💬 (abajo a la izquierda, al lado del cronómetro)
   - Haz clic en él

2. **Iniciar conversación nueva:**
   - Haz clic en el botón **"+"** (arriba a la derecha)
   - Verás la lista de TODOS los jugadores con sus fotos
   - Haz clic en el jugador con quien quieres chatear

3. **Ver conversaciones existentes:**
   - Si ya has chateado con jugadores, aparecerán en la lista
   - Verás: foto, nombre, último mensaje, hora
   - Si hay mensajes sin leer, aparece un número rojo

4. **Enviar mensaje:**
   - Escribe en el campo de texto
   - Presiona `Enter` o haz clic en el botón ✈️

5. **Volver a la lista:**
   - Haz clic en **"← Volver"** (arriba a la derecha)

### Como JUGADOR:

1. **Abrir el chat:**
   - Busca el botón 💬 (abajo a la izquierda)
   - Haz clic en él

2. **Ver mensajes:**
   - Todos tus mensajes con el entrenador aparecen automáticamente

3. **Enviar mensaje:**
   - Escribe en el campo de texto
   - Presiona `Enter` o haz clic en el botón ✈️

---

## 🎨 CÓMO SE VE EL CHAT

### Vista de Conversaciones (Entrenador):
```
┌─────────────────────────────────┐
│ 💬 Chat con Jugadores      + ✕ │
├─────────────────────────────────┤
│  📷 Hugo García               │
│     Hola entrenador!      10:30│
│  🔴 2                           │
├─────────────────────────────────┤
│  📷 Carlos Pérez              │
│     Gracias por el...     Ayer │
├─────────────────────────────────┤
│  📷 Juan López                │
│     Entendido             15:45│
└─────────────────────────────────┘
```

### Vista de Chat Activo:
```
┌─────────────────────────────────┐
│ 💬 Chat con Jugadores        ✕ │
├─────────────────────────────────┤
│ 📷 Hugo García    ← Volver      │
│    ✓ Conectado                  │
├─────────────────────────────────┤
│                                 │
│  ┌──────────────┐               │
│  │ Hola Hugo!   │ 10:25         │
│  └──────────────┘               │
│                                 │
│               ┌──────────────┐  │
│         10:30 │ Hola entrena!│  │
│               └──────────────┘  │
│                                 │
├─────────────────────────────────┤
│ Escribe un mensaje...        ✈️│
└─────────────────────────────────┘
```

---

## ❓ PROBLEMAS COMUNES

### "No me aparece el chat"
- ✅ Limpia la caché del navegador (ver PASO 2)
- ✅ Usa modo incógnito

### "No puedo seleccionar jugadores"
- ✅ Verifica que ejecutaste el SQL en Supabase (PASO 1)
- ✅ Abre la consola (F12) y busca errores en rojo

### "Los mensajes no se guardan"
- ✅ Verifica que ejecutaste el SQL en Supabase (PASO 1)
- ✅ Verifica que la tabla `messages` existe en Supabase
- ✅ Ve a Supabase → Table Editor → busca "messages"

### "Me sale 'Jugador no encontrado'"
- ✅ Limpia la caché del navegador
- ✅ Recarga la página
- ✅ Vuelve a seleccionar el jugador

### "No me sale el nombre del jugador"
- ✅ Limpia la caché del navegador
- ✅ Abre la consola (F12) y busca "=== DEBUG CHAT ==="
- ✅ Verifica que `selectedPlayer` no sea `undefined`

---

## 🔍 DEBUG (Si algo falla)

1. Presiona `F12` para abrir la consola
2. Busca mensajes que empiecen con:
   - `=== DEBUG CHAT ===`
   - `Error loading messages:`
   - `Error sending message:`
3. Copia el error y envíamelo

---

## ✅ CHECKLIST FINAL

Antes de usar el chat, verifica:

- [ ] Ejecuté el SQL en Supabase
- [ ] Vi el mensaje "Success. No rows returned"
- [ ] Limpié la caché del navegador (o uso incógnito)
- [ ] Puedo ver el botón 💬 en la app
- [ ] Puedo abrir el chat
- [ ] Puedo ver la lista de jugadores
- [ ] Puedo seleccionar un jugador
- [ ] Puedo escribir y enviar mensajes
- [ ] Los mensajes aparecen en el chat

---

## 📞 SOPORTE

Si después de seguir TODOS los pasos algo no funciona:

1. Abre la consola (F12)
2. Haz una captura de pantalla de los errores
3. Envíame la captura

**URL de la app:** https://rafator11-beep.github.io/cabrerizos-fc/

---

**RECUERDA**: El chat funciona en tiempo real. Si el entrenador envía un mensaje, el jugador lo verá inmediatamente (y viceversa).
