import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  BookCheckIcon,
} from 'lucide-react';

export default function ClientDashboard() {
  const [isGigsOpen, setIsGigsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/client-dashboard' },
    {
      id: 'gigs',
      label: 'Gigs',
      icon: Briefcase,
      hasDropdown: true,
      path: '',
      subItems: [
        { id: 'create-gigs', label: 'Create gigs', icon: PlusCircle, path: '/client-dashboard/create-gigs' },
        { id: 'your-gigs', label: 'Your gigs', icon: FileText, path: '/client-dashboard/your-gigs' },
      ],
    },
    { id: 'Disputes', label: 'Disputes', icon: BarChart3, path: '/client-dashboard/disputes' },
    { id: 'Review', label: 'Reviews', icon: Book, path: '/client-dashboard/review-submissions' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/client-dashboard/settings' },
    { id: 'profile', label: 'Profile', icon: User, path: '/client-dashboard/profile' },
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
    <div className="flex h-screen bg-[#1a1a1a] relative">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f0f0f] border-r border-gray-800 flex flex-col relative z-10">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center space-x-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#622578] flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-white font-medium text-sm">John Doe</h3>
              <p className="text-gray-400 text-xs">Client</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation Menu (no overflow to avoid scroll bar on dropdown) */}
        <nav className="flex-1 py-4">
          <div className="space-y-3 px-3">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#622578] text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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

                {/* Dropdown Menu (renders inline so it won't produce a scroll bar) */}
                {item.hasDropdown && isGigsOpen && (
                  <div className="ml-4 mt-1 space-y-2">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => navigate(subItem.path)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(subItem.path)
                            ? 'bg-[#622578] text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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

        {/* Single Divider before Upgrade Section */}
        <div className="border-t border-gray-800 mx-3 mb-3"></div>

        {/* Upgrade Section */}
        <div className="p-3 mx-2 mb-3 bg-[#622578]/10 border border-[#622578]/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Client Account</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* User Dropdown Modal */}
      {isUserMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsUserMenuOpen(false)}
          ></div>

          {/* Modal */}
          <div className="fixed top-20 left-4 w-72 bg-white rounded-xl shadow-2xl z-50 border border-gray-200">
            {/* Workspaces Section */}
            <div className="p-4">
              <p className="text-xs text-gray-500 font-semibold mb-3">
                CLIENT ACCOUNT
              </p>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#622578] flex items-center justify-center text-white text-xs font-semibold">
                    U
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">
                      User Name
                    </p>
                    <p className="text-gray-500 text-xs">wallet: *****3950</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate('/client-dashboard/profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-[#622578] border border-[#622578] rounded-lg hover:bg-[#622578] hover:text-white transition-colors"
                >
                  Client
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  console.log('Logging out...');
                  setIsUserMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}