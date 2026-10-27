import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Divider, OrderSummary, Row } from '../../components/OrderSummary'
import { Callout, Message, Page, PageIntro, Panel } from '../../components/Layout'
import { cinemas, foods, movies, SEAT_PRICE } from '../../data'
import { useStore } from '../../store'
import { BookingStepper, Button, Chip, Countdown, Field, vnd } from '../../ui'

/** Current order, falling back to the design's sample order when the booking is empty. */
export function useOrder() {
  const { booking, seatTotal, foodTotal } = useStore()
  const movie = movies.find((m) => m.id === booking.movieId) ?? movies[0]
  const cinema = cinemas.find((c) => c.id === booking.cinemaId) ?? cinemas[0]
  const demo = booking.seats.length === 0
  const seats = demo ? [{ id: 'F07', type: 'standard' as const }, { id: 'F08', type: 'standard' as const }] : booking.seats
  const sTotal = demo ? 2 * SEAT_PRICE.standard : seatTotal
  const foodLines = Object.entries(booking.food).filter(([, q]) => q > 0).map(([id, q]) => ({ f: foods.find((x) => x.id === id)!, q }))
  const fLines = demo && foodLines.length === 0 ? [{ f: foods[0], q: 1 }] : foodLines
  const fTotal = demo && foodLines.length === 0 ? foods[0].price : foodTotal
  return {
    movie,
    cinema,
    room: cinema.showtimes[0].room.replace('Phòng ', ''),
    time: booking.time,
    seats,
    seatText: seats.map((s) => s.id).sort().join(', '),
    seatTotal: sTotal,
    foodLines: fLines,
    total: sTotal + fTotal,
    code: 'CG102601',
  }
}

function FoodIcon({ kind }: { kind: 'popcorn' | 'drink' }) {
  return (
    <svg width="48" height="56" viewBox="0 0 48 56" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted" aria-hidden>
      {kind === 'popcorn' ? (
        <>
          <path d="M8 22h32l-4 30H12L8 22Z" />
          <path d="M18 22l2 30M30 22l-2 30M24 22v30" />
          <path d="M8 22c-3-8 3-12 7-9 1-6 11-6 12-1 5-4 12 0 8 7 3 0 5 3 5 3" />
        </>
      ) : (
        <>
          <path d="M10 18h28l-3 34H13l-3-34Z" />
          <path d="M10 28h28M30 18l3-14h8" />
        </>
      )}
    </svg>
  )
}

/* ───────────── 13 Food & drinks ───────────── */
export function Food() {
  const nav = useNavigate()
  const { booking, setFood, secondsLeft } = useStore()
  const [cat, setCat] = useState<'all' | 'combo' | 'popcorn' | 'drink'>('all')
  const tabs = [['all', 'Tất cả'], ['combo', 'Combo'], ['popcorn', 'Bắp'], ['drink', 'Đồ uống']] as const
  const list = foods.filter((f) => cat === 'all' || f.cat === cat)

  return (
    <Page>
      <div className="w-fit max-w-full">
        <BookingStepper step={1} />
      </div>
      <PageIntro title="Thêm chút ngon cho buổi phim" subtitle="Đặt trước và nhận tại quầy với mã đặt vé của bạn." />
      <div className="w-[240px]">
        <Countdown seconds={booking.holdUntil ? secondsLeft : 272} />
      </div>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(([k, l]) => (
              <Chip key={k} selected={cat === k} onClick={() => setCat(k)}>
                {l}
              </Chip>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((f) => {
              const q = booking.food[f.id] ?? 0
              return (
                <article key={f.id} className="flex flex-col gap-3 self-start rounded-card border border-line bg-surface p-6">
                  <div className="flex h-28 items-center justify-center rounded-control bg-raised">
                    <FoodIcon kind={f.cat === 'drink' ? 'drink' : 'popcorn'} />
                  </div>
                  <h3 className="text-xl font-semibold leading-7 text-fg">{f.name}</h3>
                  <p className="text-sm text-muted">{f.desc}</p>
                  <p className="text-xl font-semibold leading-7 text-fg">{vnd(f.price)}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="secondary" aria-label={`Giảm ${f.name}`} disabled={q === 0} onClick={() => setFood(f.id, q - 1)}>
                      −
                    </Button>
                    <span className="flex-1 text-center text-base text-fg" aria-live="polite">
                      {q}
                    </span>
                    <Button variant="secondary" aria-label={`Thêm ${f.name}`} onClick={() => setFood(f.id, q + 1)}>
                      +
                    </Button>
                  </div>
                  {q > 0 && <p className="text-xs text-success">✓ Đã thêm vào đơn</p>}
                </article>
              )
            })}
          </div>
        </div>
        <div className="xl:w-[352px] xl:shrink-0">
          <OrderSummary>
            <Button block onClick={() => nav('/booking/checkout')}>
              Tiếp tục · Kiểm tra đơn
            </Button>
            <Link to="/booking/checkout" className="text-center text-xs text-muted hover:text-fg">
              Bỏ qua đồ ăn
            </Link>
          </OrderSummary>
        </div>
      </div>
    </Page>
  )
}

/* ───────────── 14 Checkout ───────────── */
export function Checkout() {
  const nav = useNavigate()
  const { user, booking, secondsLeft } = useStore()
  const o = useOrder()
  return (
    <Page>
      <div className="w-fit max-w-full">
        <BookingStepper step={2} />
      </div>
      <PageIntro title="Kiểm tra đơn đặt vé" subtitle="Mọi chi tiết rõ ràng trước khi thanh toán." />
      <div className="w-[240px]">
        <Countdown seconds={booking.holdUntil ? secondsLeft : 272} />
      </div>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Panel title="Thông tin suất chiếu">
            <p className="text-xl font-semibold leading-7 text-fg">{o.movie.title}</p>
            <Row k="Rạp / Phòng" v={`${o.cinema.name} · Phòng ${o.room}`} />
            <Row k="Suất chiếu" v={`26/10/2026 · ${o.time}`} />
            <Row k="Định dạng" v={`2D phụ đề · ${o.movie.rating}`} />
            <Row k="Ghế" v={`Standard · ${o.seatText}`} />
            <Button variant="ghost" className="w-fit" to="/booking/seats">
              Sửa ghế
            </Button>
          </Panel>
          <Panel title="Đồ ăn & thức uống">
            {o.foodLines.map(({ f, q }) => (
              <div key={f.id} className="flex flex-col gap-3">
                <Row k={`${f.name} × ${q}`} v={vnd(f.price * q)} />
                <p className="text-sm text-fg">{f.desc.split(' · ')[0]} · Nhận tại quầy</p>
              </div>
            ))}
            <Button variant="ghost" className="w-fit" to="/booking/food">
              Sửa đồ ăn
            </Button>
          </Panel>
          <Panel title="Thông tin liên hệ">
            <Row k="Họ và tên" v={user?.name ?? 'Nguyễn Minh Anh'} />
            <Row k="Email" v={user?.email ?? 'minhanh@example.com'} />
            <p className="text-xs text-muted">Vé mẫu sẽ được lưu trong Vé của tôi. Không gửi email thật.</p>
          </Panel>
        </div>
        <div className="xl:w-[352px] xl:shrink-0">
          <OrderSummary>
            <Button block onClick={() => nav('/booking/payment')}>
              Tiếp tục thanh toán mô phỏng
            </Button>
            <p className="text-xs text-muted">Thanh toán mô phỏng · Không sử dụng tiền thật</p>
          </OrderSummary>
        </div>
      </div>
    </Page>
  )
}

/* ───────────── 15 Mock payment ───────────── */
export function Payment() {
  const nav = useNavigate()
  const { user, booking, secondsLeft } = useStore()
  const o = useOrder()
  const [method, setMethod] = useState<'card' | 'wallet' | 'bank'>('card')
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState((user?.name ?? 'Nguyễn Minh Anh').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/Đ/g, 'D'))
  const methods = [['card', 'Thẻ mẫu'], ['wallet', 'Ví mô phỏng'], ['bank', 'Chuyển khoản mẫu']] as const

  function pay(to: string) {
    setBusy(true)
    setTimeout(() => nav(to), 900)
  }

  return (
    <Page>
      <div className="w-fit max-w-full">
        <BookingStepper step={2} />
      </div>
      <PageIntro title="Thanh toán mô phỏng" subtitle="Simulated payment — no real money" />
      <div className="w-[240px]">
        <Countdown seconds={booking.holdUntil ? secondsLeft : 272} />
      </div>
      <Callout tone="warning" title="Thanh toán mô phỏng – không sử dụng tiền thật">
        <p className="text-fg">Chỉ dùng dữ liệu mẫu bên dưới. Không nhập số thẻ, mã bảo mật hoặc thông tin ngân hàng thật.</p>
      </Callout>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Panel title="Phương thức thanh toán">
            <div className="flex flex-wrap gap-3">
              {methods.map(([k, l]) => (
                <Chip key={k} selected={method === k} onClick={() => setMethod(k)}>
                  {l}
                </Chip>
              ))}
            </div>
            <p className="text-sm text-fg">Các lựa chọn đều là mô phỏng, không liên kết nhà cung cấp thanh toán.</p>
          </Panel>
          {method === 'card' ? (
            <Panel title="Thông tin thẻ · DỮ LIỆU MẪU">
              <Field label="Tên chủ thẻ mẫu" value={name} onChange={(e) => setName(e.target.value)} helper="Dữ liệu minh họa" />
              <Field label="Số thẻ mẫu · Không phải thẻ thật" value="0000 0000 0000 1026" readOnly helper="Số mẫu không có khả năng giao dịch" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hết hạn mẫu" value="12 / 30" readOnly />
                <Field label="CVV mẫu" value="000" readOnly />
              </div>
            </Panel>
          ) : (
            <Panel title={method === 'wallet' ? 'Ví mô phỏng' : 'Chuyển khoản mẫu'}>
              <p className="text-sm text-fg">{method === 'wallet' ? 'Ví CineGo Pay (mô phỏng) · Số dư không có thật.' : 'CineGo Demo Bank · STK 0000 0000 1026 (mẫu).'}</p>
              <p className="text-xs text-muted">Không nhập thông tin tài khoản thật.</p>
            </Panel>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span>Mô phỏng kết quả khác:</span>
            <Link to="/booking/failed" className="underline hover:text-fg">
              thanh toán thất bại
            </Link>
            <Link to="/booking/timeout" className="underline hover:text-fg">
              hết thời gian thanh toán
            </Link>
          </div>
        </div>
        <div className="xl:w-[352px] xl:shrink-0">
          <OrderSummary>
            <Button block loading={busy} onClick={() => pay('/booking/success')}>
              Xác nhận mô phỏng · {vnd(o.total)}
            </Button>
            <p className="text-xs text-muted">Thanh toán mô phỏng · Không sử dụng tiền thật</p>
          </OrderSummary>
        </div>
      </div>
    </Page>
  )
}

/* ───────────── 16–18 Payment result ───────────── */
const outcomes = {
  success: {
    icon: '✓',
    ring: 'border-success text-success',
    title: 'Đặt vé thành công!',
    text: (n: string) => `${n}, buổi phim của bạn đã sẵn sàng. Vé mẫu được lưu trong Vé của tôi.`,
    tone: 'success' as const,
    banner: 'Đã thanh toán · Mô phỏng',
    totalLabel: 'Đã thanh toán mô phỏng',
    step: 3 as const,
  },
  failed: {
    icon: '✕',
    ring: 'border-danger text-danger',
    title: 'Thanh toán chưa thành công',
    text: () => 'Yêu cầu mô phỏng bị từ chối. Đơn chưa được thanh toán và chưa phát hành vé. Bạn có thể thử lại hoặc đổi phương thức.',
    tone: 'error' as const,
    banner: 'Thanh toán thất bại · Chưa thanh toán',
    totalLabel: 'Số tiền cần thanh toán',
    step: 2 as const,
  },
  timeout: {
    icon: '◷',
    ring: 'border-warning text-warning',
    title: 'Hết thời gian thanh toán',
    text: () => 'Chưa nhận được kết quả từ bộ mô phỏng. Thanh toán chưa hoàn tất, chưa phát hành vé và không đánh dấu đã trả tiền.',
    tone: 'warning' as const,
    banner: 'Chưa hoàn tất · Chưa xác nhận thanh toán',
    totalLabel: 'Số tiền cần thanh toán',
    step: 2 as const,
  },
}

export function PaymentResult({ kind }: { kind: keyof typeof outcomes }) {
  const o = outcomes[kind]
  const ord = useOrder()
  const { user } = useStore()
  const actions: Record<typeof kind, ReactNode> = {
    success: (
      <>
        <Button to="/tickets/CG102601" block>
          Xem vé & QR minh họa
        </Button>
        <Button to="/" variant="secondary" block>
          Về trang chủ
        </Button>
      </>
    ),
    failed: (
      <>
        <Button to="/booking/payment" block>
          Thử thanh toán lại
        </Button>
        <Button to="/booking/checkout" variant="secondary" block>
          Quay lại kiểm tra đơn
        </Button>
      </>
    ),
    timeout: (
      <>
        <Button to="/booking/payment" block>
          Kiểm tra & thử lại
        </Button>
        <Button to="/" variant="secondary" block>
          Về trang chủ
        </Button>
      </>
    ),
  }
  return (
    <Page>
      <div className="w-fit max-w-full">
        <BookingStepper step={o.step} />
      </div>
      <div className="mx-auto flex w-full max-w-[736px] flex-col gap-6">
        <div className="flex flex-col items-center gap-6 pt-6 text-center">
          <div className={`flex size-14 items-center justify-center rounded-full border-2 text-2xl ${o.ring}`} aria-hidden>
            {o.icon}
          </div>
          <h1 className="text-[32px] font-bold leading-10 text-fg">{o.title}</h1>
          <p className="max-w-xl text-base text-muted">{o.text(user?.name ?? 'Nguyễn Minh Anh')}</p>
        </div>
        <Message tone={o.tone} title={o.banner}>
          Không có giao dịch tiền thật. Trạng thái chỉ dùng minh họa cho MVP.
        </Message>
        <Panel title="Chi tiết đặt vé">
          <Row k="Mã đặt vé" v={ord.code} />
          <Row k="Phim" v={ord.movie.title} />
          <Row k="Rạp / Phòng" v={`${ord.cinema.name} · ${ord.room}`} />
          <Row k="Suất chiếu" v={`26/10/2026 · ${ord.time} · 2D phụ đề`} />
          <Row k="Ghế Standard" v={`${ord.seatText} · ${vnd(ord.seatTotal)}`} />
          {ord.foodLines.map(({ f, q }) => (
            <Row key={f.id} k={`${f.name} × ${q}`} v={vnd(f.price * q)} />
          ))}
          <Divider />
          <Row k={o.totalLabel} v={vnd(ord.total)} strong />
        </Panel>
        {actions[kind]}
      </div>
    </Page>
  )
}
