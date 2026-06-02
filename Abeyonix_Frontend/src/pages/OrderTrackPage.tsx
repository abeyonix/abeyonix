import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin, Package, CheckCircle2, Clock,
  Truck, Circle, ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOrderDetails } from "@/api/order";
import { OrderDetailsResponse, OrderTrackingInfo } from "@/types/order";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

/* ── Reuse same TrackingIcon + TrackingTimeline from OrderDetailsPage ── */
const TrackingIcon = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  if (s.includes("deliver")) return <CheckCircle2 className="w-4 h-4" />;
  if (s.includes("ship") || s.includes("transit")) return <Truck className="w-4 h-4" />;
  if (s.includes("process") || s.includes("confirm")) return <Clock className="w-4 h-4" />;
  return <Circle className="w-4 h-4" />;
};

const TrackingTimeline = ({ tracking }: { tracking: OrderTrackingInfo[] }) => {
  if (!tracking || tracking.length === 0)
    return <p className="text-sm text-gray-400 italic">No tracking updates yet.</p>;

  return (
    <div className="relative pl-2">
      {tracking.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === tracking.length - 1;
        return (
          <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span className="absolute left-[15px] top-6 w-[2px] h-full bg-gray-200" />
            )}
            <span className={`relative z-10 mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
              ${isFirst ? "bg-green-500 text-white ring-4 ring-green-100 animate-pulse" : "bg-white text-gray-400 border-2 border-gray-200"}`}>
              <TrackingIcon status={step.status} />
            </span>
            <div className="pt-0.5">
              <p className={`font-semibold text-sm ${isFirst ? "text-green-600" : "text-gray-700"}`}>
                {step.status}
              </p>
              {step.description && (
                <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
              )}
              {step.location && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />{step.location}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(step.updated_at).toLocaleString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrderTrackPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    getOrderDetails(orderNumber)
      .then(setOrder)
      .catch(() => setError("Order not found or tracking unavailable."))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Page Header */}
        <section
          className="relative h-[200px] md:h-[250px] flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url('https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg')` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-4">
            <p className="text-white/70 text-sm tracking-widest uppercase mb-2">
              Home / Track Order
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Track Your Order</h1>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-10">

          {loading && (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <a href="/" className="text-orange-500 underline text-sm">Go to Homepage</a>
            </div>
          )}

          {!loading && !error && order && (
            <div className="space-y-6">

              {/* Order Meta */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Number</p>
                    <p className="font-bold text-gray-800 text-xl">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Placed On</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                      <Package className="w-3 h-3" />
                      {order.order_status}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border
                      ${order.payment_status.toLowerCase() === "paid"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Tracking Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-500" />
                    Tracking History
                  </h3>
                  <TrackingTimeline tracking={order.tracking} />
                </div>

                <div className="space-y-6">
                  {/* Delivery Address */}
                  {order.shipping_address && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        Delivery Address
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-semibold text-gray-800">{order.shipping_address.contact_name}</p>
                        <p>{order.shipping_address.address_line1}</p>
                        {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                        <p>{order.shipping_address.city}, {order.shipping_address.state_province} — {order.shipping_address.postal_code}</p>
                        <p>{order.shipping_address.country}</p>
                        <p className="text-gray-500 pt-1">📞 {order.shipping_address.contact_phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Items Summary */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      Items
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.product_id} className="flex gap-3 items-center">
                          <img
                            src={`${MEDIA_BASE_URL}${item.primary_image}`}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            ₹{item.total_price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-gray-200 mt-4 pt-3 flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>₹{order.total_amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login CTA */}
              {/* <div className="bg-orange-50 border border-orange-200 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">Want full order management?</p>
                  <p className="text-sm text-gray-500 mt-0.5">Login to view all orders, cancel, download invoice and more.</p>
                </div>
                <a
                  href="/login"
                  className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition whitespace-nowrap"
                >
                  Login to Account <ArrowRight className="w-4 h-4" />
                </a>
              </div> */}

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackPage;