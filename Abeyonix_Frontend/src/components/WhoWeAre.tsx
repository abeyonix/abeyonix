import React, { useState, useEffect, useRef } from 'react';

const WhoWeAre = () => {
  const statsData = [
    { id: 1, target: 1000, suffix: '+', label: 'Happy Clients' },
    { id: 2, target: 500, suffix: '+', label: 'Completed Projects' },
    { id: 3, target: 98, suffix: '%', label: 'Client Satisfaction' },
  ];

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let current = 0;
      const step = Math.ceil(target / 40);

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, 30);

      return () => clearInterval(timer);
    }, [isVisible, target]);

    return (
      <span>
        {count >= 1000 ? `${Math.floor(count / 1000)}K` : count}
        {suffix}
      </span>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* IMAGE BLOCK */}
<div className="relative flex justify-center lg:block">
  {/* Main Image */}
  <div
    className={`relative z-10 transition-all duration-1000 ease-out
    ${
      isVisible
        ? 'translate-x-0 translate-y-0 opacity-100'
        : '-translate-x-12 -translate-y-12 opacity-0'
    }`}
  >
    <img
      src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-W4LD7HZ.jpg"
      alt="Drone Shot"
      className="rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto object-cover"
    />
  </div>

  {/* Secondary Image (OVERLAP ON MOBILE + DESKTOP) */}
  <div
    className={`absolute
      -bottom-6 -right-4           /* mobile overlap */
      sm:-bottom-10 sm:-right-10   /* desktop overlap */
      w-2/3 max-w-xs sm:max-w-sm
      z-20 transition-all duration-1000 ease-out delay-200
    ${
      isVisible
        ? 'translate-x-0 translate-y-0 opacity-100'
        : 'translate-x-12 translate-y-12 opacity-0'
    }`}
  >
    <img
      src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-EHBWWJV.jpg"
      alt="Controller"
      className="rounded-2xl shadow-xl border-4 border-white object-cover"
    />
  </div>
</div>


          {/* TEXT BLOCK */}
          <div className="space-y-6 text-center lg:text-left">
            <span className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
              Who We Are
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-playfair text-gray-900 leading-tight">
              Delivering cinematic visuals through precision, creativity, and
              advanced drone technology.
            </h2>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              We combine storytelling with cutting-edge aerial cinematography to
              provide perspectives that inspire, inform, and captivate.
            </p>

            <div className="pt-2">
              <button className="btn-primary px-8 py-3 rounded-full">
                Learn More
              </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100 text-center lg:text-left">
              {statsData.map((stat) => (
                <div key={stat.id}>
                  <h3 className="text-3xl font-bold text-drone-green">
                    <Counter target={stat.target} suffix={stat.suffix} />
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
