import React from 'react';

// Define types for TypeScript
interface Breadcrumb {
  label: string;
  href?: string; // Optional link for the first items (e.g., "Home")
}

interface PageHeaderProps {
  title: string;
  backgroundImage: string;
  breadcrumbs: Breadcrumb[];
}

const PageHeader = ({ title, backgroundImage, breadcrumbs }: PageHeaderProps) => {
  return (
    <section
      className="relative h-[400px] md:h-[500px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        {/* Breadcrumbs */}
        <p className="text-primary font-medium tracking-[0.2em] text-sm md:text-base uppercase mb-4 text-white/90">
          {breadcrumbs.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <a href={item.href} className="hover:opacity-80 transition-opacity">
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </p>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold font-playfair text-white leading-tight">
          {title}
        </h1>
      </div>
    </section>
  );
};

export default PageHeader;