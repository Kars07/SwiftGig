import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Briefcase,
  Book,
  BarChart3,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileText,
  LogOut,
  Sparkles,
} from "lucide-react";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  hasDropdown?: boolean;
  subItems?: SubMenuItem[];
}

export default function ClientDashboard() {
  const [isGigsOpen, setIsGigsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser: UserData = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user data in localStorage:", error);
      }
    }

    // ✅ Check if it's user's first visit
    const hasVisited = localStorage.getItem("hasVisitedClientDashboard");
    if (!hasVisited) {
      setShowWelcomeModal(true);
      localStorage.setItem("hasVisitedClientDashboard", "true");
    }
  }, []);

  const handleLogout = (): void => {
    setFadeOut(true);
    setTimeout(() => {
      localStorage.clear();
      navigate("/login");
    }, 800);
  };

  const menuItems: MenuItem[] = [
    { id: "home", label: "Home", icon: Home, path: "/client-dashboard" },
    {
      id: "gigs",
      label: "Gigs",
      icon: Briefcase,
      hasDropdown: true,
      subItems: [
        {
          id: "create-gigs",
          label: "Create gigs",
          icon: PlusCircle,
          path: "/client-dashboard/create-gigs",
        },
        {
          id: "your-gigs",
          label: "Your gigs",
          icon: FileText,
          path: "/client-dashboard/your-gigs",
        },
      ],
    },
    {
      id: "disputes",
      label: "Disputes",
      icon: BarChart3,
      path: "/client-dashboard/disputes",
    },
    {
      id: "review",
      label: "Reviews",
      icon: Book,
      path: "/client-dashboard/review-submissions",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/client-dashboard/settings",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/client-dashboard/profile",
    },
  ];

  const isActive = (path?: string): boolean => !!path && location.pathname === path;

  const handleNavigation = (item: MenuItem): void => {
    if (item.hasDropdown) {
      setIsGigsOpen((prev) => !prev);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div
      className={`flex h-screen bg-[#1a1a1a] relative transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Sidebar */}
      <div className="w-64 bg-[#0f0f0f] border-r border-gray-800 flex flex-col relative z-10">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center space-x-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#622578] flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-white font-medium text-sm">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </h3>
              <p className="text-gray-400 text-xs">{user?.role || "Client"}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-3 px-3">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-[#622578] text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.hasDropdown && (
                    <div>
                      {isGigsOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </button>

                {item.hasDropdown && isGigsOpen && item.subItems && (
                  <div className="ml-4 mt-1 space-y-2">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => navigate(subItem.path)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(subItem.path)
                            ? "bg-[#622578] text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-800 mx-3 mb-3"></div>

        {/* Welcome Section */}
        <div className="p-3 mx-2 mb-3 bg-[#622578]/10 border border-[#622578]/30 rounded-lg flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-[#a855f7]" />
          <div>
            <p className="text-sm text-white font-medium">Manage your gigs!</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* User Dropdown */}
      {isUserMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsUserMenuOpen(false)}
          ></div>

          <div className="fixed top-20 left-4 w-72 bg-white rounded-xl shadow-2xl z-50 border border-gray-200">
            <div className="p-4">
              <p className="text-xs text-gray-500 font-semibold mb-3">
                CLIENT ACCOUNT
              </p>

              <div className="flex flex-wrap items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[#622578] flex items-center justify-center text-white text-xs font-semibold">
                    {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-gray-900 text-sm font-medium leading-tight break-words">
                      {user ? `${user.firstName} ${user.lastName}` : "User"}
                    </p>
                    <p
                      className="text-gray-500 text-xs truncate mt-1 max-w-[150px] sm:max-w-[200px]"
                      title={user?.email}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate("/client-dashboard/profile");
                    setIsUserMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-[#622578] border border-[#622578] rounded-lg hover:bg-[#622578] hover:text-white transition-colors whitespace-nowrap"
                >
                  Profile
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ✅ Welcome Modal for First-Time Users */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center p-8 animate-fadeIn">
            <Sparkles className="mx-auto w-10 h-10 text-[#622578]" />
            <h2 className="text-2xl font-semibold mt-3 text-gray-800">
              Welcome to SwiftGig!
            </h2>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              Hey {user?.firstName || "there"} 👋, we're excited to have you onboard!
              You can start by creating gigs or reviewing your current ones in your dashboard.
            </p>

            <button
              onClick={() => setShowWelcomeModal(false)}
              className="mt-6 bg-[#622578] text-white px-6 py-2 rounded-lg hover:bg-[#4b1c5c] transition-colors"
            >
              Let’s Go 🚀
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}