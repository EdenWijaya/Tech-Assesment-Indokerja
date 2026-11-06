import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Briefcase } from "lucide-react";
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

const JOB_TYPE_COLOR: Record<JobType, string> = {
  FULL_TIME: "bg-blue-100 text-blue-700",
  PART_TIME: "bg-purple-100 text-purple-700",
  CONTRACT: "bg-orange-100 text-orange-700",
  REMOTE: "bg-green-100 text-green-700",
  INTERNSHIP: "bg-yellow-100 text-yellow-700",
};

const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return "Gaji tidak disebutkan";
  const fmt = (n: number) => `Rp ${(n / 1000000).toFixed(0)}jt`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `Mulai ${fmt(min)}`;
  return `Hingga ${fmt(max!)}`;
};

const JobListPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (jobType) params.jobType = jobType;
      const res = await api.get("/jobs", { params });
      setJobs(res.data.data.jobs);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Cari Lowongan Kerja</h1>
        <p className="text-gray-500 text-sm mb-6">Temukan pekerjaan impian kamu di sini</p>

        {/* Filter Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari posisi atau perusahaan..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Tipe</option>
            {Object.entries(JOB_TYPE_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Cari
          </button>
        </form>

        {/* Job List */}
        {loading ? (
          <p className="text-center text-gray-400 py-16">Memuat lowongan...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Tidak ada lowongan yang ditemukan.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-blue-400 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-800 text-base">{job.title}</h2>
                    <p className="text-gray-500 text-sm mt-0.5">{job.companyName}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} /> {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${JOB_TYPE_COLOR[job.jobType]}`}
                  >
                    {JOB_TYPE_LABEL[job.jobType]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListPage;
