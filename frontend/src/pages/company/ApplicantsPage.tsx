import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Mail, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import type { Application, ApplicationStatus } from "../../types";

const STATUS_BADGE: Record<ApplicationStatus, { label: string; className: string }> = {
  APPLIED: { label: "Applied", className: "bg-blue-100 text-blue-800 border-blue-200" },
  REVIEWING: { label: "Reviewing", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  SHORTLISTED: { label: "Shortlisted", className: "bg-purple-100 text-purple-800 border-purple-200" },
  ACCEPTED: { label: "Accepted", className: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
};

const STATUS_OPTIONS: ApplicationStatus[] = ["APPLIED", "REVIEWING", "SHORTLISTED", "ACCEPTED", "REJECTED"];

const ApplicantsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // State Modal Ubah Status
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("REVIEWING");
  const [statusNotes, setStatusNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setJobTitle(res.data.data.job.title);
      setApplications(res.data.data.applications);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const openStatusModal = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNotes("");
    setError("");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (newStatus === selectedApp.status) {
      setError("Status yang dipilih sama dengan status saat ini.");
      return;
    }

    setUpdating(true);
    setError("");

    try {
      await api.patch(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        notes: statusNotes || undefined,
      });

      setSelectedApp(null);
      await fetchApplicants(); // Refresh data pelamar dan timeline history
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengubah status pelamar.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/company/jobs")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft size={16} /> Kembali ke Lowongan Saya
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Kandidat Pelamar</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Posisi: <span className="font-semibold text-gray-700">{jobTitle || "Memuat..."}</span>
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20">Memuat data pelamar...</p>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">Belum ada kandidat yang melamar untuk lowongan ini.</p>
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
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          Melamar pada {new Date(app.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-gray-800">{app.applicant?.name}</h2>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail size={13} className="text-gray-400" /> {app.applicant?.email}
                      </p>

                      {app.notes && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-0.5">Pesan Pelamar:</p>
                          <p className="text-xs text-gray-600 italic">"{app.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : app.id)}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Clock size={13} />
                        Riwayat
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      <button
                        onClick={() => openStatusModal(app)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition"
                      >
                        Ubah Status
                      </button>
                    </div>
                  </div>

                  {/* Riwayat Perubahan Status (Application History) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/70 p-5">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                        Application History Log
                      </h4>
                      {!app.histories || app.histories.length === 0 ? (
                        <p className="text-xs text-gray-400">Belum ada riwayat tercatat.</p>
                      ) : (
                        <ol className="relative border-l border-gray-300 ml-2 space-y-3">
                          {app.histories.map((hist) => {
                            const histBadge = STATUS_BADGE[hist.newStatus];
                            return (
                              <li key={hist.id} className="ml-4">
                                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-blue-500"></div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${histBadge.className}`}>
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
                                  Oleh: {hist.changedBy?.name || "Sistem"}
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

        {/* Modal Ubah Status */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Ubah Status Kandidat</h3>
              <p className="text-xs text-gray-500 mb-4">
                Kandidat: <span className="font-semibold text-gray-700">{selectedApp.applicant?.name}</span>
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2.5 text-xs mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Status Baru</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_BADGE[st].label} {st === selectedApp.status ? "(Saat ini)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Catatan Perubahan (Tersimpan ke Application History)
                  </label>
                  <textarea
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Contoh: Kandidat lolos tes teknis, lanjut interview..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
                  >
                    {updating ? "Menyimpan..." : "Perbarui Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsPage;
