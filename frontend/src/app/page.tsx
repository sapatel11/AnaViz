import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StepsSection from "@/components/StepsSection";
import Footer from "@/components/Footer";


export default function HomePage() {
  return (
    <>
    <Navbar />
    <main>
      <Hero />
      <StepsSection />
      <Footer />
    </main>
    </>
  );
}
