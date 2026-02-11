import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local'), override: true })

import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.use(cors({ origin: process.env.FRONTEND_URL ?? true, credentials: true }))
app.use(express.json())
app.use('/api', routes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dibre-api' })
})

app.listen(PORT, () => {
  console.log(`dib.re API listening on http://localhost:${PORT}`)
})
