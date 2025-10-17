import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FirstSectionProps {
  onGetStarted: () => '/create-profile' | '/login';
}

export default function FirstSection({ onGetStarted }: FirstSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-b from-[#0b0013] via-[#1a0025] to-black pt-40">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#622578] to-[#8b3a9e] rounded-full blur-[120px] opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-[#7a2e94] to-[#9d4ab3] rounded-full blur-[100px] opacity-30 animate-float-medium"></div>
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-gradient-to-br from-[#8b3a9e] to-[#a347b8] rounded-full blur-[80px] opacity-25 animate-float-fast"></div>
        <div className="absolute bottom-[30%] left-[15%] w-[300px] h-[300px] bg-gradient-to-tr from-[#622578] to-[#7a2e94] rounded-full blur-[90px] opacity-20 animate-float-reverse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
          <span className="bg-gradient-to-r from-[#622578] via-[#8b3a9e] to-[#a347b8] bg-clip-text text-transparent text-white">
            Work Smarter. Hire Faster. Collaborate Globally
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
          SwiftGig connects Talents and clients through secure escrow Treasury payments, verified reviews, and trustless smart contracts—empowering work that’s fast, fair, and global.
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="group inline-flex items-center space-x-2 bg-gradient-to-r from-[#622578] to-[#8b3a9e] hover:from-[#7a2e94] hover:to-[#a347b8] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 animate-fade-in-up animation-delay-400"
        >
          <span className="text-lg cursor-pointer">Get Started</span>
          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fade-in-up animation-delay-600">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="text-4xl font-bold text-white mb-2">1000+</div>
            <div className="text-gray-400 text-sm">Active Talents</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-gray-400 text-sm">Completed Gigs</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="text-4xl font-bold text-white mb-2">$2M+</div>
            <div className="text-gray-400 text-sm">Total Paid Out</div>
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
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 12s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 18s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards; }
        .animation-delay-600 { animation-delay: 0.6s; opacity: 0; animation-fill-mode: forwards; }
      `}</style>
    </section>
  );
}