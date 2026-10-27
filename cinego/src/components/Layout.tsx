import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { THEMES, useTheme } from '../theme'
import { useStore } from '../store'
import { cx } from '../ui'

/* Abstract horizon from the design (same path as the exported SVG), stroked with theme tokens. */
export function Horizon({ className }: { className?: string }) {
  return (
    <svg className={cx('h-20 w-[180px] shrink-0 overflow-visible text-muted', className)} viewBox="0 0 180.664 81.0468" fill="none" aria-hidden>
      <path
        d="M0.332182 80.669L90.3322 0.668977L180.332 80.669M30.3322 80.669L90.3322 28.669L150.332 80.669M60.3322 80.669L90.3322 52.669L120.332 80.669"
        stroke="currentColor"
        strokeOpacity="0.5"
      />
    </svg>
  )
}

export function FilmArt({ className, title = 'Chuyến Tàu Cuối', size = 'lg' }: { className?: string; title?: string; size?: 'lg' | 'md' }) {
  return (
    <div
      className={cx('flex flex-col justify-between overflow-hidden rounded-xl p-6', className)}
      style={{ backgroundImage: 'linear-gradient(to right, var(--hero-from), var(--hero-via) 48%, var(--hero-to))' }}
    >
      <p className="text-xs text-fg">CINEGO ORIGINAL STORIES</p>
      <Horizon />
      <div className="flex flex-col gap-2">
        <p className={cx('font-bold text-fg', size === 'lg' ? 'text-[32px] leading-10' : 'text-2xl leading-8')}>{title}</p>
        <p className="text-xs text-muted">MỘT HÀNH TRÌNH. NGÀN ĐIỀU CHƯA KỂ.</p>
      </div>
    </div>
  )
}

/* ───────────── Theme switcher (6 modes) ───────────── */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const current = THEMES.find((t) => t.id === theme)!
  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 lg:bottom-4">
      {open && (
        <div className="w-56 rounded-card border border-line bg-surface p-3 shadow-xl" role="menu">
          {(['Gốc', 'Chỉnh sửa'] as const).map((ver) => (
            <div key={ver} className="mb-2 last:mb-0">
              <p className="mb-1 px-1 text-xs text-muted">Bản {ver.toLowerCase()}</p>
              {THEMES.filter((t) => t.version === ver).map((t) => (
                <button
                  key={t.id}
                  role="menuitemradio"
                  aria-checked={t.id === theme}
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                  className={cx('flex w-full cursor-pointer items-center gap-3 rounded-control px-2 py-2 text-left text-sm font-medium', t.id === theme ? 'bg-raised text-fg' : 'text-muted hover:bg-raised')}
                >
                  <span className="flex overflow-hidden rounded-full border border-line">
                    {t.swatch.map((c) => (
                      <span key={c} className="size-4" style={{ background: c }} />
                    ))}
                  </span>
                  {t.label}
                  {t.id === theme && <span className="ml-auto text-gold">✓</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-raised px-4 py-2 text-sm font-medium text-fg shadow-lg hover:brightness-110"
      >
        <span className="size-3 rounded-full bg-primary" />
        {current.label} · {current.version}
      </button>
    </div>
  )
}

/* ───────────── Customer layout ───────────── */
const navItems = [
  { to: '/', label: 'Lịch chiếu', end: true },
  { to: '/cinemas', label: 'Rạp phim' },
  { to: '/offers', label: 'Ưu đãi' },
  { to: '/tickets', label: 'Vé của tôi' },
]

export function CustomerLayout() {
  const { user } = useStore()
  const { pathname } = useLocation()
  const hideTabs = /^\/(login|register|forgot|reset)/.test(pathname)
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="flex h-[72px] items-center justify-between gap-4 border-b border-line px-4 sm:px-8 lg:h-[88px] lg:px-16">
        <nav className="flex min-w-0 items-center gap-6 rounded-control bg-raised px-4 py-4 text-sm font-medium lg:gap-12">
          <Link to="/" className="text-danger">
            CINEGO
          </Link>
          <div className="hidden items-center gap-6 md:flex lg:gap-12">
            {navItems.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('whitespace-nowrap hover:text-gold', isActive ? 'text-gold' : 'text-fg')}>
                {n.label}
              </NavLink>
            ))}
            {!user && (
              <NavLink to="/login" className={({ isActive }) => cx('whitespace-nowrap hover:text-gold', isActive ? 'text-gold' : 'text-fg')}>
                Đăng nhập
              </NavLink>
            )}
          </div>
        </nav>
        <Link to={user ? '/profile' : '/login'} className="truncate text-sm font-medium text-muted hover:text-fg">
          VI &nbsp;·&nbsp; {user ? user.name : 'Đăng nhập'}
        </Link>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="flex flex-col justify-between gap-1 border-t border-line px-4 py-4 pb-24 text-xs text-muted sm:flex-row sm:px-8 lg:px-16 lg:pb-4">
        <p>CineGo · Academic MVP · Dữ liệu minh họa</p>
        <p className="sm:text-right">
          Không giao dịch thật · Hỗ trợ / Điều khoản ·{' '}
          <Link to="/staff" className="underline hover:text-fg">
            Staff
          </Link>{' '}
          ·{' '}
          <Link to="/admin" className="underline hover:text-fg">
            Admin
          </Link>
        </p>
      </footer>

      {!hideTabs && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-4 border-t border-line bg-raised px-4 py-4 text-sm font-medium md:hidden">
          <NavLink to="/" end className={({ isActive }) => cx('flex-1 text-center', isActive ? 'text-gold' : 'text-fg')}>
            ⌂ Trang chủ
          </NavLink>
          <NavLink to="/tickets" className={({ isActive }) => cx('flex-1 text-center', isActive ? 'text-gold' : 'text-fg')}>
            ▣ Vé của tôi
          </NavLink>
          <NavLink to={user ? '/profile' : '/login'} className={({ isActive }) => cx('flex-1 text-center', isActive ? 'text-gold' : 'text-fg')}>
            ○ Tài khoản
          </NavLink>
        </nav>
      )}
      <ThemeSwitcher />
    </div>
  )
}

/* ───────────── Shared page chrome ───────────── */
export const Page = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx('mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-8 lg:px-16 lg:py-8', className)}>{children}</div>
)

export function PageIntro({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold leading-8 text-fg">{title}</h1>
      {subtitle && <p className="text-base text-muted">{subtitle}</p>}
    </div>
  )
}

export function Panel({ title, subtitle, children, className }: { title?: string; subtitle?: string; children?: ReactNode; className?: string }) {
  return (
    <section className={cx('flex flex-col gap-4 rounded-card border border-line bg-surface p-6', className)}>
      {title && <h2 className="text-xl font-semibold leading-7 text-fg">{title}</h2>}
      {subtitle && <p className="-mt-2 text-xs text-muted">{subtitle}</p>}
      {children}
    </section>
  )
}

/* Message with colored left rule (used by auth screens). */
export function Message({ tone, title, children }: { tone: 'success' | 'error' | 'warning' | 'info'; title: string; children?: ReactNode }) {
  const c = { success: ['border-success', 'text-success', '✓'], error: ['border-danger', 'text-danger', '×'], warning: ['border-warning', 'text-warning', '!'], info: ['border-info', 'text-info', 'ⓘ'] }[tone]
  return (
    <div className={cx('flex flex-col gap-0 rounded-lg border-l-[3px] bg-raised p-4 text-sm font-medium', c[0])} role={tone === 'error' ? 'alert' : 'status'}>
      <p className={c[1]}>
        {c[2]}&nbsp;&nbsp;{title}
      </p>
      {children && <p className="text-muted">{children}</p>}
    </div>
  )
}
