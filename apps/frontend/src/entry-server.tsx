/**
 * Entry-point para renderização SSR / pre-rendering.
 *
 * Usado pelo script de prerender (prerender.js) durante o build
 * para gerar HTML estático das rotas definidas em `routesToPrerender`.
 *
 * O Clerk é substituído automaticamente pelo mock (via alias no vite.config.ts),
 * então os componentes SignedIn/SignedOut/etc. funcionam sem provider.
 * O React Router usa StaticRouter para resolver a URL no servidor.
 */

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes } from './App'

/**
 * Renderiza a aplicação para a URL fornecida e retorna o HTML como string.
 */
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
  )
}

/**
 * Rotas que devem ser pre-renderizadas no build.
 * Adicione novas rotas aqui conforme necessário.
 */
export const routesToPrerender = ['/']
