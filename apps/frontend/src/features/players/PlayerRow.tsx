import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Stars } from '@/components/ui/Stars/Stars'
import { ATTRIBUTE_LABELS } from '@/domain/types'
import type { Player, PlayerAttributes } from '@/domain/types'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'
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
  /** Se true, ao passar o mouse no nome exibe popover com estrelas e atributos (player deve ter stars, pass, etc.) */
  showAttributesOnHover?: boolean
  /** Jogador com atributos (obrigatório se showAttributesOnHover) */
  playerWithAttrs?: PlayerRowPlayerWithAttrs
  className?: string
}

function Avatar({ player, size = 'md' }: { player: PlayerRowPlayer; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'size-8' : 'size-10'
  if (player.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt=""
        className={cn('shrink-0 rounded-full object-cover', sizeClass)}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-sm font-semibold text-[var(--text-tertiary)]',
        sizeClass,
      )}
    >
      {player.name.charAt(0).toUpperCase()}
    </div>
  )
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
          'w-full cursor-default rounded-lg transition-colors duration-150',
          open && 'bg-[var(--surface-tertiary)]',
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
 * Linha reutilizável de jogador: avatar + nome (+ conteúdo extra por composition).
 * Use em listas verticais (times, seleção de jogadores).
 * Com showAttributesOnHover, a row inteira é área de hover e mostra popover + efeito de fundo.
 */
export function PlayerRow({
  player,
  children,
  showAttributesOnHover = false,
  playerWithAttrs,
  className,
}: PlayerRowRootProps) {
  const attrsSource = playerWithAttrs ?? (player as PlayerRowPlayerWithAttrs)
  const showPopover =
    showAttributesOnHover &&
    attrsSource &&
    typeof (attrsSource as Player).stars === 'number'

  const rowContent = (
    <>
      <Avatar player={player} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
        {player.name}
      </span>
      {children}
    </>
  )

  return (
    <div className={className}>
      {showPopover ? (
        <AttributesPopover
          player={attrsSource as PlayerRowPlayerWithAttrs}
          rowClassName={cn(
            'flex items-center gap-3 py-1.5 pr-2',
            'hover:bg-[var(--surface-tertiary)]',
          )}
        >
          {rowContent}
        </AttributesPopover>
      ) : (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg py-1.5 pr-2 transition-colors',
            'hover:bg-[var(--surface-tertiary)]',
          )}
        >
          {rowContent}
        </div>
      )}
    </div>
  )
}
