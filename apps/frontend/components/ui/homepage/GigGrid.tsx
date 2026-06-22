import GigCard from "@/components/ui/GigCard"

// Data dummy — nanti diganti fetch dari backend pakai lib/api.ts
const gigs = [
  { artistName: "Artist", title: "Mascot Logo", rating: 4, price: "Rp 200", thumbnailColor: "bg-blue-50" },
  { artistName: "Artist", title: "Mascot Logo", rating: 5, price: "Rp 200", thumbnailColor: "bg-blue-50" },
  { artistName: "Artist", title: "Mascot Logo", rating: 4, price: "Rp 200", thumbnailColor: "bg-blue-50" },
  { artistName: "Artist", title: "Mascot Logo", rating: 4, price: "Rp 200", thumbnailColor: "bg-blue-50" },
  { artistName: "Artist", title: "Mascot Logo", rating: 5, price: "Rp 200", thumbnailColor: "bg-blue-50" },
  { artistName: "Artist", title: "Mascot Logo", rating: 4, price: "Rp 200", thumbnailColor: "bg-blue-50" },
]

export default function GigGrid() {
  return (
    <section className="px-4 py-6 md:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-dark">Jasa Unggulan</h2>
        <h2 className="text-base font-semibold text-text-dark">Gig Card</h2>
      </div>

      <div className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2 md:grid-cols-3
      ">
        {gigs.map((gig, i) => (
          <GigCard key={i} {...gig} />
        ))}
      </div>
    </section>
  )
}