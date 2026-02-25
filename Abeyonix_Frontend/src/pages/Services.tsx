import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import ServicesSection from '@/components/ServicesSection'; // Import the existing component
import { createService } from '@/api/service'; // adjust path if needed

const ServicesPage = () => {
    const sectionRef = useRef(null);
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        city: '',
        serviceType: '',
        message: ''
    });

    const pageData = {
        title: "Our Services",
        // Using the same image as Contact and About pages
        backgroundImage: "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg",
        breadcrumbs: [
            { label: 'Home', href: '/' },
            { label: 'Services' }
        ]
    };

    const services = [
        {
            title: 'Aerial Videography',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus luctus nec.',
            image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-filming-video-drone-filming-UAV-aerial-footage-drone-video-1-1.png',
        },
        {
            title: 'Aerial Photography',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus luctus nec.',
            image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/camera-drone-drone-photography-aerial-photography-drone-camera-filming-drone-1-1.png',
        },
        {
            title: 'Real Estate Shots',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus luctus nec.',
            image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-aerial-drone-quadcopter-UAV-drone-technology-1-1.png',
        },
        {
            title: 'Event Coverage',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus luctus nec.',
            image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-surveillance-security-drone-monitoring-drone-drone-watch-surveillance-UAV-1.png',
        },
        {
            title: 'Social Media Content',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus luctus nec.',
            image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/flying-drone-airborne-drone-drone-flight-aerial-view-flying-UAV-1.png',
        },
        {
            title: 'Mapping & Surveying',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus luctus nec .',
            image: 'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/drone-remote-drone-controller-UAV-controller-flying-remote-remote-control-drone-1-1.png',
        },
    ];

    const handleServiceClick = (serviceTitle) => {
        setSelectedService(serviceTitle);
        setFormData(prev => ({ ...prev, serviceType: serviceTitle }));

        // Scroll to form
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setSuccessMessage('');
            setErrorMessage('');

            const payload = {
                name: formData.name,
                email: formData.email,
                mobile_number: formData.mobile, // map correctly
                city: formData.city,
                service_type: formData.serviceType,
                message: formData.message,
            };

            const response = await createService(payload);

            // ✅ Only using POST response
            setSuccessMessage('Service booking submitted successfully!');

            // Reset form
            setFormData({
                name: '',
                email: '',
                mobile: '',
                city: '',
                serviceType: '',
                message: '',
            });

        } catch (error: any) {
            setErrorMessage(
                error?.response?.data?.detail || 'Something went wrong.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Reusable Page Header */}
                <PageHeader
                    title={pageData.title}
                    backgroundImage={pageData.backgroundImage}
                    breadcrumbs={pageData.breadcrumbs}
                />

                <section
                    ref={sectionRef}
                    id="services"
                    className="relative py-20 overflow-visible"
                >
                    <div className="container mx-auto px-4 lg:px-8 relative z-20">
                        {/* Section Header */}
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
                            <div>
                                <p className="text-primary font-medium tracking-widest uppercase mb-4">
                                    Our Services
                                </p>
                                <h2 className="text-3xl text-black md:text-4xl lg:text-5xl font-bold font-heading">
                                    High-quality aerial visuals
                                    <br />
                                    for professional needs
                                </h2>
                            </div>
                            <button className="btn-primary mt-6 lg:mt-0">Learn More</button>
                        </div>

                        {/* Services Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className="service-card group hover:bg-orange-500 cursor-pointer transition-all duration-300"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => handleServiceClick(service.title)}
                                >
                                    {/* Icon / Image */}
                                    <div className="mb-4">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-16 h-16 object-contain"
                                        />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold font-heading mb-4 text-secondary-foreground">
                                        {service.title}
                                    </h3>

                                    {/* Divider */}
                                    <div className="w-full h-px bg-secondary-foreground/20 mb-4" />

                                    {/* Description */}
                                    <p className="text-secondary-foreground/70 text-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Book Service Form Section */}
                <section ref={formRef} className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                                    Book Our Services
                                </h2>
                                <p className="text-gray-600">
                                    Fill out the form below and we'll get back to you as soon as possible.
                                </p>
                            </div>

                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
                                    {successMessage}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                                    {errorMessage}
                                </div>
                            )}


                            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label htmlFor="mobile" className="block text-gray-700 font-medium mb-2">
                                            Mobile Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="mobile"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="serviceType" className="block text-gray-700 font-medium mb-2">
                                        Service Type *
                                    </label>
                                    <select
                                        id="serviceType"
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Select a service</option>
                                        {services.map((service, index) => (
                                            <option key={index} value={service.title}>
                                                {service.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                                        Message (Optional)
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    ></textarea>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-md transition-colors duration-300 disabled:opacity-50"
                                    >
                                        {loading ? "Submitting..." : "Submit Booking Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <style>{`
        @keyframes gentle-bobble {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
        </div>
    );
};

export default ServicesPage;