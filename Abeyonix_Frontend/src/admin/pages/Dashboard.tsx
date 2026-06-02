// src/pages/admin/Dashboard.tsx

import { useEffect, useState } from "react";
import { getDashboard, DashboardData } from "@/api/dashboard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  ShoppingBag, Users, Package, TrendingUp,
  AlertTriangle, MessageSquare, Wrench, IndianRupee,
} from "lucide-react";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

const STATUS_COLORS: Record<string, string> = {
  PLACED:           "#3b82f6",
  CONFIRMED:        "#6366f1",
  PROCESSING:       "#f59e0b",
  SHIPPED:          "#8b5cf6",
  OUT_FOR_DELIVERY: "#06b6d4",
  DELIVERED:        "#22c55e",
  CANCELLED:        "#ef4444",
  RETURNED:         "#f97316",
  REFUNDED:         "#6b7280",
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <p className="text-red-500">Failed to load dashboard</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* ── Revenue Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Today's Revenue"    value={formatCurrency(data.revenue.today)}      color="bg-blue-500" />
        <StatCard icon={IndianRupee} label="This Week"          value={formatCurrency(data.revenue.this_week)}  color="bg-indigo-500" />
        <StatCard icon={IndianRupee} label="This Month"         value={formatCurrency(data.revenue.this_month)} color="bg-violet-500" />
        <StatCard icon={TrendingUp}  label="Total Revenue"      value={formatCurrency(data.revenue.total)}      color="bg-emerald-500" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag}    label="Total Orders"     value={data.total_orders}          color="bg-orange-500" />
        <StatCard icon={Users}          label="Total Users"      value={data.total_users}            sub={`+${data.new_users_this_month} this month`} color="bg-cyan-500" />
        <StatCard icon={Package}        label="Total Products"   value={data.total_products}         color="bg-pink-500" />
        <StatCard icon={MessageSquare}  label="New Inquiries"    value={data.new_inquiries}          sub={`${data.total_inquiries} total`} color="bg-rose-500" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Monthly Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthly_revenue} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.order_status_breakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ status, percent }) =>
                  `${status} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.order_status_breakdown.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data.recent_orders.map((order) => (
              <div key={order.order_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{order.order_number}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${order.order_status === "DELIVERED" ? "bg-green-100 text-green-700" :
                      order.order_status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      order.order_status === "PLACED"    ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"}`}>
                    {order.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Top Selling Products</h2>
            <div className="space-y-3">
              {data.top_selling_products.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  {p.primary_image ? (
                    <img
                      src={`${MEDIA_BASE_URL}${p.primary_image}`}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.product_name}</p>
                    <p className="text-xs text-gray-400">{p.total_quantity} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {formatCurrency(p.total_revenue)}
                  </span>
                </div>
              ))}
              {data.top_selling_products.length === 0 && (
                <p className="text-sm text-gray-400 italic">No sales data yet</p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          {data.low_stock_products.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h2 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                Low Stock Alert
              </h2>
              <div className="space-y-2">
                {data.low_stock_products.map((p) => (
                  <div key={p.product_id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{p.product_name}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {p.quantity} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services & Inquiries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Wrench size={14} /> Total Services
                </span>
                <span className="font-semibold text-gray-800">{data.total_services}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <MessageSquare size={14} /> Total Inquiries
                </span>
                <span className="font-semibold text-gray-800">{data.total_inquiries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-orange-400" /> New Inquiries
                </span>
                <span className="font-semibold text-orange-500">{data.new_inquiries}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;