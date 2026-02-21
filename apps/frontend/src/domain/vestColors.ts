export interface VestColor {
  key: string
  label: string
  hex: string
  textHex: string
}

export const VEST_COLORS: VestColor[] = [
  { key: 'red', label: 'Vermelho', hex: '#EF4444', textHex: '#FFFFFF' },
  { key: 'blue', label: 'Azul', hex: '#3B82F6', textHex: '#FFFFFF' },
  { key: 'green', label: 'Verde', hex: '#22C55E', textHex: '#FFFFFF' },
  { key: 'yellow', label: 'Amarelo', hex: '#EAB308', textHex: '#1A1A1A' },
  { key: 'orange', label: 'Laranja', hex: '#F97316', textHex: '#FFFFFF' },
  { key: 'purple', label: 'Roxo', hex: '#A855F7', textHex: '#FFFFFF' },
  { key: 'pink', label: 'Rosa', hex: '#EC4899', textHex: '#FFFFFF' },
  { key: 'cyan', label: 'Ciano', hex: '#06B6D4', textHex: '#FFFFFF' },
  { key: 'white', label: 'Branco', hex: '#F5F5F5', textHex: '#1A1A1A' },
  { key: 'black', label: 'Preto', hex: '#1A1A1A', textHex: '#FFFFFF' },
  { key: 'gray', label: 'Cinza', hex: '#6B7280', textHex: '#FFFFFF' },
  { key: 'lime', label: 'Lima', hex: '#84CC16', textHex: '#1A1A1A' },
]

export function getVestColor(key: string): VestColor | undefined {
  return VEST_COLORS.find((c) => c.key === key)
}
