import type { ReactNode } from 'react'
import { cinemas, foods, movies, SEAT_PRICE } from '../data'
import { useStore } from '../store'
import { vnd } from '../ui'

export function Row({ k, v, strong }: { k: string; v: ReactNode; strong?: boolean }) {
  return (
    <p className={strong ? 'text-sm' : 'text-sm leading-5'}>
      <span className="text-muted">{k}</span>
      <span className="whitespace-pre text-muted">{'   /   '}</span>
      <span className={strong ? 'text-xl font-semibold leading-7 text-fg' : 'font-medium text-fg'}>{v}</span>
    </p>
  )
}

export const Divider = () => <div className="h-px w-full bg-line" />

/** "Đơn của bạn" rail shared by seat → food → checkout. */
export function OrderSummary({ children, showFood = true }: { children?: ReactNode; showFood?: boolean }) {
  const { booking, foodTotal } = useStore()
  const movie = movies.find((m) => m.id === booking.movieId) ?? movies[0]
  const cinema = cinemas.find((c) => c.id === booking.cinemaId) ?? cinemas[0]
  const room = cinema.showtimes[0].room.replace('Phòng ', '')
  // Opened past the seat step without seats (direct link): show the sample order from the design.
  const demo = showFood && booking.seats.length === 0
  const seats = demo ? [{ id: 'F07', type: 'standard' as const }, { id: 'F08', type: 'standard' as const }] : booking.seats
  const seatSum = seats.reduce((n, x) => n + SEAT_PRICE[x.type], 0)
  const counts = seats.reduce<Record<string, number>>((m, s) => ({ ...m, [s.type]: (m[s.type] ?? 0) + 1 }), {})
  const typeName = { standard: 'Standard', vip: 'VIP', couple: 'Ghế đôi' } as const
  const foodLines = Object.entries(booking.food).filter(([, q]) => q > 0)

  return (
    <aside className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <h2 className="text-xl font-semibold leading-7 text-fg">Đơn của bạn</h2>
      <p className="text-xl font-semibold leading-7 text-fg">{movie.title}</p>
      <p className="text-sm font-medium text-muted">
        {movie.rating} · {movie.minutes} phút · 2D phụ đề
      </p>
      <Divider />
      <Row k="Rạp / Phòng" v={`${cinema.name} · ${room}`} />
      <Row k="Suất chiếu" v={`26/10/2026 · ${booking.time}`} />
      {seats.length === 0 ? (
        <Row k="Ghế" v="Chưa chọn" />
      ) : (
        (Object.keys(counts) as (keyof typeof SEAT_PRICE)[]).map((t) => (
          <div key={t} className="flex flex-col gap-3">
            <Row k={`Ghế ${typeName[t]}`} v={seats.filter((s) => s.type === t).map((s) => s.id).sort().join(', ')} />
            <Row k={`${counts[t]} vé × ${vnd(SEAT_PRICE[t])}`} v={vnd(counts[t] * SEAT_PRICE[t])} />
          </div>
        ))
      )}
      {showFood &&
        foodLines.map(([id, q]) => {
          const f = foods.find((x) => x.id === id)!
          return <Row key={id} k={`${f.name} × ${q}`} v={vnd(f.price * q)} />
        })}
      <Row k="Phí bổ sung" v="0đ" />
      <Divider />
      <Row k="Tổng cộng" v={vnd(seatSum + (showFood ? foodTotal : 0))} strong />
      {children}
    </aside>
  )
}
