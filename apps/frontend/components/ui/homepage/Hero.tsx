export default function Hero() {
  return (
    <section className="
      bg-white
      px-4 py-10 text-center
      md:px-8 md:py-16
    ">
      <h1 className="
        text-2xl font-bold text-text-dark leading-snug max-w-2xl mx-auto
        md:text-4xl
      ">
        Cari Talenta Kreatif Terbaik Untuk Proyek Anda
      </h1>

      <div className="mt-6 max-w-xl mx-auto flex">
        <input
          type="text"
          placeholder="Search untuk Proyek Anda"
          className="
            flex-1 rounded-l-md border border-zinc-300 bg-white
            px-4 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary
          "
        />
        <button className="
          bg-primary text-white px-5 rounded-r-md
          hover:bg-blue-700 transition-colors
          flex items-center justify-center
        ">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </section>
  )
}