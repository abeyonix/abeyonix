import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      setStatus("failed");
      return;
    }

    verifyPayment(transactionId);
  }, []);

  const verifyPayment = async (transactionId: string) => {
    try {
      const res = await axios.get(
        `/api/v1/payment/verify/${transactionId}`
      );

      if (res.data.status === "success") {
        setOrderId(res.data.order_id);
        setStatus("success");
      } else {
        setStatus("failed");
      }
    } catch (error) {
      setStatus("failed");
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Verifying payment...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-red-600">
          Payment Failed ❌
        </h2>
        <button
          onClick={() => navigate("/checkout")}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-green-600">
        Payment Successful 🎉
      </h2>

      <p className="mt-4 text-lg">
        Order ID: <span className="font-semibold">#{orderId}</span>
      </p>

      <button
        onClick={() => navigate("/orders")}
        className="mt-6 bg-primary text-white px-6 py-2 rounded-md"
      >
        View My Orders
      </button>
    </div>
  );
}
