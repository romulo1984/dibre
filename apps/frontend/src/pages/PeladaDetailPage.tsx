import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '../hooks/useAuthToken.js'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'
import { Button } from '../components/ui/Button/Button.js'
import { Card } from '../components/ui/Card/Card.js'
import { TeamStatsCard } from '../features/games/TeamStatsCard.js'
import {
  getGame,
  getGamePlayers,
  getGameTeams,
  setGamePlayers,
  runDraw,
} from '../services/games.service.js'
import { listPlayers } from '../services/players.service.js'
import type { Game, TeamAssignment, Player } from '../domain/types.js'

export function PeladaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const getToken = useAuthToken()
  const [game, setGame] = useState<Game | null>(null)
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [teams, setTeams] = useState<TeamAssignment[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [drawLoading, setDrawLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([getGame(id), getGamePlayers(id), getGameTeams(id), listPlayers()])
      .then(([g, playersRes, teamsRes, players]) => {
        if (!cancelled) {
          setGame(g)
          setPlayerIds(playersRes.playerIds)
          setTeams(teamsRes.teams)
          setAllPlayers(players)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const playerNames = new Map(allPlayers.map((p) => [p.id, p.name]))

  const handleSetPlayers = async (selectedIds: string[]) => {
    if (!id || !isSignedIn) return
    const token = await getToken()
    if (!token) return
    try {
      await setGamePlayers(id, selectedIds, token)
      setPlayerIds(selectedIds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  const handleRunDraw = async () => {
    if (!id || !isSignedIn) return
    const token = await getToken()
    if (!token) return
    setDrawLoading(true)
    try {
      const res = await runDraw(id, token)
      setTeams(res.teams)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no sorteio')
    } finally {
      setDrawLoading(false)
    }
  }

  if (!id) return null
  if (loading) return <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
  if (error && !game) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error}
        <Button variant="outline" className="mt-4" onClick={() => navigate('/peladas')}>
          Voltar
        </Button>
      </div>
    )
  }
  if (!game) return null

  return (
    <div className="space-y-8">
      <PageHeader.Root>
        <div>
          <PageHeader.Title>{game.name}</PageHeader.Title>
          <PageHeader.Description>
            {game.numberOfTeams} time(s) · {playerIds.length} jogador(es) selecionado(s)
          </PageHeader.Description>
        </div>
        {isSignedIn && (
          <PageHeader.Actions>
            <Button
              variant="primary"
              loading={drawLoading}
              disabled={playerIds.length < game.numberOfTeams}
              onClick={handleRunDraw}
            >
              Executar sorteio
            </Button>
          </PageHeader.Actions>
        )}
      </PageHeader.Root>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isSignedIn && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Selecionar jogadores</Card.Title>
          </Card.Header>
          <Card.Content>
            <PeladaPlayerSelect
              allPlayers={allPlayers}
              selectedIds={playerIds}
              onChange={handleSetPlayers}
            />
          </Card.Content>
        </Card.Root>
      )}

      {!isSignedIn && playerIds.length > 0 && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Jogadores nesta pelada</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul className="list-inside list-disc">
              {playerIds.map((pid) => (
                <li key={pid}>{playerNames.get(pid) ?? pid}</li>
              ))}
            </ul>
          </Card.Content>
        </Card.Root>
      )}

      {teams.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Times e estatísticas
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamStatsCard key={team.teamName} team={team} playerNames={playerNames} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PeladaPlayerSelect({
  allPlayers,
  selectedIds,
  onChange,
}: {
  allPlayers: Player[]
  selectedIds: string[]
  onChange: (ids: string[]) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const toggle = (playerId: string) => {
    const next = selectedIds.includes(playerId)
      ? selectedIds.filter((id) => id !== playerId)
      : [...selectedIds, playerId]
    setSaving(true)
    onChange(next).finally(() => setSaving(false))
  }
  return (
    <div className="flex flex-wrap gap-2">
      {allPlayers.map((p) => (
        <label
          key={p.id}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(p.id)}
            onChange={() => toggle(p.id)}
            disabled={saving}
            className="rounded"
          />
          <span className="text-sm">{p.name}</span>
        </label>
      ))}
      {allPlayers.length === 0 && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Nenhum jogador cadastrado.{' '}
          <Link to="/players/new" className="underline">
            Cadastre jogadores
          </Link>{' '}
          primeiro.
        </p>
      )}
    </div>
  )
}
