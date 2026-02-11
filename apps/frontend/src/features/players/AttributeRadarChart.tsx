import { useMemo } from 'react'
import { cn } from '@/lib/utils'

/** Atributos técnicos (sem estrelas). Ordem: topo e sentido horário. Reutilizável em perfil, edição, card do time e popover. */
const ATTRIBUTE_KEYS = ['pass', 'shot', 'defense', 'energy', 'speed'] as const
const ATTRIBUTE_ABBREV: Record<(typeof ATTRIBUTE_KEYS)[number], string> = {
  pass: 'PAS',
  shot: 'CHU',
  defense: 'DEF',
  energy: 'ENG',
  speed: 'VEL',
}

export interface TechnicalAttributes {
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
}

/** Formata valor para rótulo: inteiro ou uma casa decimal (exportado para uso em listagens/tabelas). */
// eslint-disable-next-line react-refresh/only-export-components -- helper compartilhado
export function formatAttributeValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

interface AttributeRadarChartProps {
  /** Valores por atributo (suporta decimais, ex.: médias de time). Escala entre min e max. */
  attributes: TechnicalAttributes
  /** Tamanho do SVG (viewBox). */
  size?: number
  /** Mínimo da escala (default 1). */
  min?: number
  /** Máximo da escala (default 5). */
  max?: number
  /** Exibir rótulos numéricos e siglas nos eixos (default true). Compacto: false para popover. */
  showLabels?: boolean
  /** Descrição para acessibilidade. */
  ariaLabel?: string
  className?: string
}

/** Cor do polígono pela média (1 = vermelho, 3 = neutro, 5 = verde), igual ao formulário de edição */
function averageToColor(avg: number): { fill: string; stroke: string } {
  if (avg >= 4) return { fill: 'rgba(34, 197, 94, 0.35)', stroke: 'rgb(34, 197, 94)' }
  if (avg <= 2) return { fill: 'rgba(239, 68, 68, 0.35)', stroke: 'rgb(239, 68, 68)' }
  return { fill: 'rgba(148, 163, 184, 0.25)', stroke: 'rgb(100, 116, 139)' }
}

const DEFAULT_MIN = 1
const DEFAULT_MAX = 5

export function AttributeRadarChart({
  attributes,
  size = 260,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  showLabels = true,
  ariaLabel = 'Atributos técnicos em radar',
  className,
}: AttributeRadarChartProps) {
  const PADDING = 10
  const innerSize = size - 2 * PADDING

  const { cx, cy, gridLevels, dataPoly, labelPoints, colors } =
    useMemo(() => {
      const cx = innerSize / 2
      const cy = innerSize / 2
      const maxR = (innerSize / 2) * 0.72
      const range = max - min || 1

      // Ângulos em graus: topo = 90°, depois +72° por vértice (sentido horário). SVG: y para baixo.
      const angles = [90, 162, 234, 306, 18].map((d) => (d * Math.PI) / 180)

      // 4 linhas concêntricas equidistantes: centro = 1, cada anel = +1 (2, 3, 4, 5)
      const gridLevels = [1, 2, 3, 4].map((step) => {
        const t = step / 4
        const r = t * maxR
        return angles.map((a) => ({
          x: cx + r * Math.cos(a),
          y: cy - r * Math.sin(a),
        }))
      })

      const values = ATTRIBUTE_KEYS.map((k) => {
        const v = attributes[k] ?? 0
        return Math.max(min, Math.min(max, v))
      })
      const dataPoints = values.map((v, i) => {
        const t = (v - min) / range
        const r = t * maxR
        const a = angles[i]
        return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), value: v }
      })

      const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

      const labelRadius = maxR + innerSize * 0.08
      const labelPoints = angles.map((a, i) => ({
        x: cx + labelRadius * Math.cos(a),
        y: cy - labelRadius * Math.sin(a),
        key: ATTRIBUTE_KEYS[i],
        value: values[i],
      }))

      const avg = values.reduce((s, v) => s + v, 0) / values.length
      const colors = averageToColor(avg)

      return {
        cx,
        cy,
        gridLevels,
        dataPoly,
        labelPoints,
        colors,
      }
    }, [attributes, size, min, max])

  const viewSize = size + 2 * PADDING
  const offset = (viewSize - innerSize) / 2

  return (
    <figure className={cn('flex flex-col items-center', className)}>
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className="size-full max-w-full"
        aria-label={ariaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${offset}, ${offset})`}>
        {/* Grid: pentágonos concêntricos */}
        <g stroke="rgb(203 213 225)" strokeWidth="0.8" fill="none">
          {gridLevels.map((pts, i) => (
            <polygon
              key={i}
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          ))}
        </g>

        {/* Linhas do centro aos vértices */}
        <g stroke="rgb(226 232 240)" strokeWidth="0.6">
          {[0, 1, 2, 3, 4].map((i) => {
            const p = gridLevels[gridLevels.length - 1][i]
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
              />
            )
          })}
        </g>

        {/* Polígono dos dados (preenchimento) */}
        <polygon
          points={dataPoly}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Rótulos: número + sigla em cada eixo (opcional para modo compacto) */}
        {showLabels &&
          labelPoints.map(({ x, y, key, value }) => (
            <g key={key} transform={`translate(${x},${y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fill: 'var(--text-primary)',
                }}
              >
                {formatAttributeValue(value)}
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="hanging"
                dy="6"
                style={{
                  fontSize: 10,
                  fill: 'var(--text-tertiary)',
                }}
              >
                {ATTRIBUTE_ABBREV[key]}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <figcaption className="sr-only">
        Atributos: Passe {formatAttributeValue(attributes.pass)}, Chute{' '}
        {formatAttributeValue(attributes.shot)}, Defesa{' '}
        {formatAttributeValue(attributes.defense)}, Energia{' '}
        {formatAttributeValue(attributes.energy)}, Velocidade{' '}
        {formatAttributeValue(attributes.speed)}
      </figcaption>
    </figure>
  )
}
