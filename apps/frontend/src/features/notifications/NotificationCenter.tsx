import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '@/domain/types'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notifications.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import { cn } from '@/lib/utils'

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function getNotificationIcon(type: string): string {
  if (type === 'GROUP_JOIN_REQUEST') return '🙋'
  if (type === 'GROUP_INVITATION') return '✉️'
  return '🔔'
}

export function NotificationCenter() {
  const getToken = useAuthToken()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    const token = await getToken()
    if (!token) return
    setLoading(true)
    try {
      const data = await getNotifications(token)
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  // Poll every 30s for new notifications
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleOpen = async () => {
    setOpen((v) => !v)
    if (!open) {
      await fetchNotifications()
    }
  }

  const handleMarkRead = async (notif: Notification) => {
    if (!notif.read) {
      const token = await getToken()
      if (!token) return
      await markNotificationRead(notif.id, token).catch(() => {})
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }
    // Navigate to the group if relevant
    if (notif.group) {
      navigate(`/groups/${notif.groupId}`)
      setOpen(false)
    }
  }

  const handleMarkAllRead = async () => {
    const token = await getToken()
    if (!token) return
    await markAllNotificationsRead(token).catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notificações"
        className={cn(
          'relative flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors',
          'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
          open && 'bg-[var(--surface-tertiary)] text-[var(--text-primary)]'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Notificações
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-[var(--color-brand-100)] px-1.5 py-0.5 text-xs font-bold text-[var(--color-brand-700)]">
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="cursor-pointer text-xs text-[var(--color-brand-600)] hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <span className="size-5 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="mb-2 text-3xl">🔔</span>
                <p className="text-sm text-[var(--text-tertiary)]">Nenhuma notificação.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleMarkRead(notif)}
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-3 border-b border-[var(--border-primary)] px-4 py-3 text-left transition-colors last:border-0',
                    notif.read
                      ? 'hover:bg-[var(--surface-secondary)]'
                      : 'bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)]'
                  )}
                >
                  <span className="mt-0.5 shrink-0 text-lg">
                    {getNotificationIcon(notif.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        notif.read ? 'text-[var(--text-secondary)]' : 'font-medium text-[var(--text-primary)]'
                      )}
                    >
                      {notif.message}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-brand-600)]" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
