type RegisterFormProps = {
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
      {/* Tab indicator */}
      <div className="flex gap-4 mb-6 border-b border-zinc-200 pb-3">
        <span
          className="text-sm text-text-muted cursor-pointer hover:text-text-dark"
          onClick={onSwitchToLogin}
        >
          Masuk
        </span>
        <span className="text-sm font-semibold text-text-dark border-b-2 border-text-dark pb-1">
          Daftar
        </span>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-text-dark mb-1 block">
            Nama Lengkap
          </label>
          <input
            type="text"
            className="w-full bg-zinc-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-dark mb-1 block">
            Email
          </label>
          <input
            type="email"
            className="w-full bg-zinc-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-dark mb-1 block">
            No. WhatsApp
          </label>
          <input
            type="tel"
            className="w-full bg-zinc-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-dark mb-1 block">
            Buat Kata Sandi
          </label>
          <input
            type="password"
            className="w-full bg-zinc-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-dark mb-1 block">
            Peran (Buyer/Seller)
          </label>
          <div className="relative">
            <select className="w-full bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-text-dark appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-center mt-6 text-base font-bold text-text-dark tracking-widest">
        ATELIER
      </p>
    </div>
  )
}