import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from './components/Layout'
import { StoreProvider } from './store'
import { ThemeProvider } from './theme'
import Home from './pages/customer/Home'
import MovieDetail from './pages/customer/MovieDetail'
import Seats from './pages/customer/Seats'
import { Forgot, Login, Register, Reset } from './pages/customer/Auth'
import { Checkout, Food, Payment, PaymentResult } from './pages/customer/Booking'
import { Profile, TicketDetail, Tickets } from './pages/customer/Tickets'
import CheckIn from './pages/staff/CheckIn'
import { AdminLayout } from './components/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import { Cinemas, MovieForm, Movies, SeatLayout } from './pages/admin/Catalog'
import { BookingDetail, Bookings, CreateShowtime, Food as AdminFood, Showtimes, Users } from './pages/admin/Operations'

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="loading" element={<Home loading />} />
              <Route path="movies/:id" element={<MovieDetail />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot" element={<Forgot />} />
              <Route path="reset" element={<Reset />} />
              <Route path="booking/seats" element={<Seats />} />
              <Route path="booking/food" element={<Food />} />
              <Route path="booking/checkout" element={<Checkout />} />
              <Route path="booking/payment" element={<Payment />} />
              <Route path="booking/success" element={<PaymentResult kind="success" />} />
              <Route path="booking/failed" element={<PaymentResult kind="failed" />} />
              <Route path="booking/timeout" element={<PaymentResult kind="timeout" />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="tickets/empty" element={<Tickets empty />} />
              <Route path="tickets/:code" element={<TicketDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="staff" element={<CheckIn />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="empty" element={<Dashboard />} />
              <Route path="movies" element={<Movies />} />
              <Route path="movies/new" element={<MovieForm />} />
              <Route path="movies/:id/edit" element={<MovieForm />} />
              <Route path="cinemas" element={<Cinemas />} />
              <Route path="seat-layout" element={<SeatLayout />} />
              <Route path="showtimes" element={<Showtimes />} />
              <Route path="showtimes/new" element={<CreateShowtime />} />
              <Route path="food" element={<AdminFood />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="bookings/:code" element={<BookingDetail />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  )
}
