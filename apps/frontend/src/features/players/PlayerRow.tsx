import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Stars } from '@/components/ui/Stars/Stars'
import { ATTRIBUTE_LABELS } from '@/domain/types'
import type { Player, PlayerAttributes } from '@/domain/types'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'
import { PlayerAvatar } from '@/features/players/PlayerAvatar'
import { cn } from '@/lib/utils'

/** Dados mínimos para exibir uma linha de jogador (avatar + nome) */
export interface PlayerRowPlayer {
  id: string
  name: string
  avatarUrl?: string | null
}

/** Jogador com atributos (para popover) */
export type PlayerRowPlayerWithAttrs = PlayerRowPlayer & Partial<PlayerAttributes>

interface PlayerRowRootProps {
  /** Dados do jogador (mínimo: id, name, avatarUrl?) */
  player: PlayerRowPlayer
  /** Conteúdo à direita (ex.: checkbox, badge). Composition: use como children. */
  children?: ReactNode
  /** Conteúdo à esquerda do avatar (ex.: posição no ranking). */
  prefix?: ReactNode
  /** Se true, ao passar o mouse exibe popover com estrelas e atributos (player deve ter stars, pass, etc.) */
  showAttributesOnHover?: boolean
  /** Jogador com atributos (obrigatório se showAttributesOnHover) */
  playerWithAttrs?: PlayerRowPlayerWithAttrs
  /** Tamanho do avatar: sm (row compacta) | md (row padrão) */
  avatarSize?: 'sm' | 'md'
  className?: string
}

const POPOVER_SHOW_DELAY_MS = 200
const POPOVER_HIDE_DELAY_MS = 150

function AttributesPopover({
  player,
  children,
  rowClassName,
}: {
  player: PlayerRowPlayerWithAttrs
  children: ReactNode
  rowClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(0)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>(0)
  const triggerRef = useRef<HTMLDivElement>(null)

  const hasAttrs =
    typeof player.stars === 'number' &&
    typeof player.pass === 'number' &&
    typeof player.shot === 'number'

  useEffect(() => {
    return () => {
      clearTimeout(hideTimeoutRef.current)
      clearTimeout(showTimeoutRef.current)
    }
  }, [])

  if (!hasAttrs) return <>{children}</>

  const handleEnter = () => {
    clearTimeout(hideTimeoutRef.current)
    clearTimeout(showTimeoutRef.current)
    showTimeoutRef.current = setTimeout(() => {
      setOpen(true)
      const el = triggerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        setCoords({ x: rect.left, y: rect.bottom + 6 })
      }
    }, POPOVER_SHOW_DELAY_MS)
  }

  const handleLeave = () => {
    clearTimeout(showTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => setOpen(false), POPOVER_HIDE_DELAY_MS)
  }

  const cancelHide = () => {
    clearTimeout(hideTimeoutRef.current)
  }

  const attrs = [
    { key: 'stars' as const, label: ATTRIBUTE_LABELS.stars },
    { key: 'pass' as const, label: ATTRIBUTE_LABELS.pass },
    { key: 'shot' as const, label: ATTRIBUTE_LABELS.shot },
    { key: 'defense' as const, label: ATTRIBUTE_LABELS.defense },
    { key: 'energy' as const, label: ATTRIBUTE_LABELS.energy },
    { key: 'speed' as const, label: ATTRIBUTE_LABELS.speed },
  ]

  const hasTechnicalAttrs =
    typeof player.pass === 'number' &&
    typeof player.shot === 'number' &&
    typeof player.defense === 'number' &&
    typeof player.energy === 'number' &&
    typeof player.speed === 'number'

  const popoverContent = open ? (
    <div
      className="fixed z-[100] min-w-[200px] rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-3 shadow-xl"
      style={{ left: coords.x, top: coords.y }}
      onMouseEnter={cancelHide}
      onMouseLeave={handleLeave}
    >
      <p className="mb-2 border-b border-[var(--border-primary)] pb-2 text-xs font-semibold text-[var(--text-tertiary)]">
        Nível e atributos
      </p>
      <div className="mb-2">
        <Stars value={player.stars ?? 0} size="sm" />
      </div>
      {hasTechnicalAttrs && (
        <div className="mb-2 flex justify-center">
          <AttributeRadarChart
            attributes={{
              pass: player.pass ?? 0,
              shot: player.shot ?? 0,
              defense: player.defense ?? 0,
              energy: player.energy ?? 0,
              speed: player.speed ?? 0,
            }}
            size={140}
            showLabels={true}
            ariaLabel={`Atributos de ${player.name}`}
            className="max-w-[140px]"
          />
        </div>
      )}
      <dl className="space-y-1 text-xs">
        {attrs.map(({ key, label }) => (
          <div key={key} className="flex justify-between gap-3">
            <dt className="text-[var(--text-tertiary)]">{label}</dt>
            <dd className="font-medium">{player[key] ?? '-'}</dd>
          </div>
        ))}
      </dl>
    </div>
  ) : null

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={cn(
          'group w-full cursor-default rounded-xl transition-all duration-200',
          'bg-gradient-to-r from-transparent via-transparent to-[var(--surface-secondary)]/30',
          open && 'bg-[var(--surface-secondary)]/60',
          rowClassName,
        )}
      >
        {children}
      </div>
      {typeof document !== 'undefined' && popoverContent
        ? createPortal(popoverContent, document.body)
        : null}
    </>
  )
}

/**
 * Linha reutilizável de jogador: [prefix] + avatar 3:4 + nome + children.
 * Use em listas verticais (times, seleção, top parceria).
 * Com showAttributesOnHover, a row inteira é área de hover e mostra popover + degradê.
 */
export function PlayerRow({
  player,
  children,
  prefix,
  showAttributesOnHover = false,
  playerWithAttrs,
  avatarSize = 'sm',
  className,
}: PlayerRowRootProps) {
  const attrsSource = playerWithAttrs ?? (player as PlayerRowPlayerWithAttrs)
  const showPopover =
    showAttributesOnHover &&
    attrsSource &&
    typeof (attrsSource as Player).stars === 'number'

  const rowContent = (
    <>
      {prefix}
      <PlayerAvatar player={player} size={avatarSize} hoverZoom />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
        {player.name}
      </span>
      {children}
    </>
  )

  const rowWrapperClass = cn(
    'flex items-center gap-3 rounded-xl py-2 pr-3 transition-colors',
    !showPopover && 'group bg-gradient-to-r from-transparent to-[var(--surface-secondary)]/20 hover:to-[var(--surface-secondary)]/50',
  )

  return (
    <div className={className}>
      {showPopover ? (
        <AttributesPopover
          player={attrsSource as PlayerRowPlayerWithAttrs}
          rowClassName={rowWrapperClass}
        >
          {rowContent}
        </AttributesPopover>
      ) : (
        <div className={rowWrapperClass}>
          {rowContent}
        </div>
      )}
    </div>
  )
}
