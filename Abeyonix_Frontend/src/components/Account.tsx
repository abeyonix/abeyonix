import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Pencil, Save, X } from "lucide-react";
import { useEffect } from "react";
import { getUserById, updateUser } from "@/api/user";
import { UserResponse, UpdateUserPayload } from "@/types/user";
import {
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteAddress,
  makeDefaultAddress,
} from "@/api/address";

import {
  UserAddressResponse,
  UserAddressCreate,
  UserAddressUpdate,
} from "@/types/address";

import { getUserOrders } from "@/api/order";
import { UserOrderWithItems, OrderTrackingInfo } from "@/types/order";
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

const pageData = {
  title: "Account",
  backgroundImage:
    "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg",
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Account" }],
};

type Section = "profile" | "orders" | "address";

const Account = () => {
  const { user, logout, updateUserContext } = useAuth();
  const [activeSection, setActiveSection] = useState<Section | null>("profile");
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserPayload>({});

  const [addresses, setAddresses] = useState<UserAddressResponse[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<UserAddressResponse | null>(null);
  const [orders, setOrders] = useState<UserOrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UserOrderWithItems | null>(
    null,
  );
  const navigate = useNavigate();
  const location = useLocation();


  const [addressForm, setAddressForm] = useState<UserAddressCreate>({
    address_type: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    is_default: false,
  });

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const section = params.get("section");

  if (section === "orders") {
    setActiveSection("orders");
  } else if (section === "address") {
    setActiveSection("address");
  } else {
    // ✅ Default fallback
    setActiveSection("profile");
  }
}, [location.search]);

  useEffect(() => {
    if (!user?.user_id) return;

    setLoadingProfile(true);
    getUserById(user.user_id)
      .then((data) => {
        setProfile(data);
        setFormData({
          user_name: data.user_name,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone ?? "",
          alternative_phone: data.alternative_phone ?? "",
        });
      })
      .finally(() => setLoadingProfile(false));
  }, [user?.user_id]);

  useEffect(() => {
    if (!user?.user_id) return;

    setLoadingAddresses(true);
    getUserAddresses(user.user_id)
      .then(setAddresses)
      .finally(() => setLoadingAddresses(false));
  }, [user?.user_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;

    const updated = await updateUser(profile.user_id, formData);

    setProfile(updated);
    setIsEditing(false);

    // 🔥 Update only available fields in AuthContext
    updateUserContext({
      user_name: updated.user_name,
      email: updated.email,
    });
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({
      address_type: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "",
      is_default: false,
    });
  };

  const handleAddressSubmit = async () => {
    if (!user?.user_id) return;

    if (editingAddress) {
      const updated = await updateUserAddress(
        editingAddress.address_id,
        user.user_id,
        addressForm as UserAddressUpdate,
      );

      setAddresses((prev) =>
        prev.map((a) => (a.address_id === updated.address_id ? updated : a)),
      );
    } else {
      const created = await createUserAddress(user.user_id, addressForm);
      setAddresses((prev) => [...prev, created]);
    }

    setShowAddressForm(false);
    resetAddressForm();
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!user?.user_id) return;

    await deleteAddress(addressId, user.user_id);
    setAddresses((prev) => prev.filter((a) => a.address_id !== addressId));
  };

  const handleMakeDefault = async (addressId: number) => {
    if (!user?.user_id) return;

    await makeDefaultAddress(addressId, user.user_id);
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.address_id === addressId,
      })),
    );
  };

  useEffect(() => {
    if (!user?.user_id) return;

    setLoadingOrders(true);

    getUserOrders(user.user_id)
      .then((res) => {
        // Already sorted DESC from backend, but safe:
        const sorted = res.orders.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setOrders(sorted);
      })
      .finally(() => setLoadingOrders(false));
  }, [user?.user_id]);

  const toggleSection = (section: Section) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  const handleLogout = () => {
    logout(); // clear auth
    navigate("/"); // redirect to home
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        if (loadingProfile) {
          return <p className="text-gray-500">Loading profile...</p>;
        }

        if (!profile) {
          return <p className="text-red-500">Failed to load profile</p>;
        }

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Profile</h2>

              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className="flex items-center gap-2 text-drone-orange"
              >
                <Pencil size={18} />
                <span className="hidden sm:inline">
                  {isEditing ? "Cancel" : "Edit"}
                </span>
              </button>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Username", name: "user_name" },
                { label: "Email", name: "email" },
                { label: "First Name", name: "first_name" },
                { label: "Last Name", name: "last_name" },
                { label: "Phone", name: "phone" },
                { label: "Alternative Phone", name: "alternative_phone" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm text-gray-500">{field.label}</label>

                  {isEditing ? (
                    <input
                      name={field.name}
                      value={(formData as any)[field.name] || ""}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-drone-orange outline-none"
                    />
                  ) : (
                    <p className="mt-1 font-medium">
                      {(profile as any)[field.name] || "-"}
                    </p>
                  )}
                </div>
              ))}

              {/* Last login (read-only always) */}
              <div>
                <label className="text-sm text-gray-500">Last Login</label>
                <p className="mt-1 font-medium">
                  {profile.last_login
                    ? new Date(profile.last_login).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>

            {/* Save button */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-drone-orange text-white rounded-md"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        );

      case "address":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Addresses</h2>

              <button
                onClick={() => {
                  resetAddressForm();
                  setShowAddressForm(true);
                }}
                className="flex items-center gap-2 text-drone-orange font-semibold"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Address</span>
              </button>
            </div>

            {/* Address list */}
            {loadingAddresses ? (
              <p className="text-gray-500">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p className="text-gray-500">No addresses added yet.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.address_id}
                    className={`p-4 border rounded-lg relative
                            ${address.is_default ? "border-drone-orange bg-orange-50" : ""}`}
                  >
                    {address.is_default && (
                      <span className="absolute top-2 right-2 text-xs text-drone-orange font-semibold">
                        Default
                      </span>
                    )}

                    <p className="font-semibold">{address.address_type}</p>
                    <p className="text-sm text-gray-600">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state_province} -{" "}
                      {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>

                    <div className="flex gap-4 mt-3">
                      <button
                        onClick={() => {
                          setEditingAddress(address);
                          setAddressForm(address);
                          setShowAddressForm(true);
                        }}
                        className="text-sm text-drone-orange"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteAddress(address.address_id)}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>

                      {!address.is_default && (
                        <button
                          onClick={() => handleMakeDefault(address.address_id)}
                          className="text-sm flex items-center gap-1"
                        >
                          <Star size={14} />
                          Make Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Address Form */}
            {showAddressForm && (
              <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">
                    {editingAddress ? "Edit Address" : "Add Address"}
                  </h3>
                  <button onClick={() => setShowAddressForm(false)}>
                    <X size={18} />
                  </button>
                </div>

                {[
                  ["address_type", "Address Type"],
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
                    value={(addressForm as any)[name] || ""}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ))}

                <button
                  onClick={handleAddressSubmit}
                  className="w-full bg-drone-orange text-white py-2 rounded-md"
                >
                  {editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            )}
          </div>
        );
      case "orders":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Orders</h2>

            {loadingOrders ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders found</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow transition"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">₹{order.total_amount}</p>
                        <p className="text-sm text-orange-500">
                          {order.order_status}
                        </p>
                      </div>
                    </div>

                    {/* Preview item */}
                    <div className="flex gap-3 mt-3">
                      <img
                        src={`${MEDIA_BASE_URL}${order.items[0]?.primary_image}`}
                        className="w-14 h-14 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {order.items[0]?.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 1} more items
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
              <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* ================= PAGE HEADER ================= */}
        <section
          className="relative h-[200px] md:h-[250px] pt-16 md:pt-0 flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url('${pageData.backgroundImage}')` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-4">
            <p className="text-white/90 text-sm tracking-[0.2em] uppercase mb-2">
              {pageData.breadcrumbs.map((item, index) => (
                <span key={index}>
                  {item.href ? (
                    <a href={item.href} className="hover:opacity-80">
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

            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {pageData.title}
            </h1>
          </div>
        </section>

        {/* ================= ACCOUNT CONTENT ================= */}
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside className="hidden lg:block lg:col-span-1 bg-white rounded-xl shadow p-4">
              <div className="mb-6 text-center">
                <User className="mx-auto w-10 h-10 text-drone-orange mb-2" />
                <p className="font-semibold">{user?.user_name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                {(["profile", "orders", "address"] as Section[]).map(
                  (section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm transition
                      ${
                        activeSection === section
                          ? "bg-drone-orange text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {section === "profile" && <User size={16} />}
                      {section === "orders" && <ShoppingBag size={16} />}
                      {section === "address" && <MapPin size={16} />}
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ),
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </nav>
            </aside>

            {/* ================= DESKTOP CONTENT ================= */}
            <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl shadow p-6">
              {renderContent()}
            </div>

            {/* ================= MOBILE ACCORDION ================= */}
            <div className="lg:hidden space-y-4">
              {(["profile", "orders", "address"] as Section[]).map(
                (section) => {
                  const isOpen = activeSection === section;

                  return (
                    <div
                      key={section}
                      className={`rounded-xl border transition
          ${isOpen ? "border-drone-orange bg-orange-50" : "border-gray-200 bg-white"}
        `}
                    >
                      {/* Header */}
                      <button
                        onClick={() => toggleSection(section)}
                        className={`w-full flex items-center gap-3 px-4 py-4 font-semibold text-left
            ${isOpen ? "text-drone-orange" : "text-gray-800"}
          `}
                      >
                        {section === "profile" && <User size={20} />}
                        {section === "orders" && <ShoppingBag size={20} />}
                        {section === "address" && <MapPin size={20} />}

                        <span className="flex-1">
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </span>

                        {/* Simple visual indicator (no arrow icon) */}
                        <span className="text-sm opacity-70">
                          {isOpen ? "Close" : "Open"}
                        </span>
                      </button>

                      {/* Content */}
                      {isOpen && (
                        <div className="px-4 pb-5 pt-2 text-sm text-gray-600 border-t border-gray-200">
                          {renderContent()}
                        </div>
                      )}
                    </div>
                  );
                },
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-red-50 text-red-600 font-semibold"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Account;

const OrderDetailsModal = ({
  order,
  onClose,
}: {
  order: UserOrderWithItems;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{order.order_number}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.product_id} className="flex gap-4">
              <img src={`${MEDIA_BASE_URL}${item.primary_image}`} className="w-16 h-16 rounded" />
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold">₹{item.total_price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tracking */}
        <TrackingTimeline tracking={order.tracking} />

        {/* Total */}
        <div className="text-right font-semibold text-lg">
          Total: ₹{order.total_amount}
        </div>
      </div>
    </div>
  );
};

const TrackingTimeline = ({ tracking }: { tracking: OrderTrackingInfo[] }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Order Tracking</h3>

      <div className="relative pl-6">
        {tracking.map((step, index) => (
          <div key={index} className="mb-6 relative">
            {/* Line */}
            {index !== tracking.length - 1 && (
              <span className="absolute left-[7px] top-5 w-[2px] h-full bg-gray-300"></span>
            )}

            {/* Dot */}
            <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 animate-pulse"></span>

            {/* Content */}
            <div className="ml-4">
              <p className="font-medium">{step.status}</p>
              <p className="text-sm text-gray-500">{step.description}</p>
              <p className="text-xs text-gray-400">
                {new Date(step.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
