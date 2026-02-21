import { VEST_COLORS, getVestColor } from '@/domain/vestColors'
import { cn } from '@/lib/utils'

interface TeamColorPickerProps {
  numberOfTeams: number
  teamColors: Record<string, string>
  onChange: (colors: Record<string, string>) => void
}

export function TeamColorPicker({ numberOfTeams, teamColors, onChange }: TeamColorPickerProps) {
  const selectedValues = Object.values(teamColors)

  function handleSelect(teamOrder: number, colorKey: string | null) {
    const next = { ...teamColors }
    if (colorKey === null) {
      delete next[String(teamOrder)]
    } else {
      next[String(teamOrder)] = colorKey
    }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--text-secondary)]">Cor do colete por time</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: numberOfTeams }, (_, i) => i + 1).map((order) => {
          const currentColor = teamColors[String(order)]
          const vestColor = currentColor ? getVestColor(currentColor) : null

          return (
            <div
              key={order}
              className="rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                {vestColor ? (
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                    style={{ backgroundColor: vestColor.hex, color: vestColor.textHex }}
                  >
                    {order}
                  </span>
                ) : (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-tertiary)] text-[10px] font-bold text-[var(--text-tertiary)]">
                    {order}
                  </span>
                )}
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Time {order}
                </span>
                {vestColor && (
                  <span className="ml-auto text-xs text-[var(--text-tertiary)]">
                    {vestColor.label}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelect(order, null)}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-md border text-[10px] transition-all',
                    !currentColor
                      ? 'border-[var(--color-brand-500)] ring-2 ring-[var(--color-brand-500)]/30'
                      : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]',
                  )}
                  title="Sem cor"
                >
                  &ndash;
                </button>
                {VEST_COLORS.map((color) => {
                  const isSelected = currentColor === color.key
                  const isUsedByOther =
                    !isSelected && selectedValues.includes(color.key)

                  return (
                    <button
                      key={color.key}
                      type="button"
                      disabled={isUsedByOther}
                      onClick={() => handleSelect(order, color.key)}
                      className={cn(
                        'size-7 rounded-md border transition-all',
                        isSelected
                          ? 'ring-2 ring-[var(--color-brand-500)]/30 border-[var(--color-brand-500)] scale-110'
                          : 'border-transparent hover:scale-105',
                        isUsedByOther && 'opacity-25 cursor-not-allowed',
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={isUsedByOther ? `${color.label} (usado)` : color.label}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[var(--text-tertiary)]">
        Opcional. Cada time pode ter uma cor diferente.
      </p>
    </div>
  )
}
