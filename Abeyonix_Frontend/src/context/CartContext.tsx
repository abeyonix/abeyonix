import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { addCartItem, getCartItems } from "@/api/cart";
import { useAuth } from "@/context/AuthContext";
import type { CartItemResponse } from "@/types/cart";
import { toast } from "sonner";
import {
  getGuestCart,
  addGuestCartItem,
  clearGuestCart,
  getGuestCartCount,
  getGuestCartTotal,
} from "@/utils/guestCart";

interface CartContextType {
  cartItems: CartItemResponse[];
  cartCount: number;
  cartTotalPrice: number;
  cartLoading: boolean;
  addToCart: (product: {
    product_id: number;
    unit_price: number;
    quantity: number;
    name?: string;
    primary_image?: string;
    slug?: string;
    category_name?: string;
    sub_category_name?: string;
    stock_quantity?: number;
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
  const isSyncing = useRef(false);

  /* ================= FETCH CART ================= */
  const refetchCart = async () => {
    if (user) {
      // Logged in → fetch from API
      try {
        setCartLoading(true);
        const data = await getCartItems(user.user_id);
        setCartItems(data.items);
        setCartCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
        setCartTotalPrice(
          data.items.reduce((sum, item) => sum + item.total_price, 0),
        );
      } catch (err) {
        console.error("Failed to fetch cart", err);
      } finally {
        setCartLoading(false);
      }
    } else {
      // Guest → read from localStorage (same shape as CartItemResponse)
      const guestItems = getGuestCart();
      setCartItems(guestItems as unknown as CartItemResponse[]);
      setCartCount(getGuestCartCount());
      setCartTotalPrice(getGuestCartTotal());
    }
  };

  /* ================= SYNC GUEST CART TO DB ON LOGIN ================= */
  const syncGuestCartToServer = async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    const guestItems = getGuestCart();
    if (guestItems.length === 0) {
      isSyncing.current = false;
      return;
    }

    try {
      setCartLoading(true);
      for (const item of guestItems) {
        await addCartItem({
          user_id: user!.user_id,
          product_id: item.product.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          session_id: null,
        });
      }
      clearGuestCart();
    } catch (err) {
      console.error("Failed to sync guest cart to server", err);
    } finally {
      isSyncing.current = false;
      setCartLoading(false);
    }
  };

  /* ================= AUTO LOAD ON LOGIN / LOGOUT ================= */
  useEffect(() => {
    if (user && !didFetch.current) {
      didFetch.current = true;
      syncGuestCartToServer().then(() => refetchCart());
    }

    if (!user) {
      didFetch.current = false;
      refetchCart(); // loads guest cart from localStorage
    }
  }, [user]);

  /* ================= ADD TO CART ================= */
  const addToCart = async ({
    product_id,
    unit_price,
    quantity,
    name = "",
    primary_image = "",
    slug = "",
    category_name = "",
    sub_category_name = "",
    stock_quantity = 0,
  }: {
    product_id: number;
    unit_price: number;
    quantity: number;
    name?: string;
    primary_image?: string;
    slug?: string;
    category_name?: string;
    sub_category_name?: string;
    stock_quantity?: number;
  }) => {
    if (!user) {
      // Guest → save to localStorage
      addGuestCartItem({
        product_id,
        unit_price,
        quantity,
        name,
        primary_image,
        slug,
        category_name,
        sub_category_name,
        stock_quantity,
      });
      await refetchCart();
      toast.success("Item added to cart");
      return;
    }

    // Logged in → save to API
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
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : "Something went wrong while adding to cart",
      );
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
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
