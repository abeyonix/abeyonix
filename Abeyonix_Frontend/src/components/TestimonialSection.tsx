import { Play } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non ligula vel nisi tempor hendrerit.",
    name: "Daniel Harris",
    role: "Client",
    image:
      "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-P3RKYH9-2.jpg",
  },
  {
    text: "Exceptional quality and professionalism. The aerial footage exceeded our expectations.",
    name: "Sarah Mitchell",
    role: "Client",
    image:
      "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-P3RKYH9-768x768.jpg",
  },
  {
    text: "They captured stunning visuals that truly elevated our brand's marketing materials.",
    name: "Michael Chen",
    role: "Client",
    image:
      "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-P3RKYH9-4-768x768.jpg",
  },
];

const clientAvatars = [
  testimonials[0].image,
  testimonials[1].image,
  testimonials[2].image,
];

const TestimonialSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in {
          animation: slideIn 0.7s ease-out;
        }
      `}</style>

      <section className="py-16 lg:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">

            {/* LEFT IMAGE — hidden on mobile */}
            <div className="relative hidden lg:block">
              <img
                src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-DG63W2C.jpg"
                className="rounded-2xl w-full h-[420px] object-cover"
                alt="Happy Client"
              />

              <div className="absolute top-4 left-4 bg-drone-green text-white px-4 py-2 rounded-full flex items-center gap-2 shadow">
                <div className="flex -space-x-2">
                  {clientAvatars.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <span className="text-xs font-medium">1k+ happy clients</span>
              </div>
            </div>

            {/* CENTER CONTENT */}
            <div className="flex flex-col items-center text-center lg:text-left">
              <span className="text-xs font-semibold tracking-[0.2em] text-drone-green uppercase">
                Testimonial
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-playfair mt-3 mb-6">
                Real experiences from clients
              </h2>

              <div className="bg-drone-green rounded-2xl p-6 sm:p-8 text-white shadow-xl w-full">
                <div key={currentTestimonial} className="slide-in">
                  <p className="text-white/90 leading-relaxed mb-6 text-base sm:text-lg min-h-[100px]">
                    “{testimonials[currentTestimonial].text}”
                  </p>

                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <img
                      src={testimonials[currentTestimonial].image}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                      alt={testimonials[currentTestimonial].name}
                    />
                    <div>
                      <h4 className="font-semibold">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-white/70 text-sm">
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE — video style, hidden on mobile */}
            <div className="relative hidden lg:block">
              <img
                src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-FRLBE3W.jpg"
                className="rounded-2xl w-full h-[420px] object-cover"
                alt="Drone Footage"
              />

              <button className="absolute inset-0 flex items-center justify-center group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow transition-transform group-hover:scale-110">
                  <Play className="w-6 h-6 text-drone-green fill-drone-green ml-1" />
                </div>
              </button>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialSection;
