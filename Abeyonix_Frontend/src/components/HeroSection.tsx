import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const features = [
    'Certified Drone Pilots',
    '4K Aerial Footage',
    'Advanced Flight Technology',
  ];

  const sliderImages = [
    'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-YT84U2V-Copy-300x300.jpg',
    'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-NHZH594-Copy-300x300.jpg',
    'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-YB9AP5B-Copy-300x300.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === sliderImages.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  return (
    <>
      {/* Custom Animation Styles */}
      <style>{`
        @keyframes drone-fly {
          0% {
            top: 10%;
            right: -10%;
            opacity: 0;
            transform: rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          35% {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          50% {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          75% {
            left: -10%;
            bottom: -10%;
            transform: rotate(-15deg);
          }
          100% {
            left: -15%;
            bottom: -15%;
            opacity: 0;
          }
        }
        .animate-drone {
          animation: drone-fly 10s linear infinite;
        }

        @media (max-width: 480px) {
          .animate-drone {
            animation-duration: 14s;
          }
        }
      `}</style>

      <section className="relative min-h-screen flex items-start md:items-center pt-20 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage:
              'url(https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-S67VE57.jpg)',
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-20" />

        {/* Flying Drone */}
        <img
          src="https://web.moxcreative.com/fleanec/wp-content/uploads/sites/11/2023/02/pngegg.png"
          alt="Flying Drone"
          className="absolute w-32 sm:w-40 md:w-64 opacity-70 md:opacity-100 z-25 pointer-events-none animate-drone"
        />

        {/* Content */}
        <div className="container mx-auto px-4 lg:px-8 relative z-30">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(90vh-6rem)]">

            {/* LEFT CONTENT */}
            <div className="text-primary-foreground animate-fade-in text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6 md:mb-8 italic">
                Cinematic Drone
                <br />
                Aerial Visual
              </h1>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mt-6 md:mt-8 justify-center md:justify-start">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="text-sm md:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10 md:mt-14 items-center md:items-start">
                <button className="btn-primary px-7 w-full sm:w-auto">
                  Explore More
                </button>

                <button
                  className="px-7 py-3 w-full sm:w-auto rounded-full border border-white/30
                  bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition"
                >
                  Shop Now
                </button>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div
              className="flex flex-col items-center lg:items-end mt-12 md:mt-24 animate-slide-in"
              style={{ animationDelay: '0.3s' }}
            >
              {/* Main Slider */}
              <div className="relative hidden sm:block w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 overflow-hidden rounded-3xl mb-6">
                <div
                  className="flex h-full transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${activeSlide * 100}%)`,
                  }}
                >
                  {sliderImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 sm:gap-4 mb-4">
                {sliderImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${activeSlide === index
                      ? 'ring-2 ring-primary scale-105'
                      : 'opacity-90 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="flex gap-2 mb-6">
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all ${activeSlide === index
                      ? 'bg-primary w-4'
                      : 'bg-primary-foreground/50 w-2'
                      }`}
                  />
                ))}
              </div>

              {/* Description */}
              <p className="text-primary-foreground/80 text-center lg:text-right max-w-xs mb-6 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>

              <button className="btn-primary w-full sm:w-auto mb-10 sm:mb-0">
                Discover More
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
