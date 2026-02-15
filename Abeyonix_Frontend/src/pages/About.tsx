import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import WhoWeAre from '@/components/WhoWeAre';

const AboutPage = () => {
  const pageData = {
    title: "About Us",
    // Using the same image as Contact page
    backgroundImage: "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg",
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'About' }
    ]
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

        {/* Who We Are Section */}
        <WhoWeAre />
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;