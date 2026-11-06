import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { JobType } from "../../types";

const CreateJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    companyName: user?.name || "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "FULL_TIME" as JobType,
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/jobs", {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : null,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax, 10) : null,
      });

      navigate("/company/jobs");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat lowongan pekerjaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/company/jobs")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Buat Lowongan Pekerjaan Baru</h1>
          <p className="text-gray-500 text-sm mb-6">Lengkapi detail posisi untuk menarik kandidat terbaik</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Judul Posisi / Job Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Frontend Engineer, Backend Developer"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Nama perusahaan"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Lokasi Kerja *
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Contoh: Jakarta Selatan, Hybrid, Remote"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Tipe Pekerjaan *
                </label>
                <select
                  value={form.jobType}
                  onChange={(e) => setForm({ ...form, jobType: e.target.value as JobType })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Kontrak</option>
                  <option value="REMOTE">Remote</option>
                  <option value="INTERNSHIP">Magang</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Gaji Minimal (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={form.salaryMin}
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                  placeholder="Contoh: 8000000"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Gaji Maksimal (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={form.salaryMax}
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                  placeholder="Contoh: 15000000"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Deskripsi & Kualifikasi *
              </label>
              <textarea
                rows={6}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Jelaskan tanggung jawab pekerjaan, kualifikasi yang dibutuhkan, dan benefit yang ditawarkan..."
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/company/jobs")}
                className="border border-gray-300 text-gray-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm px-6 py-2 rounded-lg transition"
              >
                {loading ? "Menyimpan..." : "Terbitkan Lowongan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;
