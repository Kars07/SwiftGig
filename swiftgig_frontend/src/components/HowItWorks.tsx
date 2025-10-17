import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

type Mode = "hiring" | "finding";

type Card = {
  id: string;
  title: string;
  image: string;
  description?: string;
  href?: string;
};

const hiringCards: Card[] = [
  {
    id: "h1",
    title: "Posting Gigs for Hire",
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=3d3b5a3f1c6f4b3b1f2a1f4a8f1b2c3d",
    description: "Create a job post and attract qualified talent.",
  },
  {
    id: "h2",
    title: "Get engagment and hire",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1c9f0a1d2a3b4c5d6e7f8a9b0c1d2e3f",
    description: "Review proposals, interview and choose the best fit.",
  },
  {
    id: "h3",
    title: "Pay when work is done",
    image:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=7b5f6a7c8d9e0f1a2b3c4d5e6f7a8b9c",
    description: "Secure payments and milestone-based releases.",
  },
];

const findingCards: Card[] = [
  {
    id: "f1",
    title: "Find relevant Gigs fast",
    image:
      "https://images.unsplash.com/photo-1520975911985-9d5ae5d3b1f1?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=0e7f8c9a1b2c3d4e5f6a7b8c9d0e1f2a",
    description: "Browse curated opportunities matched to your skills.",
  },
  {
    id: "f2",
    title: "Send great proposals",
    image:
      "https://images.unsplash.com/photo-1531379410508-63b2c2a45d6d?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e",
    description: "Stand out with a tailored pitch and portfolio.",
  },
  {
    id: "f3",
    title: "Get paid securely",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f",
    description: "Payments released on completion and approval.",
  },
];

export default function HowItWorks() {
  const [mode, setMode] = useState<Mode>("hiring");
  const cards = mode === "hiring" ? hiringCards : findingCards;

  return (
    <section className="relative min-h-screen px-6 py-24 overflow-hidden bg-gradient-to-b from-[#0b0013] via-[#1a0025] to-black">
      {/* Floating orbs to match FirstSection */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-24 w-[800px] h-[800px] bg-gradient-to-br from-[#622578] to-[#8b3a9e] rounded-full blur-[120px] opacity-40 animate-float-slow" />
        <div className="absolute -bottom-24 -right-16 w-[600px] h-[600px] bg-gradient-to-tl from-[#7a2e94] to-[#9d4ab3] rounded-full blur-[100px] opacity-30 animate-float-medium" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-gradient-to-br from-[#8b3a9e] to-[#a347b8] rounded-full blur-[80px] opacity-25 animate-float-fast" />
        <div className="absolute bottom-[30%] left-[15%] w-[300px] h-[300px] bg-gradient-to-tr from-[#622578] to-[#7a2e94] rounded-full blur-[90px] opacity-20 animate-float-reverse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 gap-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">How it works</h2>

          <div className="flex items-center space-x-3 bg-white/3 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setMode("hiring")}
              aria-pressed={mode === "hiring"}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "hiring"
                  ? "bg-gradient-to-r from-[#622578] to-[#8b3a9e] text-white shadow-lg"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              For hiring
            </button>

            <button
              onClick={() => setMode("finding")}
              aria-pressed={mode === "finding"}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "finding"
                  ? "bg-gradient-to-r from-[#622578] to-[#8b3a9e] text-white shadow-lg"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              For finding Gigs
            </button>
          </div>
        </div>

        <p className="text-gray-400 mb-8 max-w-3xl">
          Toggle between the flows to see tailored steps for hiring and for finding work. Hover or focus a step to reveal the next action.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <article
              key={card.id}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl overflow-hidden shadow-sm transition-transform transform hover:-translate-y-1 focus-within:-translate-y-1"
              tabIndex={0}
            >
              <div className="relative h-56 md:h-48 lg:h-56">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* overlay: shows on hover or focus */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                  <a
                    href={card.href ?? "#"}
                    onClick={(e) => {
                      e.preventDefault();
                      // demo action - replace with router navigation or real link
                      alert(`Continue: ${card.title}`);
                    }}
                    className="mb-6 inline-flex items-center gap-2 bg-white text-[#2b0b2f] font-semibold px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
                  >
                    Continue
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                {card.description && <p className="text-gray-300 text-sm">{card.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* keyframes and small animation utilities that Tailwind might not include by default */}
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
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 12s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 18s ease-in-out infinite; }
      `}</style>
    </section>
  );
}