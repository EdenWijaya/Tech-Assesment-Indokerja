import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Building, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import type { Application, ApplicationStatus } from "../../types";

const STATUS_BADGE: Record<ApplicationStatus, { label: string; className: string }> = {
  APPLIED: { label: "Terkirim", className: "bg-blue-100 text-blue-800 border-blue-200" },
  REVIEWING: { label: "Ditinjau", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  SHORTLISTED: { label: "Lolos Seleksi", className: "bg-purple-100 text-purple-800 border-purple-200" },
  ACCEPTED: { label: "Diterima", className: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-800 border-red-200" },
};

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/my");
        setApplications(res.data.data.applications);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const toggleHistory = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Riwayat Lamaran Saya</h1>
        <p className="text-gray-500 text-sm mb-6">Pantau status seleksi pekerjaan yang telah Anda lamar</p>

        {loading ? (
          <p className="text-center text-gray-400 py-16">Memuat riwayat lamaran...</p>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">Anda belum melamar pekerjaan apa pun.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
            >
              Jelajahi Lowongan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const badge = STATUS_BADGE[app.status] || {
                label: app.status,
                className: "bg-gray-100 text-gray-700",
              };
              const isExpanded = expandedId === app.id;

              return (
                <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          Diajukan pada {new Date(app.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-gray-800">{app.job?.title}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building size={14} className="text-gray-400" />
                          {app.job?.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {app.job?.location}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleHistory(app.id)}
                      className="self-start sm:self-center flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                      <Clock size={14} />
                      Riwayat Status
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* Accordion Timeline Application History */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/70 p-5">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                        Timeline Perubahan Status
                      </h3>
                      {!app.histories || app.histories.length === 0 ? (
                        <p className="text-xs text-gray-400">Belum ada catatan riwayat perubahan status.</p>
                      ) : (
                        <ol className="relative border-l border-gray-300 ml-2 space-y-4">
                          {app.histories.map((hist) => {
                            const histBadge = STATUS_BADGE[hist.newStatus];
                            return (
                              <li key={hist.id} className="ml-4">
                                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-blue-500"></div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${histBadge.className}`}>
                                    {histBadge.label}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(hist.createdAt).toLocaleString("id-ID", {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}
                                  </span>
                                </div>
                                {hist.notes && <p className="text-xs text-gray-600 mt-1 italic">"{hist.notes}"</p>}
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  Diperbarui oleh: {hist.changedBy?.name || "Sistem"}
                                </p>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;
