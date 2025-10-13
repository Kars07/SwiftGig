import React from "react";
import { motion } from "framer-motion";
import { Edit3, Briefcase, Star, Mail, Globe, Award, TrendingUp } from "lucide-react";

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A031F]/80 text-white p-6 md:px-10 rounded-xl relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
             <h1 className="text-purple-400 text-sm mb-5">Talent Dashboard</h1>
              <motion.h1
                className="text-3xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Profile
              </motion.h1>

          </div>
          <button className="mt-4 md:mt-0 flex items-center gap-2  bg-purple-500 cursor-pointer px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/30">
            <Edit3 size={18} />
            Edit Profile
          </button>
        </div>

        {/* Profile Hero Section */}
        <div className="bg-[#2B0A2F]/70 rounded-3xl p-8 md:p-10 shadow-lg mb-8 backdrop-blur-sm border border-[#641374]/50">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile Image & Quick Stats */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src="/seexy.webp"
                alt="Profile"
                className="w-40 h-40 rounded-2xl border-4 border-purple-500 object-cover"
              />
              <div className="mt-6 flex gap-3">
                <div className="bg-[#641374]/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-purple-300">4.8</p>
                  <p className="text-xs text-gray-300 mt-1">Rating</p>
                </div>
                <div className="bg-[#641374]/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-purple-300">35</p>
                  <p className="text-xs text-gray-300 mt-1">Projects</p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Wuraola Omilabu Elizabeth</h2>
              <p className="text-xl text-purple-400 font-medium mb-4">Frontend & Game Developer</p>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Passionate about creating interactive and beautiful digital experiences. 
                Always learning, always building ✨
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <a href="mailto:omilabuwu@gmail.com" className="flex items-center gap-2 bg-[#2B0A2F]/60 hover:bg-[#3A0F3F]/70 transition px-4 py-2 rounded-lg border border-[#3A0F3F]">
                  <Mail size={18} className="text-purple-400" />
                  <span className="text-sm text-gray-200">omilabuwu@gmail.com</span>
                </a>
                <a href="https://wuraola.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#2B0A2F]/60 hover:bg-[#3A0F3F]/70 transition px-4 py-2 rounded-lg border border-[#3A0F3F]">
                  <Globe size={18} className="text-purple-400" />
                  <span className="text-sm text-gray-200">wuraola.vercel.app</span>
                </a>
              </div>

              {/* Quick Stats Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-[#3A0F3F]/30 border border-[#641374]/40 rounded-lg px-4 py-2">
                  <Briefcase size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">12 Active Gigs</span>
                </div>
                <div className="flex items-center gap-2 bg-[#3A0F3F]/30 border border-[#641374]/40 rounded-lg px-4 py-2">
                  <TrendingUp size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">Top Rated</span>
                </div>
                <div className="flex items-center gap-2 bg-[#3A0F3F]/30 border border-[#641374]/40 rounded-lg px-4 py-2">
                  <Award size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skills */}
          <div className="lg:col-span-1">
            <div className="bg-[#2B0A2F]/70 rounded-2xl p-6 shadow-md backdrop-blur-sm border border-[#641374]/50">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Star className="text-purple-400" size={22} />
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "HTML",
                  "CSS",
                  "JavaScript",
                  "React",
                  "Tailwind CSS",
                  "Framer Motion",
                  "Git",
                  "Game Development",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="bg-[#641374]/20 border border-[#641374]/40 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="bg-[#2B0A2F]/70 rounded-2xl p-6 shadow-md backdrop-blur-sm border border-[#641374]/50">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Briefcase className="text-purple-400" size={22} />
                Featured Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    name: "Dream Project",
                    link: "https://omilabu6.github.io/Dream/",
                    desc: "A beautiful web project showcasing creativity and motion.",
                    tags: ["React", "Animation"],
                  },
                  {
                    name: "SwiftFunds",
                    link: "https://swift-funds.vercel.app/",
                    desc: "A fintech startup dashboard with sleek animations.",
                    tags: ["Fintech", "Dashboard"],
                  },
                ].map((project) => (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={project.name}
                    className="group bg-[#3A0F3F]/30 hover:bg-[#641374]/20 border border-[#641374]/40 rounded-xl p-5 transition-all duration-300 shadow-md hover:shadow-purple-500/30"
                  >
                    <h4 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition">
                      {project.name}
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">{project.desc}</p>
                    <div className="flex gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-xs bg-[#641374]/30 text-purple-300 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;