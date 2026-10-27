import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilmArt, Page, PageIntro } from '../../components/Layout'
import { movieMeta, movies } from '../../data'
import { Button, Chip, Field, MovieCard, Skeleton } from '../../ui'

const ALL = 'Thể loại'
const genres = [ALL, ...Array.from(new Set(movies.map((m) => m.genre)))]
const upcoming = new Set(['tan-so-la', 'mua-he-cua-gio', 'hanh-tinh-nho', 'duoi-anh-den'])

export default function Home({ loading = false }: { loading?: boolean }) {
  const [tab, setTab] = useState<'now' | 'soon'>('now')
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState(ALL)

  const list = useMemo(
    () =>
      movies.filter(
        (m) =>
          (tab === 'now' || upcoming.has(m.id)) &&
          (genre === ALL || m.genre === genre) &&
          m.title.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [tab, q, genre],
  )

  return (
    <Page>
      <section className="flex flex-col items-stretch gap-8 rounded-card bg-surface p-6 lg:flex-row lg:items-center lg:p-8">
        <div className="flex flex-col gap-5 lg:w-[560px] lg:shrink-0">
          <p className="text-xs text-gold">PHIM NỔI BẬT / FEATURED</p>
          <h2 className="text-[32px] font-bold leading-10 text-fg">Chuyến Tàu Cuối</h2>
          <p className="text-sm font-medium text-muted">T13 · Phiêu lưu / Bí ẩn · 118 phút · 2D phụ đề</p>
          <p className="text-base text-muted">Một chuyến tàu rời thành phố lúc nửa đêm. Hai người xa lạ lần theo những bí mật trước khi bình minh khép lại hành trình.</p>
          <div className="flex flex-wrap gap-3">
            <Button to="/movies/chuyen-tau-cuoi">Đặt vé ngay →</Button>
            <Button to="/movies/chuyen-tau-cuoi" variant="secondary">
              Chi tiết phim
            </Button>
          </div>
          <p className="text-xs text-muted">Khởi chiếu 26.10.2026 · Tại 3 cụm rạp CineGo</p>
        </div>
        <FilmArt className="h-[304px] flex-1" />
      </section>

      <div className="flex gap-3">
        <Chip selected={tab === 'now'} onClick={() => setTab('now')}>
          Đang chiếu
        </Chip>
        <Chip selected={tab === 'soon'} onClick={() => setTab('soon')}>
          Sắp chiếu
        </Chip>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Field
          className="w-full p-0 sm:w-[360px]"
          label="Tìm phim"
          placeholder="⌕  Tìm tên phim bạn yêu thích"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          helper={`${list.length} phim hư cấu dành cho bạn`}
        />
        <label className="sr-only" htmlFor="genre">
          Thể loại
        </label>
        <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="h-11 cursor-pointer rounded-control bg-raised px-4 text-sm font-medium text-fg outline-none">
          {genres.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <span className="rounded-control bg-raised px-4 py-3 text-sm font-medium text-fg">26/10 ▾</span>
        <span className="rounded-control bg-raised px-4 py-3 text-sm font-medium text-fg">Tất cả rạp ▾</span>
      </div>

      <PageIntro title="Khám phá màn ảnh" subtitle={`${list.length} câu chuyện mới · Chọn phim, chọn giờ, chọn ghế yêu thích.`} />

      {loading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5" aria-busy>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex min-h-[400px] flex-col gap-2 rounded-card bg-raised p-4">
              <Skeleton className="h-[264px] w-full bg-line/40" />
              <Skeleton className="h-6 w-3/4 bg-line/40" />
              <Skeleton className="h-4 w-1/2 bg-line/40" />
            </div>
          ))}
        </div>
      ) : list.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {list.map((m) => (
            <MovieCard key={m.id} id={m.id} title={m.title} meta={movieMeta(m)} idx={movies.indexOf(m)} />
          ))}
        </div>
      ) : (
        <p className="rounded-card bg-surface p-6 text-muted">Không có phim phù hợp. Hãy thử bộ lọc khác.</p>
      )}

      <section className="flex flex-col gap-2 rounded-card bg-surface p-6">
        <h3 className="text-xl font-semibold leading-7 text-fg">Ba điểm hẹn. Một trải nghiệm CineGo.</h3>
        <p className="text-base text-muted">Central · Riverside · West — Chọn rạp gần bạn, đặt vé rõ giá và không phí bổ sung.</p>
        <p className="text-xs text-muted">Phim, lịch chiếu và thông tin rạp trong dự án đều là dữ liệu hư cấu.</p>
        <Link to="/cinemas" className="mt-1 text-sm font-medium text-danger">
          Xem các rạp →
        </Link>
      </section>
    </Page>
  )
}
