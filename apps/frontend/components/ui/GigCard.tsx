type GigCardProps = {
  artistName: string
  title: string
  rating: number
  price: string
  thumbnailColor?: string
}

export default function GigCard({
  artistName,
  title,
  rating,
  price,
  thumbnailColor = "bg-blue-50",
}: GigCardProps) {
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">

      {/* Header: ikon artist + nama + love icon */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-text-dark" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.5c-3.3 0-9.8 1.6-9.8 4.9v2.4h19.6v-2.4c0-3.3-6.5-4.9-9.8-4.9z" />
          </svg>
          <span className="text-xs text-text-dark">{artistName}</span>
        </div>
        <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>

      {/* Thumbnail */}
      <div className={`${thumbnailColor} h-28 flex items-center justify-center`}>
        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-text-dark mb-1">{title}</p>

        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 ${i < rating ? "text-amber-400" : "text-zinc-200"}`}
              fill="currentColor" viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.957c.299.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.02 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-muted">Mulai Dari</span>
          <span className="text-xs font-semibold text-text-dark">{price}</span>
        </div>
      </div>
    </div>
  )
}