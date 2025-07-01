import { FaBuilding, FaDoorOpen, FaUser, FaFlask, FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";

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
      className={`h-screen flex-shrink-0 flex flex-col justify-between sidebar-light shadow-lg p-2 sticky top-0 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Top Section */}
      <div className="space-y-2 flex flex-col items-center">
        <button
          className="btn btn-ghost flex items-center justify-center mb-2 cursor-pointer"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          
          {sidebarOpen && <span className="ml-2">Hide Sidebar</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center custom-bordered-btn cursor-pointer ${sidebarOpen ? "w-60" : "w-12" } ${activeForm === "showSlidingPage" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showSlidingPage"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Show Dashboard"
        >
          <FaBuilding />
          {sidebarOpen && <span className="ml-2">Dashboard</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center custom-bordered-btn cursor-pointer ${activeForm === "showDepartments" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showDepartments"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Show All Departments"
        >
          <FaBuilding />
          {sidebarOpen && <span className="ml-2">Departments</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center custom-bordered-btn cursor-pointer ${activeForm === "showRooms" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showRooms"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Show All Rooms"
        >
          <FaDoorOpen />
          {sidebarOpen && <span className="ml-2">Rooms</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center custom-bordered-btn cursor-pointer ${activeForm === "showUsers" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showUsers"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Show All Users"
        >
          <FaUser />
          {sidebarOpen && <span className="ml-2">Users</span>}
        </button>
        <button
          className={`btn btn-outline flex items-center justify-center custom-bordered-btn cursor-pointer ${activeForm === "showLabs" ? "btn-active" : ""}`}
          onClick={() => { setActiveForm("showLabs"); setError(""); setSuccess(""); }}
          disabled={loading}
          title="Show All Labs"
        >
          <FaFlask />
          {sidebarOpen && <span className="ml-2">Labs</span>}
        </button>
      </div>
      {/* Bottom Section */}
      <div className="flex flex-col items-center">
        <button
          className="btn btn-error flex items-center justify-center custom-bordered-btn cursor-pointer"
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