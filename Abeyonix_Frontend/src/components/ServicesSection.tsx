import React, { useState, useEffect, useRef } from "react";

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
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  const services = [
  {
    title: "Custom Drone Development",
    description:
      "We design and build customized drones tailored to your specific needs, including surveillance, mapping, and industrial applications.",
    image:
      "https://cdn-icons-png.flaticon.com/512/149/149060.png", // drone icon
  },
  {
    title: "IoT-Based Project Development",
    description:
      "Transform your ideas into real-world IoT solutions with smart devices, sensors, and automation systems built for efficiency and innovation.",
    image:
      "https://cdn-icons-png.flaticon.com/512/4149/4149678.png", // IoT network
  },
  {
    title: "3D Printing & Prototyping",
    description:
      "Bring your concepts to life with high-precision 3D printing and rapid prototyping for functional and creative applications.",
    image:
      "https://cdn-icons-png.flaticon.com/512/1995/1995539.png", // 3D printer
  },
  {
    title: "Smart IoT Solutions",
    description:
      "We develop scalable IoT systems for smart homes, industries, and automation, enabling real-time monitoring and control.",
    image:
      "https://cdn-icons-png.flaticon.com/512/3062/3062634.png", // smart home IoT
  },
  {
    title: "Robotics & Automation Solutions",
    description:
      "Advanced robotics and automation solutions designed to improve productivity, streamline operations, and solve complex challenges.",
    image:
      "https://cdn-icons-png.flaticon.com/512/4712/4712027.png", // robot arm
  },
  {
    title: "Drone Repair & Maintenance",
    description:
      "Reliable drone repair and maintenance services to ensure optimal performance, durability, and long-term efficiency.",
    image:
      "https://cdn-icons-png.flaticon.com/512/942/942748.png", // repair tools
  },
];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="
        relative py-20
        overflow-x-hidden       /* 🔥 MOBILE FIX */
        md:overflow-x-hidden   /* 🔥 FIX */
        md:overflow-y-hidden   /* 🔥 FIX */
      "
      style={{
        backgroundImage:
          "url(https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
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
              ? "opacity-100 translate-x-0 translate-y-0 rotate-0"
              : `
                  opacity-0
                  translate-x-[120%]  /* MOBILE ENTRY */
                  md:translate-x-[240%]
                  -translate-y-[90%]
                  rotate-12
                `
          }
        `}
        style={{ transitionDuration: "3s" }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <p className="text-primary font-medium tracking-widest uppercase mb-4">
              Our Services
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
              Innovative technology solutions
              <br />
               for modern real-world needs
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
              <img
                src={service.image}
                alt={service.title}
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
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
