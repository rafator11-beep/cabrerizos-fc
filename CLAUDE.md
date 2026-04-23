# CABRERIZOS F.C. — SYSTEM PROMPT

## STACK
React 18+Vite+TailwindCSS+Supabase. PWA. Target: 400×858px móvil. Dark/bold/Gen Z.

## ARQUITECTURA
```
src/
├── components/        PlayerCard, StatBadge, FieldToken, SwipeCard → export desde index.js
├── hooks/             useSupabase*.ts, useToast, useGestures, useAppContext
├── tabs/              ElXI, Pizarra, Sesiones, TuVoz, ElEquipo
├── context/           AppContext (jugador activo, tab, rol, online/offline)
└── index.css          variables globales únicamente
```

## SUPABASE
Tablas: `players` `sessions` `lineups` `tactics` `feedback`
Roles: `coach` (total) | `player` (solo su perfil + TuVoz)
Realtime activo: `lineups` `sessions`
Regla: llamadas Supabase SOLO en hooks, nunca en componentes.
Si añades tabla → incluye SQL migración como comentario al final del hook.

## REGLAS ABSOLUTAS
1. Touch-first: `onPointerDown/Move/Up` + `touch-action:none` en TODO lo interactivo
2. Layout: `100dvh`, overflow oculto solo donde explícito, scroll declarado
3. Sin sidebar — navegación solo Bottom Nav 5 tabs
4. Tailwind para estilos, sin CSS externo salvo variables en `index.css`
5. No tocar: `useGameEngine` `useGameEffects` `useGameContent`
6. Offline-first: `localStorage` como caché, sync Supabase cuando hay conexión
7. Error boundary por tab (si Pizarra falla, El XI sigue)
8. Componente >200 líneas → dividir en subcomponentes misma carpeta

## NOMENCLATURA UI
Alineación→ElXI | Táctica→Pizarra | Entrenamientos→Sesiones | Feedback→TuVoz | Plantilla→ElEquipo

## COMPONENTES BASE
- `PlayerCard` foto+dorsal+posición+estado físico (verde/amarillo/rojo)
- `StatBadge` píldora estadística con color semántico
- `FieldToken` ficha táctil reutilizable en Pizarra y ElXI
- `SwipeCard` base swipe tipo Tinder para TuVoz y votaciones
- `Toast` flotante inferior, auto-dismiss 3s, swipe para cerrar → hook `useToast()`

## GESTOS
- Swipe ←/→ en TuVoz (valorar entrenamiento)
- Long press en PlayerCard → menú contextual (editar/lesión/nota)
- Pull-to-refresh en Sesiones y ElEquipo
- Pinch-zoom: desactivado global, activable solo en Pizarra por coach
- Háptico: `navigator.vibrate(40)` al confirmar alineación o votar

## RENDIMIENTO
- `React.lazy()+Suspense` por cada tab (code splitting)
- `useMemo` en cálculos de formaciones y posiciones
- Imágenes con lazy load + skeleton placeholder
- Debounce 300ms en inputs de búsqueda

## ANIMACIONES
- Cambio tab: `transform:translateX` sin librerías
- Entrada cards: fade+translateY(12px) stagger 60ms/ítem
- Transiciones CSS puras salvo casos complejos

## ACCESIBILIDAD
- `aria-label` en botones de icono
- Contraste WCAG AA en textos sobre fondos oscuros
- Focus visible en modo teclado

## ESTADOS VACÍOS Y ERRORES
- Cada sección tiene estado vacío diseñado (ilustración+CTA, nunca pantalla en blanco)
- Modo degradado si Supabase no responde → datos localStorage + banner "Sin conexión"
- Toast tipos: éxito(verde) aviso(naranja) error(rojo) info(azul)

## OUTPUT — REGLAS ESTRICTAS
- SOLO el archivo afectado completo, cabecera `### Archivo.jsx`
- Si afecta design system → actualiza también `components/index.js`
- Sin saludos, sin explicaciones, sin conclusiones
- Múltiples archivos → en orden de dependencia
