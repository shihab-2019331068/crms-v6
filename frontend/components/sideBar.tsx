import { 
  FaTachometerAlt, 
  FaEye, 
  FaUsersCog, 
  FaCog,
  FaSignOutAlt 
} from "react-icons/fa";

interface SideBarProps {
  activeForm: string;
  setActiveForm: (form: string) => void;
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setError?: (msg: string) => void;
  setSuccess?: (msg: string) => void;
}

export default function SideBar({
  activeForm,
  setActiveForm,
  loading,
  sidebarOpen,
  setSidebarOpen,
  setError = () => {},
  setSuccess = () => {},
}: SideBarProps) {
  return (
    <aside
      className={`flex-shrink-0 flex flex-col justify-between sidebar-light shadow p-2 sticky top-0 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      } h-[calc(100vh)]`}
    >
      {/* Top Section */}
      <div className="space-y-2 flex flex-col items-center">
        <button
          className={`btn btn-outline flex items-center justify-center sb-btn ${sidebarOpen ? "w-60" : "w-15"}`}
          onClick={() => { setSidebarOpen(!sidebarOpen); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Dashboard"
        >
          <FaTachometerAlt />
          {sidebarOpen && <span className="ml-2">Hide Sidebar</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center sb-btn ${sidebarOpen ? "w-60" : "w-15"} ${activeForm === "showSlidingPage" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showSlidingPage"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Dashboard"
        >
          <FaTachometerAlt />
          {sidebarOpen && <span className="ml-2">Dashboard</span>}
        </button>
        <button
          className={`flex items-center justify-center sb-btn cursor-pointer ${sidebarOpen ? "w-60" : "w-15"} ${activeForm === "showView" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showView"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="View"
        >
          <FaEye />
          {sidebarOpen && <span className="ml-2">View</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center sb-btn cursor-pointer ${sidebarOpen ? "w-60" : "w-15"} ${activeForm === "showManage" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showManagingPage"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Manage"
        >
          <FaUsersCog />
          {sidebarOpen && <span className="ml-2">Manage</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center sb-btn cursor-pointer ${sidebarOpen ? "w-60" : "w-15"} ${activeForm === "showSettings" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showSettings"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Settings"
        >
          <FaCog />
          {sidebarOpen && <span className="ml-2">Settings</span>}
        </button>
      </div>
      <div className="flex flex-col items-center">
        <button
          className="btn btn-error flex items-center justify-center sb-btn cursor-pointer"
          onClick={() => {
            window.location.href = '/login';
          }}
          title="Logout"
        >
          <FaSignOutAlt />
          {sidebarOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </aside>
  );
}