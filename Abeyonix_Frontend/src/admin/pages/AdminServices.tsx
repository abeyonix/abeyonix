import { useEffect, useState } from "react";
import { getServices } from "@/api/service";
import {
  Search,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

interface ServiceResponse {
  id: number;
  name: string;
  email: string;
  mobile_number: string;
  city: string;
  service_type: string;
  message?: string;
  created_at?: string;
}

export default function AdminServices() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ================= FETCH SERVICES =================
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServices();
      setServices(data);
      setFilteredServices(data);
    } catch (err) {
      setError("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ================= SEARCH FILTER =================
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.service_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchTerm, services]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Requests
          </h1>
          <p className="text-gray-600">
            View all customer service inquiries
          </p>
        </div>

        {/* SEARCH */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="text-red-500" size={20} />
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-500 text-lg">No service requests found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? "Try different search" : "No data available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Mobile</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">City</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Message</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredServices.map((service, index) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {service.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {service.email}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {service.mobile_number}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {service.city}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                          {service.service_type}
                        </span>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-500 truncate">
                          {service.message || (
                            <span className="italic text-gray-400">
                              No message
                            </span>
                          )}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}