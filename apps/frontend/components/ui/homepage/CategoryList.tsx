type Category = {
  name: string
  color: string
}

const categories: Category[] = [
  { name: "Write & Word", color: "bg-red-600" },
  { name: "3D Model", color: "bg-orange-600" },
  { name: "nama", color: "bg-amber-500" },
  { name: "nama", color: "bg-yellow-400" },
  { name: "nama", color: "bg-lime-600" },
  { name: "nama", color: "bg-green-600" },
]

export default function CategoryList() {
  return (
    <section id="kategori" className="px-4 py-8 md:px-8">
      <h2 className="text-base font-semibold text-text-dark mb-4">
        Kategori Populer
      </h2>

      <div className="
        grid grid-cols-3 gap-3
        sm:grid-cols-4 md:grid-cols-6
      ">
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`
              ${cat.color} rounded-lg aspect-square
              flex items-center justify-center
              text-white text-xs font-medium text-center px-2
            `}
          >
            {cat.name}
          </div>
        ))}
      </div>
    </section>
  )
}