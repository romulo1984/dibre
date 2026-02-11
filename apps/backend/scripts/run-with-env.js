/**
 * Carrega .env e .env.local (este sobrescreve) e executa o comando passado.
 * Uso: node scripts/run-with-env.js prisma db push
 */
import dotenv from 'dotenv'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local'), override: true })

const [cmd, ...args] = process.argv.slice(2)
if (!cmd) {
  console.error('Uso: node scripts/run-with-env.js <comando> [args...]')
  process.exit(1)
}

const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
  cwd: root,
  env: { ...process.env },
})
child.on('exit', (code) => process.exit(code ?? 0))
