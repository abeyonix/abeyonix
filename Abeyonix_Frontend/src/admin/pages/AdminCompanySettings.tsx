// pages/admin/AdminCompanySettings.tsx

import { useEffect, useState } from "react";

import {
  createCompanySettings,
  deleteCompanySettings,
  getCompanySettings,
  updateCompanySettings,
} from "@/api/companySettings";

import {
  Building2,
  Edit2,
  Trash2,
  Loader2,
  Plus,
  X,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

export default function AdminCompanySettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    gst_number: "",
    website: "",
    logo: null as File | null,
  });

  // =====================================================
  // FETCH SETTINGS
  // =====================================================

  const fetchSettings = async () => {
    setLoading(true);

    try {
      const data = await getCompanySettings();
      setSettings(data);
    } catch (err: any) {
      setError("Failed to fetch company settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async () => {
    if (!form.company_name.trim()) {
      setError("Company name is required");
      return;
    }

    setSubmitting(true);

    try {
      if (editData) {
        await updateCompanySettings(editData.id, form);
      } else {
        await createCompanySettings(form);
      }

      resetForm();
      fetchSettings();
    } catch (err: any) {
      setError(err || "Failed to save company settings");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (item: any) => {
    setEditData(item);

    setForm({
      company_name: item.company_name || "",
      company_email: item.company_email || "",
      company_phone: item.company_phone || "",
      address_line1: item.address_line1 || "",
      city: item.city || "",
      state: item.state || "",
      postal_code: item.postal_code || "",
      country: item.country || "",
      gst_number: item.gst_number || "",
      website: item.website || "",
      logo: null,
    });

    setImagePreview(
      item.logo_url ? `${MEDIA_BASE_URL}${item.logo_url}` : null
    );

    setOpenModal(true);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);

    try {
      await deleteCompanySettings(deleteId);

      setDeleteId(null);

      fetchSettings();
    } catch (err) {
      setError("Failed to delete company settings");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setForm({ ...form, logo: file });

      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setOpenModal(false);
    setEditData(null);

    setImagePreview(null);

    setForm({
      company_name: "",
      company_email: "",
      company_phone: "",
      address_line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      gst_number: "",
      website: "",
      logo: null,
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Company Settings
            </h1>

            <p className="text-gray-600 mt-1">
              Manage your company information
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <Plus size={20} />
            Add Company
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />

            <p className="text-red-700">{error}</p>

            <button
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X className="text-red-500" size={18} />
            </button>
          </div>
        )}

        {/* CARD */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : settings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-24 flex flex-col items-center justify-center">
            <Building2 className="text-gray-300 mb-4" size={60} />

            <h3 className="text-xl font-semibold text-gray-700">
              No Company Settings Found
            </h3>

            <p className="text-gray-500 mt-2">
              Create your company settings
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {settings.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* LOGO */}
                    <div className="flex-shrink-0">
                      {item.logo_url ? (
                        <img
                          src={`${MEDIA_BASE_URL}${item.logo_url}`}
                          alt={item.company_name}
                          className="w-28 h-28 rounded-2xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                          <ImageIcon
                            className="text-gray-400"
                            size={40}
                          />
                        </div>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {item.company_name}
                          </h2>

                          <div className="space-y-2 mt-4">
                            <div className="flex items-center gap-3 text-gray-600">
                              <Mail size={18} />
                              {item.company_email || "-"}
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                              <Phone size={18} />
                              {item.company_phone || "-"}
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                              <Globe size={18} />
                              {item.website || "-"}
                            </div>

                            <div className="flex items-start gap-3 text-gray-600">
                              <MapPin size={18} className="mt-1" />

                              <div>
                                {item.address_line1}, {item.city},{" "}
                                {item.state}, {item.country} -{" "}
                                {item.postal_code}
                              </div>
                            </div>

                            <div className="text-sm text-gray-500">
                              GST Number:
                              <span className="ml-2 font-medium text-gray-700">
                                {item.gst_number || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all"
                          >
                            <Edit2 size={20} />
                          </button>

                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
            {/* HEADER */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editData
                  ? "Update Company Settings"
                  : "Add Company Settings"}
              </h2>

              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* COMPANY NAME */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name *
                </label>

                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_name: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Enter company name"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Email
                </label>

                <input
                  type="email"
                  value={form.company_email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_email: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Phone
                </label>

                <input
                  type="text"
                  value={form.company_phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company_phone: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* WEBSITE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Website
                </label>

                <input
                  type="text"
                  value={form.website}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      website: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* ADDRESS */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={form.address_line1}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address_line1: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>

              {/* CITY */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  City
                </label>

                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* STATE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  State
                </label>

                <input
                  type="text"
                  value={form.state}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      state: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* POSTAL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Postal Code
                </label>

                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      postal_code: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* COUNTRY */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Country
                </label>

                <input
                  type="text"
                  value={form.country}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      country: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* GST */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  GST Number
                </label>

                <input
                  type="text"
                  value={form.gst_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gst_number: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* LOGO */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Logo
                </label>

                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-center hover:border-orange-400 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <p className="text-sm text-gray-600">
                      {form.logo
                        ? form.logo.name
                        : "Click to upload logo"}
                    </p>
                  </div>
                </label>
              </div>

              {/* PREVIEW */}
              {imagePreview && (
                <div className="md:col-span-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 rounded-2xl border border-gray-200 object-cover"
                  />
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && (
                  <Loader2 className="animate-spin" size={18} />
                )}

                {editData ? "Update Settings" : "Create Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DELETE MODAL */}
      {/* ================================================= */}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Delete Company Settings
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this company settings?
              </p>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2 className="animate-spin" size={18} />
                  )}

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