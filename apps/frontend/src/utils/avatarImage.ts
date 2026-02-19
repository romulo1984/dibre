/**
 * Comprime e recorta uma imagem para avatar (quadrado, tamanho controlado).
 * Retorna data URL em JPEG para armazenar como base64 sem ficar pesado.
 */

const DEFAULT_SIZE = 256
const MAX_DATA_URL_LENGTH = 480_000 // ~360KB; backend aceita até 500k

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível carregar a imagem'))
    }
    img.src = url
  })
}

const ASPECT_WIDTH = 3
const ASPECT_HEIGHT = 4

/**
 * Recorta o centro da imagem na proporção 3×4 e redimensiona.
 * Desenha em um canvas e exporta como JPEG com a qualidade dada.
 */
function drawCenter34(
  img: HTMLImageElement,
  width: number,
  quality: number
): string {
  const height = Math.round((width * ASPECT_HEIGHT) / ASPECT_WIDTH)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2d não disponível')

  const imgRatio = img.width / img.height
  const targetRatio = ASPECT_WIDTH / ASPECT_HEIGHT
  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height
  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / targetRatio
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Comprime o arquivo de imagem para um data URL (base64) em tamanho adequado.
 * - Recorte: centro na proporção 3×4 (retrato).
 * - Redimensiona para no máximo `maxSize` px de largura.
 * - JPEG com qualidade reduzida até caber em ~360KB.
 */
export async function compressImageToBase64(
  file: File,
  maxSize: number = DEFAULT_SIZE,
  maxDataUrlLength: number = MAX_DATA_URL_LENGTH
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo deve ser uma imagem (PNG, JPEG, etc.)')
  }

  const img = await loadImage(file)
  const qualities = [0.8, 0.75, 0.65, 0.55, 0.45]

  for (const q of qualities) {
    const dataUrl = drawCenter34(img, maxSize, q)
    if (dataUrl.length <= maxDataUrlLength) return dataUrl
  }

  const smaller = Math.floor(maxSize * 0.75)
  for (const q of [0.5, 0.4]) {
    const dataUrl = drawCenter34(img, smaller, q)
    if (dataUrl.length <= maxDataUrlLength) return dataUrl
  }

  return drawCenter34(img, smaller, 0.35)
}
