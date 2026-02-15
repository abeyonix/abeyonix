import { ArrowRight } from 'lucide-react';

const FeaturedProjects = () => {
  const projects = [
    {
      title: 'Urban Drone Launch',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image:
        'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-K4K8T82.jpg',
    },
    {
      title: 'Landscape Aerial View',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image:
        'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-HRKKRQR.jpg',
    },
    {
      title: 'Rooftop Filming',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image:
        'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-6PEXHXZ.jpg',
    },
    {
      title: 'Construction Surveying',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image:
        'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-3SPW4S6.jpg',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-black font-medium  uppercase mb-4">
              Our Services
            </p>
          <h2 className="section-title mb-6">Our Featured Projects</h2>
          <button className="btn-primary text-sm">View All Project</button>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="project-card group h-80 md:h-96"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image */}
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Arrow Button */}
              <button className="absolute top-4 right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground transition-all duration-300 group-hover:scale-110 z-10">
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Overlay Content */}
              <div className="project-overlay">
                <h3 className="text-xl font-bold font-heading mb-2">
                  {project.title}
                </h3>
                <p className="text-secondary-foreground/80 text-sm">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
