import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AdminHead, PillSelect } from '../../components/AdminLayout'
import { Button, EmptyState, KpiCard } from '../../ui'

const RANGES = ['20–26/10/2026', '01–07/11/2026']
const revenue = [11.5, 15, 13, 21, 18.5, 22.5, 27]
const days = ['20/10', '21/10', '22/10', '23/10', '24/10', '25/10', '26/10']
const top = [
  ['Chuyến Tàu Cuối', 42.6],
  ['Thành Phố Mây', 31.2],
  ['Bên Kia Bình Minh', 24.8],
  ['Mật Mã Đại Dương', 18.4],
] as const
const occupancy = [
  ['03 · 19:30', 82, '98/120 ghế'],
  ['01 · 17:00', 64, '96/150 ghế'],
  ['02 · 20:15', 71, '71/100 ghế'],
  ['03 · 22:00', 43, '52/120 ghế'],
] as const

function RevenueChart() {
  const W = 1000
  const H = 160
  const x = (i: number) => (i / (revenue.length - 1)) * W
  const y = (v: number) => H - (v / 30) * H
  const pts = revenue.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-between text-xs text-muted">
        <span>20–26/10/2026 · Triệu đồng</span>
        <span className="text-danger">— Doanh thu mô phỏng</span>
      </div>
      <div className="flex gap-3">
        <div className="flex h-[160px] flex-col justify-between text-xs text-muted" aria-hidden>
          {[30, 20, 10, 0].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <div className="flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[160px] w-full overflow-visible" role="img" aria-label="Biểu đồ doanh thu theo ngày">
            {[0, 10, 20, 30].map((n) => (
              <line key={n} x1="0" x2={W} y1={y(n)} y2={y(n)} stroke="var(--c-border)" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
            ))}
            <polyline points={pts} fill="none" stroke="var(--c-error)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-2 flex justify-between text-xs text-muted">
            {days.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const loc = useLocation()
  const [draft, setDraft] = useState(loc.pathname.endsWith('/empty') ? RANGES[1] : RANGES[0])
  const [applied, setApplied] = useState(draft)
  const [movie, setMovie] = useState('Tất cả phim')
  const [cinema, setCinema] = useState('Tất cả rạp')
  const empty = applied === RANGES[1]

  return (
    <>
      <AdminHead title="Tổng quan" />
      <div className="flex flex-wrap gap-3">
        <PillSelect label="Khoảng ngày" value={draft} onChange={setDraft} options={RANGES} />
        <PillSelect label="Phim" value={movie} onChange={setMovie} options={['Tất cả phim', 'Chuyến Tàu Cuối', 'Thành Phố Mây']} />
        <PillSelect label="Rạp" value={cinema} onChange={setCinema} options={['Tất cả rạp', 'Central', 'Riverside', 'West']} />
        <Button className="h-11" onClick={() => setApplied(draft)}>
          Áp dụng
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {empty ? (
          <>
            <KpiCard label="Doanh thu mô phỏng" value="0đ" delta="— Chưa có kỳ đối chiếu" />
            <KpiCard label="Vé đã bán" value="0" delta="— Chưa có kỳ đối chiếu" />
            <KpiCard label="Đơn đặt vé" value="0" delta="— Chưa có kỳ đối chiếu" />
            <KpiCard label="Tỷ lệ lấp đầy" value="0%" delta="— Chưa có kỳ đối chiếu" />
          </>
        ) : (
          <>
            <KpiCard label="Doanh thu mô phỏng" value="128.400.000đ" delta="↗ 12,4% so với kỳ trước" />
            <KpiCard label="Vé đã bán" value="1.426" delta="↗ 8,2% so với kỳ trước" />
            <KpiCard label="Đơn đặt vé" value="738" delta="↗ 6,8% so với kỳ trước" />
            <KpiCard label="Tỷ lệ lấp đầy" value="72,4%" delta="↗ 4,1 điểm phần trăm" />
          </>
        )}
      </div>

      <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold leading-7">Doanh thu theo thời gian</h2>
        {empty ? <EmptyState title="Chưa có dữ liệu trong khoảng thời gian này" description="Không có đơn phù hợp với ngày, phim và rạp đang chọn." /> : <RevenueChart />}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
          <h2 className="text-xl font-semibold leading-7">Top phim theo doanh thu</h2>
          {empty ? (
            <>
              <p className="text-base text-muted">Chưa có doanh thu để xếp hạng phim.</p>
              <p className="text-xs text-muted">Không vẽ cột khi không có dữ liệu.</p>
            </>
          ) : (
            <>
              {top.map(([n, v]) => (
                <div key={n} className="grid grid-cols-[minmax(0,140px)_1fr_64px] items-center gap-3 text-sm font-medium">
                  <span className="truncate">{n}</span>
                  <span className="h-3 rounded-full bg-raised">
                    <span className="block h-3 rounded-full bg-gold" style={{ width: `${(v / 50) * 100}%` }} />
                  </span>
                  <span className="text-right text-xs text-muted">{v.toString().replace('.', ',')} tr đ</span>
                </div>
              ))}
              <p className="text-xs text-muted">Dữ liệu học thuật · Không phải báo cáo kinh doanh thật.</p>
            </>
          )}
        </section>
        <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
          <h2 className="text-xl font-semibold leading-7">Lấp đầy theo suất chiếu</h2>
          {empty ? (
            <>
              <p className="text-base text-muted">Chưa có suất chiếu phù hợp.</p>
              <p className="text-xs text-muted">0 vé bán · Không có mẫu số để so sánh.</p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted">Central · 26/10/2026 · Ghế bán / sức chứa</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {occupancy.map(([s, p, c]) => (
                  <div key={s} className="flex flex-col gap-2">
                    <span className="text-xs text-muted">{s}</span>
                    <span className="text-xl font-bold text-gold">{p}%</span>
                    <span className="text-xs text-muted">{c}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {empty ? (
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => {
              setDraft(RANGES[0])
              setApplied(RANGES[0])
            }}
          >
            Đặt lại bộ lọc
          </Button>
          <span className="text-sm text-muted">Đổi khoảng ngày hoặc bỏ bộ lọc để xem dữ liệu mô phỏng.</span>
        </div>
      ) : (
        <p className="text-xs text-muted">Academic MVP · So sánh 20–26/10 và 13–19/10/2026 · Cả hai kỳ đều mô phỏng.</p>
      )}
    </>
  )
}
