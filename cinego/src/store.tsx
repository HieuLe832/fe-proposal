import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HOLD_SECONDS, SEAT_PRICE, foods } from './data'
import type { SeatType } from './ui'

export type SeatRef = { id: string; type: SeatType }

type Booking = {
  movieId: string
  cinemaId: string
  time: string
  seats: SeatRef[]
  food: Record<string, number>
  holdUntil: number | null
}

type Ctx = {
  user: { name: string; email: string } | null
  login: (email: string, name?: string) => void
  logout: () => void
  booking: Booking
  setShowtime: (movieId: string, cinemaId: string, time: string) => void
  toggleSeat: (s: SeatRef) => void
  setSeats: (s: SeatRef[]) => void
  setFood: (id: string, qty: number) => void
  seatTotal: number
  foodTotal: number
  total: number
  secondsLeft: number
  restartHold: () => void
  resetBooking: () => void
}

const emptyBooking: Booking = { movieId: 'chuyen-tau-cuoi', cinemaId: 'central', time: '19:30', seats: [], food: {}, holdUntil: null }
const StoreCtx = createContext<Ctx>(null as never)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Ctx['user']>({ name: 'Nguyễn Minh Anh', email: 'minhanh@example.com' })
  const [booking, setBooking] = useState<Booking>(emptyBooking)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const setSeats = useCallback((seats: SeatRef[]) => {
    setBooking((b) => ({ ...b, seats, holdUntil: seats.length ? (b.holdUntil ?? Date.now() + HOLD_SECONDS * 1000) : null }))
  }, [])

  const toggleSeat = useCallback((s: SeatRef) => {
    setBooking((b) => {
      const has = b.seats.some((x) => x.id === s.id)
      const seats = has ? b.seats.filter((x) => x.id !== s.id) : [...b.seats, s]
      return { ...b, seats, holdUntil: seats.length ? (b.holdUntil ?? Date.now() + HOLD_SECONDS * 1000) : null }
    })
  }, [])

  const value = useMemo<Ctx>(() => {
    const seatTotal = booking.seats.reduce((n, s) => n + SEAT_PRICE[s.type], 0)
    const foodTotal = Object.entries(booking.food).reduce((n, [id, q]) => n + q * (foods.find((f) => f.id === id)?.price ?? 0), 0)
    return {
      user,
      login: (email, name) => setUser({ email, name: name ?? 'Nguyễn Minh Anh' }),
      logout: () => setUser(null),
      booking,
      setShowtime: (movieId, cinemaId, time) => setBooking({ ...emptyBooking, movieId, cinemaId, time }),
      toggleSeat,
      setSeats,
      setFood: (id, qty) => setBooking((b) => ({ ...b, food: { ...b.food, [id]: Math.max(0, qty) } })),
      seatTotal,
      foodTotal,
      total: seatTotal + foodTotal,
      secondsLeft: booking.holdUntil ? Math.max(0, Math.ceil((booking.holdUntil - now) / 1000)) : HOLD_SECONDS,
      restartHold: () => setBooking((b) => ({ ...b, holdUntil: Date.now() + HOLD_SECONDS * 1000 })),
      resetBooking: () => setBooking(emptyBooking),
    }
  }, [user, booking, now, toggleSeat, setSeats])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreCtx)
