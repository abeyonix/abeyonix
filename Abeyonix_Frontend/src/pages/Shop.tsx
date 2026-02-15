import { useEffect, useState, useRef } from 'react';
import { ShoppingCart, ChevronRight, ChevronDown, Menu } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetails from '@/components/ProductDetails';
import { ShopProductItem } from '@/types/shop';
import { getCategoryTree } from '@/api/shop';
import { getShopProducts } from '@/api/shop';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '@/api/shop';
import { ProductSearchItem } from '@/types/shop';
import { formatPrice } from '@/utils/formatPrice';


interface Category {
  id: number;
  name: string;
  slug: string;
  image_path: string;
  children: Category[];
  sub_categories: any[];
}

const ShopPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const [activeChild, setActiveChild] = useState<Category | null>(null);
  const childCloseTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [parentTop, setParentTop] = useState(0);
  const [childTop, setChildTop] = useState(0);

  // Mobile accordion state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [expandedChildren, setExpandedChildren] = useState<number[]>([]);

  const [products, setProducts] = useState<ShopProductItem[]>([]);
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | undefined>();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchItem[]>([]);
  const [searchCursor, setSearchCursor] = useState<number | null>(null);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);



  const { addToCart } = useCart();
  const navigate = useNavigate();


  const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

  const pageData = {
    title: "Shop",
    backgroundImage:
      "https://templates.sparklethings.com/dronex/wp-content/uploads/sites/193/2025/12/image-8WMN5XW.jpg",
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Shop' },
    ],
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoryTree();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };

    fetchCategories();
  }, []);


  // PRODUCT FETCH FUNCTION (SCROLL-SAFE)
  const fetchProducts = async (
    reset = false,
    categoryId?: number,
    subCategoryId?: number
  ) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    try {
      const data = await getShopProducts({
        category_id: categoryId,
        sub_category_id: subCategoryId,
        last_id: reset ? undefined : lastId,
      });

      setProducts(prev =>
        reset ? data.items : [...prev, ...data.items]
      );

      setLastId(data.last_id);
      setHasMore(data.has_more);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };


  // INITIAL LOAD (ALL PRODUCTS)
  useEffect(() => {
    fetchProducts(true);
  }, []);


  // Search API handler
  const fetchSearchProducts = async (reset = false) => {
    if (!searchQuery.trim()) return;
    if (!searchHasMore && !reset) return;

    // only show loader on FIRST fetch
    if (reset) setSearchLoading(true);

    try {
      const data = await searchProducts({
        search: searchQuery,
        cursor: reset ? undefined : searchCursor,
        limit: 10,
      });

      setSearchResults(prev =>
        reset ? data.items : [...prev, ...data.items]
      );

      setSearchCursor(data.next_cursor ?? null);
      setSearchHasMore(!!data.next_cursor);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };


  useEffect(() => {
    const query = searchQuery.trim();

  // Reset when less than 3 characters
  if (query.length < 3) {
    setSearchResults([]);
    setSearchCursor(null);
    setSearchHasMore(true);
    setSearchOpen(false);
    return;
  }

    const timeout = setTimeout(() => {
      fetchSearchProducts(true);
      setSearchOpen(true);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setDropdownOpen(false);
      setActiveParent(null);
      setActiveChild(null);
    }, 300);
  };

  const handleParentEnter = (
    category: Category,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (childCloseTimeoutRef.current) {
      clearTimeout(childCloseTimeoutRef.current);
      childCloseTimeoutRef.current = null;
    }

    const parentRect = event.currentTarget.getBoundingClientRect();
    const containerRect =
      event.currentTarget.parentElement?.getBoundingClientRect();

    if (containerRect) {
      setParentTop(parentRect.top - containerRect.top);
    }

    setActiveParent(category);
    setActiveChild(null);
  };

  const handleParentLeave = () => {
    childCloseTimeoutRef.current = window.setTimeout(() => {
      setActiveParent(null);
      setActiveChild(null);
    }, 300);
  };

  const handleChildEnter = (
    child: Category,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (childCloseTimeoutRef.current) {
      clearTimeout(childCloseTimeoutRef.current);
      childCloseTimeoutRef.current = null;
    }

    const childRect = event.currentTarget.getBoundingClientRect();
    const containerRect =
      event.currentTarget.parentElement?.getBoundingClientRect();

    if (containerRect) {
      setChildTop(childRect.top - containerRect.top);
    }

    setActiveChild(child);
  };

  const handleChildLeave = () => {
    childCloseTimeoutRef.current = window.setTimeout(() => {
      setActiveChild(null);
    }, 300);
  };

  // Mobile accordion handlers
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleChildExpansion = (childId: number) => {
    setExpandedChildren(prev =>
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleCategoryClick = (category: Category, subCategoryId?: number) => {
    setSelectedCategoryId(category.id);
    setSelectedSubCategoryId(subCategoryId);
    setMobileMenuOpen(false);
    fetchProducts(true, category.id, subCategoryId);
  };


  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'ig');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={i} className="text-black">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };




  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 &&
        hasMore &&
        !loading
      ) {
        fetchProducts(
          false,
          selectedCategoryId,
          selectedSubCategoryId
        );
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, lastId, selectedCategoryId, selectedSubCategoryId]);



  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Inline Page Header */}
        <section
          className="relative h-[200px] md:h-[250px] flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url('${pageData.backgroundImage}')` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Content */}
          <div className="relative z-10 text-center px-4">
            {/* Breadcrumbs */}
            <p className="text-white/90 text-sm tracking-[0.2em] uppercase mb-2">
              {pageData.breadcrumbs.map((item, index) => (
                <span key={index}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {index < pageData.breadcrumbs.length - 1 && (
                    <span className="mx-2">/</span>
                  )}
                </span>
              ))}
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold font-playfair text-white">
              {pageData.title}
            </h1>
          </div>
        </section>

        {/* Shop Filters Section */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              {/* Mobile Category Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white flex justify-between items-center"
                >
                  <span>Shop by Category</span>
                  <Menu className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop Category Dropdown */}
              <div
                className="hidden md:block relative w-full md:w-64"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Dropdown Button */}
                <div className="border border-gray-300 rounded-md px-4 py-2 text-sm bg-white cursor-pointer flex justify-between items-center">
                  <span>Shop by Category</span>
                  <span className="text-gray-500">▾</span>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute left-0 top-full z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg flex"
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Parent Categories Column */}
                    <div className="w-64 max-h-72 overflow-y-auto">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseEnter={(e) => handleParentEnter(category, e)}
                          onMouseLeave={handleParentLeave}
                          onClick={() => {

                            setSelectedCategoryId(category.id);
                            setSelectedSubCategoryId(undefined);
                            setDropdownOpen(false);
                            fetchProducts(true, category.id);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={`${MEDIA_BASE_URL}${category.image_path}`}
                              alt={category.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {category.name}
                            </span>
                          </div>

                          {(category.children.length > 0 || category.sub_categories.length > 0) && (
                            <span className="text-gray-400">›</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Child Categories Column (Nested) */}
                    {activeParent && activeParent.children.length > 0 && (
                      <div
                        className="absolute left-64 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-y-auto"
                        style={{ top: parentTop }}
                        onMouseEnter={() => {
                          if (childCloseTimeoutRef.current) {
                            clearTimeout(childCloseTimeoutRef.current);
                            childCloseTimeoutRef.current = null;
                          }
                        }}
                        onMouseLeave={handleParentLeave}
                      >
                        {activeParent.children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseEnter={(e) => handleChildEnter(child, e)}
                            onClick={() => {

                              setSelectedCategoryId(activeParent?.id);
                              setSelectedSubCategoryId(child.id);
                              setDropdownOpen(false);
                              fetchProducts(true, activeParent?.id, child.id);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={`${MEDIA_BASE_URL}${child.image_path}`}
                                alt={child.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {child.name}
                              </span>
                            </div>

                            {child.sub_categories.length > 0 && (
                              <span className="text-gray-400">›</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Subcategories Cards for Parent Categories */}
                    {activeParent &&
                      activeParent.children.length === 0 &&
                      activeParent.sub_categories.length > 0 && (
                        <div
                          className="absolute left-64 w-96 bg-white border border-gray-200 rounded-md shadow-lg p-4"
                          style={{ top: parentTop }}
                          onMouseEnter={() => {
                            if (childCloseTimeoutRef.current) {
                              clearTimeout(childCloseTimeoutRef.current);
                              childCloseTimeoutRef.current = null;
                            }
                          }}
                          onMouseLeave={handleParentLeave}
                        >
                          <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                            {activeParent.sub_categories.map((subCategory) => (
                              <div
                                key={subCategory.id}
                                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {

                                  setSelectedCategoryId(activeParent?.id);
                                  setSelectedSubCategoryId(subCategory.id);
                                  setDropdownOpen(false);
                                  fetchProducts(true, activeParent?.id, subCategory.id);
                                }}
                              >
                                <div className="w-16 h-16 rounded-md overflow-hidden mb-2 bg-gray-100">
                                  <img
                                    src={`${MEDIA_BASE_URL}${subCategory.image_path}`}
                                    alt={subCategory.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-xs text-center text-gray-700">
                                  {subCategory.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Subcategories Cards for Child Categories */}
                    {activeChild && activeChild.sub_categories.length > 0 && (
                      <div
                        className="absolute left-[32rem] w-96 bg-white border border-gray-200 rounded-md shadow-lg p-4"
                        style={{ top: childTop }}
                        onMouseEnter={() => {
                          if (childCloseTimeoutRef.current) {
                            clearTimeout(childCloseTimeoutRef.current);
                            childCloseTimeoutRef.current = null;
                          }
                        }}
                      >
                        <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                          {activeChild.sub_categories.map((subCategory) => (
                            <div
                              key={subCategory.id}
                              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {

                                setSelectedCategoryId(activeParent?.id);
                                setSelectedSubCategoryId(subCategory.id);
                                setDropdownOpen(false);
                                fetchProducts(true, activeParent?.id, subCategory.id);
                              }}
                            >
                              <div className="w-16 h-16 rounded-md overflow-hidden mb-2 bg-gray-100">
                                <img
                                  src={`${MEDIA_BASE_URL}${subCategory.image_path}`}
                                  alt={subCategory.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs text-center text-gray-700">
                                {subCategory.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Bar (Right) */}
              <div className="w-full md:w-80 relative" ref={searchBoxRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onFocus={() => searchResults.length && setSearchOpen(true)}
                />

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                {/* SEARCH DROPDOWN */}
                {searchOpen && searchResults.length > 0 && (
                  <div
                    className="absolute z-50 mt-2 w-full bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (
                        el.scrollTop + el.clientHeight >= el.scrollHeight - 50 &&
                        searchHasMore &&
                        !searchLoading
                      ) {
                        fetchSearchProducts();
                      }
                    }}
                  >
                    {searchResults.map(product => (
                      <div
                        key={product.id}
                        className="flex gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {/* Image */}
                        <img
                          src={`${MEDIA_BASE_URL}${product.primary_image}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />

                        {/* Info */}
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">
                            {highlightText(product.name, searchQuery)}
                          </p>
                          <span className="text-sm text-primary font-semibold">
                            ₹{formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* First-load loader only */}
                    {searchLoading && (
                      <p className="text-center text-sm py-2 text-gray-400">
                        Searching…
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Mobile Category Accordion Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">Categories</h3>
                <button onClick={() => setMobileMenuOpen(false)}>
                  ✕
                </button>
              </div>

              <div className="py-2">
                {categories.map((category) => (
                  <div key={category.id} className="border-b">
                    {/* Category Item */}
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`${MEDIA_BASE_URL}${category.image_path}`}
                          alt={category.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {category.name}
                        </span>
                      </div>
                      {(category.children.length > 0 || category.sub_categories.length > 0) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryExpansion(category.id);
                          }}
                          className="p-1"
                        >
                          {expandedCategories.includes(category.id) ?
                            <ChevronDown className="w-4 h-4" /> :
                            <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                      )}
                    </div>

                    {/* Subcategories for Parent Categories (direct) */}
                    {expandedCategories.includes(category.id) &&
                      category.children.length === 0 &&
                      category.sub_categories.length > 0 && (
                        <div className="pl-12 py-2 bg-gray-50">
                          {category.sub_categories.map((subCategory) => (
                            <div
                              key={subCategory.id}
                              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleCategoryClick(category, subCategory.id)}
                            >
                              <img
                                src={`${MEDIA_BASE_URL}${subCategory.image_path}`}
                                alt={subCategory.name}
                                className="w-6 h-6 object-cover rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {subCategory.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Child Categories */}
                    {expandedCategories.includes(category.id) &&
                      category.children.length > 0 && (
                        <div className="bg-gray-50">
                          {category.children.map((child) => (
                            <div key={child.id} className="border-b border-gray-200">
                              {/* Child Category Item */}
                              <div
                                className="flex items-center justify-between px-8 py-3 cursor-pointer"
                                onClick={() => handleCategoryClick(category, child.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={`${MEDIA_BASE_URL}${child.image_path}`}
                                    alt={child.name}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {child.name}
                                  </span>
                                </div>
                                {child.sub_categories.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleChildExpansion(child.id);
                                    }}
                                    className="p-1"
                                  >
                                    {expandedChildren.includes(child.id) ?
                                      <ChevronDown className="w-4 h-4" /> :
                                      <ChevronRight className="w-4 h-4" />
                                    }
                                  </button>
                                )}
                              </div>

                              {/* Subcategories for Child Categories */}
                              {expandedChildren.includes(child.id) &&
                                child.sub_categories.length > 0 && (
                                  <div className="pl-16 py-2 bg-gray-100">
                                    {child.sub_categories.map((subCategory) => (
                                      <div
                                        key={subCategory.id}
                                        className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleCategoryClick(category, subCategory.id)}
                                      >
                                        <img
                                          src={`${MEDIA_BASE_URL}${subCategory.image_path}`}
                                          alt={subCategory.name}
                                          className="w-6 h-6 object-cover rounded"
                                        />
                                        <span className="text-sm text-gray-700">
                                          {subCategory.name}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        <section className="container mx-auto px-4 py-10">
          {products.length === 0 && !loading && (
            <p className="text-center text-gray-500">
              No products found
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={`${MEDIA_BASE_URL}${product.primary_image}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    {product.discount_price ? (
                      <>
                        <span className="text-primary font-semibold">
                          ₹{formatPrice(product.discount_price)}
                        </span>
                        <span className="text-gray-400 text-sm line-through">
                          ₹{formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">
                        ₹{formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Add to cart */}
                  <button
                    className="mt-auto flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-md hover:opacity-90 transition"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent opening product details
                      addToCart({
                        product_id: product.id,
                        unit_price: product.discount_price ?? product.price,
                        quantity: 1
                      });
                    }}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                </div>
              </div>
            ))}
          </div>

          {loading && (
            <p className="text-center mt-6 text-gray-500">
              Loading more products…
            </p>
          )}
        </section>


      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;