import { updateCartItem, deleteCartItem } from '@/api/cart';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

const CartPage = () => {
    const { user } = useAuth();
    const { cartItems, cartTotalPrice, refetchCart } = useCart();
    const navigate = useNavigate();

    const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

    const pageData = {
        title: 'Cart',
        backgroundImage:
            'https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg',
        breadcrumbs: [
            { label: 'Home', href: '/' },
            { label: 'Cart' },
        ],
    };

    const handleIncreaseQty = async (itemId: number, currentQty: number) => {
        await updateCartItem(itemId, {
            quantity: currentQty + 1,
        });

        await refetchCart();
    };

    const handleDecreaseQty = async (itemId: number, currentQty: number) => {
        if (currentQty <= 1) return;

        await updateCartItem(itemId, {
            quantity: currentQty - 1,
        });

        await refetchCart();
    };

    const handleRemoveItem = async (itemId: number) => {
        await deleteCartItem(itemId);
        await refetchCart();
    };




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
                                        <a href={item.href} className="hover:opacity-80">
                                            {item.label}
                                        </a>
                                    ) : (
                                        item.label
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

                {/* ================= CART CONTENT ================= */}
                <section className="container mx-auto px-4 py-10">
                    {!user ? (
                        <p className="text-center text-gray-500">
                            Please login to view your cart
                        </p>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            {/* Image */}
                            <img
                                src="https://illustrations.popsy.co/gray/shopping-cart.svg"
                                alt="Empty cart"
                                className="w-48 mb-6 opacity-80"
                            />

                            {/* Heading */}
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                                Your cart is feeling lonely 🛒
                            </h2>

                            {/* Sub text */}
                            <p className="text-gray-500 max-w-md mb-6">
                                Looks like you haven’t added anything yet.
                                Go ahead, make your cart happy — it loves company!
                            </p>

                            {/* CTA */}
                            <a
                                href="/shop"
                                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:opacity-90 transition"
                            >
                                Start Shopping
                            </a>
                        </div>

                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* ================= CART ITEMS ================= */}
                            <div className="lg:col-span-2">

                                {/* -------- Header Row -------- */}
                                <div className="hidden lg:grid grid-cols-5 gap-4 pb-3 border-b text-sm font-semibold text-gray-600">
                                    <span className="col-span-2">Product</span>
                                    <span className="text-center">Price</span>
                                    <span className="text-center">Quantity</span>
                                    <span className="text-right">Sub Total</span>
                                </div>

                                {/* -------- Items -------- */}
                                {cartItems.map(item => (
                                    <div key={item.id}>
                                        {/* ================= DESKTOP VIEW ================= */}
                                        <div className="hidden lg:grid grid-cols-5 gap-4 py-4 items-center">
                                            {/* Product */}
                                            <div className="col-span-2 flex gap-4 items-center relative">
                                                {/* Remove button */}
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="absolute -left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                                                    aria-label="Remove item"
                                                >
                                                    <X size={16} />
                                                </button>

                                                <img
                                                    src={`${MEDIA_BASE_URL}${item.product.primary_image}`}
                                                    alt={item.product.name}
                                                    onClick={() => navigate(`/product/${item.product.product_id}`)}
                                                    className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition"
                                                />

                                                <span className="font-medium text-gray-800">
                                                    {item.product.name}
                                                </span>
                                            </div>


                                            {/* Unit Price */}
                                            <div className="text-center text-gray-700">
                                                ₹{formatPrice(item.unit_price)}
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="w-8 h-8 border rounded text-lg disabled:opacity-40"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() =>
                                                        handleDecreaseQty(item.id, item.quantity)
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span className="w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    className="w-8 h-8 border rounded text-lg"
                                                    onClick={() =>
                                                        handleIncreaseQty(item.id, item.quantity)
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>


                                            {/* Sub Total */}
                                            <div className="text-right font-semibold">
                                                ₹{formatPrice(item.total_price)}
                                            </div>
                                        </div>

                                        {/* ================= MOBILE VIEW ================= */}
                                        <div className="lg:hidden flex justify-between py-4">
                                            {/* Left side */}
                                            <div className="flex gap-4">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="absolute -left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                                                        aria-label="Remove item"
                                                    >
                                                        <X size={16} />
                                                    </button>

                                                    <img
                                                        src={`${MEDIA_BASE_URL}${item.product.primary_image}`}
                                                        alt={item.product.name}
                                                        onClick={() => navigate(`/product/${item.product.product_id}`)}
                                                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition"
                                                    />
                                                </div>


                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-800">
                                                        {item.product.name}
                                                    </span>

                                                    <span className="text-sm text-gray-600">
                                                        Price: ₹{formatPrice(item.unit_price)}
                                                    </span>

                                                    {/* Quantity */}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <button
                                                            className="w-7 h-7 border rounded text-lg disabled:opacity-40"
                                                            disabled={item.quantity <= 1}
                                                            onClick={() =>
                                                                handleDecreaseQty(item.id, item.quantity)
                                                            }
                                                        >
                                                            −
                                                        </button>

                                                        <span className="w-6 text-center font-medium">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            className="w-7 h-7 border rounded text-lg"
                                                            onClick={() =>
                                                                handleIncreaseQty(item.id, item.quantity)
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Right side */}
                                            <div className="font-semibold text-right">
                                                ₹{formatPrice(item.total_price)}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <hr />
                                    </div>

                                ))}
                            </div>

                            {/* ================= SUMMARY ================= */}
                            <div className="border rounded-lg p-6 bg-white h-fit">
                                <h3 className="text-lg font-semibold mb-4">
                                    Order Summary
                                </h3>

                                <div className="flex justify-between text-sm mb-2">
                                    <span>Subtotal</span>
                                    <span>₹{formatPrice(cartTotalPrice)}</span>
                                </div>

                                <div className="flex justify-between text-sm mb-2">
                                    <span>Delivery</span>
                                    <span>₹0</span>
                                </div>

                                <hr className="my-3" />

                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>₹{formatPrice(cartTotalPrice)}</span>
                                </div>

                                <a
                                    href="/checkout"
                                    className="mt-6 block text-center bg-primary text-white py-3 rounded-md hover:opacity-90 transition"
                                >
                                    Proceed to Checkout
                                </a>
                            </div>
                        </div>
                    )}
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default CartPage;
