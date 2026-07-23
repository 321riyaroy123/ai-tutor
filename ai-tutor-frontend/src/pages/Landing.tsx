import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import FeaturesSection from "../components/FeaturesSection"
import CTASection from "../components/CTASection"
import Footer from "../components/Footer"

export default function Landing() {
  return (
    <div className="app-shell sunrise-shell">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
