import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ThemeSwitcher } from '../../components/Layout'
import { Row } from '../../components/OrderSummary'
import { Button, cx, Field, vnd } from '../../ui'

type Result = { kind: 'idle' } | { kind: 'valid' | 'used' | 'wrong' | 'notfound'; code: string; at?: string }

const ORDERS: Record<string, { guest: string; seats: string; total: number; time: string }> = {
  CG102601: { guest: 'Nguyễn Minh Anh', seats: 'F07 / F08 · 2 × 90.000đ = 180.000đ', total: 265000, time: '19:30' },
  CG102598: { guest: 'Phạm Quốc Bảo', seats: 'C05 / C06 · 2 × 90.000đ = 180.000đ', total: 265000, time: '19:30' },
}
const SHOWTIMES = ['17:00', '19:30', '21:45']
const initialScans = [
  { code: 'CG102598', at: '18:58' },
  { code: 'CG102599', at: '18:56' },
]

function Icon({ d, className }: { d: ReactNode; className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {d}
    </svg>
  )
}
const ScanIcon = ({ className }: { className?: string }) => <Icon className={className} d={<path d="M4 10V6a2 2 0 0 1 2-2h4M18 4h4a2 2 0 0 1 2 2v4M24 18v4a2 2 0 0 1-2 2h-4M10 24H6a2 2 0 0 1-2-2v-4M8 14h12" />} />

function StatusIcon({ tone }: { tone: 'success' | 'danger' | 'warning' }) {
  const color = { success: 'text-success', danger: 'text-danger', warning: 'text-warning' }[tone]
  if (tone === 'warning')
    return <Icon className={cx('size-9', color)} d={<><path d="M14 3 26 24H2L14 3Z" /><path d="M14 11v6M14 20.5v.5" /></>} />
  return (
    <span className={cx('flex size-9 items-center justify-center rounded-full border-2', tone === 'success' ? 'border-success' : 'border-danger', color)}>
      <Icon className="size-5" d={tone === 'success' ? <path d="m7 14 5 5 9-10" /> : <path d="m8 8 12 12M20 8 8 20" />} />
    </span>
  )
}

export default function CheckIn() {
  const [params] = useSearchParams()
  const preset = params.get('state')
  const [time, setTime] = useState(preset === 'wrong' ? '17:00' : '19:30')
  const [code, setCode] = useState(preset === 'notfound' ? 'CG000000' : preset ? 'CG102601' : '')
  const [used, setUsed] = useState<Record<string, string>>({ CG102598: '26/10/2026 · 18:58', CG102599: '26/10/2026 · 18:56', ...(preset === 'used' ? { CG102601: '26/10/2026 · 19:02' } : {}) })
  const [scans, setScans] = useState(initialScans)
  const [res, setRes] = useState<Result>(() => (preset === 'valid' || preset === 'used' || preset === 'wrong' || preset === 'notfound' ? evaluate(preset === 'notfound' ? 'CG000000' : 'CG102601', preset === 'wrong' ? '17:00' : '19:30', preset === 'used' ? { CG102601: '26/10/2026 · 19:02' } : {}) : { kind: 'idle' }))

  function evaluate(c: string, t: string, usedMap: Record<string, string>): Result {
    const id = c.trim().toUpperCase()
    const order = ORDERS[id]
    if (!order) return { kind: 'notfound', code: id }
    if (usedMap[id]) return { kind: 'used', code: id, at: usedMap[id] }
    if (order.time !== t) return { kind: 'wrong', code: id }
    return { kind: 'valid', code: id }
  }

  function check(e?: FormEvent) {
    e?.preventDefault()
    if (code.trim()) setRes(evaluate(code, time, used))
  }

  function confirm(id: string) {
    const now = new Date()
    const hh = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setUsed((u) => ({ ...u, [id]: `26/10/2026 · ${hh}` }))
    setScans((s) => [{ code: id, at: hh }, ...s])
    setRes({ kind: 'idle' })
    setCode('')
  }

  const order = res.kind !== 'idle' && res.kind !== 'notfound' ? ORDERS[res.code] : undefined

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-4 sm:px-8">
        <Link to="/staff" className="flex items-center gap-3 text-base font-bold tracking-wide">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--c-primary)" strokeWidth="1.6" aria-hidden>
            <path d="M3 8h22v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V8Z" />
            <path d="m11 14 2 2 4-4" />
          </svg>
          CINEGO / CHECK-IN
        </Link>
        <div className="flex items-center gap-4 text-xs text-muted sm:text-sm">
          <span className="hidden sm:inline">Trần Ngọc Mai · Staff · CineGo Central</span>
          <Button variant="secondary" size="sm" to="/">
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-bold leading-10">Kiểm tra vé vào rạp</h1>
            <p className="text-base text-muted">Chọn đúng suất chiếu. Chỉ xác nhận khi vé hợp lệ và chưa sử dụng.</p>
          </div>
          <span className="rounded-control bg-raised px-4 py-3 text-sm font-medium">Ca tối · 26/10/2026</span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-medium">
          {['CineGo Central ▾', 'Phòng 03 ▾', '26/10/2026 ▾'].map((l) => (
            <span key={l} className="rounded-control bg-raised px-4 py-3">
              {l.replace(' ▾', '')} <span className="text-xs">▾</span>
            </span>
          ))}
          <label className="relative">
            <span className="sr-only">Suất chiếu</span>
            <select
              value={time}
              onChange={(e) => {
                setTime(e.target.value)
                setRes({ kind: 'idle' })
              }}
              className="cursor-pointer appearance-none rounded-control bg-primary px-4 py-3 pr-8 text-sm font-medium text-on-primary outline-none"
            >
              {SHOWTIMES.map((t) => (
                <option key={t} value={t} className="bg-surface text-fg">
                  {t} · Chuyến Tàu Cuối
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-primary">▾</span>
          </label>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
              <h2 className="text-xl font-semibold leading-7">Quét mã vé</h2>
              <div className="flex h-[260px] items-center justify-center rounded-control border border-line bg-bg">
                <div className="flex h-[200px] w-[216px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-muted/70 text-center">
                  <ScanIcon className="size-10 text-muted" />
                  <p className="text-sm font-medium">Vùng quét xem trước</p>
                  <p className="text-xs text-muted">Không kết nối camera thật</p>
                </div>
              </div>
              <p className="text-xs text-muted">Preview tĩnh · Không quét QR hay xác thực vé thật.</p>
            </section>

            <form onSubmit={check} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
              <h2 className="text-xl font-semibold leading-7">Hoặc nhập mã đặt vé</h2>
              <Field label="Mã vé / mã đặt vé" placeholder="Nhập mã, ví dụ CG102601" value={code} onChange={(e) => setCode(e.target.value)} helper="Không nhập dữ liệu thẻ hoặc thông tin thanh toán." />
              <Button type="submit" block>
                Kiểm tra mã
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-6">
            {res.kind === 'idle' && (
              <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
                <h2 className="text-xl font-semibold leading-7">Sẵn sàng kiểm tra</h2>
                <ScanIcon className="size-9 text-muted" />
                <p className="text-base text-muted">Đưa mã vào vùng xem trước hoặc nhập mã thủ công để xem kết quả minh họa.</p>
                <div className="h-px bg-line" />
                <Row k="Suất đang chọn" v={`${time} · Phòng 03`} />
                <Row k="Định dạng" v="2D phụ đề · T13" />
                <Banner tone="info" title="Chưa ghi nhận check-in">
                  Kiểm tra mã không đồng nghĩa với xác nhận vé đã dùng.
                </Banner>
              </section>
            )}

            {res.kind === 'notfound' && (
              <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
                <h2 className="flex items-center gap-3 text-2xl font-semibold leading-8">
                  <StatusIcon tone="danger" /> Không tìm thấy vé
                </h2>
                <Banner tone="danger" title={`Không có kết quả cho ${res.code}`}>
                  Kiểm tra ký tự, nhập lại mã hoặc yêu cầu khách mở chi tiết vé.
                </Banner>
                <Button
                  block
                  onClick={() => {
                    setRes({ kind: 'idle' })
                    setCode('')
                  }}
                >
                  Quét lại / Nhập mã khác
                </Button>
              </section>
            )}

            {order && res.kind !== 'idle' && res.kind !== 'notfound' && (
              <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
                <h2 className="flex items-center gap-3 text-2xl font-semibold leading-8">
                  <StatusIcon tone={res.kind === 'valid' ? 'success' : 'warning'} />
                  {res.kind === 'valid' ? 'Vé hợp lệ' : res.kind === 'used' ? 'Vé đã được sử dụng' : 'Vé không đúng suất chiếu'}
                </h2>
                {res.kind === 'valid' && (
                  <Banner tone="success" title="Chưa sử dụng · Có thể xác nhận">
                    Đã thanh toán mô phỏng. Check-in chưa được ghi nhận.
                  </Banner>
                )}
                {res.kind === 'used' && (
                  <Banner tone="warning" title={`Đã quét: ${res.at}`}>
                    Nhân viên: Trần Ngọc Mai. Không check-in lại hoặc cho qua kiểm tra.
                  </Banner>
                )}
                {res.kind === 'wrong' && (
                  <Banner tone="warning" title={`Đang chọn ${time} · Vé đặt ${order.time}`}>
                    Chuyển về suất {order.time}, Phòng 03 rồi kiểm tra lại. Không ghi đè xác thực.
                  </Banner>
                )}
                <Row k="Mã / Khách" v={`${res.code} · ${order.guest}`} />
                <Row k="Phim" v="Chuyến Tàu Cuối · T13 · 118 phút" />
                <Row k="Rạp / Phòng" v="CineGo Central · Phòng 03" />
                <Row k="Suất trên vé" v={`26/10/2026 · ${order.time} · 2D phụ đề`} />
                <Row k="Ghế Standard" v={order.seats} />
                <Row k="Đồ ăn" v="Combo Đôi × 1 · 85.000đ" />
                <Row k="Tổng mô phỏng" v={vnd(order.total)} strong />
                {res.kind === 'valid' && (
                  <>
                    <Button block onClick={() => confirm(res.code)}>
                      Xác nhận check-in
                    </Button>
                    <p className="text-xs text-muted">Chỉ nút xác nhận mới ghi nhận đã dùng trong kịch bản mẫu.</p>
                  </>
                )}
                {res.kind === 'used' && (
                  <Button
                    block
                    onClick={() => {
                      setRes({ kind: 'idle' })
                      setCode('')
                    }}
                  >
                    Quét lại / Nhập mã khác
                  </Button>
                )}
                {res.kind === 'wrong' && (
                  <Button
                    block
                    onClick={() => {
                      setTime(order.time)
                      setRes(evaluate(res.code, order.time, used))
                    }}
                  >
                    Chọn đúng suất & kiểm tra lại
                  </Button>
                )}
              </section>
            )}

            <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
              <h2 className="text-xl font-semibold leading-7">Lượt quét gần đây</h2>
              {scans.map((s, i) => (
                <p key={`${s.code}-${i}`} className="flex justify-between text-sm">
                  <span className="font-medium">{s.code}</span>
                  <span className="text-success">✓ {s.at} · Đã xác nhận</span>
                </p>
              ))}
            </section>
          </div>
        </div>
        <p className="pt-4 text-xs text-muted">Academic MVP · Mã vé, kết quả và lịch sử quét đều là dữ liệu mô phỏng.</p>
      </main>
      <ThemeSwitcher />
    </div>
  )
}

function Banner({ tone, title, children }: { tone: 'success' | 'danger' | 'warning' | 'info'; title: string; children: ReactNode }) {
  const c = { success: ['border-success', 'text-success', '✓'], danger: ['border-danger', 'text-danger', '⊗'], warning: ['border-warning', 'text-warning', '⚠'], info: ['border-info', 'text-info', 'ⓘ'] }[tone]
  return (
    <div className={cx('rounded-control border-l-[3px] bg-raised p-4 text-sm font-medium', c[0])}>
      <p className={c[1]}>
        {c[2]} &nbsp;{title}
      </p>
      <p className="text-fg">{children}</p>
    </div>
  )
}
