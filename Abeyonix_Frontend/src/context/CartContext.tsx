import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useRef
} from 'react';

import { addCartItem, getCartItems } from '@/api/cart';
import { useAuth } from '@/context/AuthContext';
import type { CartItemResponse } from '@/types/cart';
import { toast } from "sonner";

interface CartContextType {
    cartItems: CartItemResponse[];
    cartCount: number;
    cartTotalPrice: number;
    cartLoading: boolean;
    addToCart: (product: {
        product_id: number;
        unit_price: number;
        quantity: number;
    }) => Promise<void>;
    resetCart: () => void;
    refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotalPrice, setCartTotalPrice] = useState(0);

    const [cartLoading, setCartLoading] = useState(false);
    const didFetch = useRef(false);

    /* ================= FETCH CART ================= */
    const refetchCart = async () => {
        if (!user) return;

        try {
            setCartLoading(true);
            const data = await getCartItems(user.user_id);

            setCartItems(data.items);

            const totalQty = data.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            const totalPrice = data.items.reduce(
                (sum, item) => sum + item.total_price,
                0
            );

            setCartCount(totalQty);
            setCartTotalPrice(totalPrice);
        } catch (err) {
            console.error('Failed to fetch cart', err);
        } finally {
            setCartLoading(false); // ✅ END
        }
    };

    /* ================= AUTO LOAD ON LOGIN ================= */
    useEffect(() => {
        if (user && !didFetch.current) {
            didFetch.current = true;
            refetchCart();
        }

        if (!user) {
            didFetch.current = false;
            resetCart();
        }
    }, [user]);

    /* ================= ADD TO CART ================= */
    const addToCart = async ({
        product_id,
        unit_price,
        quantity,
    }: {
        product_id: number;
        unit_price: number;
        quantity: number;
    }) => {
        if (!user) {
            toast.success(`Please login to add items to cart`);
            return;
        }

        try {
            setCartLoading(true);

            await addCartItem({
                user_id: user.user_id,
                product_id,
                quantity,
                unit_price,
                session_id: null,
            });

            await refetchCart();
        } finally {
            setCartLoading(false);
        }
    };

    /* ================= RESET ================= */
    const resetCart = () => {
        setCartItems([]);
        setCartCount(0);
        setCartTotalPrice(0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartTotalPrice,
                cartLoading,
                addToCart,
                resetCart,
                refetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return ctx;
};
