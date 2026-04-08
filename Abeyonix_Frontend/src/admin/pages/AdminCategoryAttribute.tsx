import { useEffect, useState } from "react";
import {
  getCategoryAttributes,
  createCategoryAttribute,
  updateCategoryAttribute,
  deleteCategoryAttribute,
} from "@/api/attribute"; // Note: This import path might need correction based on your file structure

import { getCategories } from "@/api/category";
import { getSubCategories } from "@/api/subCategory";
import { getAttributes } from "@/api/attribute";

import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

export default function AdminCategoryAttribute() {
  // --- STATE (Your Business Logic) ---
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [search, setSearch] = useState("");
  const [attrSearch, setAttrSearch] = useState("");
  const [isAttributeDropdownOpen, setIsAttributeDropdownOpen] = useState(false); // Added for custom dropdown UI

  const [form, setForm] = useState({
    category_id: "",
    sub_category_id: "",
    attribute_id: "",
  });

  // --- FETCH DATA (Your Business Logic) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catAttr, cats, subs, attrs] = await Promise.all([
        getCategoryAttributes(),
        getCategories(),
        getSubCategories(),
        getAttributes(),
      ]);

      setData(catAttr);
      setFiltered(catAttr);
      setCategories(cats);
      setSubCategories(subs);
      setAttributes(attrs);
    } catch (error) {
      // Optional: Add error state handling here if needed
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- SEARCH TABLE (Your Business Logic) ---
  useEffect(() => {
    if (!search) return setFiltered(data);

    setFiltered(
      data.filter(
        (d) =>
          d.category_name?.toLowerCase().includes(search.toLowerCase()) ||
          d.sub_category_name?.toLowerCase().includes(search.toLowerCase()) ||
          d.attribute_name?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  // --- CATEGORY FILTER (Your Business Logic) ---
  const categoriesWithChildren = new Set(
    subCategories
      .filter((c) => c.parent_id !== null)
      .map((c) => c.parent_id)
  );

  const validCategories = categories.filter(
    (c) => !categoriesWithChildren.has(c.id)
  );

  // --- SUBCATEGORY FILTER (Your Business Logic) ---
  const filteredSubCategories = subCategories.filter(
    (s) => s.category_id === Number(form.category_id)
  );

  // --- ATTRIBUTE FILTER (Your Business Logic) ---
  const usedAttributes = data
    .filter(
      (d) =>
        d.category_id === Number(form.category_id) &&
        d.sub_category_id === Number(form.sub_category_id)
    )
    .map((d) => d.attribute_id);

  const availableAttributes = attributes.filter(
    (a) => !usedAttributes.includes(a.id) || (editData && a.id === editData.attribute_id)
  );

  const filteredAttributes = availableAttributes.filter((a) =>
    a.name.toLowerCase().includes(attrSearch.toLowerCase())
  );

  // --- SUBMIT (Your Business Logic) ---
  const handleSubmit = async () => {
    if (!form.category_id || !form.attribute_id) return;

    setSubmitting(true);

    try {
      const payload = {
        category_id: Number(form.category_id),
        sub_category_id: form.sub_category_id
          ? Number(form.sub_category_id)
          : undefined,
        attribute_id: Number(form.attribute_id),
      };

      if (editData) {
        await updateCategoryAttribute(editData.id, payload);
      } else {
        await createCategoryAttribute(payload);
      }

      resetForm();
      fetchData();
    } catch (error) {
      // Optional: Add error state handling here
      console.error("Failed to submit", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setOpenModal(false);
    setEditData(null);
    setForm({
      category_id: "",
      sub_category_id: "",
      attribute_id: "",
    });
    setAttrSearch("");
  };

  // --- EDIT (Your Business Logic) ---
  const handleEdit = (item) => {
    setEditData(item);
    setForm({
      category_id: item.category_id,
      sub_category_id: item.sub_category_id || "",
      attribute_id: item.attribute_id,
    });
    setOpenModal(true);
  };

  // --- DELETE (Your Business Logic) ---
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteCategoryAttribute(deleteId);
      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setSubmitting(false);
    }
  };

  // --- JSX (UI Design Applied) ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Category Attributes
          </h1>
          <p className="text-gray-600">
            Assign attributes to specific categories and sub-categories.
          </p>
        </div>

        {/* SEARCH AND ADD BUTTON */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by category, sub-category, or attribute..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add Category Attribute
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No attributes assigned</p>
              <p className="text-gray-400 text-sm mt-1">
                {search
                  ? "Try a different search term"
                  : "Assign an attribute to a category to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sub-Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Attribute
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.category_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.sub_category_name || (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {item.attribute_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-orange-600 hover:text-orange-800 transition-colors p-1 hover:bg-orange-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                            title="Delete"
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
      </div>

      {/* ADD/EDIT MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editData ? "Edit Assignment" : "Assign New Attribute"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* CATEGORY DROPDOWN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value, sub_category_id: "" })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a category</option>
                  {validCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUB-CATEGORY DROPDOWN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Category (Optional)
                </label>
                <select
                  value={form.sub_category_id}
                  onChange={(e) =>
                    setForm({ ...form, sub_category_id: e.target.value })
                  }
                  disabled={!form.category_id || filteredSubCategories.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">None (Assign to Category)</option>
                  {filteredSubCategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ATTRIBUTE DROPDOWN WITH SEARCH */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAttributeDropdownOpen(!isAttributeDropdownOpen)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <span className={form.attribute_id ? "text-gray-900" : "text-gray-400"}>
                      {form.attribute_id
                        ? attributes.find((a) => a.id === parseInt(form.attribute_id))?.name
                        : "Select an attribute"}
                    </span>
                    <ChevronDown size={20} className="text-gray-400" />
                  </button>

                  {isAttributeDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search attributes..."
                            value={attrSearch}
                            onChange={(e) => setAttrSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredAttributes.length > 0 ? (
                          filteredAttributes.map((attr) => (
                            <button
                              key={attr.id}
                              onClick={() => {
                                setForm({ ...form, attribute_id: attr.id.toString() });
                                setIsAttributeDropdownOpen(false);
                                setAttrSearch("");
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 transition-colors"
                            >
                              {attr.name}
                            </button>
                          ))
                        ) : (
                          <p className="px-4 py-2 text-sm text-gray-500 text-center">
                            No attributes available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.category_id || !form.attribute_id}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                {editData ? "Update Assignment" : "Assign Attribute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Assignment
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this assignment? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}