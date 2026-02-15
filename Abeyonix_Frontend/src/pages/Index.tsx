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
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <WhoWeAre />
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
