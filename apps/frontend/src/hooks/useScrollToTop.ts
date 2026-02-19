import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll suave para o topo sempre que a rota mudar.
 * Usar dentro de um componente que está dentro do <BrowserRouter>.
 */
export function useScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
}
