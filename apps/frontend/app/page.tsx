import Navbar from "@/components/ui/homepage/Navbar"
import Hero from "@/components/ui/homepage/Hero"
import CategoryList from "@/components/ui/homepage/CategoryList"
import GigGrid from "@/components/ui/homepage/GigGrid"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CategoryList />
      <GigGrid />
    </main>
  )
}