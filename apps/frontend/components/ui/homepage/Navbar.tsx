import ButtonLogin from "@/components/ui/ButtonLogin"
import Link from "next/link"

export default function Navbar() {
  return (
    <header className="
      sticky top-0 z-50 bg-primary-light
      px-4 py-3
      md:px-8
    ">
      <div className="
        flex items-center justify-between gap-3
        md:gap-6
      ">

        {/* Logo */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-primary font-bold text-lg">S</span>
          <span className="text-text-dark font-semibold text-sm md:text-base">
            NAMA
          </span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="
                w-full rounded-md border border-zinc-300 bg-white
                pl-3 pr-9 py-1.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary
              "
            />
            <svg
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories — disembunyikan di layar paling kecil, muncul dari sm ke atas */}
        <a href="#kategori" className="hidden sm:block text-sm text-text-dark whitespace-nowrap">
          Categories
        </a>

        {/* Tombol auth */}
        <Link href="/auth">
          <ButtonLogin variant="primary">
            <span className="hidden sm:inline">Masuk/Daftar</span>
            <span className="sm:hidden">Masuk</span>
          </ButtonLogin>
        </Link>

      </div>
    </header>
  )
}