import type { PlayerEntity } from '../domain/player.js'
import { STAR_MIN, STAR_MAX, validateAttributes } from '../domain/player.js'
import * as gameRepo from '../repositories/game.repository.js'
import * as playerRepo from '../repositories/player.repository.js'
import * as groupRepo from '../repositories/group.repository.js'
import * as groupPlayerRepo from '../repositories/group-player.repository.js'

export interface PlayerProfileGame {
  id: string
  name: string
  createdAt: Date
  deletedAt: Date | null
}

export interface PlayerProfileTeammate {
  player: PlayerEntity
  timesTogether: number
}

export async function listPlayers(ownerId: string): Promise<PlayerEntity[]> {
  return playerRepo.findAllPlayersByOwner(ownerId)
}

export async function getPlayerById(id: string, ownerId: string): Promise<PlayerEntity | null> {
  return playerRepo.findPlayerByIdForOwner(id, ownerId)
}

export async function getPlayerWithParticipationCount(
  id: string,
  ownerId: string
): Promise<{ player: PlayerEntity; participationCount: number } | null> {
  const player = await playerRepo.findPlayerByIdForOwner(id, ownerId)
  if (!player) return null
  const participationCount = await playerRepo.countParticipations(id)
  return { player, participationCount }
}

/** Perfil completo: jogador, contagem de participações, peladas e top 5 parceiros (mesmo time). */
export async function getPlayerProfile(
  id: string,
  viewerId: string
): Promise<{
  player: PlayerEntity
  participationCount: number
  games: PlayerProfileGame[]
  teammates: PlayerProfileTeammate[]
  createdByName: string | null
  isOwner: boolean
} | null> {
  // Try owner access first; fall back to group member access
  let player = await playerRepo.findPlayerByIdForOwner(id, viewerId)
  const isOwner = !!player
  if (!player) {
    const raw = await playerRepo.findPlayerById(id)
    if (!raw || raw.deletedAt) return null
    if (!raw.createdById) return null
    const canView = await groupRepo.isGroupMemberOfOwner(viewerId, raw.createdById)
    if (!canView) return null
    player = raw
  }

  const participationCount = await playerRepo.countParticipations(id)
  const playerOwnerId = player.createdById ?? viewerId
  const games = await playerRepo.findParticipatedGames(id, playerOwnerId)

  const countByPlayerId = new Map<string, number>()
  for (const g of games) {
    const teams = await gameRepo.getTeamsByGameId(g.id)
    for (const team of teams) {
      if (!team.playerIds.includes(id)) continue
      for (const otherId of team.playerIds) {
        if (otherId === id) continue
        countByPlayerId.set(otherId, (countByPlayerId.get(otherId) ?? 0) + 1)
      }
    }
  }
  const topIds = Array.from(countByPlayerId.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([playerId]) => playerId)
  const teammatePlayers = await playerRepo.findPlayersByIds(topIds)
  const teammates: PlayerProfileTeammate[] = topIds
    .map((playerId) => {
      const player = teammatePlayers.find((p) => p.id === playerId)
      const timesTogether = countByPlayerId.get(playerId) ?? 0
      return player ? { player, timesTogether } : null
    })
    .filter((t): t is PlayerProfileTeammate => t != null)

  let createdByName: string | null = null
  if (!isOwner && player.createdById) {
    const creator = await groupRepo.findUserById(player.createdById)
    createdByName = creator?.name ?? creator?.email ?? null
  }

  return {
    player,
    participationCount,
    games,
    teammates,
    createdByName,
    isOwner,
  }
}

export async function createPlayer(
  data: {
    name: string
    avatarUrl?: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  },
  ownerId: string
): Promise<{ error?: string; player?: PlayerEntity }> {
  if (!data.name?.trim()) return { error: 'Name is required' }
  const attrs = {
    stars: data.stars,
    pass: data.pass,
    shot: data.shot,
    defense: data.defense,
    energy: data.energy,
    speed: data.speed,
  }
  if (!validateAttributes(attrs)) {
    return { error: `All attributes must be between ${STAR_MIN} and ${STAR_MAX}` }
  }
  const player = await playerRepo.createPlayer({
    name: data.name.trim(),
    avatarUrl: data.avatarUrl ?? null,
    createdById: ownerId,
    ...attrs,
  })

  await groupPlayerRepo.addNewPlayerToOwnerGroups(player.id, ownerId)

  return { player }
}

export async function updatePlayer(
  id: string,
  data: Partial<{
    name: string
    avatarUrl: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  }>,
  ownerId: string
): Promise<{ error?: string; player?: PlayerEntity }> {
  const existing = await playerRepo.findPlayerByIdForOwner(id, ownerId)
  if (!existing) return { error: 'Player not found' }
  if (data.name !== undefined && !data.name?.trim()) return { error: 'Name cannot be empty' }
  if (!validateAttributes(data)) {
    return { error: `All attributes must be between ${STAR_MIN} and ${STAR_MAX}` }
  }
  const updated = await playerRepo.updatePlayer(id, data)
  return { player: updated ?? existing }
}

export async function deletePlayer(
  id: string,
  ownerId: string
): Promise<{ error?: string; ok?: boolean }> {
  const existing = await playerRepo.findPlayerByIdForOwner(id, ownerId)
  if (!existing) return { error: 'Player not found' }
  const ok = await playerRepo.deletePlayer(id)
  if (!ok) return { error: 'Player not found' }
  return { ok: true }
}

/* ── Export / Import ── */

/**
 * Formato de linha: Nome;estrelas,passe,chute,defesa,energia,velocidade[,base64]
 * Retrocompatível: se não tiver a 7ª coluna (avatar), importa sem imagem.
 */

export async function exportPlayers(
  ownerId: string,
  includeAvatar: boolean,
  playerIds?: string[]
): Promise<{ text: string; exported: Array<{ name: string; stars: number; pass: number; shot: number; defense: number; energy: number; speed: number }> }> {
  let players = await playerRepo.findAllPlayersByOwner(ownerId)
  // Excluir jogadores deletados da exportação
  players = players.filter((p) => !p.deletedAt)
  if (playerIds && playerIds.length > 0) {
    const idSet = new Set(playerIds)
    players = players.filter((p) => idSet.has(p.id))
  }
  const exported = players.map((p) => ({
    name: p.name,
    stars: p.stars,
    pass: p.pass,
    shot: p.shot,
    defense: p.defense,
    energy: p.energy,
    speed: p.speed,
  }))
  const lines = players.map((p) => {
    const attrs = [p.stars, p.pass, p.shot, p.defense, p.energy, p.speed].join(',')
    if (includeAvatar && p.avatarUrl) {
      return `${p.name};${attrs},${p.avatarUrl}`
    }
    return `${p.name};${attrs}`
  })
  return { text: lines.join('\n'), exported }
}

export interface ImportedPlayer {
  name: string
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  players: ImportedPlayer[]
}

export async function importPlayers(
  text: string,
  ownerId: string
): Promise<ImportResult> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const result: ImportResult = { imported: 0, skipped: 0, errors: [], players: [] }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    const sepIdx = line.indexOf(';')
    if (sepIdx === -1) {
      result.errors.push(`Linha ${lineNum}: formato inválido (faltando ";")`)
      result.skipped++
      continue
    }

    const name = line.substring(0, sepIdx).trim()
    const rest = line.substring(sepIdx + 1)

    if (!name) {
      result.errors.push(`Linha ${lineNum}: nome vazio`)
      result.skipped++
      continue
    }

    // Extrair avatar base64 se presente (começa com "data:")
    let avatarUrl: string | null = null
    let attrsPart = rest

    const dataIdx = rest.indexOf(',data:')
    if (dataIdx !== -1) {
      attrsPart = rest.substring(0, dataIdx)
      avatarUrl = rest.substring(dataIdx + 1)
    }

    const parts = attrsPart.split(',').map((s) => parseInt(s.trim(), 10))
    if (parts.length < 6 || parts.some(isNaN)) {
      result.errors.push(`Linha ${lineNum}: atributos inválidos (esperado 6 números)`)
      result.skipped++
      continue
    }

    const [stars, pass, shot, defense, energy, speed] = parts
    const attrs = { stars, pass, shot, defense, energy, speed }
    if (!validateAttributes(attrs)) {
      result.errors.push(`Linha ${lineNum}: atributos fora do intervalo 1-5`)
      result.skipped++
      continue
    }

    try {
      const imported = await playerRepo.createPlayer({
        name,
        avatarUrl,
        createdById: ownerId,
        ...attrs,
      })
      await groupPlayerRepo.addNewPlayerToOwnerGroups(imported.id, ownerId)
      result.imported++
      result.players.push({ name, ...attrs })
    } catch (err) {
      result.errors.push(`Linha ${lineNum}: erro ao salvar "${name}"`)
      result.skipped++
    }
  }

  return result
}
