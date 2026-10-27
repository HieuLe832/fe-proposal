import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ALink, AdminHead, Dot, PillSelect } from '../../components/AdminLayout'
import { Row } from '../../components/OrderSummary'
import { Callout, Message } from '../../components/Layout'
import { Button, Chip, cx, Dialog, Field, Table, vnd } from '../../ui'

/* ───────────── 07 Showtimes ───────────── */
const week = [['T2', '26/10'], ['T3', '27/10'], ['T4', '28/10'], ['T5', '29/10'], ['T6', '30/10'], ['T7', '31/10'], ['CN', '01/11']]
const roomSlots = [
  ['Phòng 01', '17:00–18:46', 'Thành Phố Mây', '●  Đang mở bán · Đệm 15 phút'],
  ['Phòng 02', '20:15–22:19', 'Mật Mã Đại Dương', '◷  Tạm dừng bán · Đệm 15 phút'],
  ['Phòng 03', '19:30–21:28', 'Chuyến Tàu Cuối', '●  Đang mở bán · Đệm 15 phút'],
]
const showRows = [
  ['Chuyến Tàu Cuối', 'Central · 03', '26/10 · 19:30', 'open'],
  ['Thành Phố Mây', 'Central · 01', '26/10 · 17:00', 'open'],
  ['Mật Mã Đại Dương', 'Central · 02', '26/10 · 20:15', 'paused'],
  ['Chuyến Tàu Cuối', 'Central · 03', '26/10 · 22:00', 'open'],
] as const

export function Showtimes() {
  const nav = useNavigate()
  const [day, setDay] = useState(0)
  const [view, setView] = useState<'list' | 'week'>('list')
  const [cinema, setCinema] = useState('CineGo Central')
  const [paused, setPaused] = useState<Record<number, boolean>>({ 2: true })
  return (
    <>
      <AdminHead title="Lịch chiếu" />
      <div className="flex flex-wrap gap-3">
        <PillSelect label="Rạp" value={cinema} onChange={setCinema} options={['CineGo Central', 'CineGo Riverside', 'CineGo West']} />
        <PillSelect label="Phim" value="Tất cả phim" onChange={() => {}} options={['Tất cả phim']} />
        <Button className="h-11" variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
          Danh sách
        </Button>
        <Button className="h-11" variant={view === 'week' ? 'primary' : 'secondary'} onClick={() => setView('week')}>
          Lịch tuần
        </Button>
        <Button className="h-11" onClick={() => nav('/admin/showtimes/new')}>
          ＋ Tạo suất chiếu
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7" role="tablist">
        {week.map(([d, date], i) => (
          <button
            key={d}
            role="tab"
            aria-selected={day === i}
            onClick={() => setDay(i)}
            className={cx('flex cursor-pointer flex-col items-center rounded-control py-3 text-sm font-medium', day === i ? 'bg-primary text-on-primary' : 'bg-raised text-fg hover:brightness-110')}
          >
            <span className="text-xs">{d}</span>
            {date}
          </button>
        ))}
      </div>
      <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold leading-7">
          {day === 0 ? 'Thứ hai' : `${week[day][0] === 'CN' ? 'Chủ nhật' : 'Thứ ' + (day + 1)}`}, {week[day][1].split('/')[0]} tháng {week[day][1].split('/')[1]} · Lịch phòng
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {roomSlots.map(([room, time, film, note]) => (
            <div key={room} className="flex flex-col gap-2 rounded-card bg-raised p-4">
              <span className="text-xs text-muted">{room}</span>
              <span className="text-xl font-semibold">{time}</span>
              <span className="text-sm font-medium">{film}</span>
              <span className="text-xs text-muted">{note}</span>
            </div>
          ))}
        </div>
      </section>
      {view === 'week' ? (
        <section className="grid grid-cols-7 gap-2 rounded-card border border-line bg-surface p-4 text-center text-xs">
          {week.map(([d, date], i) => (
            <button key={d} onClick={() => setDay(i)} className={cx('cursor-pointer rounded-control p-3', day === i ? 'bg-raised text-fg' : 'text-muted hover:bg-raised')}>
              <span className="block font-medium">{d} {date}</span>
              <span className="text-lg font-semibold text-gold">{[12, 11, 12, 10, 14, 16, 15][i]}</span> suất
            </button>
          ))}
        </section>
      ) : (
        <Table
          head={['Phim / Định dạng', 'Rạp / Phòng', 'Ngày / Giờ', 'Giá Standard', 'Trạng thái', 'Thao tác']}
          rows={showRows.map((r, i) => [
            <span key="f" className="leading-5">
              {r[0]}
              <br />
              2D phụ đề
            </span>,
            r[1],
            r[2],
            '90.000đ',
            paused[i] ? <Dot tone="warning">Tạm dừng</Dot> : <Dot tone="success">Mở bán</Dot>,
            <span key="a">
              <ALink onClick={() => setPaused((p) => ({ ...p, [i]: !p[i] }))}>{paused[i] ? 'Mở bán' : 'Chi tiết'}</ALink> · <ALink>Sửa</ALink>
            </span>,
          ])}
          footer={<span>Hiển thị 1–4 / 12 suất · Central &nbsp; ‹ &nbsp;1&nbsp; 2&nbsp; 3&nbsp; ›</span>}
        />
      )}
    </>
  )
}

/* ───────────── 08 / 09 Create showtime ───────────── */
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const fromMin = (n: number) => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
const FILM_MIN = 118
const CLEAN = 15
const EXISTING = { start: '19:30', end: '21:28', ready: '21:43' }

export function CreateShowtime() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [start, setStart] = useState(params.get('state') === 'overlap' ? '20:00' : '19:30')
  const [prices, setPrices] = useState({ std: '90000', vip: '120000', couple: '180000' })
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(start)
  const end = valid ? fromMin(toMin(start) + FILM_MIN) : '—'
  const ready = valid ? fromMin(toMin(start) + FILM_MIN + CLEAN) : '—'
  // The 19:30 slot is the sample template for this room; any other overlapping start conflicts with it.
  const conflict = valid && start !== EXISTING.start && toMin(start) < toMin(EXISTING.ready) && toMin(start) + FILM_MIN + CLEAN > toMin(EXISTING.start)
  const overlapMin = conflict ? Math.min(toMin(end), toMin(EXISTING.end)) - Math.max(toMin(start), toMin(EXISTING.start)) : 0
  const priceOk = Object.values(prices).every((p) => Number(p) > 0)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!conflict && valid && priceOk) nav('/admin/showtimes')
  }

  return (
    <>
      <AdminHead title="Tạo suất chiếu" />
      <form onSubmit={submit} noValidate className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          {conflict && (
            <Callout tone="error" glyph="⊗" title="Không thể lưu · Suất chiếu bị chồng lịch">
              <p>
                Phòng 03 đã có lịch {EXISTING.start}–{EXISTING.end}. Suất mới {start}–{end} giao nhau {overlapMin} phút.
              </p>
            </Callout>
          )}
          <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">Thông tin suất chiếu</h2>
            <Field label="Phim *" value="Chuyến Tàu Cuối · 118 phút" readOnly />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rạp *" value="CineGo Central" readOnly />
              <Field label="Phòng *" value="Phòng 03 · 120 ghế" readOnly />
              <Field label="Ngày chiếu *" value="26/10/2026" readOnly />
              <Field label="Định dạng" value="2D phụ đề" readOnly />
              <Field label="Giờ bắt đầu *" value={start} onChange={(e) => setStart(e.target.value)} placeholder="HH:MM" error={conflict ? `Trùng lịch. Chọn từ ${EXISTING.ready}.` : !valid ? 'Nhập giờ dạng HH:MM' : undefined} helper={`Thời lượng phim: ${FILM_MIN} phút`} />
              <Field label="Giờ kết thúc (tự tính)" value={end} readOnly helper={`Cộng thêm ${CLEAN} phút dọn phòng`} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Standard / vé *" inputMode="numeric" value={prices.std} onChange={(e) => setPrices((p) => ({ ...p, std: e.target.value }))} helper={vnd(Number(prices.std) || 0)} />
              <Field label="VIP / vé *" inputMode="numeric" value={prices.vip} onChange={(e) => setPrices((p) => ({ ...p, vip: e.target.value }))} helper={vnd(Number(prices.vip) || 0)} />
              <Field label="Couple / cặp *" inputMode="numeric" value={prices.couple} onChange={(e) => setPrices((p) => ({ ...p, couple: e.target.value }))} helper={vnd(Number(prices.couple) || 0)} />
            </div>
            <p className="text-xs text-muted">Giá VND phải lớn hơn 0. Kiểm tra lịch bao gồm phim và 15 phút dọn phòng.</p>
          </section>
          <div className="flex gap-3">
            <Button type="submit" disabled={conflict || !valid || !priceOk}>
              Lưu suất chiếu
            </Button>
            <Button type="button" variant="secondary" onClick={() => nav('/admin/showtimes')}>
              Hủy
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <aside className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">{conflict ? 'Lịch đang xung đột' : 'Xem trước suất chiếu'}</h2>
            <p className="text-xl font-semibold leading-7">Chuyến Tàu Cuối</p>
            {conflict ? (
              <>
                <Row k="Rạp / Phòng" v="CineGo Central · 03" />
                <Row k="Ngày" v="26/10/2026" />
                <Row k="Đã lên lịch" v={`${EXISTING.start}–${EXISTING.end}`} />
                <Row k="Dọn phòng" v={`${EXISTING.end}–${EXISTING.ready}`} />
                <Row k="Suất đề xuất" v={`${start}–${end}`} />
                <p className="text-sm text-fg">{FILM_MIN} phút phim + {CLEAN} phút đệm. Khóa lưu cho đến khi hết chồng lịch.</p>
              </>
            ) : (
              <>
                <Row k="Phòng" v="Central · 03" />
                <Row k="Bắt đầu" v={`26/10 · ${start}`} />
                <Row k="Kết thúc" v={end} />
                <Row k="Phòng sẵn sàng" v={ready} />
                <Row k="Sức chứa" v="120 vị trí" />
                <p className="text-xs text-muted">72 Standard · 24 VIP · 12 cặp Couple (24 vị trí)</p>
              </>
            )}
          </aside>
          {conflict ? (
            <Callout tone="warning" glyph="⚠" title={`Điều chỉnh giờ bắt đầu: ${EXISTING.ready}`}>
              <p>Kết thúc phim mới lúc {fromMin(toMin(EXISTING.ready) + FILM_MIN)}.</p>
              <p>Phòng sẵn sàng lại lúc {fromMin(toMin(EXISTING.ready) + FILM_MIN + CLEAN)}.</p>
              <p>Hoặc chọn phòng hay ngày khác.</p>
              <Button type="button" size="sm" className="mt-3" onClick={() => setStart(EXISTING.ready)}>
                Dùng {EXISTING.ready}
              </Button>
            </Callout>
          ) : (
            <Message tone={valid ? 'success' : 'warning'} title={valid ? 'Khung giờ hợp lệ' : 'Giờ chưa hợp lệ'}>
              {valid ? 'Không chồng lịch trong dữ liệu ví dụ. Có thể lưu suất chiếu.' : 'Nhập giờ bắt đầu dạng HH:MM.'}
            </Message>
          )}
          <p className="text-xs text-muted">{conflict ? 'Đề xuất chỉ hướng dẫn; chưa tự thay đổi giờ bạn đã nhập.' : 'Bản xem trước tĩnh · Chưa tạo suất chiếu thật.'}</p>
        </div>
      </form>
    </>
  )
}

/* ───────────── 10 Food & prices ───────────── */
type Item = { name: string; cat: string; price: number; on: boolean }
const initialFood: Item[] = [
  { name: 'Combo Đôi · 1 bắp lớn + 2 nước', cat: 'Combo', price: 85000, on: true },
  { name: 'Combo Một Người · 1 bắp + 1 nước', cat: 'Combo', price: 65000, on: true },
  { name: 'Bắp rang lớn', cat: 'Bắp rang', price: 45000, on: true },
  { name: 'Bắp phô mai', cat: 'Bắp rang', price: 50000, on: true },
  { name: 'Nước ngọt lớn', cat: 'Đồ uống', price: 30000, on: true },
  { name: 'Trà đào', cat: 'Đồ uống', price: 35000, on: false },
]

export function Food() {
  const [items, setItems] = useState(initialFood)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Danh mục')
  const [st, setSt] = useState('Tình trạng')
  const [edit, setEdit] = useState<{ i: number | 'seat'; value: string } | null>(null)
  const [seat, setSeat] = useState({ std: 90000, vip: 120000, couple: 180000 })
  const list = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => it.name.toLowerCase().includes(q.toLowerCase()) && (cat === 'Danh mục' || it.cat === cat) && (st === 'Tình trạng' || (st === 'Đang bán') === it.on))

  function save() {
    if (!edit) return
    const v = Number(edit.value.replace(/\D/g, ''))
    if (!(v > 0)) return
    if (edit.i === 'seat') setSeat((s) => ({ ...s, std: v }))
    else setItems((its) => its.map((it, k) => (k === edit.i ? { ...it, price: v } : it)))
    setEdit(null)
  }

  return (
    <>
      <AdminHead title="Đồ ăn & giá bán" />
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-full sm:w-[300px]" label="Tìm sản phẩm" placeholder="Tên món hoặc mã sản phẩm" value={q} onChange={(e) => setQ(e.target.value)} />
        <PillSelect label="Danh mục" value={cat} onChange={setCat} options={['Danh mục', 'Combo', 'Bắp rang', 'Đồ uống']} />
        <PillSelect label="Tình trạng" value={st} onChange={setSt} options={['Tình trạng', 'Đang bán', 'Tạm hết']} />
        <Button className="h-11">＋ Thêm sản phẩm</Button>
      </div>
      <Table
        head={['Mặt hàng / Thành phần', 'Danh mục', 'Giá bán', 'Khả dụng', 'Thao tác']}
        rows={list.map(({ it, i }) => [
          it.name,
          it.cat,
          vnd(it.price),
          it.on ? <Dot tone="success">Đang bán</Dot> : <Dot tone="warning">Tạm hết</Dot>,
          <span key="a">
            <ALink onClick={() => setEdit({ i, value: String(it.price) })}>Sửa giá</ALink> · <ALink onClick={() => setItems((its) => its.map((x, k) => (k === i ? { ...x, on: !x.on } : x)))}>{it.on ? 'Tạm ẩn' : 'Mở bán'}</ALink>
          </span>,
        ])}
        footer={<span>Hiển thị 1–{list.length} / 12 sản phẩm &nbsp; ‹ &nbsp;1&nbsp; 2&nbsp; ›</span>}
      />
      <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold leading-7">Giá ghế mặc định</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <Row k="Standard / vé" v={vnd(seat.std)} />
            <Row k="VIP / vé" v={vnd(seat.vip)} />
            <Row k="Couple / cặp" v={vnd(seat.couple)} />
          </div>
          <Button variant="secondary" onClick={() => setEdit({ i: 'seat', value: String(seat.std) })}>
            Sửa giá
          </Button>
        </div>
        <p className="text-xs text-muted">Giá VND minh họa · Không phí bổ sung · Giá suất chiếu được cấu hình riêng khi tạo lịch.</p>
      </section>
      <Dialog open={!!edit} title="Sửa giá" description="Giá VND phải lớn hơn 0." onClose={() => setEdit(null)}>
        {edit && (
          <div className="flex flex-col gap-4">
            <Field label="Giá bán (VND)" inputMode="numeric" autoFocus value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} error={Number(edit.value) > 0 ? undefined : 'Giá phải lớn hơn 0'} />
            <div className="flex gap-3">
              <Button onClick={save}>Lưu giá</Button>
              <Button variant="secondary" onClick={() => setEdit(null)}>
                Hủy
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}

/* ───────────── 11 / 12 Bookings ───────────── */
type Booking = { code: string; guest: string; film: string; slot: string; seats: string; total: number; pay: 'paid' | 'pending' | 'none' | 'failed'; state: string }
const bookings: Booking[] = [
  { code: 'CG102601', guest: 'Nguyễn Minh Anh', film: 'Chuyến Tàu Cuối', slot: '26/10 · 19:30 · Central 03', seats: 'F07, F08', total: 265000, pay: 'paid', state: 'Đã xác nhận' },
  { code: 'CG102602', guest: 'Trần Hoàng Nam', film: 'Thành Phố Mây', slot: '26/10 · 17:00 · Central 01', seats: 'C03, C04', total: 180000, pay: 'pending', state: 'Chờ xử lý' },
  { code: 'CG102603', guest: 'Lê Thu Hà', film: 'Mật Mã Đại Dương', slot: '26/10 · 20:15 · Central 02', seats: 'G05, G06', total: 240000, pay: 'paid', state: 'Đã xác nhận' },
  { code: 'CG102604', guest: 'Phạm Bảo An', film: 'Khu Vườn Sao', slot: '26/10 · 16:00 · Riverside 01', seats: 'A01, A02', total: 180000, pay: 'none', state: 'Đã hủy' },
  { code: 'CG102605', guest: 'Đỗ Quỳnh Chi', film: 'Tần Số Lạ', slot: '26/10 · 21:00 · West 01', seats: 'E03, E04', total: 245000, pay: 'paid', state: 'Đã xác nhận' },
  { code: 'CG102606', guest: 'Vũ Đức Anh', film: 'Bên Kia Bình Minh', slot: '26/10 · 18:00 · West 02', seats: 'B01, B02', total: 180000, pay: 'failed', state: 'Hết hạn giữ' },
]
const payLabel = (b: Booking): ReactNode =>
  b.pay === 'paid' ? <Dot tone="success">Đã thanh toán</Dot> : b.pay === 'pending' ? <Dot tone="warning">Chờ thanh toán</Dot> : b.pay === 'none' ? 'Không thu tiền' : 'Thất bại mô phỏng'

export function Bookings() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [pay, setPay] = useState('Thanh toán')
  const [state, setState] = useState('Trạng thái đơn')
  const [applied, setApplied] = useState({ q: '', pay: 'Thanh toán', state: 'Trạng thái đơn' })
  const payMap: Record<string, Booking['pay']> = { 'Đã thanh toán': 'paid', 'Chờ thanh toán': 'pending', 'Không thu tiền': 'none', 'Thất bại': 'failed' }
  const list = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (b.code + b.guest).toLowerCase().includes(applied.q.toLowerCase()) &&
          (applied.pay === 'Thanh toán' || payMap[applied.pay] === b.pay) &&
          (applied.state === 'Trạng thái đơn' || b.state === applied.state),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applied],
  )
  return (
    <>
      <AdminHead title="Đơn đặt vé" />
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-full sm:w-[326px]" label="Tìm đơn hàng" placeholder="Mã đặt vé hoặc tên khách hàng" value={q} onChange={(e) => setQ(e.target.value)} />
        <PillSelect label="Ngày" value="26/10/2026" onChange={() => {}} options={['26/10/2026']} />
        <PillSelect label="Rạp" value="Tất cả rạp" onChange={() => {}} options={['Tất cả rạp']} />
        <Button className="h-11" onClick={() => setApplied({ q, pay, state })}>
          Lọc đơn
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PillSelect label="Thanh toán" value={pay} onChange={setPay} options={['Thanh toán', ...Object.keys(payMap)]} />
        <PillSelect label="Trạng thái đơn" value={state} onChange={setState} options={['Trạng thái đơn', 'Đã xác nhận', 'Chờ xử lý', 'Đã hủy', 'Hết hạn giữ']} />
        <span className="text-sm text-muted">Thanh toán và trạng thái đơn được theo dõi độc lập.</span>
      </div>
      <Table
        head={['Mã đơn / Khách', 'Phim / Suất chiếu', 'Ghế', 'Tổng tiền', 'Thanh toán mẫu', 'Đơn / Thao tác']}
        rows={list.map((b) => [
          <span key="c" className="leading-5">
            {b.code}
            <br />
            {b.guest}
          </span>,
          <span key="f" className="leading-5">
            {b.film}
            <br />
            {b.slot}
          </span>,
          b.seats,
          vnd(b.total),
          payLabel(b),
          <span key="a" className="whitespace-nowrap">
            <span className="text-info">{b.state}</span> · <ALink onClick={() => nav(`/admin/bookings/${b.code}`)}>Xem</ALink>
          </span>,
        ])}
        footer={<span>Hiển thị 1–{list.length} / 24 đơn ngày 26/10/2026 &nbsp; ‹ &nbsp;1&nbsp; 2&nbsp; 3&nbsp; 4&nbsp; ›</span>}
      />
      {list.length === 0 && <p className="text-center text-sm text-muted">Không có đơn phù hợp bộ lọc.</p>}
      <p className="text-xs text-muted">Mọi số tiền và trạng thái thanh toán là dữ liệu mô phỏng học thuật; không thu tiền thật.</p>
    </>
  )
}

export function BookingDetail() {
  const { code = 'CG102601' } = useParams()
  const nav = useNavigate()
  const b = bookings.find((x) => x.code === code) ?? bookings[0]
  const confirmed = b.state === 'Đã xác nhận'
  const log: [string, string, boolean][] = [
    ['18:40:00', 'Tạo đơn · Giữ ghế ' + b.seats.replace(', ', '/'), false],
    ['18:41:12', `Thêm Combo Đôi · Tổng ${vnd(b.total)}`, false],
    ['18:42:08', 'Gửi yêu cầu thanh toán mẫu', false],
    ['18:42:10', b.pay === 'paid' ? 'Thành công mô phỏng · Phát hành vé' : b.pay === 'pending' ? 'Đang chờ kết quả mô phỏng' : 'Không hoàn tất · Không phát hành vé', b.pay === 'paid'],
  ]
  return (
    <>
      <AdminHead title="Chi tiết đơn đặt vé" />
      <div className="flex flex-wrap gap-3 text-xs">
        <span className={cx('rounded-control bg-raised px-3 py-2', confirmed ? 'text-success' : 'text-warning')}>{confirmed ? '✓' : '◷'} Đơn {b.state.toLowerCase()}</span>
        <span className={cx('rounded-control bg-raised px-3 py-2', b.pay === 'paid' ? 'text-success' : 'text-warning')}>{b.pay === 'paid' ? '✓ Đã thanh toán mô phỏng' : '◷ Chưa thanh toán'}</span>
        {b.pay === 'paid' && <span className="rounded-control bg-raised px-3 py-2 text-success">□ Vé hợp lệ · Chưa dùng</span>}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">Đơn đặt vé {b.code}</h2>
            <Row k="Khách hàng" v={b.guest} />
            <Row k="Liên hệ" v="minhanh@example.com · 090 ••• ••42" />
            <div className="my-2 h-px bg-line" />
            <h2 className="text-xl font-semibold leading-7">{b.film}</h2>
            <p className="text-sm font-semibold">Phiêu lưu / Bí ẩn · T13 · 118 phút · 2D phụ đề</p>
            <Row k="Rạp / Phòng" v={`CineGo ${b.slot.split('· ')[2]}`} />
            <Row k="Suất chiếu" v={`26/10/2026 · ${b.slot.split(' · ')[1]}`} />
            <Row k="Ghế Standard" v={b.seats.replace(', ', ' / ')} />
            <div className="my-2 h-px bg-line" />
            <Row k="2 vé × 90.000đ" v="180.000đ" />
            <Row k="Combo Đôi × 1" v="85.000đ" />
            <p className="text-xs text-muted">Đồ ăn: 1 bắp rang lớn + 2 nước ngọt lớn</p>
            <Row k="Phí bổ sung" v="0đ" />
            <div className="my-2 h-px bg-line" />
            <Row k="Tổng thanh toán mô phỏng" v={vnd(b.total)} strong />
          </section>
          <Message tone={confirmed ? 'success' : 'warning'} title={confirmed ? 'Vé hợp lệ · Chưa check-in' : 'Chưa phát hành vé'}>
            {confirmed ? `${b.code} chưa ghi nhận sử dụng. Nhân viên cần kiểm tra đúng phòng và suất trước khi xác nhận.` : `${b.code} chưa có vé hợp lệ vì đơn ${b.state.toLowerCase()}.`}
          </Message>
        </div>
        <div className="flex flex-col gap-4">
          <aside className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">Nhật ký thanh toán mẫu</h2>
            {log.map(([t, msg, ok]) => (
              <div key={t} className="border-b border-line pb-3 text-sm">
                <p className={cx('font-medium', ok ? 'text-success' : 'text-fg')}>✓ {t} · 26/10/2026</p>
                <p className="text-muted">{msg}</p>
              </div>
            ))}
            <Row k="Phương thức" v="Thẻ kiểm thử" />
            <Row k="Mã tham chiếu" v={`SIM-${b.code}`} />
          </aside>
          <Message tone="info" title="Không phải chứng từ tài chính">
            Không có giao dịch thật. Nhật ký này chỉ minh họa luồng học thuật.
          </Message>
          <Button variant="secondary" block onClick={() => nav('/admin/bookings')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    </>
  )
}

/* ───────────── 13 Users ───────────── */
type User = { name: string; email: string; role: 'Customer' | 'Staff' | 'Admin'; active: boolean; protectedAdmin?: boolean }
const initialUsers: User[] = [
  { name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', role: 'Customer', active: true },
  { name: 'Trần Ngọc Mai', email: 'ngocmai@example.com', role: 'Staff', active: true },
  { name: 'Lê Gia Huy · Bạn', email: 'giahuy@example.com', role: 'Admin', active: true, protectedAdmin: true },
  { name: 'Trần Hoàng Nam', email: 'hoangnam@example.com', role: 'Customer', active: true },
  { name: 'Lê Thu Hà', email: 'thuha@example.com', role: 'Customer', active: false },
  { name: 'Phạm Bảo An', email: 'baoan@example.com', role: 'Staff', active: false },
]

export function Users() {
  const [users, setUsers] = useState(initialUsers)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('Vai trò')
  const [st, setSt] = useState('Trạng thái')
  const [edit, setEdit] = useState<number | null>(null)
  const list = users.map((u, i) => ({ u, i })).filter(({ u }) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()) && (role === 'Vai trò' || u.role === role) && (st === 'Trạng thái' || (st === 'Hoạt động') === u.active))
  return (
    <>
      <AdminHead title="Người dùng" />
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-full sm:w-[300px]" label="Tìm người dùng" placeholder="Tên hoặc email" value={q} onChange={(e) => setQ(e.target.value)} />
        <PillSelect label="Vai trò" value={role} onChange={setRole} options={['Vai trò', 'Customer', 'Staff', 'Admin']} />
        <PillSelect label="Trạng thái" value={st} onChange={setSt} options={['Trạng thái', 'Hoạt động', 'Tạm ngưng']} />
        <Button className="h-11">＋ Thêm người dùng</Button>
      </div>
      <Table
        head={['Họ và tên', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác']}
        rows={list.map(({ u, i }) => [
          u.name,
          u.email,
          u.protectedAdmin ? 'Admin · Bảo vệ' : u.role,
          u.active ? <Dot tone="success">Hoạt động</Dot> : <Dot tone="muted">Tạm ngưng</Dot>,
          u.protectedAdmin ? (
            <ALink onClick={() => setEdit(i)}>Xem quyền quản trị</ALink>
          ) : (
            <span key="a">
              <ALink onClick={() => setEdit(i)}>Sửa quyền</ALink> · <ALink onClick={() => setUsers((us) => us.map((x, k) => (k === i ? { ...x, active: !x.active } : x)))}>{u.active ? 'Khóa' : 'Mở'}</ALink>
            </span>
          ),
        ])}
        footer={<span>Hiển thị 1–{list.length} / 42 người dùng &nbsp; ‹ &nbsp;1&nbsp; 2&nbsp; 3&nbsp; …&nbsp; 7&nbsp; ›</span>}
      />
      <Callout tone="warning" glyph="⚠" title="Quyền Admin là quyền nhạy cảm">
        <p>Chỉ Admin được phân quyền. Yêu cầu xác thực lại và xác nhận trước khi đổi vai trò; không tự khóa tài khoản đang đăng nhập hoặc hạ quyền Admin cuối cùng.</p>
      </Callout>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          ['Customer', 'Đặt vé, thanh toán mô phỏng, quản lý vé cá nhân.'],
          ['Staff', 'Kiểm tra vé đúng suất và xác nhận check-in.'],
          ['Admin', 'Quản lý danh mục, lịch chiếu, đơn và phân quyền.'],
        ].map(([t, d]) => (
          <section key={t} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
            <h2 className="text-xl font-semibold leading-7">{t}</h2>
            <p className="text-sm text-muted">{d}</p>
          </section>
        ))}
      </div>
      <Dialog open={edit !== null} title={edit !== null && users[edit].protectedAdmin ? 'Quyền quản trị' : 'Sửa quyền'} description={edit !== null ? `${users[edit].name} · ${users[edit].email}` : ''} onClose={() => setEdit(null)}>
        {edit !== null && (
          <div className="flex flex-col gap-4">
            {users[edit].protectedAdmin ? (
              <Message tone="warning" title="Tài khoản được bảo vệ">
                Không thể hạ quyền hoặc khóa tài khoản Admin đang đăng nhập.
              </Message>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(['Customer', 'Staff', 'Admin'] as const).map((r) => (
                  <Chip
                    key={r}
                    selected={users[edit].role === r}
                    onClick={() => setUsers((us) => us.map((x, k) => (k === edit ? { ...x, role: r } : x)))}
                  >
                    {r}
                  </Chip>
                ))}
              </div>
            )}
            <Button variant="secondary" onClick={() => setEdit(null)}>
              Đóng
            </Button>
          </div>
        )}
      </Dialog>
    </>
  )
}
