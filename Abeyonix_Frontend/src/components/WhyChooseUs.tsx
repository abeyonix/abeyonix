const features = [
  {
    title: "Cinematic Quality",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/Drone_9-1-2.png",
  },
  {
    title: "Advanced Technology",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/Drone_11-1-2.png",
  },
  {
    title: "Licensed Pilots",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/Drone-1.png",
  },
  {
    title: "Flexible Services",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/Drone_8-1-2.png",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left - Feature List */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                // Added border-b for lines, pb-6 for spacing. 
                // Condition checks if it's not the last item to avoid a hanging line at the bottom.
                className={`flex gap-4 ${index !== features.length - 1 ? 'border-b border-gray-200 pb-6' : 'pb-2'}`}
              >
                <div className="text-primary flex-shrink-0 pt-1">
                  {/* Replaced SVG with Image */}
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-drone-green font-playfair italic mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Center - Image */}
          <div className="flex justify-center">
            <img
              src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-BMARLEW.jpg"
              alt="Drone in flight"
              className="rounded-2xl w-full max-w-xs object-cover shadow-lg max-h-[400px]"
            />
          </div>

          {/* Right - Content */}
          <div className="space-y-6">
            <span className="text-xs font-semibold tracking-[0.2em] text-drone-green uppercase">
              Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground font-playfair leading-tight">
              Premium drone visuals with advanced tech and certified pilots.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non ligula vel nisi tempor hendrerit. Suspendisse potenti. Curabitur consequat augue vitae eros consequat, vitae egestas urna placerat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;