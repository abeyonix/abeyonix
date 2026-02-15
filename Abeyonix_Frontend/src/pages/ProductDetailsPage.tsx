import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getProductById } from '@/api/product';
import { ProductDetailResponse } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<'description' | 'reviews'>('description');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();
  const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      const data = await getProductById(Number(id));
      setProduct(data);

      const primary = data.media.find(m => m.is_primary);
      setActiveImage(primary?.url || data.media[0]?.url || null);

      setQuantity(1);
      setLoading(false);
    };

    loadProduct();
  }, [id]);

  if (loading || !product) {
    return (
      <>
        <Header />
        <p className="text-center py-20">Loading product…</p>
        <Footer />
      </>
    );
  }

  const stockQty = product.inventory?.quantity ?? 0;
  const inStock = stockQty > 0;

  const increaseQty = () =>
    setQuantity(prev => (prev < stockQty ? prev + 1 : prev));

  const decreaseQty = () =>
    setQuantity(prev => (prev > 1 ? prev - 1 : prev));

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
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Page Header */}
        <section
          className="relative h-[200px] md:h-[250px] flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 text-center px-4">
            <p className="text-white/90 text-sm tracking-[0.2em] uppercase mb-2">
              <span
                className="cursor-pointer hover:opacity-80"
                onClick={() => navigate('/')}
              >
                Home
              </span>
              <span className="mx-2">/</span>
              <span
                className="cursor-pointer hover:opacity-80"
                onClick={() => navigate('/shop')}
              >
                Shop
              </span>
              <span className="mx-2">/</span>
              <span>{product.name}</span>
            </p>

            <h1 className="text-3xl md:text-4xl font-bold font-playfair text-white">
              {product.name}
            </h1>
          </div>
        </section>

        {/* Product Content */}
        <section className="container mx-auto px-4 py-10">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm text-primary hover:underline"
          >
            ← Back
          </button>

          {/* Main */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Images */}
            <div>
              <div className="mb-4 max-w-[420px] mx-auto">
                {activeImage && (
                  <img
                    src={`${MEDIA_BASE_URL}${activeImage}`}
                    className="w-full object-contain"
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
                        : ''
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

            {/* Info */}
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
                  ₹{formatPrice(product.pricing.discount_price)}
                </span>
                <span className="ml-2 text-gray-400 line-through text-base">
                  ₹{formatPrice(product.pricing.price)}
                </span>
              </>
            ) : (
              <span>₹{formatPrice(product.pricing?.price)}</span>
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
              onClick={()=> navigate(`/checkout?product_id=${product.id}&quantity=1`)}
            >
              Buy Now
            </button>
          </div>
        </div>
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <div className="border-b flex gap-6">
              {['description', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="mt-6">
                <p>{product.long_description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="mt-6 text-gray-500">
                No reviews yet
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
