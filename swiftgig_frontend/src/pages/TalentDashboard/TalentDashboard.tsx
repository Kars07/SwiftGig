import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  BarChart3,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileText,
  LogOut,
} from 'lucide-react';

export default function TalentDashboard() {
  const [isGigsOpen, setIsGigsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/talent-dashboard' },
    {
      id: 'gigs',
      label: 'Gigs',
      icon: Briefcase,
      hasDropdown: true,
      path: '',
      subItems: [
        { id: 'Gigs', label: 'Gigs', icon: PlusCircle, path: '/talent-dashboard/gigs' },
        { id: 'your-gigs', label: 'Your gigs', icon: FileText, path: '/talent-dashboard/your-gigs' },
      ],
    },
    { id: 'voting-poll', label: 'Voting poll', icon: BarChart3, path: '/talent-dashboard/voting-poll' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/talent-dashboard/settings' },
    { id: 'profile', label: 'Profile', icon: User, path: '/talent-dashboard/profile' },
  ];

  const isActive = (path: string) => path && location.pathname === path;

  const handleNavigation = (item: any) => {
    if (item.hasDropdown) {
      setIsGigsOpen(!isGigsOpen);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="flex h-screen  bg-gradient-to-br from-[#2B0A2F] via-[#2B0A2F] to-[#0D0012] relative">
      {/* Sidebar */}
      <aside className="w-full  md:w-64 bg-[#1A031F]/60 rounded-2xl flex flex-col justify-between ">
        {/* Navigation */}
        <nav className="space-y-6 p-5">
          <h1 className="text-xl tracking-[0.1em] text-center text-white mb-4">SWIFTGIG</h1>
          <img src="/Vector 6.svg" alt="" />

          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition ${
                    isActive(item.path)
                      ? 'bg-[#000000] text-purple-200 '
                      : 'text-purple-200 hover:bg-[#2B0A2F]/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
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

                {/* Dropdown Menu */}
                {item.hasDropdown && isGigsOpen && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.id}>
                        <button
                          onClick={() => navigate(subItem.path)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition ${
                            isActive(subItem.path)
                              ? 'bg-[#4B1656] text-white'
                              : 'text-purple-300 hover:bg-[#2B0A2F]/40 hover:text-white'
                          }`}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info Section */}
        <div className="bg-[#2B0A2F]/40 p-4 rounded-xl m-4">
          <p className="text-sm text-purple-200">Talent Account</p>
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 mt-3 cursor-pointer"
          >
            <div className="bg-[#4B1656] w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div>
              <p className="text-sm font-semibold text-white">User Name</p>
              <p className="text-xs text-purple-300">Wallet: ****3950</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto rounded-2xl p-6">
        <Outlet />
      </div>

      {/* User Dropdown Modal */}
      {isUserMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsUserMenuOpen(false)}
          ></div>

          <div className="fixed bottom-8 left-8 w-72 bg-[#1A031F] rounded-xl shadow-2xl z-50 border border-[#2B0A2F]/70 p-4 text-white">
            <p className="text-xs text-purple-300 mb-3 font-semibold">ACCOUNT</p>

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
                  navigate('/client-dashboard/profile');
                  setIsUserMenuOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#4B1656] rounded-lg hover:bg-[#6B2282] transition"
              >
                Switch
              </button>
            </div>

            <button
              onClick={() => {
                console.log('Logging out...');
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
