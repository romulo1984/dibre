import { useRef, useState, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas-pro'
import type { Player } from '@/domain/types'
import { Button } from '@/components/ui/Button/Button'
import { Logo } from '@/components/ui/Logo'

interface PlayerExportCardProps {
  player: Player
  participationCount: number
  open: boolean
  onClose: () => void
}

const ATTRS = [
  { key: 'pass' as const, label: 'PAS' },
  { key: 'shot' as const, label: 'CHU' },
  { key: 'defense' as const, label: 'DEF' },
  { key: 'energy' as const, label: 'ENG' },
  { key: 'speed' as const, label: 'VEL' },
]

function attrColor(value: number): string {
  if (value >= 4) return '#22c55e'
  if (value >= 3) return '#eab308'
  return '#ef4444'
}

function starsString(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(5 - count)
}

export function PlayerExportCard({ player, participationCount, open, onClose }: PlayerExportCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const avg = (player.pass + player.shot + player.defense + player.energy + player.speed) / 5

  // Fechar com Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquear scroll do body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const doExport = useCallback(async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })
      const dataUrl = canvas.toDataURL('image/png')

      // Tenta usar Web Share API com arquivo se disponível
      if (typeof navigator.share === 'function') {
        try {
          const blob = await (await fetch(dataUrl)).blob()
          const file = new File([blob], `${player.name.replace(/\s+/g, '-').toLowerCase()}-dibre.png`, {
            type: 'image/png',
          })
          await navigator.share({
            files: [file],
            title: `${player.name} - dib.re`,
            text: `Confira o card de ${player.name} no dib.re!`,
          })
          setExporting(false)
          return
        } catch {
          // Se share falhar, faz download normal
        }
      }

      // Fallback: download direto
      const link = document.createElement('a')
      link.download = `${player.name.replace(/\s+/g, '-').toLowerCase()}-dibre.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Erro ao exportar card:', err)
    } finally {
      setExporting(false)
    }
  }, [player.name])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      {/* Botão fechar */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-lg text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Fechar"
      >
        ✕
      </button>

      <div className="flex flex-col items-center gap-4">
        {/* ── Card de exportação ── */}
        <div
          ref={cardRef}
          className="relative w-[360px] overflow-hidden rounded-3xl sm:w-[400px]"
          style={{
            background: 'linear-gradient(145deg, #0a1628 0%, #132743 40%, #1a3a5c 70%, #0f2035 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Glow de fundo */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(34,197,94,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59,130,246,0.12) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />

          {/* Grid pattern decorativo */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
            }}
          />

          {/* Conteúdo */}
          <div className="relative flex flex-col p-7">
            {/* Topo: Overall badge + Peladas */}
            <div className="flex items-start justify-between">
              <div
                className="flex flex-col items-center rounded-2xl px-4 py-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.25) 0%, rgba(16,185,129,0.15) 100%)',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(110,231,183,0.7)' }}>
                  Overall
                </span>
                <span className="text-3xl font-black leading-none" style={{ color: '#6ee7b7' }}>
                  {avg.toFixed(1)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Peladas jogadas</div>
                <div className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>{participationCount}</div>
              </div>
            </div>

            {/* Centro: Avatar + Nome + Estrelas */}
            <div className="mt-5 flex flex-col items-center gap-2.5">
              {/* Avatar */}
              <div
                className="size-36 overflow-hidden rounded-2xl"
                style={{
                  border: '3px solid rgba(34,197,94,0.4)',
                  boxShadow: '0 0 30px rgba(34,197,94,0.2), 0 20px 60px rgba(0,0,0,0.4)',
                }}
              >
                {player.avatarUrl ? (
                  <img
                    src={player.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center text-5xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                      color: '#ffffff',
                    }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Nome */}
              <h3 className="mt-1 text-center text-2xl font-black tracking-tight" style={{ color: '#ffffff' }}>
                {player.name}
              </h3>

              {/* Estrelas */}
              <div className="text-lg tracking-wider" style={{ color: '#F3BC12' }}>
                {starsString(player.stars)}
              </div>
            </div>

            {/* Atributos */}
            <div className="mt-5 space-y-2.5">
              {ATTRS.map(({ key, label }) => {
                const val = player[key]
                const pct = ((val - 1) / 4) * 100
                const color = attrColor(val)
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-8 text-right text-[11px] font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {label}
                    </span>
                    <div
                      className="relative h-3 flex-1 overflow-hidden rounded-full"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}aa, ${color})`,
                          boxShadow: `0 0 8px ${color}55`,
                        }}
                      />
                    </div>
                    <span className="w-5 text-right text-sm font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {val}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Rodapé: logo SVG */}
            <div className="mt-5 flex items-center justify-center">
              <Logo
                height={18}
                primaryColor="#94a3b8"
                accentColor="#F3BC12"
                animate={false}
              />
            </div>
          </div>
        </div>

        {/* Botão flutuante de exportar */}
        <Button
          variant="primary"
          loading={exporting}
          onClick={doExport}
          className="shadow-xl"
        >
          📤 Exportar Card
        </Button>
      </div>
    </div>
  )
}
