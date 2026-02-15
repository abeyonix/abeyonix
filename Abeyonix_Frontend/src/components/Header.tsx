import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Home,
  Store,
  MoreHorizontal,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { useCart } from '@/context/CartContext';
import { getCartItems } from '@/api/cart';
import type { CartItemResponse } from '@/types/cart';
import { formatPrice } from '@/utils/formatPrice';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    cartCount,
    cartItems,       // ✅ FROM CONTEXT
    cartLoading,     // ✅ FROM CONTEXT (if you added it)
  } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  // const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  // const [cartLoading, setCartLoading] = useState(false);
  const cartRef = useRef<HTMLDivElement | null>(null);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Shop', href: '/shop' },
    { name: 'Contact', href: '/contact' },
  ];

  // useEffect(() => {
  //   if (!cartOpen || !user) return;

  //   const loadCart = async () => {
  //     try {
  //       setCartLoading(true);
  //       const data = await getCartItems(user.user_id);
  //       setCartItems(data.items);
  //     } catch (err) {
  //       console.error('Failed to load cart', err);
  //     } finally {
  //       setCartLoading(false);
  //     }
  //   };

  //   loadCart();
  // }, [cartOpen, user]);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const isMobileActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartOpen &&
        cartRef.current &&
        !cartRef.current.contains(event.target as Node)
      ) {
        setCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartOpen]);

  return (
    <>
      {/* ================= DESKTOP HEADER (UNCHANGED) ================= */}
      <header
        className="
    w-full
    bg-background
    shadow-lg
    lg:fixed lg:top-4 lg:left-1/2 lg:-translate-x-1/2
    lg:z-50
    lg:w-[95%] lg:max-w-7xl
    lg:rounded-xl
  "
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <img
                src="https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/Group-2.png"
                alt="DroneX Logo"
                className="h-8 md:h-10"
              />
            </a>

            {/* ================= DESKTOP NAV ================= */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`transition-colors duration-200 ${isActive(link.href)
                    ? 'text-drone-orange font-bold'
                    : 'text-gray-700 hover:text-drone-orange'
                    }`}
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* ================= DESKTOP RIGHT ================= */}
            <div className="hidden lg:flex items-center gap-4">

              {/* CART ICON + MINI CART */}
              <div ref={cartRef} className="relative">

                {/* Cart Icon (CLICK TO OPEN) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      setLoginOpen(true);
                      return;
                    }
                    setCartOpen(prev => !prev);
                  }}
                  className="relative text-gray-700 hover:text-drone-orange"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-drone-orange text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>

                {/* Mini Cart Dropdown */}
                {cartOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-lg z-50">

                    {/* Items */}
                    <div className="max-h-72 overflow-y-auto">
                      {cartLoading ? (
                        <p className="p-4 text-sm text-gray-500">
                          Loading cart…
                        </p>
                      ) : cartItems.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">
                          Your cart is empty
                        </p>
                      ) : (
                        cartItems.map(item => (
                          <div
                            key={item.id}
                            className="flex gap-3 px-4 py-3 border-b last:border-b-0"
                          >
                            <img
                              src={`${import.meta.env.VITE_MEDIA_BASE_URL}${item.product.primary_image}`}
                              alt={item.product.name}
                              className="w-14 h-14 object-cover rounded"
                            />

                            <div className="flex flex-col text-sm">
                              <span className="font-medium line-clamp-1">
                                {item.product.name}
                              </span>
                              <span className="text-gray-500">
                                {item.quantity} × ₹{formatPrice(item.unit_price)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4 flex gap-2">
                      <a
                        href="/cart"
                        className="flex-1 text-center py-2 border rounded text-sm hover:bg-gray-100"
                      >
                        View Cart
                      </a>

                      <a
                        href="/checkout"
                        className="flex-1 text-center py-2 bg-primary text-white rounded text-sm hover:bg-primary/90"
                      >
                        Checkout
                      </a>
                    </div>
                  </div>
                )}
              </div>


              {/* LOGIN / USER MENU */}
              {!user ? (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-drone-orange text-drone-orange rounded-md"
                >
                  <User className="w-4 h-4" />
                  Login
                </button>
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                    setUserMenuOpen(true);
                  }}
                  onMouseLeave={() => {
                    closeTimeoutRef.current = setTimeout(() => {
                      setUserMenuOpen(false);
                    }, 250);
                  }}
                >
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-md">
                    <User className="w-4 h-4" />
                    {user.user_name}
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-40 bg-white shadow rounded-md
        transition-all duration-200
        ${userMenuOpen
                        ? 'opacity-100 translate-y-0 visible'
                        : 'opacity-0 translate-y-1 invisible'
                      }`}
                  >
                    <a
                      href="/account"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Account
                    </a>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

            </div>


            {/* ================= MOBILE RIGHT ================= */}
            <div className="flex lg:hidden items-center">
              {!user ? (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-drone-orange font-medium"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={() => (window.location.href = '/account')}
                  className="flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {user.user_name}
                  </span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>



      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow lg:hidden">
        <div className="flex justify-around items-center h-16 text-xs">

          <a
            href="/"
            className={`relative flex flex-col items-center gap-1 ${isMobileActive('/')
              ? 'text-drone-orange'
              : 'text-gray-500'
              }`}
          >

            <Home size={20} />
            Home
          </a>

          <a
            href="/shop"
            className={`relative flex flex-col items-center gap-1 ${isMobileActive('/shop')
              ? 'text-drone-orange'
              : 'text-gray-500'
              }`}
          >

            <Store size={20} />
            Shop
          </a>

          <button
            onClick={() => {
              if (!user) setLoginOpen(true);
              else window.location.href = '/cart';
            }}
            className={`relative flex flex-col items-center gap-1 ${isMobileActive('/cart')
              ? 'text-drone-orange'
              : 'text-gray-500'
              }`}
          >

            <ShoppingCart size={20} />
            Cart
            <span className="absolute -top-1 -right-1 bg-drone-orange text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          </button>
          <button
            onClick={() => {
              if (!user) setLoginOpen(true);
              else window.location.href = '/account';
            }}
            className={`relative flex flex-col items-center gap-1 ${isMobileActive('/account')
              ? 'text-drone-orange'
              : 'text-gray-500'
              }`}
          >
            <User size={20} />
            Account
          </button>


          <div className="relative group">
            <button className="flex flex-col items-center gap-1">
              <MoreHorizontal size={20} />
              More
            </button>

            <div className="absolute bottom-14 right-0 hidden group-hover:block bg-white shadow rounded-md w-40">
              <a href="/about" className="block px-4 py-2 hover:bg-gray-100">
                About
              </a>
              <a href="/services" className="block px-4 py-2 hover:bg-gray-100">
                Services
              </a>
              <a href="/contact" className="block px-4 py-2 hover:bg-gray-100">
                Contact
              </a>

              {user && (
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ================= MODALS ================= */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignUp={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onForgotPassword={() => {
          setLoginOpen(false);
          setForgotOpen(true);
        }}
      />

      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onBackToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => {
          setForgotOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
};

export default Header;
