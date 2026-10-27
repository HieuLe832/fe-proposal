import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ALink, AdminHead, Dot, PillSelect } from '../../components/AdminLayout'
import { Message } from '../../components/Layout'
import { movies } from '../../data'
import { Button, cx, Field, Table } from '../../ui'

/* ───────────── 03 Movies management ───────────── */
type Status = 'now' | 'soon' | 'hidden'
const initial: Record<string, Status> = Object.fromEntries(movies.map((m) => [m.id, 'now' as Status]))
initial['mua-he-cua-gio'] = 'hidden'
initial['hanh-tinh-nho'] = 'soon'
initial['duoi-anh-den'] = 'soon'

export function Movies() {
  const nav = useNavigate()
  const [status, setStatus] = useState(initial)
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState('Trạng thái')
  const [fGenre, setFGenre] = useState('Thể loại')
  const genres = ['Thể loại', ...new Set(movies.map((m) => m.genre))]
  const list = useMemo(
    () =>
      movies.filter(
        (m) =>
          m.title.toLowerCase().includes(q.toLowerCase()) &&
          (fGenre === 'Thể loại' || m.genre === fGenre) &&
          (fStatus === 'Trạng thái' || { 'Đang chiếu': 'now', 'Sắp chiếu': 'soon', 'Đã ẩn': 'hidden' }[fStatus] === status[m.id]),
      ),
    [q, fGenre, fStatus, status],
  )
  const count = (s: Status) => Object.values(status).filter((x) => x === s).length

  return (
    <>
      <AdminHead title="Quản lý phim" />
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-full sm:w-[314px]" label="Tìm phim" placeholder="Tên phim hoặc mã phim" value={q} onChange={(e) => setQ(e.target.value)} />
        <PillSelect label="Trạng thái" value={fStatus} onChange={setFStatus} options={['Trạng thái', 'Đang chiếu', 'Sắp chiếu', 'Đã ẩn']} />
        <PillSelect label="Thể loại" value={fGenre} onChange={setFGenre} options={genres} />
        <Button className="h-11" onClick={() => nav('/admin/movies/new')}>
          ＋ Thêm phim
        </Button>
      </div>
      <p className="text-sm text-muted">
        {movies.length} phim hư cấu · {count('now')} đang chiếu · {count('soon')} sắp chiếu · {count('hidden')} đã ẩn
      </p>
      <Table
        head={['Tên phim', 'Thể loại', 'Thời lượng', 'Độ tuổi', 'Trạng thái', 'Thao tác']}
        rows={list.map((m) => [
          m.title,
          m.genre,
          `${m.minutes} phút`,
          <span key="r" className="inline-block rounded-control bg-raised px-3 py-2 text-xs text-gold">
            {m.rating}
          </span>,
          status[m.id] === 'now' ? <Dot tone="success">Đang chiếu</Dot> : status[m.id] === 'soon' ? <Dot tone="warning">Sắp chiếu</Dot> : <Dot tone="muted">Đã ẩn</Dot>,
          <span key="a" className="whitespace-nowrap">
            <ALink to={`/admin/movies/${m.id}/edit`}>Sửa</ALink> · <ALink onClick={() => setStatus((s) => ({ ...s, [m.id]: s[m.id] === 'hidden' ? 'now' : 'hidden' }))}>{status[m.id] === 'hidden' ? 'Hiện' : 'Ẩn'}</ALink>
          </span>,
        ])}
        footer={
          <span>
            Hiển thị {list.length ? `1–${list.length}` : '0'} / {movies.length} phim &nbsp; ‹ &nbsp;1&nbsp; ›
          </span>
        }
      />
    </>
  )
}

/* ───────────── 04 Add / edit movie ───────────── */
export function MovieForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const movie = movies.find((m) => m.id === id)
  const [f, setF] = useState({
    title: movie?.title ?? '',
    genre: movie?.genre ?? '',
    minutes: movie ? String(movie.minutes) : '',
    rating: movie ? `${movie.rating} · Từ ${movie.rating.replace(/\D/g, '') || '0'} tuổi` : 'T13 · Từ 13 tuổi',
    date: '26/10/2026',
    summary: movie ? 'Một chuyến tàu rời thành phố lúc nửa đêm. Hai người xa lạ lần theo những bí mật trước khi bình minh khép lại hành trình.' : '',
    cast: movie ? 'Lâm Khánh · An Nhiên · Hoàng Duy' : '',
    trailer: movie ? 'https://example.com/cinego/trailer' : '',
  })
  const [pub, setPub] = useState('Đang chiếu')
  const [touched, setTouched] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))

  const errs = {
    title: f.title ? '' : 'Vui lòng nhập tên phim',
    genre: f.genre ? '' : 'Vui lòng chọn thể loại',
    minutes: /^[1-9]\d*$/.test(f.minutes) ? '' : 'Thời lượng phải là số nguyên lớn hơn 0',
    summary: f.summary ? '' : 'Vui lòng nhập tóm tắt nội dung',
    trailer: !f.trailer || /^https:\/\//.test(f.trailer) ? '' : 'Chỉ chấp nhận https:// hoặc để trống',
  }
  const invalid = Object.values(errs).some(Boolean)
  const show = (k: keyof typeof errs) => (touched ? errs[k] : '')

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!invalid) nav('/admin/movies')
  }

  return (
    <>
      <AdminHead title={movie ? 'Chỉnh sửa phim' : 'Thêm phim'} />
      <form onSubmit={submit} noValidate className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">Thông tin phim</h2>
            <Field label="Tên phim *" value={f.title} onChange={set('title')} error={show('title')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thể loại *" value={f.genre} onChange={set('genre')} error={show('genre')} />
              <Field label="Thời lượng (phút) *" value={f.minutes} onChange={set('minutes')} error={show('minutes')} />
              <Field label="Phân loại độ tuổi *" value={f.rating} onChange={set('rating')} />
              <Field label="Ngày khởi chiếu" value={f.date} onChange={set('date')} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="summary" className="text-xs text-muted">
                Tóm tắt nội dung *
              </label>
              <textarea
                id="summary"
                rows={3}
                value={f.summary}
                onChange={set('summary')}
                className={cx('w-full resize-y rounded-control border bg-bg px-4 py-3 text-sm font-medium text-fg outline-none focus:border-primary', show('summary') ? 'border-danger' : 'border-line')}
              />
              {show('summary') && <p className="text-xs text-danger">{show('summary')}</p>}
            </div>
            <Field label="Diễn viên hư cấu" value={f.cast} onChange={set('cast')} />
            <Field label="Trailer URL (tùy chọn)" value={f.trailer} onChange={set('trailer')} error={show('trailer')} helper="URL mẫu minh họa, không phát video. Chấp nhận https:// hoặc để trống." />
          </section>
          <div className="flex gap-3">
            <Button type="submit">Lưu thay đổi</Button>
            <Button type="button" variant="secondary" onClick={() => nav('/admin/movies')}>
              Hủy
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">Poster minh họa</h2>
            <div className="flex aspect-[3/4] max-h-[260px] w-full flex-col justify-between rounded-lg p-5" style={{ backgroundImage: 'linear-gradient(to right, var(--hero-from), var(--hero-via) 48%, var(--hero-to))' }}>
              <p className="text-xs text-fg">CINEGO / PHIM HƯ CẤU</p>
              <span className="text-2xl text-muted">🖼︎＋</span>
              <p className="text-xl font-semibold text-fg">{f.title || 'Tên phim'}</p>
            </div>
            <Button type="button" variant="secondary" block>
              Tải poster mẫu
            </Button>
            <p className="text-xs text-muted">PNG/JPG · Tối đa 5 MB · Tỷ lệ 2:3. Không dùng poster thương mại.</p>
          </section>
          <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">Phát hành</h2>
            <PillSelect label="Trạng thái phát hành" value={pub} onChange={setPub} options={['Đang chiếu', 'Sắp chiếu', 'Đã ẩn']} />
            <p className="text-base text-muted">Trạng thái hiển thị trong danh mục khách hàng.</p>
          </section>
          <Message tone={touched && invalid ? 'error' : 'info'} title={touched && invalid ? 'Còn trường chưa hợp lệ' : 'Kiểm tra dữ liệu'}>
            Các trường * là bắt buộc. Thời lượng phải là số nguyên lớn hơn 0.
          </Message>
        </div>
      </form>
    </>
  )
}

/* ───────────── 05 Cinemas and rooms ───────────── */
const cinemaList = [
  { id: 'Central', addr: '12 Đường Ánh Sao, Quận 1, TP.HCM', rooms: 3, seats: 370 },
  { id: 'Riverside', addr: '28 Đường Bến Mây, Quận 7, TP.HCM', rooms: 2, seats: 240 },
  { id: 'West', addr: '45 Đường Gió Tây, Bình Tân, TP.HCM', rooms: 2, seats: 280 },
]
const rooms: Record<string, [string, string, string, string, 'ok' | 'maint'][]> = {
  Central: [['Phòng 01', '2D phụ đề', '150 ghế', 'Standard / VIP', 'ok'], ['Phòng 02', '2D lồng tiếng', '100 ghế', 'Standard / Couple', 'maint'], ['Phòng 03', '2D phụ đề', '120 ghế', 'Standard / VIP / Couple', 'ok']],
  Riverside: [['Phòng 01', '2D phụ đề', '140 ghế', 'Standard / VIP', 'ok'], ['Phòng 02', '2D lồng tiếng', '100 ghế', 'Standard / Couple', 'ok']],
  West: [['Phòng 01', '2D phụ đề', '160 ghế', 'Standard / VIP', 'ok'], ['Phòng 02', '2D phụ đề', '120 ghế', 'Standard / Couple', 'ok']],
}

export function Cinemas() {
  const nav = useNavigate()
  const [sel, setSel] = useState('Central')
  const [filter, setFilter] = useState('Tất cả cụm rạp')
  const [roomStatus, setRoomStatus] = useState('Trạng thái phòng')
  const shown = cinemaList.filter((c) => filter === 'Tất cả cụm rạp' || c.id === filter)
  const rr = rooms[sel].filter((r) => roomStatus === 'Trạng thái phòng' || (roomStatus === 'Hoạt động') === (r[4] === 'ok'))
  return (
    <>
      <AdminHead title="Rạp & phòng chiếu" />
      <div className="flex flex-wrap justify-between gap-3">
        <PillSelect label="Cụm rạp" value={filter} onChange={setFilter} options={['Tất cả cụm rạp', 'Central', 'Riverside', 'West']} />
        <Button className="h-11">＋ Thêm rạp / phòng</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {shown.map((c) => (
          <section key={c.id} className={cx('flex flex-col gap-4 rounded-card border bg-surface p-6', sel === c.id ? 'border-gold' : 'border-line')}>
            <h2 className="text-xl font-semibold leading-7">CineGo {c.id}</h2>
            <span className="text-muted" aria-hidden>
              🏢︎
            </span>
            <p className="text-sm text-muted">{c.addr}</p>
            <p className="text-xl font-semibold">
              {c.rooms} phòng · {c.seats} ghế
            </p>
            <p className="text-sm text-success">✓ Đang hoạt động</p>
            <Button variant="secondary" block onClick={() => setSel(c.id)}>
              Quản lý phòng
            </Button>
          </section>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold leading-7">Phòng chiếu tại CineGo {sel}</h2>
        <PillSelect label="Trạng thái phòng" value={roomStatus} onChange={setRoomStatus} options={['Trạng thái phòng', 'Hoạt động', 'Bảo trì']} />
      </div>
      <Table
        head={['Phòng', 'Định dạng', 'Sức chứa', 'Loại ghế', 'Trạng thái', 'Thao tác']}
        rows={rr.map((r) => [
          r[0],
          r[1],
          r[2],
          r[3],
          r[4] === 'ok' ? <Dot tone="success">Hoạt động</Dot> : <Dot tone="warning">Bảo trì</Dot>,
          <span key="a">
            <ALink>Sửa</ALink> · <ALink onClick={() => nav('/admin/seat-layout')}>Sơ đồ</ALink>
          </span>,
        ])}
        footer={<span>Hiển thị 1–{rr.length} / {rr.length} phòng &nbsp; ‹ &nbsp;1&nbsp; ›</span>}
      />
      <p className="text-xs text-muted">Địa chỉ hư cấu · Sức chứa tính theo vị trí ngồi · Couple bán theo cặp.</p>
    </>
  )
}

/* ───────────── 06 Seat-layout editor ───────────── */
type Cell = 'std' | 'vip' | 'couple' | 'none'
const ROWS = 'ABCDEFGHIJ'.split('')
const COLS = 12
const idx = (r: string, c: number) => `${r}${String(c).padStart(2, '0')}`
const defaultGrid = (): Record<string, Cell> => {
  const g: Record<string, Cell> = {}
  for (const r of ROWS) for (let c = 1; c <= COLS; c++) g[idx(r, c)] = 'AF'.includes(r) || 'BCDE'.includes(r) ? 'std' : 'GH'.includes(r) ? 'vip' : 'couple'
  return g
}

export function SeatLayout() {
  const nav = useNavigate()
  const [grid, setGrid] = useState(defaultGrid)
  const [tool, setTool] = useState<Cell>('std')
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)
  const n = (t: Cell) => Object.values(grid).filter((x) => x === t).length
  const cap = n('std') + n('vip') + n('couple')

  function paint(r: string, c: number) {
    setSaved(false)
    setGrid((g) => {
      const next = { ...g }
      const mate = c % 2 === 1 ? c + 1 : c - 1
      const wasCouple = g[idx(r, c)] === 'couple'
      next[idx(r, c)] = tool
      if (tool === 'couple' || wasCouple) {
        if (tool === 'couple' && mate >= 1 && mate <= COLS) next[idx(r, mate)] = 'couple'
        else if (wasCouple && mate >= 1 && mate <= COLS) next[idx(r, mate)] = tool === 'none' ? 'none' : tool
      }
      return next
    })
  }

  const tools: [Cell, string][] = [['std', '□ Standard'], ['vip', '◇ VIP'], ['couple', '↔ Couple'], ['none', '× Xóa vị trí']]

  return (
    <>
      <AdminHead title="Thiết kế sơ đồ ghế" />
      <div className="grid items-start gap-6 xl:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold leading-7">Thiết lập</h2>
            <p className="text-sm font-medium text-muted">Central · Phòng 03</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Số hàng" value="10" readOnly />
              <Field label="Số cột" value="12" readOnly />
            </div>
            <Field label="Lối đi sau cột" value="06" readOnly helper="Lối đi không tính vào sức chứa." />
            <h2 className="text-xl font-semibold leading-7">Công cụ tô ghế</h2>
            <div className="flex flex-wrap gap-3">
              {tools.map(([t, l]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTool(t)}
                  aria-pressed={tool === t}
                  className={cx('h-11 cursor-pointer rounded-control px-4 text-sm font-medium', tool === t ? 'bg-primary text-on-primary' : 'bg-raised text-fg hover:brightness-110')}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">Chọn công cụ, sau đó chọn vị trí trên sơ đồ. Đây là trạng thái tĩnh.</p>
          </section>
          <Message tone="info" title={`Sức chứa: ${cap} vị trí`}>
            {n('std')} Standard · {n('vip')} VIP · {n('couple')} vị trí Couple ({n('couple') / 2} cặp).
          </Message>
        </div>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:p-6">
            <h2 className="text-xl font-semibold leading-7">Sơ đồ ghế · A–J / 01–12</h2>
            <div className="flex flex-col items-center gap-1">
              <svg width="440" height="14" viewBox="0 0 440 14" className="max-w-full text-muted" aria-hidden>
                <path d="M2 12 Q 220 -4 438 12" fill="none" stroke="currentColor" />
              </svg>
              <p className="text-xs text-muted">MÀN HÌNH · LỐI ĐI GIỮA CỘT 06 / 07</p>
            </div>
            <div className="flex flex-col items-center gap-2 overflow-x-auto" role="group" aria-label="Sơ đồ ghế">
              {ROWS.map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <span className="w-5 text-xs text-muted">{r}</span>
                  {Array.from({ length: COLS }, (_, i) => i + 1).map((c) => {
                    const t = grid[idx(r, c)]
                    const aisle = c === 7 ? 'ml-6' : ''
                    if (t === 'none') return <span key={c} className={cx('h-9 w-10', aisle)} />
                    if (t === 'couple') {
                      if (c % 2 === 0 && grid[idx(r, c - 1)] === 'couple') return null
                      if (c % 2 === 1 && grid[idx(r, c + 1)] === 'couple')
                        return (
                          <button key={c} type="button" onClick={() => paint(r, c)} className={cx('h-9 w-[88px] cursor-pointer rounded-control border border-line bg-raised text-xs font-medium text-fg hover:brightness-125', aisle)}>
                            {String(c).padStart(2, '0')}–{String(c + 1).padStart(2, '0')}
                          </button>
                        )
                    }
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => paint(r, c)}
                        aria-label={`${r}${c}`}
                        className={cx('h-9 w-10 cursor-pointer rounded-control border bg-raised text-xs font-medium text-fg hover:brightness-125', t === 'vip' ? 'border-gold' : 'border-line', aisle)}
                      >
                        {String(c).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="flex flex-wrap gap-x-4 text-sm font-medium">
              <span>□ A–F Standard</span>·<span>◇ G–H VIP</span>·<span>↔ I–J Couple</span>
            </p>
            <p className="text-xs text-muted">Ghế đôi gộp hai vị trí liền kề. Lối đi giữ nguyên; mọi loại ghế có nhãn, không chỉ phân biệt bằng màu.</p>
          </section>
          {saved && <Message tone="success" title="Đã lưu sơ đồ">Sơ đồ ghế được lưu trong dữ liệu mẫu.</Message>}
          {preview && <Message tone="info" title="Xem trước">Khách sẽ thấy {cap} vị trí; ghế đôi bán theo cặp.</Message>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setSaved(true)}>Lưu sơ đồ</Button>
            <Button variant="secondary" onClick={() => setPreview((p) => !p)}>
              Xem trước
            </Button>
            <Button variant="ghost" onClick={() => nav('/admin/cinemas')}>
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
