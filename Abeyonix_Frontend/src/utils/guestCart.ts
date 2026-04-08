const GUEST_CART_KEY = 'guest_cart';

// Matches the exact API CartItemResponse shape
export interface GuestCartItem {
    id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_active: boolean;
    product: {
        product_id: number;
        name: string;
        slug: string;
        category_name: string;
        sub_category_name: string;
        primary_image: string;
        stock_quantity: number;
    };
}

export const getGuestCart = (): GuestCartItem[] => {
    try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveGuestCart = (items: GuestCartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const addGuestCartItem = (product: {
    product_id: number;
    name: string;
    primary_image: string;
    unit_price: number;
    quantity: number;
    slug?: string;
    category_name?: string;
    sub_category_name?: string;
    stock_quantity?: number;
}) => {
    const cart = getGuestCart();
    const existing = cart.find(item => item.product.product_id === product.product_id);

    if (existing) {
        existing.quantity += product.quantity;
        existing.total_price = existing.unit_price * existing.quantity;
    } else {
        cart.push({
            id: product.product_id,           // temp id for guest
            quantity: product.quantity,
            unit_price: product.unit_price,
            total_price: product.unit_price * product.quantity,
            is_active: true,
            product: {
                product_id: product.product_id,
                name: product.name,
                slug: product.slug ?? '',
                category_name: product.category_name ?? '',
                sub_category_name: product.sub_category_name ?? '',
                primary_image: product.primary_image,
                stock_quantity: product.stock_quantity ?? 0,
            },
        });
    }

    saveGuestCart(cart);
};

export const updateGuestCartItem = (product_id: number, quantity: number) => {
    const cart = getGuestCart();
    const item = cart.find(i => i.product.product_id === product_id);
    if (item) {
        item.quantity = quantity;
        item.total_price = item.unit_price * quantity;
        saveGuestCart(cart);
    }
};

export const removeGuestCartItem = (product_id: number) => {
    const updated = getGuestCart().filter(i => i.product.product_id !== product_id);
    saveGuestCart(updated);
};

export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
};

export const getGuestCartCount = (): number => {
    return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
};

export const getGuestCartTotal = (): number => {
    return getGuestCart().reduce((sum, item) => sum + item.total_price, 0);
};