import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const quickLinks = ['Home', 'About', 'Services', 'Contact'];
  const serviceLinks = ['Home', 'About', 'Services', 'Contact'];

  const galleryImages = [
    'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-YT84U2V-Copy-300x300.jpg',
    'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-NHZH594-Copy-300x300.jpg',
    'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-YB9AP5B-Copy-300x300.jpg',
  ];

  return (
    <footer className="bg-drone-dark text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">

        {/* Top Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-10">

          {/* Logo & Description */}
          <div>
            <img
              src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/Group-2.png"
              alt="DroneX Logo"
              className="h-8 md:h-10 mb-4 brightness-0 invert"
            />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">
              Quick link
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-primary-foreground/70 hover:text-primary transition text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">
              Services
            </h4>
            <ul className="space-y-2">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-primary-foreground/70 hover:text-primary transition text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-primary-foreground/70 text-sm">
                  +62 812-3456-7890
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-primary-foreground/70 text-sm">
                  hello@dronexstudio.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-primary-foreground/70 text-sm">
                  Jl. Jend. Sudirman No. 32, Jakarta
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/10 pt-8">

          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-between">

            {/* Gallery */}
            <div className="flex gap-3">
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div className="w-full lg:w-auto">
              <h4 className="text-base md:text-lg font-bold font-heading mb-3">
                Subscribe A Newsletter
              </h4>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full sm:w-64 px-4 py-2.5 rounded-full sm:rounded-l-full sm:rounded-r-none
                  bg-primary-foreground text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                  className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-2.5
  rounded-full sm:rounded-r-full sm:rounded-l-none font-medium
  hover:opacity-90 transition mb-8 sm:mb-0"
                >
                  Subscribe
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
