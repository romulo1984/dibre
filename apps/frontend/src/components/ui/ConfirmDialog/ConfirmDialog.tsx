import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button/Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/40'
                : 'bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] focus:ring-2 focus:ring-[var(--color-brand-500)]/40'
            }`}
          >
            {loading && (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
