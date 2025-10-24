import React from 'react';
import { GraduationCap, Users, Briefcase } from "lucide-react";

export default function WhoWeHelpSection() {
  return (
    <section
      className="relative py-20 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-black overflow-hidden"
      style={{ marginTop: '-1px' }}
    >
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-[#622578] to-[#8b3a9e] rounded-full blur-[120px] opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-[#7a2e94] to-[#9d4ab3] rounded-full blur-[100px] opacity-30 animate-float-medium"></div>
        <div className="absolute top-[35%] right-[20%] w-[400px] h-[400px] bg-gradient-to-br from-[#8b3a9e] to-[#a347b8] rounded-full blur-[90px] opacity-25 animate-float-fast"></div>
        <div className="absolute bottom-[25%] left-[10%] w-[300px] h-[300px] bg-gradient-to-tr from-[#622578] to-[#7a2e94] rounded-full blur-[90px] opacity-20 animate-float-reverse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto animate-fade-in-smooth">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Who We <span className="text-purple-400">Help</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Empowering individuals at every stage — from students to professionals.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Career Changers */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[#622578] transition-all duration-500 ease-out hover:scale-[1.04]">
            <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <GraduationCap className="text-purple-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Graduates</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Personalized gigs just for you</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Gig analysis and targeted engagemnet</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Quick Income Opportunities</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Skill Showcase and Flexible work</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Gig Variety</p>
              </li>
            </ul>
          </div>

          {/* Students */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[#622578] transition-all duration-500 ease-out hover:scale-[1.04]">
            <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Users className="text-purple-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Students</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Qucik Income</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Skill showcasing</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Transparency</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Community and Networking</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Connect with Clients</p>
              </li>
            </ul>
          </div>

          {/* Professionals */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[#622578] transition-all duration-500 ease-out hover:scale-[1.04]">
            <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Briefcase className="text-purple-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Professionals</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Secure Transactions</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Diverse Talent Pool</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Efficient Project Management</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Cost Effective</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                <p>Fast work delivery</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -40px) scale(1.1); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.05); }
          50% { transform: translate(-15px, 15px) scale(0.95); }
          75% { transform: translate(25px, 10px) scale(1.02); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(35px, 35px) scale(1.08); }
        }
        @keyframes fade-in-smooth {
          0% { opacity: 0; transform: translateY(40px); }
          60% { opacity: 0.6; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 12s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 18s ease-in-out infinite; }
        .animate-fade-in-smooth { animation: fade-in-smooth 1.4s ease-out forwards; }
      `}</style>
    </section>
  );
}