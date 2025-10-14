import React from "react";
import { Edit3, Briefcase, Star, Mail, Globe, Award, TrendingUp } from "lucide-react";

const DashboardProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-gray-400">Manage your profile information</p>
          </div>
          <button className="mt-4 md:mt-0 flex items-center gap-2 bg-[#622578] hover:bg-[#7a2e94] cursor-pointer px-6 py-3 rounded-lg text-sm font-semibold transition-colors">
            <Edit3 size={18} />
            Edit Profile
          </button>
        </div>

        {/* Profile Hero Section */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-8 md:p-10 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile Image & Quick Stats */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src="/Client1.png"
                alt="Profile"
                className="w-40 h-40 rounded-2xl border-4 border-[#622578] object-cover"
              />
              <div className="mt-6 flex gap-3">
                <div className="bg-[#622578]/20 border border-[#622578] rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-[#622578]">4.8</p>
                  <p className="text-xs text-gray-400 mt-1">Rating</p>
                </div>
                <div className="bg-[#622578]/20 border border-[#622578] rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-[#622578]">35</p>
                  <p className="text-xs text-gray-400 mt-1">Projects</p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">John Doe Daniel</h2>
              <p className="text-xl text-[#622578] font-medium mb-4">Client</p>
              
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Passionate about creating interactive and beautiful digital experiences. 
                Always learning, always building ✨
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <a href="mailto:omilabuwu@gmail.com" className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 transition px-4 py-2 rounded-lg border border-gray-700">
                  <Mail size={18} className="text-[#622578]" />
                  <span className="text-sm text-gray-300">omilabuwu@gmail.com</span>
                </a>
                <a href="https://wuraola.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 transition px-4 py-2 rounded-lg border border-gray-700">
                  <Globe size={18} className="text-[#622578]" />
                  <span className="text-sm text-gray-300">wuraola.vercel.app</span>
                </a>
              </div>

              {/* Quick Stats Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2">
                  <Briefcase size={16} className="text-[#622578]" />
                  <span className="text-sm font-medium text-gray-300">12 Active Gigs</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2">
                  <TrendingUp size={16} className="text-[#622578]" />
                  <span className="text-sm font-medium text-gray-300">Top Rated</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2">
                  <Award size={16} className="text-[#622578]" />
                  <span className="text-sm font-medium text-gray-300">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skills */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Star className="text-[#622578]" size={22} />
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
                    className="bg-[#622578]/20 border border-[#622578] px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Briefcase className="text-[#622578]" size={22} />
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
                    className="group bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 hover:border-[#622578] rounded-xl p-5 transition-all duration-300 shadow-md"
                  >
                    <h4 className="text-lg font-bold mb-2 group-hover:text-[#622578] transition text-white">
                      {project.name}
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">{project.desc}</p>
                    <div className="flex gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-xs bg-[#622578]/20 text-[#622578] px-2 py-1 rounded border border-[#622578]/30">
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

export default DashboardProfile;