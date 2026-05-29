import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Package, CheckCircle2, Clock, Truck, Circle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOrderDetails } from "@/api/order";
import { OrderDetailsResponse, OrderTrackingInfo } from "@/types/order";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

const pageData = {
  title: "Order Details",
  backgroundImage:
    "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Account", href: "/account?section=orders" },
    { label: "Order Details" },
  ],
};

/* ─── Status icon helper ─── */
const TrackingIcon = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  if (s.includes("deliver")) return <CheckCircle2 className="w-4 h-4" />;
  if (s.includes("ship") || s.includes("transit")) return <Truck className="w-4 h-4" />;
  if (s.includes("process") || s.includes("confirm")) return <Clock className="w-4 h-4" />;
  return <Circle className="w-4 h-4" />;
};

/* ─── Tracking Timeline ─── */
const TrackingTimeline = ({ tracking }: { tracking: OrderTrackingInfo[] }) => {
  if (!tracking || tracking.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No tracking updates yet.</p>
    );
  }

  return (
    <div className="relative pl-2">
      {tracking.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === tracking.length - 1;

        return (
          <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <span className="absolute left-[15px] top-6 w-[2px] h-full bg-gray-200" />
            )}

            {/* Dot */}
            <span
              className={`relative z-10 mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                ${isFirst
                  ? "bg-green-500 text-white ring-4 ring-green-100 animate-pulse"
                  : "bg-white text-gray-400 border-2 border-gray-200"
                }`}
            >
              <TrackingIcon status={step.status} />
            </span>

            {/* Content */}
            <div className="pt-0.5">
              <p className={`font-semibold text-sm ${isFirst ? "text-green-600" : "text-gray-700"}`}>
                {step.status}
              </p>
              {step.description && (
                <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
              )}
              {step.location && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {step.location}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(step.updated_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Main Page ─── */
const OrderDetailsPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    setLoading(true);
    getOrderDetails(orderNumber)
      .then(setOrder)
      .catch((err) => setError(typeof err === "string" ? err : "Failed to load order details."))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* ── Page Header ── */}
        <section
          className="relative h-[200px] md:h-[250px] flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url('${pageData.backgroundImage}')` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-4">
            <p className="text-white/90 text-sm tracking-[0.2em] uppercase mb-2">
              {pageData.breadcrumbs.map((item, index) => (
                <span key={index}>
                  {item.href ? (
                    <a href={item.href} className="hover:opacity-80 transition-opacity">
                      {item.label}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {index < pageData.breadcrumbs.length - 1 && (
                    <span className="mx-2">/</span>
                  )}
                </span>
              ))}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-playfair text-white">
              {pageData.title}
            </h1>
          </div>
        </section>

        {/* ── Content ── */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate("/account?section=orders")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          {loading && (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-12">{error}</div>
          )}

          {!loading && !error && order && (
            <>
              {/* Order meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Order Number</p>
                  <p className="font-bold text-gray-800 text-lg">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Placed On</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(order.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                    <Package className="w-3 h-3" />
                    {order.order_status}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
                      ${order.payment_status.toLowerCase() === "paid"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-yellow-50 text-yellow-600 border-yellow-200"
                      }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
              </div>

              {/* ── Two-column layout ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT — Tracking + Shipping Address */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Tracking Card */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-orange-500" />
                      Tracking History
                    </h3>
                    <TrackingTimeline tracking={order.tracking} />
                  </div>

                  {/* Shipping Address Card */}
                  {order.shipping_address && (
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        Delivery Address
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-semibold text-gray-800">
                          {order.shipping_address.contact_name}
                        </p>
                        <p>{order.shipping_address.address_line1}</p>
                        {order.shipping_address.address_line2 && (
                          <p>{order.shipping_address.address_line2}</p>
                        )}
                        <p>
                          {order.shipping_address.city},{" "}
                          {order.shipping_address.state_province} —{" "}
                          {order.shipping_address.postal_code}
                        </p>
                        <p>{order.shipping_address.country}</p>
                        <p className="text-gray-500 pt-1">
                          📞 {order.shipping_address.contact_phone}
                        </p>
                        {order.shipping_address.address_type && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full capitalize">
                            {order.shipping_address.address_type}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT — Items + Payment Breakdown */}
                <div className="lg:col-span-3 space-y-6">

                  {/* Items Card */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      Items Ordered
                    </h3>

                    <div className="divide-y divide-gray-50">
                      {order.items.map((item) => (
                        <div key={item.product_id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <img
                            src={`${MEDIA_BASE_URL}${item.primary_image}`}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm leading-tight">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                ₹{item.unit_price.toLocaleString("en-IN")} × {item.quantity}
                              </span>
                              <span className="font-semibold text-gray-800 text-sm">
                                ₹{item.total_price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Breakdown Card */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">Payment Summary</h3>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal_amount.toLocaleString("en-IN")}</span>
                      </div>

                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>− ₹{order.discount_amount.toLocaleString("en-IN")}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>
                          {order.shipping_amount === 0
                            ? <span className="text-green-600 font-medium">Free</span>
                            : `₹${order.shipping_amount.toLocaleString("en-IN")}`}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>₹{order.tax_amount.toLocaleString("en-IN")}</span>
                      </div>

                      <div className="border-t border-dashed border-gray-200 pt-3 mt-1 flex justify-between font-bold text-gray-900 text-base">
                        <span>Total</span>
                        <span>₹{order.total_amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetailsPage;