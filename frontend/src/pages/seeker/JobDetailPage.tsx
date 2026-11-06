import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Briefcase, Building, ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import type { Job, JobType } from "../../types";

const JOB_TYPE_LABEL: Record<JobType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Kontrak",
  REMOTE: "Remote",
  INTERNSHIP: "Magang",
};

const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return "Gaji tidak disebutkan";
  const fmt = (n: number) => `Rp ${(n / 1000000).toFixed(0)}jt`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `Mulai ${fmt(min)}`;
  return `Hingga ${fmt(max!)}`;
};

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data.job);
        setHasApplied(res.data.data.hasApplied);
      } catch {
        setMessage({ type: "error", text: "Gagal memuat detail lowongan." });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.post("/applications", {
        jobId: id,
        notes: notes || undefined,
      });

      setHasApplied(true);
      setMessage({ type: "success", text: "Lamaran Anda berhasil dikirimkan!" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal mengirimkan lamaran.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-400 py-24">Memuat informasi lowongan...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 mb-4">Lowongan tidak ditemukan.</p>
          <button onClick={() => navigate("/")} className="text-blue-600 hover:underline text-sm font-medium">
            Kembali ke Daftar Lowongan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm mb-6 border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-6 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              {JOB_TYPE_LABEL[job.jobType]}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">{job.title}</h1>
            <p className="text-gray-600 font-medium flex items-center gap-1.5 mt-1">
              <Building size={16} className="text-gray-400" /> {job.companyName}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>Lokasi: {job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-gray-400" />
                <span>Gaji: {formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Deskripsi Pekerjaan</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</div>
          </div>

          {/* Form / Status Apply */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            {hasApplied ? (
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 size={24} className="shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Anda sudah melamar pekerjaan ini</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Silakan pantau status seleksi Anda di menu{" "}
                    <span
                      onClick={() => navigate("/my-applications")}
                      className="text-blue-600 underline cursor-pointer"
                    >
                      Lamaran Saya
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-800">Kirim Lamaran</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Catatan untuk Rekruter (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan perkenalan singkat atau alasan Anda tertarik dengan posisi ini..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition"
                >
                  {submitting ? "Mengirim Lamaran..." : "Lamar Sekarang"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
