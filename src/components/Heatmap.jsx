import { useMemo } from 'react'

const W = 550
const H = 366

// Pixels of blur-radius per heatpoint at full intensity
const BASE_RADIUS = 50

// Grid cell size for aggregation (pixels in SVG space)
const CELL = 22

/**
 * Extracts all player token positions (x, y) across every step in every play.
 * Also optionally includes arrow midpoints (where passes/runs happen).
 */
function extractPoints(plays, includeArrows) {
  const pts = []
  for (const play of plays) {
    const steps =
      Array.isArray(play.tokens) && play.tokens[0]?.step !== undefined
        ? play.tokens
        : [{ tokens: play.tokens || [] }]

    for (const step of steps) {
      for (const t of step.tokens || []) {
        if (t.x != null && t.y != null) {
          pts.push({ x: t.x, y: t.y, weight: t.isRival ? 0.5 : 1 })
        }
      }
      if (includeArrows) {
        for (const a of step.arrows || []) {
          if (a.x1 != null) {
            pts.push({ x: (a.x1 + a.x2) / 2, y: (a.y1 + a.y2) / 2, weight: 0.7 })
          }
        }
      }
    }
  }
  return pts
}

/**
 * Aggregates raw points into a grid of { x, y, intensity } cells.
 * Using a grid avoids rendering hundreds of overlapping SVG elements.
 */
function buildGrid(points) {
  const map = {}
  for (const { x, y, weight = 1 } of points) {
    const gx = Math.round(x / CELL) * CELL
    const gy = Math.round(y / CELL) * CELL
    const key = `${gx},${gy}`
    map[key] = (map[key] || 0) + weight
  }
  return Object.entries(map).map(([key, val]) => {
    const [gx, gy] = key.split(',').map(Number)
    return { x: gx, y: gy, val }
  })
}

/** Returns a CSS color string between cold (blue) → warm (red) for a 0-1 intensity. */
function heatColor(t) {
  // cold → hot palette: blue → cyan → green → yellow → red
  const stops = [
    [0,   [0,   0,   255]],
    [0.3, [0,   200, 200]],
    [0.5, [0,   200, 0  ]],
    [0.7, [255, 255, 0  ]],
    [1,   [255, 0,   0  ]],
  ]
  let lo = stops[0], hi = stops[stops.length - 1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) { lo = stops[i]; hi = stops[i + 1]; break }
  }
  const f = hi[0] === lo[0] ? 0 : (t - lo[0]) / (hi[0] - lo[0])
  const r = Math.round(lo[1][0] + f * (hi[1][0] - lo[1][0]))
  const g = Math.round(lo[1][1] + f * (hi[1][1] - lo[1][1]))
  const b = Math.round(lo[1][2] + f * (hi[1][2] - lo[1][2]))
  return `rgb(${r},${g},${b})`
}

// ── Field markings (lightweight SVG path re-used from FieldCanvas) ───────────
function FieldLines() {
  const hw = W / 2, hh = H / 2
  const pA = { w: 90, h: 198 }, sA = { w: 42, h: 110 }
  return (
    <g stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none">
      {/* Outline */}
      <rect x="2" y="2" width={W - 4} height={H - 4} />
      {/* Centre line */}
      <line x1={hw} y1="2" x2={hw} y2={H - 2} />
      {/* Centre circle */}
      <circle cx={hw} cy={hh} r="46" />
      <circle cx={hw} cy={hh} r="2" fill="rgba(255,255,255,0.35)" stroke="none" />
      {/* Penalty areas */}
      <rect x="2" y={(H - pA.h) / 2} width={pA.w} height={pA.h} />
      <rect x={W - 2 - pA.w} y={(H - pA.h) / 2} width={pA.w} height={pA.h} />
      {/* Goal areas */}
      <rect x="2" y={(H - sA.h) / 2} width={sA.w} height={sA.h} />
      <rect x={W - 2 - sA.w} y={(H - sA.h) / 2} width={sA.w} height={sA.h} />
    </g>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Tactical Heatmap — renders player position density over all saved plays.
 *
 * @param {{ plays: object[], includeArrows?: boolean }} props
 */
export default function Heatmap({ plays = [], includeArrows = false }) {
  const points = useMemo(() => extractPoints(plays, includeArrows), [plays, includeArrows])
  const grid   = useMemo(() => buildGrid(points), [points])
  const maxVal  = useMemo(() => Math.max(...grid.map(g => g.val), 1), [grid])

  if (points.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: 'rgba(255,255,255,.4)' }}>
        <div style={{ fontSize: 32 }}>🌡️</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Sin datos suficientes</div>
        <div style={{ fontSize: 11, opacity: 0.7, textAlign: 'center', maxWidth: 200 }}>
          Guarda jugadas con fichas de jugadores para generar el mapa de calor
        </div>
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      style={{ display: 'block' }}
      aria-label="Mapa de calor táctico"
    >
      <defs>
        {/* One radial gradient per cell for the heat effect */}
        {grid.map((pt, i) => {
          const t = pt.val / maxVal
          const color = heatColor(t)
          const alpha = (0.25 + t * 0.65).toFixed(2)
          const r = BASE_RADIUS * (0.5 + t * 0.8)
          return (
            <radialGradient key={i} id={`hg${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={color} stopOpacity={alpha} />
              <stop offset="80%"  stopColor={color} stopOpacity={(alpha * 0.2).toFixed(2)} />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          )
        })}
      </defs>

      {/* Pitch background */}
      <rect width={W} height={H} fill="#1a4a0e" />

      {/* Heat blobs — mix-blend-mode screen blends overlapping zones */}
      <g style={{ mixBlendMode: 'screen' }}>
        {grid.map((pt, i) => {
          const t = pt.val / maxVal
          const r = BASE_RADIUS * (0.5 + t * 0.8)
          return (
            <ellipse
              key={i}
              cx={pt.x}
              cy={pt.y}
              rx={r}
              ry={r * 0.78}
              fill={`url(#hg${i})`}
            />
          )
        })}
      </g>

      {/* Field markings on top */}
      <FieldLines />

      {/* Danger zone label: penalty box frontal */}
      <text x={W * 0.895} y={H * 0.38} textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="8" fontWeight="800" letterSpacing="0.5">ÁREA</text>
      <text x={W * 0.105} y={H * 0.38} textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="8" fontWeight="800" letterSpacing="0.5">ÁREA</text>

      {/* Stats footer */}
      <text x={8} y={H - 8} fill="rgba(255,255,255,.55)" fontSize="9" fontWeight="600">
        {points.length} posiciones · {plays.length} jugadas · {grid.length} zonas activas
      </text>

      {/* Legend: cold → hot */}
      <defs>
        <linearGradient id="legend-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgb(0,0,255)" />
          <stop offset="30%"  stopColor="rgb(0,200,200)" />
          <stop offset="50%"  stopColor="rgb(0,200,0)" />
          <stop offset="70%"  stopColor="rgb(255,255,0)" />
          <stop offset="100%" stopColor="rgb(255,0,0)" />
        </linearGradient>
      </defs>
      <rect x={W - 85} y={H - 18} width={80} height={7} rx="3" fill="url(#legend-grad)" opacity="0.8" />
      <text x={W - 86} y={H - 8} fill="rgba(255,255,255,.5)" fontSize="7">Frío</text>
      <text x={W - 18} y={H - 8} fill="rgba(255,255,255,.5)" fontSize="7">Caliente</text>
    </svg>
  )
}
