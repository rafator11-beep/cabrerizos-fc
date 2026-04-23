# Arquitectura Técnica - Cabrerizos F.C.

## 1. Stack Tecnológico

El proyecto está construido sobre un stack moderno y ligero enfocado en rendimiento y simplicidad (Frontend SPA + Backend as a Service):

*   **Core / UI:** React 19 (Hooks, Context API).
*   **Routing:** React Router v7 (`react-router-dom`).
*   **Build Tool:** Vite (rápido empaquetado y HMR).
*   **Backend & Base de Datos:** Supabase (PostgreSQL, Auth, Row Level Security, Storage).
*   **Cliente BD:** `@supabase/supabase-js` (v2.104).
*   **Estilos:** Vanilla CSS (`index.css` con clases utilitarias personalizadas `.btn`, `.card`, `.input-field`) + Inline Styles en componentes. Layouts adaptables (Mobile First approach usando hooks como `useIsMobile`).
*   **Iconografía:** Lucide React.
*   **Despliegue:** GitHub Pages (`gh-pages`).

---

## 2. Esquema de Datos (ERD - Supabase PostgreSQL)

La base de datos aprovecha el uso nativo de `JSONB` de PostgreSQL para estructuras dinámicas (fichas en la pizarra, ejercicios, etc.). Todas las tablas están protegidas con RLS (Row Level Security).

### Tablas Principales

**`profiles`** (Extiende `auth.users`)
*   `id` (UUID, PK) -> FK `auth.users`
*   `role` (TEXT): 'admin' (Entrenador) o 'player' (Jugador).
*   `name`, `surname`, `position` (TEXT)
*   `number` (INTEGER)
*   `photo_url`, `device_id` (TEXT)
*   `stats` (JSONB): *{ goals, assists, yellow_cards, red_cards, matches_played }*
*   `created_at` (TIMESTAMP)

**`roster`** (Plantilla independiente de Auth)
*   `id` (UUID, PK)
*   `name`, `surname`, `position`, `photo_url` (TEXT)
*   `number` (INTEGER)
*   `stats` (JSONB)
*   `is_starter` (BOOLEAN)
*   `auth_profile_id` (UUID) -> Vinculación cuando el jugador se registra.

**`plays`** (Pizarra Táctica / Jugadas)
*   `id` (UUID, PK)
*   `name`, `category`, `type` (TEXT)
*   `tokens` (JSONB): Posiciones en la pizarra *[{id, x, y, type, color, text}]*
*   `arrows` (JSONB): Vectores *[{id, startX, startY, endX, endY, color}]*
*   `created_by` (UUID) -> FK `profiles`

**`trainings`** (Entrenamientos planificados)
*   `id` (UUID, PK)
*   `title`, `intensity`, `objective`, `notes` (TEXT)
*   `date` (DATE)
*   `duration` (INTEGER)
*   `exercises` (JSONB): *[{name, description, duration, category}]*
*   `created_by` (UUID) -> FK `profiles`

**`training_scores`** (Valoraciones de Entrenamientos)
*   `id` (UUID, PK)
*   `training_id` (UUID) -> FK `trainings`
*   `player_id` (UUID) -> FK `profiles`
*   `score` (INTEGER): 1-10
*   `comment` (TEXT)
*   `items` (JSONB): Evaluaciones personalizadas.

**`lineups`** (Alineaciones para partidos)
*   `id` (UUID, PK)
*   `name`, `formation`, `notes` (TEXT)
*   `match_date` (DATE)
*   `starters` (JSONB): *[{player_id, x, y, number}]*
*   `substitutes` (JSONB): *[{player_id, number}]*

**`technique`** (Videoteca / Ejercicios Técnicos)
*   `id` (UUID, PK)
*   `title`, `description`, `category`, `video_url`, `image_url` (TEXT)
*   `tips` (JSONB): *["tip1", "tip2"]*

**`feedback`** (Sugerencias / Comentarios de Jugadores)
*   `id` (UUID, PK)
*   `player_id` (UUID) -> FK `profiles`
*   `type`, `content` (TEXT)
*   `session_id` (UUID)

**Storage:**
*   Bucket `player-photos` para almacenamiento de imágenes de perfiles.

---

## 3. Arquitectura de Flujos (Workflows)

### A. Flujo de Autenticación y Autorización
1.  **Login:** El usuario se autentica vía Supabase. El `AuthContext` captura el usuario y carga su registro de `profiles`.
2.  **Autorización (RLS & UI):** Dependiendo del campo `role` ('admin' o 'player'), la interfaz desbloquea capacidades de edición. Las políticas RLS de Supabase aseguran que solo el 'admin' pueda hacer `INSERT/UPDATE/DELETE` en tablas clave (plays, trainings, lineups, technique). Los jugadores ('player') solo tienen permisos de `SELECT` global y de `INSERT` en su propio feedback y perfiles.
3.  **Restricción de Dispositivo:** Se controla mediante el campo `device_id` en el perfil para limitar accesos simultáneos desde múltiples equipos.

### B. Sistema de Visualización de Jugadas (Pizarra Táctica)
1.  **Edición (Admin):** El entrenador accede a `Tactica.jsx` -> `Pizarra.jsx`. Usando un componente visual (Canvas/DOM), posiciona `tokens` (jugadores/balón) y dibuja `arrows` (flechas).
2.  **Envío de Información:** Al guardar, el estado local de los componentes gráficos se serializa en objetos JSON (`tokens`, `arrows`) y se envía a la tabla `plays` mediante `supabase.from('plays').insert()`.
3.  **Consumo (Player):** Los jugadores entran a la vista de Táctica, que carga los registros de `plays`. El componente lee los JSONB y renderiza de forma estática (o animada) los tokens en las coordenadas exactas de la pantalla.

### C. Flujo de Planificación de Entrenamientos y Alineaciones
1.  **Creación:** El admin crea un `training` sumando ejercicios en un arreglo (`exercises` JSONB) o una alineación posicionando los IDs del `roster` en la vista.
2.  **Feedback/Scoring:** Tras la sesión, el entrenador (o el jugador) puede interactuar con `training_scores` asignando puntuaciones al rendimiento. Los jugadores pueden usar el flujo de `feedback` para sugerir ejercicios o comentar sesiones.

---

## 4. Estado de la Interfaz (Componentes UI/UX)

La aplicación sigue un diseño "Mobile First", utilizando paneles laterales que se transforman en "Drawers" (cajones deslizantes) en móviles, y tarjetas responsivas.

*   **`App.jsx`:** Orquestador de rutas. Implementa `<ProtectedRoute>` para verificar auth antes de mostrar el contenido.
*   **`DashboardLayout.jsx`:** Wrapper principal protegido. Contiene el `Header` (con datos del perfil y botón de logout) y el Layout principal.
*   **`Sidebar.jsx`:** Menú de navegación lateral. En desktop es fijo, en mobile es un menú hamburguesa que se desliza.

### Pantallas Principales (Views / Pages)
*   **`Login.jsx`:** Pantalla de acceso. Acciones: Input de credenciales y botón Submit.
*   **`Home.jsx`:** Panel general de resumen / Dashboard de inicio.
*   **`Entrenamientos.jsx`:** Lista de sesiones. Botones de "Crear" (para Admin) y "Ver/Puntuar" (para Players).
*   **`Tactica.jsx` / `Pizarra.jsx` / `FieldCanvas.jsx`:** El motor interactivo.
    *   **Acciones Admin:** Drag & Drop de fichas, dibujar líneas/flechas, seleccionar categorías (córner, falta, etc.), "Guardar Jugada", "Borrar elemento" (doble click).
    *   **Acciones Player:** Select/Filtro de jugadas, visualización de tablero.
*   **`Plantilla.jsx`:** Listado de jugadores recuperados del `roster`. Muestra estadísticas vitales y fotos.
*   **`Alineacion.jsx`:** Editor de 11 inicial basado en posiciones (x, y) sobre un campo visual. Acciones: Drag & drop de suplentes al campo.
*   **`Tecnica.jsx`:** Biblioteca multimedia. Acciones: Ver vídeos incrustados, leer tips.
*   **`Feedback.jsx`:** Buzón de sugerencias. Acciones: Input textarea, select de tipo, submit.

### Componentes de UI Globales (`index.css`)
*   Botones: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`.
*   Formularios: `.input-field`, `.label`.
*   Contenedores: `.card` (efecto caja ligera con sombra suave).
