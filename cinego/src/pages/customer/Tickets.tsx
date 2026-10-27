import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Qr } from '../../components/Qr'
import { Divider, Row } from '../../components/OrderSummary'
import { Message, Page, PageIntro, Panel } from '../../components/Layout'
import { tickets, type Ticket } from '../../data'
import { useStore } from '../../store'
import { Button, Chip, EmptyState, Field, StatusBadge, vnd } from '../../ui'

/* ───────────── 19 / 24 My tickets ───────────── */
export function Tickets({ empty = false }: { empty?: boolean }) {
  const list = empty ? [] : tickets
  const upcoming = list.filter((t) => t.status === 'valid')
  const ended = list.filter((t) => t.status !== 'valid')
  const [tab, setTab] = useState<'all' | 'up' | 'end' | 'none'>('all')
  const shown = tab === 'all' ? list : tab === 'up' ? upcoming : tab === 'end' ? ended : []

  return (
    <Page>
      <PageIntro title="Vé của tôi" subtitle={empty ? 'Mọi trải nghiệm điện ảnh của bạn sẽ được lưu tại đây.' : 'Theo dõi vé và trạng thái thanh toán riêng biệt.'} />
      <div className="flex flex-wrap gap-2">
        <Chip selected={tab === 'all'} onClick={() => setTab('all')}>
          Tất cả ({list.length})
        </Chip>
        {!empty && (
          <>
            <Chip selected={tab === 'up'} onClick={() => setTab('up')}>
              Sắp tới ({upcoming.length})
            </Chip>
            <Chip selected={tab === 'end'} onClick={() => setTab('end')}>
              Đã kết thúc ({ended.length})
            </Chip>
            <Chip selected={tab === 'none'} onClick={() => setTab('none')}>
              Không có kết quả
            </Chip>
          </>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="mx-auto mt-10 flex w-full max-w-[820px] flex-col items-center gap-6">
          <div className="w-full">
            <EmptyState
              title={empty ? 'Bạn chưa có đơn đặt vé nào' : 'Không có vé phù hợp'}
              description={empty ? 'Câu chuyện đầu tiên đang chờ bạn. Chọn một bộ phim và bắt đầu ngay hôm nay.' : 'Thử chọn bộ lọc khác để xem các vé của bạn.'}
              action={
                <span className="mb-2 block size-6 rounded-full border-[3px] border-muted" aria-hidden />
              }
            />
          </div>
          <Button to="/">Khám phá phim →</Button>
        </div>
      ) : (
        shown.map((t) => <TicketCard key={t.code} t={t} />)
      )}
    </Page>
  )
}

const badge: Record<Ticket['status'], { s: 'valid' | 'used' | 'expired'; label: string }> = {
  valid: { s: 'valid', label: '●  Vé hợp lệ' },
  used: { s: 'used', label: '✓  Vé đã dùng' },
  expired: { s: 'expired', label: '◷  Vé hết hạn' },
}

function TicketCard({ t }: { t: Ticket }) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-semibold leading-7 text-fg">{t.movie}</h2>
        <div className="flex flex-wrap gap-4">
          <StatusBadge status={badge[t.status].s} label={badge[t.status].label} />
          <StatusBadge status="paid" label="✓  Đã thanh toán (mô phỏng)" />
        </div>
      </div>
      <div className="text-sm leading-5 text-fg">
        <p>
          {t.code} · {t.date} · {t.time}
        </p>
        <p>
          {t.cinema} · Phòng {t.room} · {t.seats}
        </p>
      </div>
      <Row k="Tổng đơn" v={vnd(t.total)} />
      <Button to={`/tickets/${t.code}`} variant="secondary" className="w-fit">
        Xem chi tiết
      </Button>
    </article>
  )
}

/* ───────────── 20–22 Ticket detail ───────────── */
const detailCopy = {
  valid: { title: 'Vé điện tử của bạn', sub: (c: string) => `Chi tiết vé mẫu · ${c}`, note: 'Đến rạp trước 15 phút. Mang mã đặt vé và giấy tờ xác nhận độ tuổi.', badge: '●  Hợp lệ / Valid' },
  used: { title: 'Vé đã sử dụng', sub: () => 'Lịch sử vé · Không thể check-in lại', note: 'Vé đã được ghi nhận sử dụng, không thể check-in lần nữa.', badge: '✓  Đã dùng / Used' },
  expired: { title: 'Vé đã hết hạn', sub: () => 'Suất chiếu đã kết thúc · Không còn hiệu lực', note: 'Suất chiếu đã kết thúc. Vé không còn hiệu lực.', badge: '◷  Hết hạn / Expired' },
}

export function TicketDetail() {
  const { code = 'CG102601' } = useParams()
  const { user } = useStore()
  const t = tickets.find((x) => x.code === code) ?? tickets[0]
  const c = detailCopy[t.status]
  return (
    <Page>
      <PageIntro title={c.title} subtitle={c.sub(t.code)} />
      <div className="flex flex-col gap-8 xl:flex-row">
        <section className="min-w-0 flex-1 rounded-card border border-line bg-surface p-6">
          <StatusBadge status={t.status} label={c.badge} />
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 pb-3">
              <Qr seed={t.code} />
              <p className="text-xs text-[#0f1220]">QR minh họa · Không có hiệu lực</p>
            </div>
            <p className="text-2xl font-bold leading-8 text-fg">{t.code}</p>
            <p className="text-xs text-muted">Thanh toán mô phỏng · Đã thanh toán</p>
          </div>
          <div className="my-6">
            <Divider />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold leading-7 text-fg">{t.movie}</h2>
            <Row k="Khách hàng" v={user?.name ?? 'Nguyễn Minh Anh'} />
            <Row k="Rạp / Phòng" v={`${t.cinema} · ${t.room}`} />
            <Row k="Ngày / Giờ" v={`${t.date} · ${t.time}`} />
            <Row k="Định dạng" v="2D phụ đề" />
            <Row k="Ghế" v={t.seats} />
            {t.food && <Row k="Đồ ăn" v={t.food} />}
            <Row k="Tổng thanh toán" v={vnd(t.total)} strong />
            {t.checkedIn && (
              <div className="rounded-control border-l-[3px] border-warning bg-raised p-3 text-sm font-medium text-warning">! &nbsp;Đã check-in lúc {t.checkedIn}</div>
            )}
          </div>
        </section>
        <aside className="h-fit rounded-card border border-line bg-surface p-6 xl:w-[352px] xl:shrink-0">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold leading-7 text-fg">Lưu ý trước giờ chiếu</h2>
            <p className="text-base text-muted">{c.note}</p>
            <Message tone="info" title="Vé minh họa cho bài tập">
              Không dùng QR này để vào rạp hoặc xác nhận giao dịch thật.
            </Message>
            {t.status !== 'valid' && (
              <Button to="/" className="w-fit">
                Đặt vé mới
              </Button>
            )}
            <Link to="/tickets" className="text-sm font-medium text-danger">
              ← Tất cả vé của tôi
            </Link>
          </div>
        </aside>
      </div>
    </Page>
  )
}

/* ───────────── 23 Profile ───────────── */
export function Profile() {
  const nav = useNavigate()
  const { user, logout, login } = useStore()
  const [f, setF] = useState({ name: user?.name ?? 'Nguyễn Minh Anh', phone: '090 123 4567', dob: '15/08/2002' })
  const [saved, setSaved] = useState(true)
  const digits = f.phone.replace(/\D/g, '')
  const phoneOk = digits.length === 10

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!f.name || !phoneOk) return
    login(user?.email ?? 'minhanh@example.com', f.name)
    setSaved(true)
  }
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => {
    setSaved(false)
    setF((s) => ({ ...s, [k]: e.target.value }))
  }

  return (
    <Page>
      <PageIntro title="Tài khoản của tôi" subtitle="Quản lý thông tin cá nhân và bảo mật." />
      <div className="flex flex-col gap-8 xl:flex-row">
        <form onSubmit={submit} noValidate className="min-w-0 flex-1">
          <Panel title="Thông tin cá nhân">
            {saved && (
              <Message tone="success" title="Đã lưu thông tin cá nhân">
                Tên và số điện thoại của bạn đã được cập nhật trong dữ liệu mẫu.
              </Message>
            )}
            <Field label="Họ và tên" value={f.name} onChange={set('name')} helper={f.name ? '✓ Tên hợp lệ' : undefined} error={f.name ? undefined : 'Vui lòng nhập họ và tên'} />
            <Field label="Email" value={user?.email ?? 'minhanh@example.com'} readOnly helper="Email dùng để đăng nhập" />
            <Field label="Số điện thoại" value={f.phone} onChange={set('phone')} helper={phoneOk ? '✓ 10 chữ số' : undefined} error={phoneOk ? undefined : 'Số điện thoại gồm 10 chữ số'} />
            <Field label="Ngày sinh" value={f.dob} onChange={set('dob')} />
            <Button type="submit" className="w-fit">
              Lưu thông tin
            </Button>
          </Panel>
        </form>
        <aside className="flex h-fit flex-col gap-4 rounded-card border border-line bg-surface p-6 xl:w-[352px] xl:shrink-0">
          <h2 className="text-xl font-semibold leading-7 text-fg">{f.name}</h2>
          <p className="text-sm font-medium text-muted">Customer · Thành viên từ 10/2026</p>
          <p className="text-sm font-medium text-fg">{user?.email ?? 'minhanh@example.com'}</p>
          <Button to="/tickets" variant="secondary" block>
            Vé của tôi
          </Button>
          <Button
            variant="ghost"
            block
            onClick={() => {
              logout()
              nav('/login')
            }}
          >
            Đăng xuất
          </Button>
        </aside>
      </div>
    </Page>
  )
}
