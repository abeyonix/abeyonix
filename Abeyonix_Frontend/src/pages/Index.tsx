import { useRef,useEffect } from "react";
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import ServicesSection from '@/components/ServicesSection';
import FeaturedProjects from '@/components/FeaturedProjects';
import GetStarted from '@/components/GetStarted';
import TestimonialSection from '@/components/TestimonialSection';
import Footer from '@/components/Footer';
import WhoWeAre from '@/components/WhoWeAre';

const Index = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  let isScrolling = false;

  const handleScroll = (e: WheelEvent) => {
    if (isScrolling) return;

    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;

    // Scroll DOWN → go to next section
    if (e.deltaY > 0 && scrollY < heroHeight - 50) {
      isScrolling = true;
      nextRef.current?.scrollIntoView({ behavior: "smooth" });

      setTimeout(() => {
        isScrolling = false;
      }, 800);
    }

    // Scroll UP → go back to hero
    if (e.deltaY < 0 && scrollY <= heroHeight) {
      isScrolling = true;
      heroRef.current?.scrollIntoView({ behavior: "smooth" });

      setTimeout(() => {
        isScrolling = false;
      }, 800);
    }
  };

  window.addEventListener("wheel", handleScroll);

  return () => window.removeEventListener("wheel", handleScroll);
}, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* HERO */}
        <div ref={heroRef}>
          <HeroSection />
        </div>

        {/* NEXT SECTION */}
        <div ref={nextRef}>
          <WhoWeAre />
        </div>

        <WhyChooseUs />
        <ServicesSection />
        <FeaturedProjects />
        <GetStarted />
        <TestimonialSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;