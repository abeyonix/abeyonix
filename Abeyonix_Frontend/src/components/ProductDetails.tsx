import { useEffect, useState } from 'react';
import { getProductById } from '@/api/product';
import { addCartItem } from '@/api/cart';
import { ProductDetailResponse } from '@/types/product';
import { useCart } from '@/context/CartContext';


interface Props {
  productId: number;
  onBack: () => void;
}

const ProductDetails = ({ productId, onBack }: Props) => {
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>(
    'description'
  );
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();
  const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);

      const primary = data.media.find(m => m.is_primary);
      setActiveImage(primary?.url || data.media[0]?.url || null);

      setQuantity(1);
      setLoading(false);
    };

    loadProduct();
  }, [productId]);

  if (loading || !product) {
    return <p className="text-center py-10">Loading product…</p>;
  }

  const stockQty = product.inventory?.quantity ?? 0;
  const inStock = stockQty > 0;

  /* ---------------- Quantity Controls ---------------- */
  const increaseQty = () => {
    setQuantity(prev => (prev < stockQty ? prev + 1 : prev));
  };

  const decreaseQty = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : prev));
  };

  /* ---------------- Add to Cart ---------------- */
  const handleAddToCart = async () => {
  if (!inStock) return;

  try {
    setAdding(true);

    await addToCart({
      product_id: product.id,
      quantity,
      unit_price:
        product.pricing?.discount_price ??
        product.pricing?.price ??
        0,
    });
  } catch (err) {
    console.error('Add to cart failed', err);
  } finally {
    setAdding(false);
  }
};

  return (
    <section className="container mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-6 text-sm text-primary hover:underline"
      >
        ← Back to products
      </button>

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT – Images */}
        <div>
          <div className="mb-4 max-w-[420px] mx-auto">
            {activeImage && (
              <img
                src={`${MEDIA_BASE_URL}${activeImage}`}
                className="w-full h-auto object-contain"
                alt={product.name}
              />
            )}
          </div>

          <div className="flex gap-3 justify-center">
            {product.media.map(media => (
              <button
                key={media.id}
                onClick={() => setActiveImage(media.url)}
                className={`w-20 h-20 rounded-md overflow-hidden border ${
                  activeImage === media.url
                    ? 'ring-2 ring-primary'
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
              >
                <img
                  src={`${MEDIA_BASE_URL}${media.url}`}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT – Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <p className={`text-sm ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            {inStock ? `In stock (${stockQty})` : 'Out of stock'}
          </p>

          {/* Price */}
          <div className="text-xl font-semibold">
            {product.pricing?.discount_price ? (
              <>
                <span className="text-primary">
                  ₹{product.pricing.discount_price}
                </span>
                <span className="ml-2 text-gray-400 line-through text-base">
                  ₹{product.pricing.price}
                </span>
              </>
            ) : (
              <span>₹{product.pricing?.price}</span>
            )}
          </div>

          <p className="text-gray-600">{product.short_description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm font-medium">Quantity:</span>

            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={decreaseQty}
                disabled={quantity === 1}
                className="px-3 py-1 text-lg disabled:opacity-40"
              >
                −
              </button>

              <span className="px-4 min-w-[40px] text-center">
                {quantity}
              </span>

              <button
                onClick={increaseQty}
                disabled={quantity >= stockQty}
                className="px-3 py-1 text-lg disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className="px-6 py-2 bg-primary text-white rounded disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>

            <button
              disabled={!inStock}
              className="px-6 py-2 border border-primary text-primary rounded disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="border-b flex gap-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-2 font-medium ${
              activeTab === 'description'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Description
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 font-medium ${
              activeTab === 'reviews'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="mt-6 space-y-4">
            <p>{product.long_description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.attributes.map(attr => (
                <p key={attr.attribute_id} className="text-sm">
                  <strong>{attr.attribute_name}:</strong>{' '}
                  {attr.value}
                  {attr.unit && ` ${attr.unit}`}
                </p>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="mt-6 text-gray-500">
            Be the first to review <strong>{product.name}</strong>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetails;
