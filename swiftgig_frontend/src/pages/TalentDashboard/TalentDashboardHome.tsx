import React, { useState } from "react";
import {
  Briefcase,
  User,
  FileText,
  Wallet,
  ArrowDownCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const DashboardHome: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(true);

  const toggleEye = () => setIsUnlocked((prev) => !prev);

  return (
    <div className="px-4 rounded-xl md:pl-10 py-6 min-h-screen bg-[#1A031F]/80 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-purple-400 text-sm">Talent Dashboard</h1>
          <h1 className="text-white font-bold mt-2 md:mt-4 text-xl">
            Welcome back!
          </h1>
        </div>
        <div className="flex justify-between md:justify-center items-center gap-3">
          <div className="flex bg-[#2B0A2F]/70 border border-[#641374]/50 text-white rounded-[15px] px-2 py-2 w-full md:w-auto">
            <img src="/Search.svg" alt="" className="w-8 h-8" />
            <input
              type="text"
              className="outline-none bg-transparent text-sm w-full placeholder-gray-400"
              placeholder="Type here..."
            />
          </div>
          <img src="/notifi.svg" className="w-6 h-6" alt="" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex md:flex-row flex-col gap-5 mt-8">
        {[
          { title: "Active Gigs", value: 28, icon: <Briefcase /> },
          { title: "Total Polls", value: 28, icon: <FileText /> },
          { title: "Profile View", value: 28, icon: <User /> },
        ].map((card, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-[#2B0A2F]/70 rounded-2xl p-4 w-full sm:w-[48%] lg:w-[32%] border border-[#641374]/50"
          >
            <div>
              <h1 className="text-gray-300 text-sm">{card.title}</h1>
              <h1 className="text-white text-xl">{card.value}</h1>
            </div>
            <div className="bg-purple-500 flex justify-center items-center px-3 py-2 rounded-2xl">
              {React.cloneElement(card.icon, {
                className: "w-6 h-6 text-white",
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Wallet + Credit Score */}
      <div className="flex flex-col md:flex-row w-full gap-6 mt-10">
        {/* Wallet Section */}
        <div className="relative z-10 bg-gradient-to-br from-[#4B1656]/80 via-[#65206E]/70 to-[#2E0936]/70 p-6 md:p-8 rounded-2xl w-full md:w-[70%] text-center shadow-lg backdrop-blur-md border border-purple-700/40">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-3 justify-center items-center">
                <div>
                  <p className="text-sm text-white/80">Total Balance</p>
                  {isUnlocked ? (
                    <h2 className="text-3xl font-bold">₦0.00</h2>
                  ) : (
                    <div className="text-xl">***</div>
                  )}
                </div>
                <button
                  onClick={toggleEye}
                  className="cursor-pointer mb-4 text-white transition-all"
                >
                  {isUnlocked ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-white/60">Wallet ID</p>
              <p className="text-sm font-mono">****1234</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-xs text-white/70 mb-1">Pending</p>
              <p className="text-xl font-semibold">₦0.00</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-xs text-white/70 mb-1">Completed</p>
              <p className="text-xl font-semibold">₦0.00</p>
            </div>
          </div>
        </div>

        {/* Credit Score Card */}
        <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl p-6 text-center flex flex-col justify-center w-full md:w-[30%]">
          <h3 className="text-gray-300 text-sm mb-3">Credit Score</h3>
          <div className="relative flex items-center justify-center mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-8 border-purple-500 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                300
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Your current credit standing</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#1A031F]/70 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-500 mt-2">
            Your gig activities will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;