import 'dotenv/config'
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
