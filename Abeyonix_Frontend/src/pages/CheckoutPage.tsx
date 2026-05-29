import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { getCheckout } from "@/api/order";
import { CheckoutPageResponse } from "@/types/order";
import { formatPrice } from "@/utils/formatPrice";
import { createUserAddress } from "@/api/address";
// import { placeOrder } from "@/api/order";
import { InitiatePaymentRequest } from "@/types/order";
import { initiatePayment, verifyPayment } from "@/api/order";

import { UserAddressCreate } from "@/types/address";

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();

  const [checkoutData, setCheckoutData] = useState<CheckoutPageResponse | null>(
    null,
  );
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressForm, setAddressForm] = useState<UserAddressCreate>({
    address_type: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    contact_name: "",
    contact_phone: "",
    is_default: false,
  });

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

  const pageData = {
    title: "Checkout",
    backgroundImage:
      "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg",
    breadcrumbs: [{ label: "Home", href: "/" }, { label: "Checkout" }],
  };

  // useEffect(() => {
  //   const fetchCheckout = async () => {
  //     if (!user?.user_id) return;

  //     try {
  //       setLoading(true);

  //       const productId = searchParams.get("product_id");
  //       const quantity = searchParams.get("quantity");

  //       const response = await getCheckout({
  //         user_id: user.user_id,
  //         product_id: productId ? Number(productId) : undefined,
  //         quantity: quantity ? Number(quantity) : undefined,
  //       });

  //       setCheckoutData(response);

  //       if (response.address.length > 0) {
  //         const defaultAddress =
  //           response.address.find((a) => a.is_default) || response.address[0];

  //         setSelectedAddressId(defaultAddress.address_id);
  //       }
  //     } catch (error) {
  //       console.error("Checkout error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCheckout();
  // }, [user, searchParams]);

  const fetchCheckout = async (autoSelectId?: number) => {
    if (!user?.user_id) return;

    try {
      setLoading(true);

      const productId = searchParams.get("product_id");
      const quantity = searchParams.get("quantity");

      const response = await getCheckout({
        user_id: user.user_id,
        product_id: productId ? Number(productId) : undefined,
        quantity: quantity ? Number(quantity) : undefined,
      });

      setCheckoutData(response);

      if (response.address.length > 0) {
        if (autoSelectId) {
          setSelectedAddressId(autoSelectId);
        } else {
          const defaultAddress =
            response.address.find((a) => a.is_default) || response.address[0];

          setSelectedAddressId(defaultAddress.address_id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckout();
  }, [user, searchParams]);

  const taxPercent =
    checkoutData && Number(checkoutData.subtotal) > 0
      ? (
          (Number(checkoutData.tax) / Number(checkoutData.subtotal)) *
          100
        ).toFixed(0)
      : "0";

  const handleAddAddress = async () => {
    if (!user?.user_id) return;

    try {
      const newAddress = await createUserAddress(user.user_id, addressForm);

      setShowAddressForm(false);

      // Reset form
      setAddressForm({
        address_type: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        contact_name: "",
        contact_phone: "",
        is_default: false,
      });

      if (!addressForm.contact_name || !addressForm.contact_phone) {
        alert("Contact name and phone are required");
        return;
      }

      // 🔥 Refetch and auto select new address
      await fetchCheckout(newAddress.address_id);
    } catch (error) {
      console.error("Add address error:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.user_id || !selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }

    setPaymentError(null);
    setPaymentLoading(true);

    try {
      const productId = searchParams.get("product_id");
      const quantity = searchParams.get("quantity");

      // ── Step 1: Initiate payment ───────────────────────────────
      const payload: InitiatePaymentRequest = {
        user_id: user.user_id,
        address_id: selectedAddressId,
        ...(productId &&
          quantity && {
            product_id: Number(productId),
            quantity: Number(quantity),
          }),
      };

      const paymentData = await initiatePayment(payload);

      // ── Step 2: Open Razorpay popup ────────────────────────────
      const options: RazorpayOptions = {
        key: paymentData.key_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.razorpay_order_id,
        name: "Your Store Name",
        prefill: {
          name: user.full_name || "",
          email: user.email,
          // contact: user.phone?.toString() || "",
        },
        theme: {
          color: "#your-primary-color", // e.g. "#2563eb"
        },

        // ── Step 3: On payment success ─────────────────────────
        handler: async (response) => {
          try {
            const order = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // ✅ Success — go to order success page
            navigate(`/order-success/${order.order_id}`);
          } catch (verifyError: any) {
            // Payment went through but verification failed
            // (very rare — usually a network blip)
            setPaymentError(
              "Payment received but confirmation failed. " +
                "Please contact support with your payment ID: " +
                response.razorpay_payment_id,
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            // User closed popup without paying
            setPaymentLoading(false);
            setPaymentError("Payment was cancelled. Please try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      // Note: don't setPaymentLoading(false) here —
      // loading stays true until handler() or ondismiss() fires
    } catch (initiateError: any) {
      setPaymentLoading(false);
      setPaymentError(
        typeof initiateError === "string"
          ? initiateError
          : "Failed to start payment. Please try again.",
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please login to continue
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* ================= PAGE HEADER ================= */}
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
                    <a href={item.href}>{item.label}</a>
                  ) : (
                    item.label
                  )}
                  {index < pageData.breadcrumbs.length - 1 && (
                    <span className="mx-2">/</span>
                  )}
                </span>
              ))}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {pageData.title}
            </h1>
          </div>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="container mx-auto px-4 py-10">
          {loading ? (
            <p className="text-center">Loading checkout...</p>
          ) : (
            checkoutData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* ================= LEFT SIDE ================= */}
                <div className="lg:col-span-2 space-y-8">
                  {/* User Info */}
                  <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">
                      Contact Information
                    </h2>

                    <p>
                      {checkoutData.user.first_name}{" "}
                      {checkoutData.user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {checkoutData.user.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {checkoutData.user.phone}
                    </p>
                  </div>

                  {/* Address */}
                  {/* Address */}
                  <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">
                        Select Delivery Address
                      </h2>

                      <button
                        onClick={() => setShowAddressForm((prev) => !prev)}
                        className="flex items-center gap-2 text-primary font-medium"
                      >
                        <Plus size={16} />
                        Add New
                      </button>
                    </div>

                    {/* Address List */}
                    <div className="space-y-3 mb-4">
                      {checkoutData.address.map((addr) => (
                        <label
                          key={addr.address_id}
                          className={`block border p-4 rounded-lg cursor-pointer transition ${
                            selectedAddressId === addr.address_id
                              ? "border-primary bg-primary/5"
                              : "hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.address_id}
                            onChange={() =>
                              setSelectedAddressId(addr.address_id)
                            }
                            className="mr-3"
                          />

                          <span className="font-medium block">
                            {addr.address_line1}
                          </span>
                          <p className="text-sm font-medium mt-1">
                            {addr.contact_name} ({addr.contact_phone})
                          </p>

                          <p className="text-sm text-gray-600">
                            {addr.city}, {addr.state_province} -{" "}
                            {addr.postal_code}
                          </p>

                          <p className="text-sm text-gray-600">
                            {addr.country}
                          </p>
                        </label>
                      ))}
                    </div>

                    {/* Add Address Form */}
                    {showAddressForm && (
                      <div className="border-t pt-4 space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Add New Address</h3>
                          <button onClick={() => setShowAddressForm(false)}>
                            <X size={16} />
                          </button>
                        </div>

                        {[
                          ["address_type", "Address Type"],
                          ["contact_name", "Contact Name"],
                          ["contact_phone", "Contact Phone"],
                          ["address_line1", "Address Line 1"],
                          ["address_line2", "Address Line 2"],
                          ["city", "City"],
                          ["state_province", "State"],
                          ["postal_code", "Postal Code"],
                          ["country", "Country"],
                        ].map(([name, label]) => (
                          <input
                            key={name}
                            placeholder={label}
                            type={name === "contact_phone" ? "tel" : "text"}
                            value={(addressForm as any)[name] || ""}
                            onChange={(e) =>
                              setAddressForm((prev) => ({
                                ...prev,
                                [name]: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                          />
                        ))}

                        <button
                          onClick={handleAddAddress}
                          className="w-full bg-primary text-white py-2 rounded-md hover:opacity-90 transition"
                        >
                          Save Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Order Items</h2>

                    <div className="space-y-4">
                      {checkoutData.products.map((product) => (
                        <div
                          key={product.product_id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex gap-4 items-center">
                            {product.primary_image && (
                              <img
                                src={`${MEDIA_BASE_URL}${product.primary_image}`}
                                className="w-16 h-16 rounded object-cover"
                              />
                            )}

                            <div>
                              <p className="font-medium">
                                {product.product_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {product.quantity}
                              </p>
                            </div>
                          </div>

                          <span className="font-semibold">
                            ₹{formatPrice(Number(product.total_price))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ================= RIGHT SIDE ================= */}
                <div className="border rounded-xl p-6 bg-white shadow-sm h-fit">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                  <div className="flex justify-between mb-2 text-sm">
                    <span>Subtotal</span>
                    <span>₹{formatPrice(Number(checkoutData.subtotal))}</span>
                  </div>

                  <div className="flex justify-between mb-2 text-sm">
                    <span>Tax({taxPercent}%)</span>
                    <span>₹{formatPrice(Number(checkoutData.tax))}</span>
                  </div>

                  <div className="flex justify-between mb-2 text-sm">
                    <span>Shipping</span>
                    <span>₹{formatPrice(Number(checkoutData.shipping))}</span>
                  </div>

                  <hr className="my-3" />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      ₹{formatPrice(Number(checkoutData.total_amount))}
                    </span>
                  </div>

                  {/* Error message — add just above the button */}
                  {paymentError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {paymentError}
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={paymentLoading}
                    className="mt-6 w-full bg-primary text-white py-3 rounded-lg
             hover:opacity-90 transition disabled:opacity-60
             disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
