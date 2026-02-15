import { Button } from "@/components/ui/button";

const GetStarted = () => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* ================= BACKGROUND VIDEO ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          className="
            absolute top-1/2 left-1/2
            w-[160vw] h-[160vh]
            sm:w-[140vw] sm:h-[140vh]
            lg:w-[120vw] lg:h-[120vh]
            -translate-x-1/2 -translate-y-1/2
            pointer-events-none
          "
          src="https://www.youtube.com/embed/hXD8itTKdY0?autoplay=1&mute=1&controls=0&loop=1&playlist=hXD8itTKdY0&modestbranding=1&rel=0&start=1391"
          title="Background Drone Video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* ================= DARK OVERLAY ================= */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* ================= CONTENT ================= */}
      <div className="container mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* LEFT CONTENT */}
          <div className="space-y-5 text-center lg:text-left">
            <span className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
              Get Started
            </span>

            <h2 className="
              text-2xl sm:text-3xl lg:text-5xl
              font-bold font-playfair
              text-white leading-tight
            ">
              Start your project with cinematic drone visuals.
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus,
              luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>

            <div className="pt-2">
              <Button
                className="
                  w-full sm:w-auto
                  bg-primary hover:bg-primary/90
                  text-white rounded-full
                  px-8 py-3
                "
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:flex justify-end">
  <div
    className="
      relative rounded-2xl overflow-hidden shadow-2xl
      w-full max-w-md aspect-video
    "
  >
    <img
      src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-DDL5TQ8.jpg"
      alt="Drone Preview"
      className="w-full h-full object-cover"
    />
  </div>
</div>

        </div>
      </div>
    </section>
  );
};

export default GetStarted;
