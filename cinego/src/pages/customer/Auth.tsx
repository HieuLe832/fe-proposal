import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FilmArt, Message, Page, Panel } from '../../components/Layout'
import { useStore } from '../../store'
import { Button, Check, Field } from '../../ui'

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Page>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
        <div className="hidden flex-1 flex-col gap-8 md:flex">
          <FilmArt className="h-[520px] w-full" />
          <h2 className="text-2xl font-bold leading-8 text-fg">Một tài khoản. Trọn trải nghiệm.</h2>
          <p className="text-base text-muted">Chọn phim, tìm ghế đẹp và quản lý mọi vé của bạn tại CineGo.</p>
        </div>
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 lg:mx-0 lg:p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold leading-8 text-fg">{title}</h1>
            <p className="text-base text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </Page>
  )
}

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v)

export function Register() {
  const nav = useNavigate()
  const { login } = useStore()
  const [f, setF] = useState({ name: '', email: '', pw: '', pw2: '', agree: false })
  const [show, setShow] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))

  const pwOk = f.pw.length >= 8 && /[a-zA-Z]/.test(f.pw) && /\d/.test(f.pw)
  const errors = {
    email: f.email && !emailOk(f.email) ? 'Email chưa đúng định dạng' : '',
    pw2: f.pw2 && f.pw2 !== f.pw ? 'Mật khẩu xác nhận không khớp' : '',
  }
  const valid = f.name && emailOk(f.email) && pwOk && f.pw === f.pw2 && f.agree

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    login(f.email, f.name)
    setSent(true)
    setTimeout(() => nav('/login'), 1200)
  }

  return (
    <AuthLayout title="Tạo tài khoản CineGo" subtitle="Bắt đầu hành trình điện ảnh của bạn.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Họ và tên" placeholder="Nguyễn Minh Anh" value={f.name} onChange={set('name')} helper="Tên hiển thị trên vé" />
        <Field label="Email" type="email" placeholder="minhanh@example.com" value={f.email} onChange={set('email')} error={errors.email} helper={emailOk(f.email) ? '✓ Định dạng email hợp lệ' : ' '} />
        <Field
          label="Mật khẩu"
          type={show ? 'text' : 'password'}
          placeholder="••••••••••"
          value={f.pw}
          onChange={set('pw')}
          helper={`${pwOk ? '✓ ' : ''}Tối thiểu 8 ký tự, có chữ và số`}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="-mt-3 w-fit cursor-pointer text-xs text-muted hover:text-fg">
          {show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        </button>
        <Field label="Xác nhận mật khẩu" type={show ? 'text' : 'password'} placeholder="••••••••••" value={f.pw2} onChange={set('pw2')} error={errors.pw2} helper={f.pw2 && f.pw2 === f.pw ? '✓ Hai mật khẩu khớp nhau' : ' '} />
        <div className="rounded-control bg-raised p-4">
          <Check label="Tôi đồng ý điều khoản và chính sách" checked={f.agree} onChange={(v) => setF((s) => ({ ...s, agree: v }))} />
        </div>
        <Button type="submit" block disabled={!valid}>
          Tạo tài khoản
        </Button>
        <Link to="/login" className="text-sm font-medium text-muted hover:text-fg">
          Đã có tài khoản? Đăng nhập →
        </Link>
        <Panel title="Quy tắc kiểm tra">
          <p className="text-xs text-muted">Ví dụ lỗi: “Email chưa đúng định dạng”; “Mật khẩu xác nhận không khớp”. Lỗi xuất hiện ngay dưới trường liên quan.</p>
        </Panel>
        {sent && <Message tone="success" title="Xác nhận sau khi gửi hợp lệ">Tạo tài khoản thành công. Vui lòng đăng nhập để tiếp tục.</Message>}
      </form>
    </AuthLayout>
  )
}

export function Login() {
  const nav = useNavigate()
  const { login } = useStore()
  const [email, setEmail] = useState('minhanh@example.com')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [failed, setFailed] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!emailOk(email) || pw.length < 8) return setFailed(true)
    login(email)
    nav('/')
  }

  return (
    <AuthLayout title="Chào mừng trở lại" subtitle="Đăng nhập để đặt vé và lưu lịch sử của bạn.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {failed && (
          <Message tone="error" title="Email hoặc mật khẩu không chính xác">
            Vui lòng kiểm tra thông tin và thử lại. Mật khẩu cần tối thiểu 8 ký tự.
          </Message>
        )}
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Mật khẩu" type={show ? 'text' : 'password'} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="button" onClick={() => setShow((s) => !s)} className="-mt-3 w-fit cursor-pointer text-xs text-muted hover:text-fg">
          {show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        </button>
        <div className="rounded-control bg-raised p-4">
          <Check label="Ghi nhớ đăng nhập" checked={remember} onChange={setRemember} />
        </div>
        <Link to="/forgot" className="text-sm font-medium text-danger">
          Quên mật khẩu? →
        </Link>
        <Button type="submit" block>
          Đăng nhập
        </Button>
        <Link to="/register" className="text-sm font-medium text-muted hover:text-fg">
          Chưa có tài khoản? Đăng ký ngay →
        </Link>
      </form>
    </AuthLayout>
  )
}

export function Forgot() {
  const [email, setEmail] = useState('minhanh@example.com')
  const [sent, setSent] = useState(false)
  const [cool, setCool] = useState(45)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!emailOk(email)) return
    setSent(true)
    const t = setInterval(() => setCool((c) => (c <= 1 ? (clearInterval(t), 0) : c - 1)), 1000)
  }

  if (!sent) {
    return (
      <AuthLayout title="Quên mật khẩu?" subtitle="Nhập email để nhận liên kết đặt lại mật khẩu.">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={email && !emailOk(email) ? 'Email chưa đúng định dạng' : undefined} />
          <Button type="submit" block disabled={!emailOk(email)}>
            Gửi liên kết đặt lại
          </Button>
          <Button to="/login" variant="secondary" block>
            ← Quay lại đăng nhập
          </Button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Kiểm tra hộp thư của bạn" subtitle="Yêu cầu đặt lại mật khẩu đã được tiếp nhận.">
      <Message tone="success" title="Đã gửi hướng dẫn đặt lại mật khẩu">
        Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu. Trong MVP, email chỉ được mô phỏng.
      </Message>
      <Field label="Email đã yêu cầu" value={email} readOnly helper="Đã gửi yêu cầu · không cần gửi lại ngay" />
      <p className="text-base text-muted">Mở email, chọn liên kết đặt lại và tạo mật khẩu mới. Liên kết chỉ dùng một lần và hết hạn sau 15 phút.</p>
      <Button block disabled={cool > 0} onClick={() => setCool(45)}>
        {cool > 0 ? `Gửi lại sau 00:${String(cool).padStart(2, '0')}` : 'Gửi lại'}
      </Button>
      <p className="text-sm font-medium text-muted">Không thấy email? Kiểm tra mục thư rác hoặc chờ hết thời gian gửi lại.</p>
      <Button to="/reset" variant="ghost" block>
        Mở liên kết mô phỏng →
      </Button>
      <Button to="/login" variant="secondary" block>
        ← Quay lại đăng nhập
      </Button>
    </AuthLayout>
  )
}

export function Reset() {
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [done, setDone] = useState(false)
  const ok = pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw) && pw === pw2

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!ok) return
    setDone(true)
    setTimeout(() => nav('/login'), 1200)
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Tạo mật khẩu mới cho tài khoản CineGo của bạn.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {done && <Message tone="success" title="Đặt lại mật khẩu thành công">Đang chuyển đến trang đăng nhập…</Message>}
        <Field label="Mật khẩu mới" type="password" placeholder="••••••••••" value={pw} onChange={(e) => setPw(e.target.value)} helper="Tối thiểu 8 ký tự, có chữ và số" />
        <Field label="Xác nhận mật khẩu" type="password" placeholder="••••••••••" value={pw2} onChange={(e) => setPw2(e.target.value)} error={pw2 && pw2 !== pw ? 'Mật khẩu xác nhận không khớp' : undefined} />
        <Button type="submit" block disabled={!ok}>
          Lưu mật khẩu mới
        </Button>
      </form>
    </AuthLayout>
  )
}
