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

/**
 * Recorta o centro quadrado da imagem e redimensiona.
 * Desenha em um canvas e exporta como JPEG com a qualidade dada.
 */
function drawCenterSquare(
  img: HTMLImageElement,
  size: number,
  quality: number
): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2d não disponível')

  const s = Math.min(img.width, img.height)
  const x = (img.width - s) / 2
  const y = (img.height - s) / 2
  ctx.drawImage(img, x, y, s, s, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Comprime o arquivo de imagem para um data URL (base64) em tamanho adequado.
 * - Recorte: centro quadrado.
 * - Redimensiona para no máximo `maxSize` px (lado).
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
    const dataUrl = drawCenterSquare(img, maxSize, q)
    if (dataUrl.length <= maxDataUrlLength) return dataUrl
  }

  // Última tentativa com tamanho menor
  const smaller = Math.floor(maxSize * 0.75)
  for (const q of [0.5, 0.4]) {
    const dataUrl = drawCenterSquare(img, smaller, q)
    if (dataUrl.length <= maxDataUrlLength) return dataUrl
  }

  return drawCenterSquare(img, smaller, 0.35)
}
