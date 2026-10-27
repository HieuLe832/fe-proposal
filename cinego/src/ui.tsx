import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ───────────── Button ───────────── */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantCls: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:brightness-110 active:brightness-90',
  secondary: 'bg-raised text-fg border border-line hover:brightness-110 active:brightness-95',
  ghost: 'bg-transparent text-fg hover:bg-raised',
  danger: 'bg-danger text-on-primary hover:brightness-110 active:brightness-90',
}
const sizeCls: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-12 px-4',
  lg: 'h-14 px-6',
}

type BtnProps = {
  variant?: Variant
  size?: Size
  loading?: boolean
  to?: string
  block?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant = 'primary', size = 'md', loading, to, block, className, children, disabled, ...rest }: BtnProps) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition select-none cursor-pointer',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    variantCls[variant],
    sizeCls[size],
    block && 'w-full',
    className,
  )
  const content = (
    <>
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </>
  )
  if (to && !disabled) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    )
  }
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}

/* ───────────── Form field ───────────── */
type FieldProps = {
  label?: string
  helper?: string
  error?: string
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

export function Field({ label, helper, error, className, id, ...rest }: FieldProps) {
  const fid = id ?? rest.name
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={fid} className="text-xs text-muted">
          {label}
        </label>
      )}
      <input
        id={fid}
        className={cx(
          'w-full rounded-control border bg-bg px-4 py-3 text-sm font-medium text-fg outline-none placeholder:text-muted',
          'focus:border-primary disabled:opacity-40',
          error ? 'border-danger' : 'border-line',
        )}
        aria-invalid={!!error}
        {...rest}
      />
      {(error || helper) && <p className={cx('text-xs', error ? 'text-danger' : 'text-muted')}>{error ?? helper}</p>}
    </div>
  )
}

export function SelectField({ label, children, className, ...rest }: { label?: string; className?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {label && <label className="text-xs text-muted">{label}</label>}
      <select className="w-full rounded-control border border-line bg-bg px-4 py-3 text-sm font-medium text-fg outline-none focus:border-primary" {...rest}>
        {children}
      </select>
    </div>
  )
}

export function Check({ label, checked, onChange, type = 'checkbox' }: { label: string; checked: boolean; onChange: (v: boolean) => void; type?: 'checkbox' | 'radio' }) {
  return (
    <label className={cx('flex cursor-pointer items-center gap-3 text-sm font-medium', checked ? 'text-gold' : 'text-fg')}>
      <input type={type} checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--c-primary)]" />
      {label}
    </label>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex cursor-pointer items-center gap-3 text-sm font-medium text-fg">
      <span className={cx('relative h-6 w-11 rounded-full transition', checked ? 'bg-primary' : 'bg-line')}>
        <span className={cx('absolute top-0.5 size-5 rounded-full bg-white transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </span>
      {label}
    </button>
  )
}

/* ───────────── Chip / Tab ───────────── */
export function Chip({ selected, children, onClick, disabled, className }: { selected?: boolean; children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex h-11 min-w-[88px] cursor-pointer items-center rounded-control px-4 text-sm font-medium transition disabled:opacity-40',
        selected ? 'bg-primary text-on-primary' : 'bg-raised text-fg hover:brightness-110',
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ───────────── Status badge ───────────── */
export type Status = 'valid' | 'used' | 'expired' | 'pending' | 'paid' | 'cancelled'
const statusMap: Record<Status, { label: string; cls: string }> = {
  valid: { label: '●  Hợp lệ', cls: 'text-success' },
  paid: { label: '●  Đã thanh toán', cls: 'text-success' },
  pending: { label: '◷  Chờ xử lý', cls: 'text-warning' },
  expired: { label: '◷  Hết hạn', cls: 'text-warning' },
  used: { label: '✓  Đã dùng', cls: 'text-muted' },
  cancelled: { label: '×  Đã hủy', cls: 'text-danger' },
}
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const s = statusMap[status]
  return <span className={cx('inline-flex items-center whitespace-pre rounded-control bg-raised px-4 py-2 text-xs', s.cls)}>{label ?? s.label}</span>
}

/* ───────────── Card ───────────── */
export function Card({ children, className, tone = 'raised' }: { children: ReactNode; className?: string; tone?: 'raised' | 'surface' }) {
  return <div className={cx('rounded-card p-4', tone === 'raised' ? 'bg-raised' : 'bg-surface', className)}>{children}</div>
}

export function Poster({ idx, className }: { idx: number; className?: string }) {
  return (
    <div
      className={cx('rounded-lg', className)}
      style={{ backgroundImage: `linear-gradient(to right, var(--poster-${(idx % 5) + 1}), var(--poster-to))` }}
    />
  )
}

export function MovieCard({ id, title, meta, idx }: { id: string; title: string; meta: string; idx: number }) {
  return (
    <Link to={`/movies/${id}`} className="flex min-h-[400px] flex-col gap-2 rounded-card bg-raised p-4 transition hover:-translate-y-0.5 hover:brightness-110">
      <Poster idx={idx} className="h-[264px] w-full shrink-0" />
      <p className="text-xl font-semibold leading-7 text-fg">{title}</p>
      <p className="text-xs text-muted">{meta}</p>
      <p className="whitespace-pre text-sm font-medium text-danger">{'Đặt vé  →'}</p>
    </Link>
  )
}

export function KpiCard({ label, value, delta, tone = 'success' }: { label: string; value: string; delta?: string; tone?: 'success' | 'danger' | 'muted' }) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-bold leading-8 text-fg">{value}</p>
      {delta && <p className={cx('text-xs', tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-muted')}>{delta}</p>}
    </Card>
  )
}

/* ───────────── Seat ───────────── */
export type SeatType = 'standard' | 'vip' | 'couple'
export type SeatState = 'available' | 'selected' | 'held' | 'sold' | 'recommended'

export function Seat({ label, type = 'standard', state, onClick, compact }: { label: string; type?: SeatType; state: SeatState; onClick?: () => void; compact?: boolean }) {
  const border = state === 'held' ? 'border-warning' : type === 'vip' ? 'border-gold' : 'border-line'
  const bg = state === 'selected' ? 'bg-primary' : state === 'recommended' ? 'bg-gold' : state === 'sold' ? 'bg-bg opacity-55' : 'bg-raised'
  const txt = state === 'recommended' ? 'text-on-gold' : state === 'held' ? 'text-warning' : state === 'selected' ? 'text-on-primary' : 'text-fg'
  const icon = state === 'selected' ? '✓' : state === 'held' ? '◷' : state === 'sold' ? '×' : state === 'recommended' ? '★' : ''
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'sold' || state === 'held'}
      aria-label={`Ghế ${label}`}
      aria-pressed={state === 'selected'}
      className={cx(
        'flex shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-control border text-sm font-medium transition',
        compact ? 'h-8 w-6 px-0 text-[10px] sm:h-11 sm:w-10 sm:px-1 sm:text-xs' : 'h-11 w-12 px-1',
        border,
        bg,
        txt,
        state === 'available' || state === 'recommended' || state === 'selected' ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed',
      )}
    >
      {state === 'selected' || state === 'held' || state === 'sold' ? icon : state === 'recommended' ? `${icon} ${label}` : label}
    </button>
  )
}

export function SeatLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-control bg-raised p-4 text-sm font-medium">
      <span className="text-fg">□ Trống</span>
      <span className="text-danger">✓ Đang chọn</span>
      <span className="text-warning">◷ Đang giữ</span>
      <span className="text-muted">× Đã bán</span>
      <span className="text-gold">★ Smart Seat</span>
      <span className="text-gold">VIP • 120.000đ</span>
      <span className="text-fg">♡ Ghế đôi • 180.000đ</span>
    </div>
  )
}

/* ───────────── Booking stepper / countdown ───────────── */
const steps = ['1. Ghế', '2. Đồ ăn', '3. Thanh toán', '4. Vé']
export function BookingStepper({ step }: { step: 0 | 1 | 2 | 3 }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-control bg-raised p-4 text-sm font-medium">
      {steps.map((s, i) => (
        <span key={s} className={i === step ? 'text-gold' : 'text-muted'}>
          {s}
        </span>
      ))}
    </div>
  )
}

export function mmss(sec: number) {
  const s = Math.max(0, sec)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function Countdown({ seconds }: { seconds: number }) {
  const expired = seconds <= 0
  const urgent = seconds <= 30
  return (
    <div className={cx('rounded-control bg-raised p-4 text-base', expired ? 'text-danger' : urgent ? 'text-warning' : 'text-gold')}>
      {expired ? '◷ 00:00 · Hết thời gian' : urgent ? `◷ ${mmss(seconds)} · Sắp hết hạn` : `◷ ${mmss(seconds)} · Giữ ghế`}
    </div>
  )
}

/* ───────────── Toast / Dialog / Banner ───────────── */
export type Tone = 'success' | 'warning' | 'error' | 'info'
const toneCls: Record<Tone, string> = { success: 'text-success', warning: 'text-warning', error: 'text-danger', info: 'text-info' }
const toneIcon: Record<Tone, string> = { success: '✓', warning: '!', error: '×', info: 'ⓘ' }

export function Toast({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div role="status" className={cx('rounded-control bg-raised p-4 text-sm font-medium shadow-lg', toneCls[tone])}>
      {toneIcon[tone]} {children}
    </div>
  )
}

export function Banner({ tone, title, children }: { tone: Tone; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-control border border-line bg-surface p-4">
      <p className={cx('text-sm font-medium', toneCls[tone])}>
        {toneIcon[tone]} {title}
      </p>
      {children && <p className="text-sm text-muted">{children}</p>}
    </div>
  )
}

export function Dialog({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children?: ReactNode; onClose?: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="flex w-full max-w-[560px] flex-col gap-2 rounded-control bg-raised p-6">
        <h2 className="text-2xl font-bold leading-8 text-fg">{title}</h2>
        {description && <p className="text-base text-muted">{description}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  )
}

/* ───────────── Feedback states ───────────── */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-10 text-center">
      <p className="text-xl font-semibold text-fg">{title}</p>
      {description && <p className="max-w-md text-base text-muted">{description}</p>}
      {action}
    </div>
  )
}

export const Skeleton = ({ className }: { className?: string }) => <div className={cx('animate-pulse rounded-lg bg-raised', className)} />

/* ───────────── Data table ───────────── */
export function Table({ head, rows, footer, className }: { head: string[]; rows: ReactNode[][]; footer?: ReactNode; className?: string }) {
  return (
    <div className={cx('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="bg-raised text-xs uppercase tracking-wide text-muted">
              {head.map((h) => (
                <th key={h} className="px-4 py-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line hover:bg-raised/40">
                {r.map((c, j) => (
                  <td key={j} className="px-4 py-4 font-medium text-fg">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div className="border-t border-line bg-raised px-4 py-4 text-sm font-medium text-fg">{footer}</div>}
    </div>
  )
}

export const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ'
