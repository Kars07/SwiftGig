import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Sun, Moon } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  return (
    <div className="min-h-screen rounded-xl bg-[#1A031F]/80 text-white p-6 md:px-10 font-sans">
      <h1 className="text-purple-400 text-sm mb-5">Talent Dashboard</h1>
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Settings ⚙️
      </motion.h1>

      <div className="space-y-8">
        {/* Account Settings */}
        <motion.div
          className="bg-[#2B0A2F]/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg "
          whileHover={{ scale: 1.01 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Account Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Change Email
              </label>
              <input
                type="email"
                placeholder="Enter new email"
                className="w-full bg-[#3A0F3F]/70 border border-[#641374]/40 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Change Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full bg-[#3A0F3F]/70 border border-[#641374]/40 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>

            <button className="bg-purple-500 hover:bg-purple-700 transition rounded-xl px-4 py-2 mt-2 font-semibold shadow-lg shadow-purple-500/30">
              Update Account
            </button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          className="bg-[#2B0A2F]/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg "
          whileHover={{ scale: 1.01 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Notification Settings</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Bell className="text-purple-400" />
              <span className="flex-1 text-gray-200">In-App Notifications</span>
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={() => setInAppNotifs(!inAppNotifs)}
                className="toggle toggle-primary accent-purple-500"
              />
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <Mail className="text-purple-400" />
              <span className="flex-1 text-gray-200">Email Notifications</span>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={() => setEmailNotifs(!emailNotifs)}
                className="toggle toggle-primary accent-purple-500"
              />
            </label>
          </div>
        </motion.div>

        {/* Theme Settings */}
        <motion.div
          className="bg-[#2B0A2F]/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex items-center justify-between"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="text-purple-400" /> : <Sun className="text-yellow-400" />}
            <span className="text-lg font-semibold text-gray-200">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-purple-600 hover:bg-purple-700 transition rounded-xl px-4 py-2 font-semibold shadow-lg shadow-purple-500/30"
          >
            {darkMode ? "Disable" : "Enable"}
          </button>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          className="bg-[#2B0A2F]/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg "
          whileHover={{ scale: 1.01 }}
        >
          <h2 className="text-xl font-semibold mb-3 text-red-400">Danger Zone</h2>
          <p className="text-gray-400 mb-4 text-sm">
            Once you delete your account, all your data will be permanently removed.
          </p>
          <button className="bg-red-600 hover:bg-red-700 transition rounded-xl px-4 py-2 font-semibold shadow-lg shadow-red-500/30">
            Delete Account
          </button>
        </motion.div>
      </div>
    </div>
  );
}