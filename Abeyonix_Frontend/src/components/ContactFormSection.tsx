import { useState } from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, Loader2 } from 'lucide-react';
// Adjust the import path to where your API service file is located
import { createInquiry, InquiryPayload } from '@/api/inquiry'; 

const ContactFormSection = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Combine first and last name as required by the API payload
    const payload: InquiryPayload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      telephone: formData.telephone,
      message: formData.message,
    };

    try {
      await createInquiry(payload);
      setSuccessMessage('Your inquiry has been submitted successfully!');
      // Reset form fields on successful submission
      setFormData({ firstName: '', lastName: '', email: '', telephone: '', message: '' });
    } catch (error: any) {
      // Use the error message from the API call or a generic one
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative py-24 bg-muted">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-2xl overflow-hidden shadow-2xl max-w-6xl mx-auto">
          
          {/* Left Side: Contact Form WITH BACKGROUND IMAGE */}
          <div 
            className="p-8 md:p-12 relative flex flex-col justify-center"
            style={{
              backgroundImage:
                "url('https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8LKJAZT.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Overlay specifically for the left side to make text readable */}
            <div className="absolute inset-0 bg-black/55" />

            {/* Content wrapper with z-index to sit on top of the overlay */}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold font-playfair text-white mb-6">
                Get In Touch
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                      className="w-full px-4 py-2 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-drone-green transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                      className="w-full px-4 py-2 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-drone-green transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                    required
                    className="w-full px-4 py-2 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-drone-green transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Telephone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="+123 456 7890"
                    className="w-full px-4 py-2 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-drone-green transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Hello there!"
                    required
                    className="w-full px-4 py-2 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-drone-green transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </form>

              {/* Success and Error Messages */}
              {successMessage && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Contact Info (Unchanged) */}
          <div className="bg-drone-green p-8 md:p-12 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold font-playfair mb-6">Contact Info</h3>
              <p className="text-white/80 mb-8 leading-relaxed">
                Feel free to reach out to us for any inquiries about our services. We are here to help you capture the best aerial visuals.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-full">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Phone</p>
                    <p className="font-medium">+91 8763049067</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-full">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Email</p>
                    <p className="font-medium">abeyonix@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-full">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Location</p>
                    <p className="font-medium">Bhubaneswar, Odisha, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-white/90 font-semibold mb-4">Follow Us</p>
              <div className="flex gap-4">
                <a href="#" className="bg-white text-drone-green p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white text-drone-green p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white text-drone-green p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white text-drone-green p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;