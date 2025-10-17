import React from "react";
import {
  ShieldCheck,
  Clock,
  Users,
  Briefcase,
  BarChart3,
  Rocket,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Briefcase,
      title: "Instant Gig Matching",
      desc: "Get matched to the perfect gigs that suit your skills, interests, and availability — instantly.",
    },
    {
      icon: ShieldCheck,
      title: "Escrow-Powered Security",
      desc: "All payments are held securely in escrow until work is approved — no scams, just trust.",
    },
    {
      icon: Users,
      title: "Verified Talents & Clients",
      desc: "We verify both talents and clients to maintain a safe, reliable gig community for everyone.",
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      desc: "Track your work history, ratings, and growth metrics to improve your gig success rate.",
    },
    {
      icon: Clock,
      title: "Instant Payouts",
      desc: "Once your gig is completed and approved, your payment is released immediately.",
    },
    {
      icon: Rocket,
      title: "Scale Your Career",
      desc: "Start small, grow fast. Build your reputation, earn more, and reach new professional heights.",
    },
  ];

  return (
    <section
      className="relative py-20 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-black overflow-hidden"
      style={{ marginTop: "-1px" }}
    >
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-25%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#622578] to-[#8b3a9e] rounded-full blur-[120px] opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-[#7a2e94] to-[#9d4ab3] rounded-full blur-[100px] opacity-30 animate-float-medium"></div>
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-gradient-to-br from-[#8b3a9e] to-[#a347b8] rounded-full blur-[80px] opacity-25 animate-float-fast"></div>
        <div className="absolute bottom-[30%] left-[15%] w-[300px] h-[300px] bg-gradient-to-tr from-[#622578] to-[#7a2e94] rounded-full blur-[90px] opacity-20 animate-float-reverse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto animate-fade-in-smooth">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#622578] to-[#8b3a9e]">
              SwiftGig?
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience freedom, fairness, and financial empowerment — built for
            freelancers and clients who value trust.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[#622578] transition-all duration-500 ease-out cursor-pointer hover:scale-[1.04]"
              >
                <div className="flex flex-col items-start space-y-4">
                  <div className="text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-white font-semibold text-xl leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#622578] to-[#8b3a9e] hover:from-[#7a2e94] hover:to-[#a347b8] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
            <span>Join SwiftGig Today</span>
          </button>
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