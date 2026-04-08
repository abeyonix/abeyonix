import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Confetti from "react-confetti";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={400}
        />
      )}

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-xl p-10 max-w-lg text-center">
          {/* Success Icon */}
          <div className="text-green-500 text-6xl mb-4">✓</div>

          <h1 className="text-3xl font-bold mb-2">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 mb-6">Thank you for your purchase.</p>

          <p className="text-sm text-gray-500 mb-6">
            Order ID: <span className="font-semibold">{orderId}</span>
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/shop"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90"
            >
              Continue Shopping
            </Link>

            <Link
              to="/account?section=orders"
              className="px-6 py-3 border rounded-lg hover:bg-gray-100"
            >
              View Orders
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
