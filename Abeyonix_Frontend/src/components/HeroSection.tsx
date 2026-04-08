import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import SpeedyBee from "@/assets/banners/SpeedyBee_banner.png";
import slider2 from "@/assets/banners/Abeyonix_drone.png";
import slider3 from "@/assets/banners/Abeyonix_3D_printing-1.png";
import slider4 from "@/assets/banners/Abeyonix_all.png";
import slider5 from "@/assets/banners/Abeyonix_3D_printing-2.png";

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  const features = [
    "Advanced drones",
    "robotics",
    "IoT solutions",
  ];

  const bgImages = [SpeedyBee, slider2, slider3, slider4, slider5];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bgImages.length);
    }, 6000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [bgImages.length]);

  return (
    <>
      {/* Custom Animation Styles */}
      <style>{`
  @keyframes drone-fly {
    0% {
      transform: translate(105vw, 8vh);
      opacity: 0;
    }
    8% {
      transform: translate(90vw, 12vh);
      opacity: 1;
    }
    38% {
      transform: translate(44vw, 38vh);
      opacity: 1;
    }
    58% {
      transform: translate(44vw, 38vh);
      opacity: 1;
    }
    92% {
      transform: translate(-8vw, 88vh);
      opacity: 1;
    }
    100% {
      transform: translate(-15vw, 100vh);
      opacity: 0;
    }
  }

  .animate-drone {
    animation: drone-fly 10s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  @media (max-width: 480px) {
    .animate-drone {
      animation-duration: 13s;
    }
  }
`}</style>

      <section className="relative min-h-screen flex items-start md:items-center pt-20 overflow-hidden">
        {/* Background Slider - FIXED & SMOOTH */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/*
            All slides sit in a single flex strip.
            We shift the strip left by (activeSlide * 100%) to reveal the active slide.
          */}
          <div
            className="flex h-full"
            style={{
              width: `${bgImages.length * 100}%`,
              transform: `translateX(-${(activeSlide * 100) / bgImages.length}%)`,
              transition: "transform 900ms cubic-bezier(0.77, 0, 0.175, 1)",
            }}
          >
            {bgImages.map((img, index) => (
              <div
                key={index}
                className="h-full bg-cover bg-center bg-no-repeat"
                style={{
                  width: `${100 / bgImages.length}%`,
                  backgroundImage: `url(${img})`,
                }}
              />
            ))}
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/5 z-10" />
        </div>

        {/* Flying Drone */}
       <img
  src="https://web.moxcreative.com/fleanec/wp-content/uploads/sites/11/2023/02/pngegg.png"
  alt="Flying Drone"
  className="absolute w-32 sm:w-40 md:w-56 pointer-events-none animate-drone"
  style={{ top: 0, left: 0, zIndex: 25 }}
/>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-20" />

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 relative z-30">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(90vh-6rem)]">
            {/* LEFT CONTENT */}
            <div className="text-primary-foreground text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6 md:mb-8 italic">
                Build. Customize. 
                <br />
                Fly. Innovate.
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
                <button
                  onClick={() => navigate("/services")}
                  className="btn-primary px-7 w-full sm:w-auto"
                >
                  Start Custom Build
                </button>

                <button
                  onClick={() => navigate("/shop")}
                  className="px-7 py-3 w-full sm:w-auto rounded-full border border-white/30
                             bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition"
                >
                  Explore Products
                </button>
              </div>
            </div>

            {/* RIGHT SIDE - You can re-enable the product slider later if needed */}
          </div>
          <div
            className="flex flex-col items-center lg:items-end mt-12 md:mt-24 animate-slide-in"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Main Slider */}
            {/* <div className="relative hidden sm:block w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 overflow-hidden rounded-3xl mb-6">
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
              </div> */}

            {/* Thumbnails */}
            {/* <div className="flex gap-3 sm:gap-4 mb-4">
                {sliderImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      activeSlide === index
                        ? "ring-2 ring-primary scale-105"
                        : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div> */}

            {/* Dots */}
            {/* <div className="flex gap-2 mb-6">
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === index
                        ? "bg-primary w-4"
                        : "bg-primary-foreground/50 w-2"
                    }`}
                  />
                ))}
              </div> */}

            {/* Description */}
            {/* <p className="text-primary-foreground/80 text-center lg:text-right max-w-xs mb-6 text-sm">
                Experience breathtaking aerial cinematography powered by
                certified pilots and cutting-edge drone technology.
              </p> */}

            {/* <button className="btn-primary w-full sm:w-auto mb-10 sm:mb-0">
                Discover More
              </button> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
