export type Movie = { id: string; title: string; rating: string; genre: string; minutes: number }

export const movies: Movie[] = [
  { id: 'chuyen-tau-cuoi', title: 'Chuyến Tàu Cuối', rating: 'T13', genre: 'Phiêu lưu / Bí ẩn', minutes: 118 },
  { id: 'thanh-pho-may', title: 'Thành Phố Mây', rating: 'P', genre: 'Kỳ ảo', minutes: 106 },
  { id: 'ben-kia-binh-minh', title: 'Bên Kia Bình Minh', rating: 'T16', genre: 'Tình cảm', minutes: 112 },
  { id: 'mat-ma-dai-duong', title: 'Mật Mã Đại Dương', rating: 'T16', genre: 'Hành động', minutes: 124 },
  { id: 'khu-vuon-sao', title: 'Khu Vườn Sao', rating: 'P', genre: 'Hoạt hình', minutes: 96 },
  { id: 'dem-khong-tieng', title: 'Đêm Không Tiếng', rating: 'T18', genre: 'Giật gân', minutes: 109 },
  { id: 'tan-so-la', title: 'Tần Số Lạ', rating: 'T13', genre: 'Khoa học viễn tưởng', minutes: 121 },
  { id: 'mua-he-cua-gio', title: 'Mùa Hè Của Gió', rating: 'T13', genre: 'Tâm lý', minutes: 104 },
  { id: 'hanh-tinh-nho', title: 'Hành Tinh Nhỏ', rating: 'P', genre: 'Gia đình', minutes: 98 },
  { id: 'duoi-anh-den', title: 'Dưới Ánh Đèn', rating: 'T13', genre: 'Âm nhạc', minutes: 116 },
]

export const movieMeta = (m: Movie, withMinutes = true) => `${m.rating} · ${m.genre}${withMinutes ? ` · ${m.minutes} phút` : ''}`

export type Showtime = { time: string; room: string; free: number | 'started' | 'full' }
export type Cinema = { id: string; name: string; address: string; showtimes: Showtime[] }

export const cinemas: Cinema[] = [
  {
    id: 'central',
    name: 'CineGo Central',
    address: '12 Đại lộ Trung Tâm · Quận 1 · 2D phụ đề',
    showtimes: [
      { time: '14:00', room: 'Phòng 03', free: 'started' },
      { time: '17:00', room: 'Phòng 03', free: 68 },
      { time: '19:30', room: 'Phòng 03', free: 42 },
      { time: '21:45', room: 'Phòng 03', free: 68 },
    ],
  },
  {
    id: 'riverside',
    name: 'CineGo Riverside',
    address: '28 Đường Ven Sông · Quận 2 · 2D phụ đề',
    showtimes: [
      { time: '14:00', room: 'Phòng 02', free: 'started' },
      { time: '17:00', room: 'Phòng 02', free: 68 },
      { time: '19:30', room: 'Phòng 02', free: 42 },
      { time: '21:45', room: 'Phòng 02', free: 'full' },
    ],
  },
  {
    id: 'west',
    name: 'CineGo West',
    address: '86 Đại lộ Phía Tây · Quận 6 · 2D phụ đề',
    showtimes: [
      { time: '14:00', room: 'Phòng 02', free: 'started' },
      { time: '17:00', room: 'Phòng 02', free: 68 },
      { time: '19:30', room: 'Phòng 02', free: 42 },
      { time: '21:45', room: 'Phòng 02', free: 68 },
    ],
  },
]

export const dates = ['26/10 · Hôm nay', '27/10 · Thứ Ba', '28/10 · Thứ Tư', '29/10 · Thứ Năm']

export const SEAT_PRICE = { standard: 90000, vip: 120000, couple: 180000 }
export const HOLD_SECONDS = 5 * 60

export type Food = { id: string; name: string; desc: string; price: number; cat: 'combo' | 'popcorn' | 'drink' }
export const foods: Food[] = [
  { id: 'combo-2', name: 'Combo Đôi', desc: '1 bắp lớn + 2 nước · Dành cho 2 người', price: 85000, cat: 'combo' },
  { id: 'combo-1', name: 'Combo Một', desc: '1 bắp vừa + 1 nước', price: 55000, cat: 'combo' },
  { id: 'caramel', name: 'Bắp caramel', desc: 'Bắp lớn · Vị caramel', price: 45000, cat: 'popcorn' },
  { id: 'soda', name: 'Nước ngọt', desc: 'Ly 500ml · Chọn vị tại quầy', price: 30000, cat: 'drink' },
]

export type Ticket = {
  code: string
  movie: string
  date: string
  time: string
  cinema: string
  room: string
  seats: string
  total: number
  status: 'valid' | 'used' | 'expired'
  food?: string
  checkedIn?: string
}

export const tickets: Ticket[] = [
  { code: 'CG102601', movie: 'Chuyến Tàu Cuối', date: '26/10/2026', time: '19:30', cinema: 'CineGo Central', room: '03', seats: 'F07, F08', total: 265000, status: 'valid', food: 'Combo Đôi × 1' },
  { code: 'CG101802', movie: 'Thành Phố Mây', date: '18/10/2026', time: '17:00', cinema: 'CineGo Riverside', room: '02', seats: 'D05, D06', total: 180000, status: 'used', checkedIn: '18/10/2026 · 16:46:12' },
  { code: 'CG101201', movie: 'Mùa Hè Của Gió', date: '12/10/2026', time: '20:00', cinema: 'CineGo West', room: '01', seats: 'C03, C04', total: 180000, status: 'expired' },
  { code: 'CG102703', movie: 'Bên Kia Bình Minh', date: '27/10/2026', time: '21:45', cinema: 'CineGo Central', room: '01', seats: 'E05, E06', total: 180000, status: 'valid' },
  { code: 'CG100905', movie: 'Khu Vườn Sao', date: '09/10/2026', time: '14:00', cinema: 'CineGo Riverside', room: '02', seats: 'B04, B05', total: 180000, status: 'used', checkedIn: '09/10/2026 · 13:42:05' },
]
