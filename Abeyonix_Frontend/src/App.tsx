import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/Contact";
import AboutPage from "./pages/About";
import ServicesPage from "./pages/Services";
import ShopPage from "./pages/Shop";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import Account from "./components/Account";
import CartPage from "@/pages/CartPage";
import { CartProvider } from "./context/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentStatus from "./pages/PaymentStatus";
import ComingSoonPage from "./pages/ComingSoonPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

import {
  PrivacyPolicy,
  TermsConditions,
  RefundPolicy,
  ShippingPolicy,
  PaymentPolicy,
  CancellationPolicy,
  ContactUs,
} from "./pages/Policy";

import AdminRoute from "@/components/AdminRoute";
import AdminLayout from "@/admin/AdminLayout";
import Dashboard from "@/admin/pages/Dashboard";
import AdminCategory from "@/admin/pages/AdminCategory";
import AdminSubCategory from "./admin/pages/AdminSubCategory";
import AdminAttribute from "./admin/pages/AdminAttribute";
import AdminCategoryAttribute from "./admin/pages/AdminCategoryAttribute";
import AdminProduct from "./admin/pages/AdminProduct";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminServices from "./admin/pages/AdminServices";
import AdminInquiryPage from "@/admin/pages/AdminInquiryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
              <Route path="/comming-soon" element={<ComingSoonPage />} />
              <Route
                path="/order-success/:orderId"
                element={<OrderSuccessPage />}
              />

              {/* POLICY */}

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/shipping" element={<ShippingPolicy />} />
              <Route path="/payment" element={<PaymentPolicy />} />
              <Route path="/cancellation" element={<CancellationPolicy />} />
              <Route path="/contact" element={<ContactUs />} />

              {/* ADMIN ROUTES */}

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="categories" element={<AdminCategory />} />
                <Route path="sub-categories" element={<AdminSubCategory />} />
                <Route path="attributes" element={<AdminAttribute />} />
                <Route path="category-attributes" element={<AdminCategoryAttribute />} />
                <Route path="products" element={<AdminProduct />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="inventory" element={<AdminInquiryPage />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
