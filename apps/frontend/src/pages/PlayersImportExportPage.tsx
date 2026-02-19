import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { Stars } from '@/components/ui/Stars/Stars'
import { BlurFade } from '@/components/magicui/blur-fade'
import { PlayerAvatar } from '@/features/players/PlayerAvatar'
import { useAuthToken } from '@/hooks/useAuthToken'
import { listPlayers } from '@/services/players.service'
import {
  exportPlayers,
  importPlayers,
  type ExportedPlayer,
  type ImportResult,
} from '@/services/players.service'
import type { Player } from '@/domain/types'
import { cn } from '@/lib/utils'

type Tab = 'export' | 'import'

export function PlayersImportExportPage() {
  const getToken = useAuthToken()
  const [tab, setTab] = useState<Tab>('export')
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [playersLoading, setPlayersLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getToken()
      .then((token) => {
        if (cancelled || !token) return
        return listPlayers(token)
      })
      .then((data) => {
        if (!cancelled && data) setAllPlayers(data)
      })
      .finally(() => {
        if (!cancelled) setPlayersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [getToken])

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Importar / Exportar jogadores</PageHeader.Title>
            <PageHeader.Description>
              Exporte seus jogadores em texto ou importe de uma lista.
            </PageHeader.Description>
          </div>
          <PageHeader.Actions>
            <Link to="/players">
              <Button variant="outline">Voltar</Button>
            </Link>
          </PageHeader.Actions>
        </PageHeader.Root>
      </BlurFade>

      {/* Tabs */}
      <BlurFade delay={0.15}>
        <div className="flex gap-1 rounded-lg border border-[var(--border-primary)] p-1 sm:w-fit">
          {([
            { key: 'export' as const, label: '📤 Exportar' },
            { key: 'import' as const, label: '📥 Importar' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none',
                tab === key
                  ? 'bg-[var(--color-brand-500)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        {tab === 'export' ? (
          <ExportSection getToken={getToken} allPlayers={allPlayers.filter((p) => !p.deletedAt)} playersLoading={playersLoading} />
        ) : (
          <ImportSection getToken={getToken} />
        )}
      </BlurFade>
    </div>
  )
}

/* ── Compact player row for result lists ── */

function MiniPlayerRow({ name, stars, pass, shot, defense, energy, speed }: ExportedPlayer) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--surface-tertiary)]">
      <PlayerAvatar player={{ name }} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
        {name}
      </span>
      <Stars value={stars} size="sm" />
      <div className="hidden items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)] sm:flex">
        {[
          { l: 'PAS', v: pass },
          { l: 'CHU', v: shot },
          { l: 'DEF', v: defense },
          { l: 'ENE', v: energy },
          { l: 'VEL', v: speed },
        ].map((a) => (
          <span key={a.l} className="rounded bg-[var(--surface-tertiary)] px-1.5 py-0.5">
            {a.l} {a.v}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Player selection bottom sheet / modal ── */

function PlayerSelectModal({
  players,
  selectedIds,
  onConfirm,
  onClose,
}: {
  players: Player[]
  selectedIds: string[]
  onConfirm: (ids: string[]) => void
  onClose: () => void
}) {
  const [ids, setIds] = useState<string[]>(selectedIds)
  const allSelected = players.length > 0 && ids.length === players.length

  const toggle = (id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Panel */}
      <div
        className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] shadow-2xl sm:max-w-lg sm:rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Selecionar jogadores</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{ids.length} de {players.length} selecionado(s)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>

        {/* Select all */}
        <div className="border-b border-[var(--border-primary)] px-5 py-2">
          <button
            type="button"
            onClick={() => setIds(allSelected ? [] : players.map((p) => p.id))}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              allSelected
                ? 'border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
                : 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]',
            )}
          >
            {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
        </div>

        {/* List */}
        <ul className="flex-1 overflow-y-auto px-3 py-2">
          {players.map((p) => {
            const checked = ids.includes(p.id)
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                    checked
                      ? 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]'
                      : 'hover:bg-[var(--surface-tertiary)]',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded border text-xs font-medium',
                      checked
                        ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white'
                        : 'border-[var(--border-primary)] bg-[var(--surface-primary)]',
                    )}
                  >
                    {checked ? '✓' : ''}
                  </span>
                  <PlayerAvatar player={p} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
                    {p.name}
                  </span>
                  <Stars value={p.stars} size="sm" />
                </button>
              </li>
            )
          })}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-primary)] px-5 py-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={() => onConfirm(ids)} disabled={ids.length === 0}>
            Exportar {ids.length} jogador(es)
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── Export Section ── */

type ExportScope = 'all' | 'selected'

function ExportSection({
  getToken,
  allPlayers,
  playersLoading,
}: {
  getToken: () => Promise<string | null>
  allPlayers: Player[]
  playersLoading: boolean
}) {
  const [scope, setScope] = useState<ExportScope | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showSelectModal, setShowSelectModal] = useState(false)
  const [data, setData] = useState('')
  const [exportedPlayers, setExportedPlayers] = useState<ExportedPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const idsForExport = scope === 'selected' ? selectedIds : undefined
  const selectionCount = scope === 'all' ? allPlayers.length : selectedIds.length
  const canExport = scope !== null && selectionCount > 0

  const handleExport = async (includeAvatar: boolean) => {
    setError(null)
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      const result = await exportPlayers(token, includeAvatar, idsForExport)
      setData(result.data)
      setExportedPlayers(result.exported)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleScopeChange = (s: ExportScope) => {
    setScope(s)
    setData('')
    setExportedPlayers([])
    if (s === 'selected') {
      setShowSelectModal(true)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectConfirm = (ids: string[]) => {
    setSelectedIds(ids)
    setShowSelectModal(false)
  }

  const lineCount = data ? data.split('\n').length : 0

  // Nomes dos selecionados para exibir resumo
  const selectedNames = scope === 'selected'
    ? allPlayers.filter((p) => selectedIds.includes(p.id)).map((p) => p.name)
    : []

  return (
    <>
      <Card.Root>
        <Card.Header>
          <Card.Title>Exportar jogadores</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div className="text-sm text-[var(--text-tertiary)]">
            <p>Gera uma lista em texto no formato:</p>
            <div className="mt-1 overflow-x-auto rounded-lg bg-[var(--surface-tertiary)] px-3 py-2">
              <code className="whitespace-pre-wrap break-all text-xs font-mono text-[var(--text-secondary)]">
                Nome;estrelas,passe,chute,defesa,energia,velocidade
              </code>
            </div>
          </div>

          {/* Etapa 1: Escolher escopo */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              1. Quem exportar?
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleScopeChange('all')}
                disabled={playersLoading || allPlayers.length === 0}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  scope === 'all'
                    ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]'
                    : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]',
                  (playersLoading || allPlayers.length === 0) && 'opacity-50',
                )}
              >
                👥 Todos ({allPlayers.length})
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('selected')}
                disabled={playersLoading || allPlayers.length === 0}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  scope === 'selected'
                    ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]'
                    : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]',
                  (playersLoading || allPlayers.length === 0) && 'opacity-50',
                )}
              >
                ✅ Selecionar jogadores
              </button>
            </div>

            {/* Resumo da seleção */}
            {scope === 'selected' && selectedIds.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--text-tertiary)]">
                  {selectedIds.length} selecionado(s):
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedNames.slice(0, 5).map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-[var(--color-brand-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                    >
                      {name}
                    </span>
                  ))}
                  {selectedNames.length > 5 && (
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      +{selectedNames.length - 5}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSelectModal(true)}
                  className="text-xs font-medium text-[var(--color-brand-600)] underline hover:no-underline"
                >
                  Alterar
                </button>
              </div>
            )}
            {scope === 'selected' && selectedIds.length === 0 && (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Nenhum jogador selecionado.{' '}
                <button
                  type="button"
                  onClick={() => setShowSelectModal(true)}
                  className="font-medium text-[var(--color-brand-600)] underline hover:no-underline"
                >
                  Selecionar
                </button>
              </p>
            )}
          </div>

          {/* Etapa 2: Exportar */}
          {canExport && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                2. Exportar
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExport(false)}
                  disabled={loading}
                >
                  {loading ? 'Exportando...' : '📤 Exportar sem imagem'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExport(true)}
                  disabled={loading}
                >
                  {loading ? 'Exportando...' : '📤 Exportar com imagem'}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <span>⚠️</span> {error}
            </div>
          )}

          {data && (
            <div className="space-y-3">
              {/* Summary with player list */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-300">
                  ✅ {lineCount} jogador(es) exportado(s)
                </p>
                <div className="max-h-[200px] overflow-y-auto">
                  {exportedPlayers.map((p, i) => (
                    <MiniPlayerRow key={i} {...p} />
                  ))}
                </div>
              </div>

              {/* Textarea + copy */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-tertiary)]">
                  Texto exportado
                </span>
                <div className="relative">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? '✅ Copiado!' : '📋 Copiar'}
                  </Button>
                  {copied && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--surface-inverse)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)] shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-200">
                      Copiado!
                    </span>
                  )}
                </div>
              </div>
              <textarea
                readOnly
                value={data}
                rows={Math.min(lineCount + 1, 15)}
                className="w-full resize-y rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-4 py-3 font-mono text-xs leading-relaxed text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          )}
        </Card.Content>
      </Card.Root>

      {showSelectModal && (
        <PlayerSelectModal
          players={allPlayers}
          selectedIds={selectedIds}
          onConfirm={handleSelectConfirm}
          onClose={() => setShowSelectModal(false)}
        />
      )}
    </>
  )
}

/* ── Import Section ── */

function ImportSection({ getToken }: { getToken: () => Promise<string | null> }) {
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleImport = async () => {
    if (!data.trim()) {
      setError('Cole o texto com os jogadores antes de importar.')
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await importPlayers(data, token)
      setResult(res)
      if (res.imported > 0 && res.skipped === 0) {
        setData('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar')
    } finally {
      setLoading(false)
    }
  }

  const lineCount = data ? data.split('\n').filter((l) => l.trim()).length : 0

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Importar jogadores</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="text-sm text-[var(--text-tertiary)]">
          <p>Cole abaixo a lista de jogadores no formato:</p>
          <div className="mt-1 overflow-x-auto rounded-lg bg-[var(--surface-tertiary)] px-3 py-2">
            <code className="whitespace-pre-wrap break-all text-xs font-mono text-[var(--text-secondary)]">
              Nome;estrelas,passe,chute,defesa,energia,velocidade[,base64]
            </code>
          </div>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          A parte da imagem (base64) é opcional. Cada jogador em uma linha.
        </p>

        <textarea
          value={data}
          onChange={(e) => {
            setData(e.target.value)
            setResult(null)
            setError(null)
          }}
          rows={10}
          placeholder={`João Silva;4,3,5,3,4,2\nMaria Costa;3,4,3,5,2,4`}
          className="w-full resize-y rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-3 font-mono text-xs leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:outline-none"
        />

        {lineCount > 0 && (
          <p className="text-xs text-[var(--text-tertiary)]">
            {lineCount} linha(s) detectada(s)
          </p>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={handleImport}
          disabled={loading || !data.trim()}
        >
          {loading ? 'Importando...' : '📥 Importar jogadores'}
        </Button>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <span>⚠️</span> {error}
          </div>
        )}

        {result && (
          <div
            className={cn(
              'space-y-3 rounded-xl border p-4 text-sm',
              result.skipped === 0
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
            )}
          >
            <p className="font-medium">
              ✅ {result.imported} importado(s)
              {result.skipped > 0 && ` · ⚠️ ${result.skipped} ignorado(s)`}
            </p>

            {/* Lista de jogadores importados */}
            {result.players.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto">
                {result.players.map((p, i) => (
                  <MiniPlayerRow key={i} {...p} />
                ))}
              </div>
            )}

            {result.errors.length > 0 && (
              <ul className="list-inside list-disc space-y-0.5 text-xs">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card.Content>
    </Card.Root>
  )
}
