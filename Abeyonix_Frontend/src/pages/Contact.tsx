import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import ContactFormSection from '@/components/ContactFormSection'; // Import the new form

const ContactPage = () => {
  const pageData = {
    title: "Contact",
    backgroundImage: "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg",
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Contact' }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Reusable Header */}
        <PageHeader 
          title={pageData.title} 
          backgroundImage={pageData.backgroundImage} 
          breadcrumbs={pageData.breadcrumbs} 
        />

        {/* New Contact Form Section */}
        <ContactFormSection />
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;