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
  const [addressErrors, setAddressErrors] = useState<Record<string, boolean>>({});

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

  const requiredFields = [
    "address_type", "contact_name", "contact_phone",
    "address_line1", "city", "state_province", "postal_code", "country",
  ];

  const errors: Record<string, boolean> = {};
  requiredFields.forEach((field) => {
    if (!(addressForm as any)[field]?.toString().trim()) {
      errors[field] = true;
    }
  });

  if (Object.keys(errors).length > 0) {
    setAddressErrors(errors);
    return;
  }

  setAddressErrors({});

  try {
    const newAddress = await createUserAddress(user.user_id, addressForm);
    setShowAddressForm(false);
    setAddressForm({
      address_type: "", address_line1: "", address_line2: "",
      city: "", state_province: "", postal_code: "", country: "",
      contact_name: "", contact_phone: "", is_default: false,
    });
    setAddressErrors({});
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
  onClick={() => { setShowAddressForm(true); setAddressErrors({}); }}
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

      {/* ================= ADDRESS MODAL ================= */}
{showAddressForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

      {/* Modal Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
        <div>
          <h3 className="font-bold text-xl text-gray-800">📍 Add New Address</h3>
          <p className="text-sm text-gray-400 mt-0.5">Save a new delivery address</p>
        </div>
        <button
          onClick={() => { setShowAddressForm(false); setAddressErrors({}); }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Modal Body */}
      <div className="px-6 py-5 space-y-4">

        <p className="text-xs text-gray-400">
          Fields marked with <span className="text-red-500 font-bold">*</span> are required
        </p>

        {/* Address Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Address Type <span className="text-red-500">*</span>
          </label>
          <select
            value={addressForm.address_type}
            onChange={(e) => {
              setAddressForm((prev) => ({ ...prev, address_type: e.target.value }));
              setAddressErrors((prev) => ({ ...prev, address_type: false }));
            }}
            className={`w-full px-4 py-3 border-2 rounded-xl text-sm transition focus:outline-none focus:border-primary
              ${addressErrors.address_type ? "border-red-400 bg-red-50" : "border-gray-200"}
              ${addressForm.address_type ? "text-gray-800" : "text-gray-400"}`}
          >
            <option value="">🏷️ Select Address Type</option>
            {["Home", "Office", "Work", "Apartment", "Hostel", "Warehouse", "Other"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {addressErrors.address_type && (
            <p className="text-red-500 text-xs mt-1">Address type is required</p>
          )}
        </div>

        {/* Contact Info Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="👤 Full Name"
              value={addressForm.contact_name}
              onChange={(e) => {
                setAddressForm((prev) => ({ ...prev, contact_name: e.target.value }));
                setAddressErrors((prev) => ({ ...prev, contact_name: false }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400
                ${addressErrors.contact_name ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {addressErrors.contact_name && (
              <p className="text-red-500 text-xs mt-1">Required</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="📞 Phone"
              value={addressForm.contact_phone}
              onChange={(e) => {
                setAddressForm((prev) => ({ ...prev, contact_phone: e.target.value }));
                setAddressErrors((prev) => ({ ...prev, contact_phone: false }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400
                ${addressErrors.contact_phone ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {addressErrors.contact_phone && (
              <p className="text-red-500 text-xs mt-1">Required</p>
            )}
          </div>
        </div>

        {/* Address Line 1 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="🏠 House / Flat / Block No."
            value={addressForm.address_line1}
            onChange={(e) => {
              setAddressForm((prev) => ({ ...prev, address_line1: e.target.value }));
              setAddressErrors((prev) => ({ ...prev, address_line1: false }));
            }}
            className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400
              ${addressErrors.address_line1 ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          {addressErrors.address_line1 && (
            <p className="text-red-500 text-xs mt-1">Required</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="🏠 Street / Area / Landmark"
            value={addressForm.address_line2}
            onChange={(e) => setAddressForm((prev) => ({ ...prev, address_line2: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400"
          />
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="🏙️ City"
              value={addressForm.city}
              onChange={(e) => {
                setAddressForm((prev) => ({ ...prev, city: e.target.value }));
                setAddressErrors((prev) => ({ ...prev, city: false }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400
                ${addressErrors.city ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {addressErrors.city && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="🗺️ State"
              value={addressForm.state_province}
              onChange={(e) => {
                setAddressForm((prev) => ({ ...prev, state_province: e.target.value }));
                setAddressErrors((prev) => ({ ...prev, state_province: false }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400
                ${addressErrors.state_province ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {addressErrors.state_province && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        </div>

        {/* Postal & Country */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="📮 Postal Code"
              value={addressForm.postal_code}
              onChange={(e) => {
                setAddressForm((prev) => ({ ...prev, postal_code: e.target.value }));
                setAddressErrors((prev) => ({ ...prev, postal_code: false }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400
                ${addressErrors.postal_code ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {addressErrors.postal_code && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="🌍 Country"
              value={addressForm.country}
              onChange={(e) => {
                setAddressForm((prev) => ({ ...prev, country: e.target.value }));
                setAddressErrors((prev) => ({ ...prev, country: false }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400
                ${addressErrors.country ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {addressErrors.country && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        </div>

      </div>

      {/* Modal Footer */}
      <div className="px-6 py-5 border-t flex gap-3 rounded-b-2xl bg-gray-50">
        <button
          onClick={() => { setShowAddressForm(false); setAddressErrors({}); }}
          className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleAddAddress}
          className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md"
        >
          Save Address
        </button>
      </div>

    </div>
  </div>
)}

      <Footer />
    </div>
  );
};

export default CheckoutPage;
