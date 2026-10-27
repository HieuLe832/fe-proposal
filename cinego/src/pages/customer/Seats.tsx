import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { OrderSummary } from '../../components/OrderSummary'
import { Message, Page, PageIntro } from '../../components/Layout'
import { cinemas, movies, SEAT_PRICE } from '../../data'
import { useStore, type SeatRef } from '../../store'
import { BookingStepper, Button, Check, Chip, Countdown, Seat, SeatLegend, vnd, type SeatState, type SeatType } from '../../ui'

const ROWS = 'ABCDEFGH'.split('')
const COLS = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'))
const SOLD = new Set(['B01', 'B02', 'B03', 'D08', 'D09', 'D10'])
const HELD = new Set(['D03', 'F10'])
const rowType = (r: string): SeatType => (r === 'G' ? 'vip' : r === 'H' ? 'couple' : 'standard')
const ZONES = { front: ['A', 'B', 'C'], center: ['F', 'E', 'D'], back: ['G', 'H'] } as const
type Zone = keyof typeof ZONES
type Modal = null | 'prefs' | 'results' | 'nogroup' | 'conflict' | 'expired'

/** Find `n` adjacent standard seats inside one block of the row (the aisle splits 01–05 / 06–10). */
function smartSearch(n: number, zone: Zone, adjacent: boolean, taken: Set<string>): SeatRef[] | null {
  for (const r of ZONES[zone]) {
    if (rowType(r) !== 'standard') continue
    const free = COLS.map((c) => `${r}${c}`).filter((id) => !SOLD.has(id) && !HELD.has(id) && !taken.has(id))
    if (!adjacent) {
      if (free.length >= n) return free.slice(0, n).map((id) => ({ id, type: 'standard' }))
      continue
    }
    let best: string[] | null = null
    let bestDist = Infinity
    for (const [lo, hi] of [
      [1, 5],
      [6, 10],
    ]) {
      for (let start = lo; start + n - 1 <= hi; start++) {
        const ids = Array.from({ length: n }, (_, i) => `${r}${String(start + i).padStart(2, '0')}`)
        if (!ids.every((id) => free.includes(id))) continue
        const dist = Math.abs(start + (n - 1) / 2 - 5.5)
        if (dist <= bestDist) {
          best = ids
          bestDist = dist
        }
      }
    }
    if (best) return best.map((id) => ({ id, type: 'standard' }))
  }
  return null
}

export default function Seats() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { booking, toggleSeat, setSeats, secondsLeft, restartHold } = useStore()
  const movie = movies.find((m) => m.id === booking.movieId) ?? movies[0]
  const cinema = cinemas.find((c) => c.id === booking.cinemaId) ?? cinemas[0]

  const [modal, setModal] = useState<Modal>((params.get('state') as Modal) || null)
  const [qty, setQty] = useState(2)
  const [adj, setAdj] = useState(true)
  const [zone, setZone] = useState<Zone>('center')
  const [found, setFound] = useState<SeatRef[]>(() => (params.get('state') === 'results' ? (smartSearch(2, 'center', true, new Set()) ?? []) : []))
  const [conflictId, setConflictId] = useState('F07')

  const mine = useMemo(() => new Set(booking.seats.map((s) => s.id)), [booking.seats])
  const expired = booking.holdUntil !== null && secondsLeft <= 0

  // Deep links to the design's modal states need seats in the order.
  useEffect(() => {
    if (params.get('state') && booking.seats.length === 0)
      setSeats([
        { id: 'F07', type: 'standard' },
        { id: 'F08', type: 'standard' },
      ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (expired) setModal('expired')
  }, [expired])

  const stateOf = (id: string): SeatState => (mine.has(id) ? 'selected' : SOLD.has(id) ? 'sold' : HELD.has(id) ? 'held' : 'available')

  function runSmart() {
    const res = smartSearch(qty, zone, adj, mine)
    if (res) {
      setFound(res)
      setModal('results')
    } else setModal('nogroup')
  }

  function acceptSmart() {
    setSeats(found)
    setModal(null)
  }

  const modalOpen = modal !== null
  const close = () => setModal(null)
  const reselect = () => {
    setSeats([])
    restartHold()
    setModal(null)
  }

  return (
    <Page>
      <div className="w-fit max-w-full">
        <BookingStepper step={0} />
      </div>
      <div className="flex flex-col gap-6">
        <PageIntro title="Chọn ghế của bạn" subtitle={`${movie.title} · ${cinema.name.replace('CineGo ', '')} · ${cinema.showtimes[0].room} · 26/10/2026 · ${booking.time}`} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-[240px]">
            <Countdown seconds={expired || modal === 'expired' ? 0 : booking.holdUntil ? secondsLeft : 272} />
          </div>
          <Chip selected onClick={() => setModal('prefs')}>
            ★ Smart Seat
          </Chip>
        </div>

        <div className="flex flex-col gap-8 xl:flex-row">
          <section className="min-w-0 flex-1 rounded-card border border-line bg-surface p-4 sm:p-6">
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-[60px] flex-col items-center gap-2">
                <svg width="520" height="16" viewBox="0 0 520 16" fill="none" className="max-w-full text-fg" aria-hidden>
                  <path d="M2 14 Q 260 -4 518 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                </svg>
                <p className="text-center text-xs text-muted">MÀN HÌNH / SCREEN</p>
              </div>
              <div className="w-full overflow-x-auto pb-1" role="group" aria-label="Sơ đồ ghế">
                <div className="mx-auto flex w-fit flex-col gap-2 sm:gap-3">
                  {ROWS.map((r) => (
                    <div key={r} className="flex items-center gap-1 sm:gap-2">
                      <span className="w-4 text-xs text-muted sm:w-5">{r}</span>
                      {COLS.map((c, i) => {
                        const id = `${r}${c}`
                        const type = rowType(r)
                        return (
                          <span key={id} className={i === 5 ? 'ml-3 sm:ml-6' : ''}>
                            <Seat
                              label={c}
                              type={type}
                              state={stateOf(id)}
                              compact
                              onClick={() => {
                                if (modalOpen) return
                                toggleSeat({ id, type })
                              }}
                            />
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full">
                <SeatLegend />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">◷ F10 vừa được giữ · Trạng thái minh họa, không đồng bộ trực tiếp</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
              <span>Mô phỏng:</span>
              <button className="cursor-pointer underline hover:text-fg" onClick={() => setModal('conflict')}>
                ghế bị người khác chọn
              </button>
              <button className="cursor-pointer underline hover:text-fg" onClick={() => setModal('expired')}>
                hết thời gian giữ ghế
              </button>
            </div>
          </section>

          <div className="xl:w-[352px] xl:shrink-0">
            <OrderSummary showFood={false}>
              <Button block disabled={booking.seats.length === 0 || expired} onClick={() => nav('/booking/food')}>
                Tiếp tục · Đồ ăn
              </Button>
            </OrderSummary>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(8,11,22,0.86)] p-4 pt-24" onClick={modal === 'prefs' ? close : undefined}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="flex w-full max-w-[560px] flex-col gap-4 rounded-xl bg-raised pb-6 shadow-2xl">
            {modal === 'prefs' && (
              <>
                <Head title="★ Smart Seat" text="Để CineGo gợi ý vị trí theo sở thích của bạn." />
                <div className="flex flex-col gap-4 px-6">
                  <p className="text-sm font-medium text-muted">SỐ LƯỢNG GHẾ</p>
                  <div className="flex items-center gap-4">
                    <Button variant="secondary" aria-label="Giảm" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                      −
                    </Button>
                    <p className="flex-1 text-center text-xl font-semibold leading-7 text-fg">{qty}</p>
                    <Button variant="secondary" aria-label="Tăng" onClick={() => setQty((q) => Math.min(8, q + 1))}>
                      +
                    </Button>
                  </div>
                  <div className="rounded-control bg-raised p-2">
                    <Check label="Ưu tiên các ghế ngồi cạnh nhau" checked={adj} onChange={setAdj} />
                  </div>
                  <p className="text-sm font-medium text-muted">KHU VỰC ƯA THÍCH</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['front', 'Phía trước'],
                        ['center', 'Chính giữa'],
                        ['back', 'Phía sau'],
                      ] as const
                    ).map(([z, l]) => (
                      <Chip key={z} selected={zone === z} onClick={() => setZone(z)}>
                        {l}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-sm">
                    <span className="text-muted">
                      Standard · {qty} × {vnd(SEAT_PRICE.standard)}
                    </span>{' '}
                    <span className="text-muted">&nbsp;/&nbsp;</span> <span className="font-medium text-fg">{vnd(qty * SEAT_PRICE.standard)}</span>
                  </p>
                  <Button block onClick={runSmart}>
                    Tìm ghế phù hợp
                  </Button>
                  <Button block variant="secondary" onClick={close}>
                    Hủy · Chọn thủ công
                  </Button>
                  <p className="text-xs text-muted">Gợi ý minh họa. Ghế chỉ được xác nhận sau khi bạn chấp nhận.</p>
                </div>
              </>
            )}

            {modal === 'results' && (
              <>
                <Head
                  title="Đã tìm thấy ghế dành cho bạn"
                  text={`${adj ? 'Hai ghế liền nhau' : 'Các ghế'} ở khu vực ${zone === 'center' ? 'chính giữa' : zone === 'front' ? 'phía trước' : 'phía sau'}, cân đối với màn hình.`}
                />
                <div className="flex flex-col gap-4 px-6">
                  <div className="flex gap-3">
                    {found.map((s) => (
                      <span key={s.id} className="inline-flex h-11 items-center rounded-control bg-primary px-4 text-sm font-medium text-on-primary">
                        ★ {s.id}
                      </span>
                    ))}
                  </div>
                  <Message tone="success" title={`Đáp ứng ${found.length}/${qty} sở thích`}>
                    {adj ? 'Ngồi cạnh nhau · ' : ''}Khu vực {zone === 'center' ? 'chính giữa' : zone === 'front' ? 'phía trước' : 'phía sau'}. Các ghế ★ được đánh dấu trên sơ đồ phía sau.
                  </Message>
                  <p className="text-sm">
                    <span className="text-muted">{found.length} ghế Standard</span> <span className="text-muted">&nbsp;/&nbsp;</span>{' '}
                    <span className="text-2xl font-bold text-fg">{vnd(found.length * SEAT_PRICE.standard)}</span>
                  </p>
                  <Button block onClick={acceptSmart}>
                    Chấp nhận {found.map((s) => s.id).join(', ')}
                  </Button>
                  <Button block variant="secondary" onClick={close}>
                    Chọn thủ công
                  </Button>
                  <p className="text-xs text-gold">★ Ghế được đề xuất · Không phải ghế VIP</p>
                </div>
              </>
            )}

            {modal === 'nogroup' && (
              <>
                <Head
                  title="Không có nhóm ghế phù hợp"
                  text={`Không tìm thấy ${qty} ghế ${adj ? 'liền nhau ' : ''}trong khu vực ${zone === 'back' ? 'phía sau' : zone === 'front' ? 'phía trước' : 'chính giữa'} theo yêu cầu mới của bạn.`}
                />
                <div className="flex flex-col gap-4 px-6">
                  <Message tone="warning" title="Thử mở rộng khu vực tìm kiếm">
                    Bạn có thể chọn chính giữa hoặc bỏ yêu cầu ngồi cạnh nhau. Lựa chọn hiện tại chưa bị thay đổi.
                  </Message>
                  <p className="text-sm font-medium text-fg">
                    Yêu cầu: {qty} ghế{adj ? ' · Ngồi cạnh nhau' : ''} · {zone === 'back' ? 'Phía sau' : zone === 'front' ? 'Phía trước' : 'Chính giữa'}
                  </p>
                  <Button block onClick={() => setModal('prefs')}>
                    Điều chỉnh sở thích
                  </Button>
                  <Button block variant="secondary" onClick={close}>
                    Chọn thủ công
                  </Button>
                </div>
              </>
            )}

            {modal === 'conflict' && (
              <>
                <Head title="Ghế vừa được chọn" text={`Seat just taken · Ghế ${conflictId} không còn khả dụng.`} />
                <div className="flex flex-col gap-4 px-6">
                  <Message tone="error" title={`× ${conflictId} đã được người khác chọn`}>
                    Chưa xác nhận nhóm ghế {booking.seats.map((s) => s.id).join('/') || 'F07/F08'}. Vui lòng quay lại sơ đồ và chọn nhóm ghế khác trước khi tiếp tục.
                  </Message>
                  <p className="text-sm font-medium text-fg">Giá vé chưa bị trừ. Đây là tình huống xung đột được mô phỏng.</p>
                  <Button
                    block
                    onClick={() => {
                      setConflictId('F07')
                      reselect()
                    }}
                  >
                    Chọn ghế lại
                  </Button>
                </div>
              </>
            )}

            {modal === 'expired' && (
              <>
                <Head title="Hết thời gian giữ ghế" text="Time expired · Thời hạn giữ ghế đã kết thúc." />
                <div className="flex flex-col gap-4 px-6">
                  <Message tone="warning" title="00:00 · Ghế đã được giải phóng">
                    {booking.seats.map((s) => s.id).join(' và ') || 'F07 và F08'} không còn được giữ cho bạn. Hãy kiểm tra sơ đồ mới và chọn lại ghế trước khi thanh toán.
                  </Message>
                  <p className="text-sm font-medium text-fg">Không có giao dịch phát sinh. Giá vé được tính lại theo lựa chọn mới.</p>
                  <Button block onClick={reselect}>
                    Chọn ghế lại
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Page>
  )
}

function Head({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2 p-6">
      <h2 className="text-2xl font-bold leading-8 text-fg">{title}</h2>
      <p className="text-base text-muted">{text}</p>
    </div>
  )
}
