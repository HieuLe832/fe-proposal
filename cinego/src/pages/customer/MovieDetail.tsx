import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FilmArt, Page, PageIntro, Panel } from '../../components/Layout'
import { cinemas, dates, movies } from '../../data'
import { useStore } from '../../store'
import { Button, Chip } from '../../ui'

export default function MovieDetail() {
  const { id = 'chuyen-tau-cuoi' } = useParams()
  const movie = movies.find((m) => m.id === id) ?? movies[0]
  const { setShowtime } = useStore()
  const nav = useNavigate()
  const [date, setDate] = useState(0)
  const [pick, setPick] = useState<{ cinema: string; time: string }>({ cinema: 'central', time: '19:30' })
  const picked = cinemas.find((c) => c.id === pick.cinema)!

  return (
    <Page>
      <div className="flex flex-col gap-8 md:flex-row">
        <FilmArt className="h-[340px] w-full shrink-0 md:w-[280px]" title={movie.title} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <p className="text-xs text-gold">CINEGO / ĐANG CHIẾU</p>
          <h1 className="text-[32px] font-bold leading-10 text-fg">{movie.title}</h1>
          <p className="text-base text-muted">
            {movie.rating} · {movie.genre} · {movie.minutes} phút · Việt Nam · 2D phụ đề
          </p>
          <p className="text-base text-fg">Một chuyến tàu rời thành phố lúc nửa đêm. Khi những hành khách lần lượt biến mất, An và người bạn mới phải giải mã một bức thư để tìm ra điểm đến cuối cùng.</p>
          <div className="text-sm font-medium leading-5 text-muted">
            <p>Đạo diễn: Trần Hải Lâm</p>
            <p>Diễn viên: Lê An Nhiên, Phạm Đức Hòa, Vũ Khánh Linh</p>
          </div>
          <Panel title="▷ Trailer minh họa">
            <p className="text-sm font-medium text-muted">Khung xem tĩnh · Không có video hoặc nội dung có bản quyền.</p>
          </Panel>
        </div>
      </div>

      <PageIntro title="Chọn suất chiếu" subtitle="Thứ Hai, 26/10/2026 · Giá vé từ 90.000đ" />

      <div className="flex flex-wrap gap-2">
        {dates.map((d, i) => (
          <Chip key={d} selected={i === date} onClick={() => setDate(i)}>
            {d}
          </Chip>
        ))}
      </div>

      {cinemas.map((c) => (
        <Panel key={c.id} title={c.name} subtitle={c.address}>
          <div className="flex flex-wrap gap-3">
            {c.showtimes.map((s) => {
              const disabled = s.free === 'started' || s.free === 'full'
              const selected = pick.cinema === c.id && pick.time === s.time
              return (
                <div key={s.time} className="flex w-[88px] flex-col gap-2">
                  <Chip selected={selected} disabled={disabled} onClick={() => setPick({ cinema: c.id, time: s.time })} className="w-full">
                    {s.time}
                    {selected ? ' ✓' : ''}
                  </Chip>
                  <p className="text-xs text-muted">{s.free === 'started' ? 'Đã bắt đầu' : s.free === 'full' ? 'Hết ghế' : `${s.room} · ${s.free} ghế trống`}</p>
                </div>
              )
            })}
          </div>
        </Panel>
      ))}

      <div>
        <Button
          onClick={() => {
            setShowtime(movie.id, pick.cinema, pick.time)
            nav('/booking/seats')
          }}
        >
          Đặt vé · {pick.time} · {picked.name.replace('CineGo ', '')} →
        </Button>
      </div>
    </Page>
  )
}
