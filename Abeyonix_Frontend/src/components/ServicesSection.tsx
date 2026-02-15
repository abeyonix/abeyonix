import React, { useState, useEffect, useRef } from 'react';

const ServicesSection = () => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  const services = [
    { title: 'Aerial Videography', description: 'Lorem ipsum...', image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-filming-video-drone-filming-UAV-aerial-footage-drone-video-1-1.png' },
    { title: 'Aerial Photography', description: 'Lorem ipsum...', image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/camera-drone-drone-photography-aerial-photography-drone-camera-filming-drone-1-1.png' },
    { title: 'Real Estate Shots', description: 'Lorem ipsum...', image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-aerial-drone-quadcopter-UAV-drone-technology-1-1.png' },
    { title: 'Event Coverage', description: 'Lorem ipsum...', image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-surveillance-security-drone-monitoring-drone-drone-watch-surveillance-UAV-1.png' },
    { title: 'Social Media Content', description: 'Lorem ipsum...', image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/flying-drone-airborne-drone-drone-flight-aerial-view-flying-UAV-1.png' },
    { title: 'Mapping & Surveying', description: 'Lorem ipsum...', image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-remote-drone-controller-UAV-controller-flying-remote-remote-control-drone-1-1.png' },
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="
        relative py-20
        overflow-x-hidden       /* 🔥 MOBILE FIX */
        md:overflow-visible     /* keep desktop same */
      "
      style={{
        backgroundImage:
          'url(https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 services-overlay z-0" />

      {/* Floating Drone */}
      <img
        src="https://web.moxcreative.com/fleanec/wp-content/uploads/sites/11/2023/02/pngegg.png"
        alt="Decorative Drone"
        className={`
          absolute
          top-[6%]
          
          /* MOBILE POSITION */
          right-[36px]
          top-[26px]
          w-[90px]

          /* DESKTOP POSITION */
          md:top-[8%]
          md:right-[20%]
          md:w-[250px]

          z-50
          transition-transform transition-opacity
          delay-300
          ease-[cubic-bezier(0.16,1,0.3,1)]
          hover:animate-[gentle-bobble_2s_ease-in-out_infinite]

          ${
            isVisible
              ? 'opacity-100 translate-x-0 translate-y-0 rotate-0'
              : `
                  opacity-0
                  translate-x-[120%]  /* MOBILE ENTRY */
                  md:translate-x-[240%]
                  -translate-y-[90%]
                  rotate-12
                `
          }
        `}
        style={{ transitionDuration: '3s' }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <p className="text-primary font-medium tracking-widest uppercase mb-4">
              Our Services
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
              High-quality aerial visuals
              <br />
              for professional needs
            </h2>
          </div>
          <button className="btn-primary mt-6 lg:mt-0">Learn More</button>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card group hover:bg-orange-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img src={service.image} alt={service.title} className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-bold mb-4">
                {service.title}
              </h3>
              <div className="w-full h-px bg-secondary-foreground/20 mb-4" />
              <p className="text-sm opacity-70">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gentle-bobble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;
