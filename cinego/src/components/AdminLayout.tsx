import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ThemeSwitcher } from './Layout'
import { cx } from '../ui'

const nav = [
  { to: '/admin', label: 'Tổng quan', end: true, crumb: 'Tổng quan' },
  { to: '/admin/movies', label: 'Phim', crumb: 'Quản lý phim' },
  { to: '/admin/cinemas', label: 'Rạp & phòng', crumb: 'Rạp & phòng chiếu' },
  { to: '/admin/showtimes', label: 'Suất chiếu', crumb: 'Lịch chiếu' },
  { to: '/admin/food', label: 'Đồ ăn & giá', crumb: 'Đồ ăn & giá bán' },
  { to: '/admin/bookings', label: 'Đặt vé', crumb: 'Đơn đặt vé' },
  { to: '/admin/users', label: 'Người dùng', crumb: 'Người dùng' },
]

const crumbFor = (path: string) => {
  if (/seat-layout/.test(path)) return 'Thiết kế sơ đồ ghế'
  if (/movies\/.+/.test(path)) return path.endsWith('/new') ? 'Thêm phim' : 'Chỉnh sửa phim'
  if (/showtimes\/new/.test(path)) return 'Tạo suất chiếu'
  if (/bookings\/.+/.test(path)) return 'Chi tiết đơn đặt vé'
  return [...nav].reverse().find((n) => path === n.to || path.startsWith(n.to + '/'))?.crumb ?? 'Tổng quan'
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const active = (n: (typeof nav)[number]) => (n.end ? pathname === n.to : pathname.startsWith(n.to))
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <nav className="flex flex-col gap-4 rounded-control bg-raised p-4 text-sm font-medium" aria-label="Quản trị">
        <Link to="/admin" onClick={onNavigate} className="text-danger">
          CINEGO ADMIN
        </Link>
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={onNavigate} className={cx(active(n) ? 'text-gold' : 'text-fg hover:text-gold')}>
            {active(n) && '› '}
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line pt-4 text-sm">
        <p className="text-xs text-gold">ACADEMIC WORKSPACE</p>
        <p className="mt-2 text-muted">3 cụm rạp · Dữ liệu mẫu</p>
      </div>
      <div className="mt-auto flex flex-col gap-2 text-sm">
        <p className="font-medium text-fg">Lê Gia Huy</p>
        <p className="text-xs text-muted">Admin · Quyền quản trị</p>
        <Link to="/" className="w-fit rounded-control border border-line bg-raised px-4 py-3 font-medium text-fg hover:brightness-110">
          Đăng xuất
        </Link>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-bg text-fg lg:pl-[240px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-line bg-surface lg:block">
        <Sidebar />
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-[260px] border-r border-line bg-surface" onClick={(e) => e.stopPropagation()}>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="flex min-h-screen flex-col">
        <header className="flex h-[60px] items-center justify-between gap-4 border-b border-line px-4 sm:px-8">
          <div className="flex items-center gap-3 text-sm text-muted">
            <button className="cursor-pointer text-lg text-fg lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu">
              ☰
            </button>
            <span className="hidden sm:inline">Không gian quản trị</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-fg">{crumbFor(pathname)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span aria-label="Thông báo">🔔︎</span>
            <span>LG · Admin</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
          <Outlet />
        </main>
        <p className="px-4 pb-4 text-xs text-muted sm:px-8">Academic MVP · Doanh thu, thanh toán và dữ liệu vận hành đều mô phỏng.</p>
      </div>
      <ThemeSwitcher />
    </div>
  )
}

export function AdminHead({ title, subtitle = 'CineGo Smart Cinema · Vận hành rõ ràng, trải nghiệm trọn vẹn', children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold leading-8">{title}</h1>
        <p className="text-sm font-medium text-muted">{subtitle}</p>
      </div>
      {children ?? <span className="rounded-control bg-raised px-3 py-2 text-xs text-warning">ⓘ Dữ liệu mô phỏng</span>}
    </div>
  )
}

export const FilterPill = ({ children }: { children: ReactNode }) => <span className="inline-flex h-11 items-center rounded-control bg-raised px-4 text-sm font-medium text-fg">{children}</span>

export function PillSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 cursor-pointer appearance-none rounded-control bg-raised pl-4 pr-8 text-sm font-medium text-fg outline-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-fg">▾</span>
    </label>
  )
}

export const ALink = ({ children, onClick, to }: { children: ReactNode; onClick?: () => void; to?: string }) =>
  to ? (
    <Link to={to} className="text-info hover:underline">
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className="cursor-pointer text-info hover:underline">
      {children}
    </button>
  )

export function Dot({ tone, children }: { tone: 'success' | 'warning' | 'muted' | 'danger'; children: ReactNode }) {
  const c = { success: 'text-success', warning: 'text-warning', muted: 'text-fg', danger: 'text-danger' }[tone]
  return (
    <span className={cx('inline-flex items-center gap-2', c)}>
      {tone === 'success' ? '●' : tone === 'warning' ? '◷' : tone === 'danger' ? '×' : '—'} {children}
    </span>
  )
}
