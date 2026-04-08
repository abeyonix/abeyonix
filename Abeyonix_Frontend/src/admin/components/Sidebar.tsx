import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Box,
  Layers,
  Package,
  ShoppingCart,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const menu = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Category", path: "/admin/categories", icon: Layers },
  { name: "Sub Category", path: "/admin/sub-categories", icon: Layers },
  { name: "Attributes", path: "/admin/attributes", icon: Settings },
  {
    name: "Category Attributes",
    path: "/admin/category-attributes",
    icon: Settings,
  },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Services", path: "/admin/services", icon: Box },
  { name: "Inventory", path: "/admin/inventory", icon: Box },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`sticky h-screen top-0 left-0 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl p-4 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } w-64`}
      >
        {/* Logo and title */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg mr-3">
            A
          </div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>

        {/* Navigation menu */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {menu.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Background hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>

                    <Icon size={20} className="relative z-10" />
                    <span className="relative z-10">{item.name}</span>

                    {/* ✅ Active indicator FIXED */}
                    {isActive && (
                      <span className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section with logout */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:bg-opacity-30 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Add animation styles */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
