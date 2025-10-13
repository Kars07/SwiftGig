import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Briefcase,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function TalentDashboard() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(164, 90, 219, ${p.opacity})`;
        ctx.fill();

        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, path: "/talent-dashboard" },
    {
      id: "gigs",
      label: "Gigs",
      icon: Briefcase,
      path: "/talent-dashboard/gigs",
    },
    {
      id: "voting-poll",
      label: "Voting poll",
      icon: BarChart3,
      path: "/talent-dashboard/voting-poll",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/talent-dashboard/settings",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/talent-dashboard/profile",
    },
  ];

  const isActive = (path : string) => location.pathname === path;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#2B0A2F] via-[#2B0A2F] to-[#0D0012] text-white relative overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Mobile Header with Menu Button */}
      <header className="md:hidden flex items-center justify-between p-4- bg-[#1A031F]/60 backdrop-blur-lg border-b border-[#2B0A2F] relative z-10">
        <h1 className="text-lg tracking-[0.1em] font-semibold">SWIFTGIG</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-[#2B0A2F]/50 hover:bg-[#2B0A2F] transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full w-64 bg-[#1A031F]/95 md:bg-[#1A031F]/60 backdrop-blur-lg rounded-r-2xl md:rounded-2xl flex flex-col justify-between p-5 shadow-xl z-50 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Close Button (Mobile Only) */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-[#2B0A2F]/50 hover:bg-[#2B0A2F] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div>
          <h1 className="text-xl tracking-[0.1em] text-center mb-6 font-semibold mt-8 md:mt-0">
            SWIFTGIG
          </h1>
          <img src="/Vector 6.svg" alt="divider" className="mb-6 mx-auto" />

          {/* Navigation */}
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition ${
                    isActive(item.path)
                      ? "bg-[#000000] text-purple-200"
                      : "text-purple-200 hover:bg-[#2B0A2F]/30 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Info */}
        <div className="bg-[#2B0A2F]/40 p-4 rounded-xl mt-6">
          <p className="text-sm text-purple-200">Talent Account</p>
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 mt-3 cursor-pointer"
          >
            <div className="bg-[#4B1656] w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div>
              <p className="text-sm font-semibold">User Name</p>
              <p className="text-xs text-purple-300">Wallet: ****3950</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 rounded-2xl relative z-10">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-[#1A031F]/80 border-t border-[#2B0A2F] backdrop-blur-lg flex justify-around items-center py-3 z-40">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              navigate(item.path);
              setIsSidebarOpen(false);
            }}
            className={`flex flex-col items-center text-xs transition ${
              isActive(item.path)
                ? "text-purple-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            {item.label.split(" ")[0]} {/* shorter labels for mobile */}
          </button>
        ))}
      </nav>

      {/* User Dropdown Modal */}
      {isUserMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsUserMenuOpen(false)}
          ></div>

          {/* Dropdown Box */}
          <div className="fixed bottom-16 left-4 md:bottom-8 md:left-8 w-[90%] md:w-72 bg-[#1A031F] rounded-xl shadow-2xl z-50 border border-[#2B0A2F]/70 p-4 text-white">
            <p className="text-xs text-purple-300 mb-3 font-semibold">
              ACCOUNT
            </p>

            <div className="flex items-center justify-between p-3 bg-[#2B0A2F]/50 rounded-lg hover:bg-[#2B0A2F]/70 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4B1656] flex items-center justify-center text-xs font-semibold">
                  U
                </div>
                <div>
                  <p className="text-sm font-medium">User's Workspace</p>
                  <p className="text-xs text-purple-300">FREE</p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigate("/client-dashboard/profile");
                  setIsUserMenuOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#4B1656] rounded-lg hover:bg-[#6B2282] transition"
              >
                Switch
              </button>
            </div>

            <button
              onClick={() => {
                console.log("Logging out...");
                setIsUserMenuOpen(false);
              }}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}