import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComingSoon from '@/components/ComingSoon';

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}

      <main className="flex-grow">
        <ComingSoon />
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default ComingSoonPage;