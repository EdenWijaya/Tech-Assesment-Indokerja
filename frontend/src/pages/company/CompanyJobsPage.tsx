import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, MapPin, Briefcase } from "lucide-react";
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

const CompanyJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        const res = await api.get("/jobs/company/my-jobs");
        setJobs(res.data.data.jobs);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Lowongan Kerja</h1>
            <p className="text-gray-500 text-sm mt-0.5">Kelola lowongan pekerjaan dan pantau kandidat pelamar</p>
          </div>
          <button
            onClick={() => navigate("/company/jobs/create")}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus size={16} /> Tambah Lowongan
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20">Memuat lowongan Anda...</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">Belum Ada Lowongan</h3>
            <p className="text-sm text-gray-400 mb-5">
              Mulai publikasikan lowongan untuk mendapatkan kandidat terbaik.
            </p>
            <button
              onClick={() => navigate("/company/jobs/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
            >
              Buat Lowongan Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {JOB_TYPE_LABEL[job.jobType]}
                    </span>
                    <span className="text-xs text-gray-400">
                      Dibuat pada {new Date(job.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" /> {job.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => navigate(`/company/jobs/${job.id}/applicants`)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    <Users size={15} className="text-blue-600" />
                    <span>Lihat Pelamar</span>
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {job._count?.applications ?? 0}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyJobsPage;
