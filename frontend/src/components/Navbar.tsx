import { Link, useNavigate } from "react-router-dom";
import { LogOut, Briefcase, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-blue-600 font-bold text-xl tracking-tight">
        IndoKerja<span className="text-gray-800">.id</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Menu Job Seeker */}
        {user?.role === "JOB_SEEKER" && (
          <>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition">
              <Briefcase size={16} />
              Lowongan
            </Link>
            <Link
              to="/my-applications"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition"
            >
              <FileText size={16} />
              Lamaran Saya
            </Link>
          </>
        )}

        {/* Menu Company */}
        {user?.role === "COMPANY" && (
          <Link
            to="/company/jobs"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition"
          >
            <Briefcase size={16} />
            Lowongan Saya
          </Link>
        )}

        {/* User Info + Logout */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role === "COMPANY" ? "Perusahaan" : "Job Seeker"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
