import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { AuthResponse, Role } from "../../types";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "JOB_SEEKER" as Role });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/register", form);
      const { user, token } = res.data.data;
      login(user, token);
      navigate(user.role === "COMPANY" ? "/company/jobs" : "/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registrasi gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Buat Akun Baru</h1>
        <p className="text-gray-500 text-sm mb-6">Bergabung dengan IndoKerja sekarang!</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama kamu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contoh@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daftar sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "JOB_SEEKER" })}
                className={`border rounded-lg py-2 text-sm font-medium transition ${
                  form.role === "JOB_SEEKER"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "COMPANY" })}
                className={`border rounded-lg py-2 text-sm font-medium transition ${
                  form.role === "COMPANY"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                Perusahaan
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 text-sm transition"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
