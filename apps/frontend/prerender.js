/**
 * Script de pre-rendering executado após o build.
 *
 * Fluxo:
 *   1. Carrega o módulo SSR compilado (dist-ssr/entry-server.js)
 *   2. Lê o template HTML gerado pelo Vite (dist/index.html)
 *   3. Salva o template original como dist/200.html (fallback SPA)
 *   4. Para cada rota em routesToPrerender, gera o HTML e salva em dist/
 *
 * O dist/200.html serve como fallback para rotas não pre-renderizadas.
 * Configure seu hosting (Netlify, Vercel, Nginx, etc.) para servir
 * 200.html quando o arquivo da rota não existir.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, 'dist')

async function prerender() {
  // 1. Importa o módulo SSR compilado
  const { render, routesToPrerender } = await import('./dist-ssr/entry-server.js')

  // 2. Lê o template HTML (saída do vite build)
  const template = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf-8')

  // 3. Salva o template original como fallback SPA (sem conteúdo pre-renderizado)
  const spaFallback = template.replace('<!--app-html-->', '')
  fs.writeFileSync(path.resolve(distDir, '200.html'), spaFallback)
  console.log('  ✓ dist/200.html (fallback SPA)')

  // 4. Pre-renderiza cada rota
  for (const url of routesToPrerender) {
    const appHtml = render(url)
    const html = template.replace('<!--app-html-->', appHtml)

    // Define o caminho do arquivo de saída
    const filePath =
      url === '/' ? path.resolve(distDir, 'index.html') : path.resolve(distDir, `${url.slice(1)}/index.html`)

    // Cria diretórios intermediários se necessário
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, html)

    console.log(`  ✓ ${path.relative(path.resolve(__dirname), filePath)}`)
  }

  console.log(`\n🎉 Pre-rendering concluído! ${routesToPrerender.length} rota(s) gerada(s).`)
}

prerender().catch((err) => {
  console.error('❌ Erro no pre-rendering:', err)
  process.exit(1)
})
