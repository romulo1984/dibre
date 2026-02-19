import type { PlayerEntity } from '../domain/player.js'
import type { TeamAssignment } from '../domain/game.js'
import { averageAttributes } from '../domain/player.js'

const STAR_5 = 5
const STAR_1 = 1

/**
 * Balanced team draw with three phases:
 * 1. Distribute players with 5 stars evenly across teams (round-robin).
 * 2. Distribute players with 1 star evenly across teams (round-robin).
 * 3. Distribute the rest (2–4 stars) by technical attributes (assign to team with lowest attribute sum).
 */
export function drawBalancedTeams(
  players: PlayerEntity[],
  numberOfTeams: number
): TeamAssignment[] {
  if (numberOfTeams < 1 || players.length === 0) {
    return Array.from({ length: Math.max(1, numberOfTeams) }, (_, i) => ({
      teamName: `Time ${String.fromCharCode(65 + i)}`,
      order: i + 1,
      playerIds: [],
      playerIdsWith5Stars: [],
      playerIdsWith1Star: [],
      avgStars: 0,
      avgPass: 0,
      avgShot: 0,
      avgDefense: 0,
      avgEnergy: 0,
      avgSpeed: 0,
    }))
  }

  const teamNames = Array.from({ length: numberOfTeams }, (_, i) => ({
    name: `Time ${String.fromCharCode(65 + i)}`,
    order: i + 1,
  }))

  const emptyTeam = () => ({
    name: '',
    order: 0,
    playerIds: [] as string[],
    sumPass: 0,
    sumShot: 0,
    sumDefense: 0,
    sumEnergy: 0,
    sumSpeed: 0,
    count: 0,
  })

  const teams = teamNames.map((t) => ({
    ...emptyTeam(),
    name: t.name,
    order: t.order,
  }))

  const players5 = players.filter((p) => p.stars === STAR_5)
  const players1 = players.filter((p) => p.stars === STAR_1)
  const playersRest = players.filter((p) => p.stars !== STAR_5 && p.stars !== STAR_1)

  const addToTeam = (t: (typeof teams)[0], player: PlayerEntity) => {
    t.playerIds.push(player.id)
    t.count++
    t.sumPass += player.pass
    t.sumShot += player.shot
    t.sumDefense += player.defense
    t.sumEnergy += player.energy
    t.sumSpeed += player.speed
  }

  // Phase 1: distribute 5-star players round-robin (even count per team)
  players5.forEach((player, idx) => {
    const teamIdx = idx % numberOfTeams
    addToTeam(teams[teamIdx], player)
  })

  // Phase 2: distribute 1-star players round-robin
  players1.forEach((player, idx) => {
    const teamIdx = idx % numberOfTeams
    addToTeam(teams[teamIdx], player)
  })

  // Phase 3: distribute rest by attribute balance (assign to team with lowest attribute sum)
  const scoreRest = (p: PlayerEntity) =>
    p.pass + p.shot + p.defense + p.energy + p.speed
  const sortedRest = [...playersRest].sort((a, b) => scoreRest(b) - scoreRest(a))

  for (const player of sortedRest) {
    let bestIdx = 0
    let bestTotal = Infinity
    for (let i = 0; i < teams.length; i++) {
      const t = teams[i]
      const total = t.sumPass + t.sumShot + t.sumDefense + t.sumEnergy + t.sumSpeed
      if (total < bestTotal) {
        bestTotal = total
        bestIdx = i
      }
    }
    const t = teams[bestIdx]
    t.playerIds.push(player.id)
    t.count++
    t.sumPass += player.pass
    t.sumShot += player.shot
    t.sumDefense += player.defense
    t.sumEnergy += player.energy
    t.sumSpeed += player.speed
  }

  const playerStarsMap = new Map(players.map((p) => [p.id, p.stars]))

  return teams.map((t) => {
    const playerIdsWith5Stars = t.playerIds.filter((id) => playerStarsMap.get(id) === STAR_5)
    const playerIdsWith1Star = t.playerIds.filter((id) => playerStarsMap.get(id) === STAR_1)
    const count = t.count || 1
    return {
      teamName: t.name,
      order: t.order,
      playerIds: t.playerIds,
      playerIdsWith5Stars,
      playerIdsWith1Star,
      avgStars:
        (t.playerIds.reduce((sum, id) => sum + (playerStarsMap.get(id) ?? 0), 0) / count),
      avgPass: t.sumPass / count,
      avgShot: t.sumShot / count,
      avgDefense: t.sumDefense / count,
      avgEnergy: t.sumEnergy / count,
      avgSpeed: t.sumSpeed / count,
    }
  })
}
