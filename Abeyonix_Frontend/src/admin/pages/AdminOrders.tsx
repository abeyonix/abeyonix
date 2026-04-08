import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderTracking } from "@/api/order";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  MapPin,
  Calendar,
  ChevronRight,
  Activity,
} from "lucide-react";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

// Common order statuses
const COMMON_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [widgets, setWidgets] = useState({
    total_orders: 0,
    active_orders: 0,
    delivered_orders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null);
  const [addTrackingForm, setAddTrackingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [trackingForm, setTrackingForm] = useState({
    status: "",
    description: "",
    location: "",
    customStatus: "",
  });

  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders({
        page: pageNum,
        page_size: pageSize,
        ...(searchTerm && { search: searchTerm }),
      });

      setOrders(data.orders || []);
      setWidgets(data.widgets || {});
      setTotalItems(data.total_count || 0);
      setPageSize(data.page_size || 10);

      const calculatedTotalPages = Math.ceil(
        data.total_count / (data.page_size || 10),
      );
      setTotalPages(calculatedTotalPages);
      setPage(data.page || 1);
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchOrders(1);
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleUpdateTracking = async () => {
    if (!trackingForm.status && !trackingForm.customStatus) {
      setError("Status is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const status = trackingForm.customStatus || trackingForm.status;
      await updateOrderTracking({
        order_id: trackingModal.order_id,
        status,
        description: trackingForm.description,
        location: trackingForm.location,
      });

      setTrackingModal(null);
      setAddTrackingForm(false);
      setTrackingForm({
        status: "",
        description: "",
        location: "",
        customStatus: "",
      });
      fetchOrders(page);
    } catch (err) {
      setError("Failed to update tracking");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: "bg-blue-100 text-blue-700",
      CONFIRMED: "bg-green-100 text-green-700",
      PROCESSING: "bg-yellow-100 text-yellow-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      RETURNED: "bg-orange-100 text-orange-700",
      REFUNDED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      FAILED: "bg-red-100 text-red-700",
      REFUNDED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (order) => {
    // Create a simple text receipt
    const receipt = `
ORDER RECEIPT
================
Order Number: ${order.order_number}
Date: ${formatDate(order.created_at)}
Status: ${order.order_status}
Payment: ${order.payment_status}

Items:
 ${order.items
   .map(
     (item) =>
       `${item.quantity} x ${item.product_name} - ${formatPrice(item.total_price)}`,
   )
   .join("\n")}

Total Amount: ${formatPrice(order.total_amount)}
================
    `;

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order.order_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Pagination logic
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Orders Management
          </h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>

        {/* WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {widgets.total_orders}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {widgets.active_orders}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Delivered Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {widgets.delivered_orders}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="text-red-500 hover:text-red-700" size={20} />
            </button>
          </div>
        )}

        {/* ORDERS TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package className="text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm
                  ? "Try a different search term"
                  : "Orders will appear here once customers place them"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sl. No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order, i) => (
                      <tr
                        key={order.order_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(page - 1) * pageSize + i + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="truncate"
                                title={`${item.quantity} x ${item.product_name}`}
                              >
                                {item.quantity} x {item.product_name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(order.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                          >
                            {order.order_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setViewOrder(order)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                              title="View Order"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setTrackingModal(order)}
                              className="text-orange-600 hover:text-orange-800 transition-colors p-1 hover:bg-orange-50 rounded"
                              title="Update Tracking"
                            >
                              <Truck size={18} />
                            </button>
                            <button
                              onClick={() => handleDownload(order)}
                              className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-50 rounded"
                              title="Download Receipt"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalItems)} of {totalItems}{" "}
                    results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {getPaginationNumbers().map((pageNum, idx) => (
                        <span key={idx}>
                          {pageNum === "..." ? (
                            <span className="px-3 py-1 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => setPage(pageNum)}
                              className={`px-3 py-1 border rounded-md text-sm font-medium ${
                                page === pageNum
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* VIEW ORDER MODAL */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setViewOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold">{viewOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold">
                    {formatDate(viewOrder.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-semibold text-lg">
                    {formatPrice(viewOrder.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewOrder.order_status)}`}
                  >
                    {viewOrder.order_status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {viewOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {item.primary_image && (
                        <img
                          src={`${MEDIA_BASE_URL}${item.primary_image}`}
                          alt={item.product_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-semibold">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING MODAL */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Order Tracking
              </h2>
              <button
                onClick={() => {
                  setTrackingModal(null);
                  setAddTrackingForm(false);
                  setTrackingForm({
                    status: "",
                    description: "",
                    location: "",
                    customStatus: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Tracking Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                <div className="space-y-6">
                  {trackingModal.tracking?.map((track, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          idx === trackingModal.tracking.length - 1
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                      >
                        {idx === trackingModal.tracking.length - 1 ? (
                          <Truck size={16} className="text-white" />
                        ) : (
                          <CheckCircle size={16} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(track.status)}`}
                          >
                            {track.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(track.updated_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          {track.description}
                        </p>
                        {track.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} />
                            {track.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Tracking Button */}
              {!addTrackingForm && (
                <button
                  onClick={() => setAddTrackingForm(true)}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
                >
                  <Plus size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Add Tracking Update
                  </span>
                </button>
              )}

              {/* Add Tracking Form */}
              {addTrackingForm && (
                <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={trackingForm.status}
                      onChange={(e) => {
                        setTrackingForm({
                          ...trackingForm,
                          status: e.target.value,
                          customStatus: "",
                        });
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Status</option>
                      {COMMON_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                      <option value="CUSTOM">Custom Status</option>
                    </select>
                  </div>

                  {trackingForm.status === "CUSTOM" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Status <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter custom status"
                        value={trackingForm.customStatus}
                        onChange={(e) =>
                          setTrackingForm({
                            ...trackingForm,
                            customStatus: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter description (optional)"
                      value={trackingForm.description}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter location (optional)"
                      value={trackingForm.location}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setAddTrackingForm(false);
                        setTrackingForm({
                          status: "",
                          description: "",
                          location: "",
                          customStatus: "",
                        });
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateTracking}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting && (
                        <Loader2 className="animate-spin" size={18} />
                      )}
                      Add Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
