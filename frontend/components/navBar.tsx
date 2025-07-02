import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type NavbarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  return (
    <nav className="w-full flex items-center justify-between px-4 py-2 navbar-light shadow">
      <button
        className="mr-4 cursor-pointer"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-black font-bold text-xl">Super Admin</div>
        <div>
          <a href="#" className="text-black hover:text-white px-3 py-2">Dashboard</a>
          <a href="#" className="text-black hover:text-white px-3 py-2">Settings</a>
          <a href="#" className="text-black hover:text-white px-3 py-2">Logout</a>
        </div>
      </div>
    </nav>
  );
}