import { useState } from "react";
import { Bell, Mail, Sun, Moon } from "lucide-react";

export default function DashboardSettings() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-white">Account Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Change Email
                </label>
                <input
                  type="email"
                  placeholder="Enter new email"
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#622578] transition-colors text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Change Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#622578] transition-colors text-white placeholder-gray-500"
                />
              </div>

              <button className="bg-[#622578] hover:bg-[#7a2e94] transition-colors rounded-lg px-6 py-3 font-semibold">
                Update Account
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-white">Notification Settings</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-700 rounded-lg cursor-pointer hover:border-[#622578] transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="text-[#622578]" size={20} />
                  <div>
                    <span className="block text-gray-200 font-medium">In-App Notifications</span>
                    <span className="text-xs text-gray-500">Receive notifications within the app</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotifs}
                  onChange={() => setInAppNotifs(!inAppNotifs)}
                  className="w-5 h-5 accent-[#622578] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-700 rounded-lg cursor-pointer hover:border-[#622578] transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="text-[#622578]" size={20} />
                  <div>
                    <span className="block text-gray-200 font-medium">Email Notifications</span>
                    <span className="text-xs text-gray-500">Receive notifications via email</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={() => setEmailNotifs(!emailNotifs)}
                  className="w-5 h-5 accent-[#622578] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="text-[#622578]" size={24} /> : <Sun className="text-yellow-400" size={24} />}
                <div>
                  <span className="block text-lg font-semibold text-gray-200">Dark Mode</span>
                  <span className="text-xs text-gray-500">Toggle dark/light theme</span>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${
                  darkMode ? 'bg-[#622578] hover:bg-[#7a2e94]' : 'bg-gray-600 hover:bg-gray-700'
                } transition-colors rounded-lg px-6 py-2 font-semibold`}
              >
                {darkMode ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-[#0f0f0f] border border-red-900/50 rounded-xl p-6 hover:border-red-600 transition-colors">
            <h2 className="text-xl font-semibold mb-3 text-red-400">Danger Zone</h2>
            <p className="text-gray-400 mb-4 text-sm">
              Once you delete your account, all your data will be permanently removed. This action cannot be undone.
            </p>
            <button className="bg-red-600 hover:bg-red-700 transition-colors rounded-lg px-6 py-3 font-semibold">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}