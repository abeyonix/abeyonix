import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  updateProductStatus
} from "@/api/product";
import { getCategories } from "@/api/category";
import { getSubCategories } from "@/api/subCategory";
import { getCategoryAttributes } from "@/api/attribute";
import {
  Plus,
  Edit2,
  Eye,
  Trash2,
  Loader2,
  X,
  Search,
  Upload,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { ProductMedia } from "@/types/product";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "";

export default function AdminProduct() {
  // State for products and data
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State for categories and attributes
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState<any>({
    name: "",
    category_id: "",
    sub_category_id: "",
    brand: "",
    short_description: "",
    long_description: "",
    price: "",
    discount_price: "",
    quantity: "",
    low_quantity_alert_at: "",
    attributes: {},
    images: [],
    primary_image_index: 0,
  });

  // Image preview state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getPrimaryImage = (media: ProductMedia[]): ProductMedia | null => {
    if (!media || media.length === 0) return null;

    return media.find((m) => m.is_primary) || null;
  };

  // Fetch products
  const fetchProducts = async () => {
  setLoading(true);
  try {
    const res = await getProducts({ page, search });

    setProducts(res.items || []);

    const pageSize = res.page_size || 10; // from API
    const totalItems = res.total || 0;

    setTotalItems(totalItems);
    setTotalPages(Math.ceil(totalItems / pageSize)); // ✅ FIX
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    setLoading(false);
  }
};

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const cats = await getCategories();
      const subs = await getSubCategories();
      setCategories(cats);
      setSubCategories(subs);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle category change
  const handleCategoryChange = async (catId: string) => {
    setForm({
      ...form,
      category_id: catId,
      sub_category_id: "",
      attributes: {},
    });

    if (catId) {
      try {
        const attrs = await getCategoryAttributes({
          category_id: Number(catId),
        });
        setAttributes(attrs);
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
      }
    } else {
      setAttributes([]);
    }
  };

  // Handle subcategory change
  const handleSubCategoryChange = async (subId: string) => {
    setForm({ ...form, sub_category_id: subId, attributes: {} });

    if (subId && form.category_id) {
      try {
        const attrs = await getCategoryAttributes({
          category_id: Number(form.category_id),
          sub_category_id: Number(subId),
        });
        setAttributes(attrs);
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
      }
    }
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle attribute change
  const handleAttributeChange = (attributeId: number, value: string) => {
    setForm({
      ...form,
      attributes: {
        ...form.attributes,
        [attributeId]: value,
      },
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }
    setForm({ ...form, images: files });

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Handle add product
  const handleAdd = () => {
    setEditData(null);
    resetForm();
    setOpenModal(true);
  };

  // Handle edit product
  const handleEdit = async (productId: number) => {
    setLoading(true);
    try {
      const product = await getProductById(productId);
      setEditData(product);

      const primaryIndex = product.media?.findIndex((m) => m.is_primary) ?? 0;

      // Populate form
      const formData = {
        name: product.name,
        category_id: product.category_id?.toString() || "",
        sub_category_id: product.sub_category_id?.toString() || "",
        brand: product.brand || "",
        short_description: product.short_description || "",
        long_description: product.long_description || "",
        price: product.pricing.price?.toString() || "",
        discount_price: product.pricing.discount_price?.toString() || "",
        quantity: product.inventory.quantity?.toString() || "",
        low_quantity_alert_at:
          product.inventory.low_quantity_alert_at?.toString() || "",
        attributes: {},
        images: [],
        primary_image_index: primaryIndex !== -1 ? primaryIndex : 0,
      };

      // Convert attributes array to object
      if (product.attributes) {
        product.attributes.forEach((attr: any) => {
          formData.attributes[attr.attribute_id] = attr.value;
        });
      }

      setForm(formData);
      setExistingImages(product.media || []);

      // Fetch attributes for this category/subcategory
      if (product.category_id) {
        const attrs = await getCategoryAttributes({
          category_id: product.category_id,
          sub_category_id: product.sub_category_id,
        });
        setAttributes(attrs);
      }

      setOpenModal(true);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view product
  const handleView = (product: any) => {
    setViewProduct(product);
  };

  // Handle delete
  const handleDelete = (productId: number) => {
    setDeleteId(productId);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);
    try {
      await deleteProduct(deleteId);
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle active/inactive
  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    try {
      await updateProductStatus(productId, !currentStatus);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Failed to update product status:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      category_id: "",
      sub_category_id: "",
      brand: "",
      short_description: "",
      long_description: "",
      price: "",
      discount_price: "",
      quantity: "",
      low_quantity_alert_at: "",
      attributes: {},
      images: [],
      primary_image_index: 0,
    });
    setAttributes([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditData(null);
  };

  // Handle submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        sub_category_id: form.sub_category_id
          ? Number(form.sub_category_id)
          : undefined,
        price: Number(form.price),
        discount_price: form.discount_price
          ? Number(form.discount_price)
          : undefined,
        quantity: Number(form.quantity),
        low_quantity_alert_at: Number(form.low_quantity_alert_at),
        primary_image_index: Number(form.primary_image_index),

        attributes: Object.entries(form.attributes)
          .filter(([_, value]) => value !== "")
          .map(([attribute_id, value]) => ({
            attribute_id: Number(attribute_id),
            value,
          })),
        existing_media_ids: existingImages.map((img) => img.id),
      };

      if (editData) {
        await updateProduct(editData.id, payload);
      } else {
        await createProduct(payload);
      }

      setOpenModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Failed to submit product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter valid categories (no children)
  const validCategories = categories.filter((cat) => {
    const hasChildren = categories.some((c) => c.parent_id === cat.id);
    return !hasChildren;
  });

  // Filter subcategories
  const filteredSubCategories = subCategories.filter(
    (s) => s.category_id === Number(form.category_id),
  );

  // All images for primary selection
  const allImages = [...existingImages, ...imagePreviews];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">
            Create, view, and manage your product inventory.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">
                Get started by adding a new product.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Sl. No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Attributes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, i) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        !product.is_active
                          ? "bg-gray-50 opacity-60"
                          : product.inventory.quantity <=
                            product.inventory.low_quantity_alert_at
                          ? "bg-red-50"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(page - 1) * 10 + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.media?.length
                                ? `${MEDIA_BASE_URL}${getPrimaryImage(product.media)?.url}`
                                : "https://via.placeholder.com/150"
                            }
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.brand || "No Brand"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <p>{product.category_name}</p>
                        <p className="text-xs text-gray-400">
                          {product.sub_category_name || "N/A"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.pricing.discount_price ? (
                          <div>
                            <span className="font-semibold text-green-600">
                              {formatPrice(product.pricing.discount_price)}
                            </span>
                            <span className="text-xs text-gray-400 line-through ml-1">
                              {formatPrice(product.pricing.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {formatPrice(product.pricing.price)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              product.inventory.quantity <=
                              product.inventory.low_quantity_alert_at
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {product.inventory.quantity}
                          </span>

                          {product.inventory.quantity <=
                            product.inventory.low_quantity_alert_at && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {product.attributes?.slice(0, 2).map((attr: any) => (
                          <div key={attr.attribute_id}>
                            {attr.attribute_name}: {attr.value} {attr.unit}
                          </div>
                        ))}
                        {product.attributes?.length > 2 && (
                          <p className="text-gray-400">...</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(product.id, product.is_active)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            product.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {product.is_active ? (
                            <>
                              <ToggleRight size={16} />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={16} />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(product)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(product.id)}
                            disabled={!product.is_active}
                            className={`p-1 rounded transition-colors ${
                              product.is_active
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title={product.is_active ? "Edit" : "Cannot edit inactive product"}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={!product.is_active}
                            className={`p-1 rounded transition-colors ${
                              product.is_active
                                ? "text-red-600 hover:bg-red-50"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title={product.is_active ? "Delete" : "Cannot delete inactive product"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Showing {products.length} of {totalItems} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  page === i + 1
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editData ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Name */}
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />

                {/* Category and Subcategory */}
                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {validCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="sub_category_id"
                    value={form.sub_category_id}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={!form.category_id}
                  >
                    <option value="">Select Sub-Category</option>
                    {filteredSubCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    placeholder="Brand"
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    name="quantity"
                    value={form.quantity}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="Quantity"
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Price and Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <input
                    name="discount_price"
                    value={form.discount_price}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    placeholder="Discount Price (Optional)"
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Low Stock Alert */}
                <input
                  name="low_quantity_alert_at"
                  value={form.low_quantity_alert_at}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Low Stock Alert At"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />

                {/* Descriptions */}
                <textarea
                  name="short_description"
                  value={form.short_description}
                  onChange={handleInputChange}
                  placeholder="Short Description"
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <textarea
                  name="long_description"
                  value={form.long_description}
                  onChange={handleInputChange}
                  placeholder="Long Description"
                  rows={4}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                {/* Dynamic Attributes */}
                {attributes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Product Attributes</h3>
                    <div className="space-y-2">
                      {attributes.map((attr) => (
                        <div
                          key={attr.attribute_id}
                          className="flex items-center gap-2"
                        >
                          <label className="text-sm font-medium w-1/3">
                            {attr.attribute_name} ({attr.unit}):
                          </label>
                          <input
                            type="text"
                            value={form.attributes[attr.attribute_id] || ""}
                            onChange={(e) =>
                              handleAttributeChange(
                                attr.attribute_id,
                                e.target.value,
                              )
                            }
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <h3 className="font-semibold mb-2">Product Images (Max 5)</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="imageUpload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                    </label>
                  </div>

                  {/* Image Previews */}
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {/* Existing Images */}
                    {existingImages.map((img, index) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={`${MEDIA_BASE_URL}${img.url || "/placeholder-image.png"}`}
                          alt={`Existing ${index}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                    {/* New Uploaded Images */}
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Upload ${index}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {existingImages.length + index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Image Selection */}
                {allImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Primary Image
                    </label>
                    <select
                      name="primary_image_index"
                      value={form.primary_image_index}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {allImages.map((_, index) => (
                        <option key={index} value={index}>
                          Image {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                {editData ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Product Details
              </h2>
              <button
                onClick={() => setViewProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={`${MEDIA_BASE_URL}${getPrimaryImage(viewProduct.media)?.url || "/placeholder-image.png"}`}
                    alt={viewProduct.name}
                    className="w-48 h-48 rounded-lg object-cover border"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold">{viewProduct.name}</h3>
                  <p className="text-gray-600">{viewProduct.brand}</p>
                  <div>
                    {viewProduct.pricing.discount_price ? (
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(viewProduct.pricing.discount_price)}
                        </span>
                        <span className="text-lg text-gray-400 line-through ml-2">
                          {formatPrice(viewProduct.pricing.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(viewProduct.pricing.price)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Stock: {viewProduct.inventory?.quantity || 0} units
                  </p>
                  <p className="text-sm text-gray-500">
                    Category: {viewProduct.category_name}{" "}
                    {viewProduct.sub_category_name || "N/A"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewProduct.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {viewProduct.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Short Description</h4>
                <p className="text-gray-600">
                  {viewProduct.short_description || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Long Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {viewProduct.long_description || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Attributes</h4>
                <div className="grid grid-cols-2 gap-2">
                  {viewProduct.attributes?.map((attr: any) => (
                    <div key={attr.attribute_id} className="text-sm">
                      <span className="font-medium">
                        {attr.attribute_name}:
                      </span>{" "}
                      {attr.value} {attr.unit}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Product Gallery</h4>
                <div className="flex gap-2 flex-wrap">
                  {viewProduct.media?.map((img: any) => (
                    <img
                      key={img.id}
                      src={`${MEDIA_BASE_URL}${img.url}`}
                      alt="Product gallery"
                      className="w-24 h-24 rounded object-cover border"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 className="text-red-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}