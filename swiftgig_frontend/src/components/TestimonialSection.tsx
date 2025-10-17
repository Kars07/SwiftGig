import React from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sophia",
      role: "Freelancer",
      text: "I got my first paid transcription gig on SwiftGig within two days of signing up! The platform made it super easy to find clients who value my skills.",
    },
    {
      name: "James",
      role: "Client",
      text: "We hired three amazing freelance designers through SwiftGig. The process was smooth, secure, and saved us so much time.",
    },
    {
      name: "Amina",
      role: "Student",
      text: "As a student, I use SwiftGig to take small writing and proofreading gigs. It’s been a great way to earn and build my portfolio.",
    },
    {
      name: "Victor",
      role: "Photographer",
      text: "SwiftGig connected me with local event gigs and clients I’d never reach on social media alone. Payments are fast and reliable!",
    },
    {
      name: "Chloe",
      role: "Content Writer",
      text: "The bidding system and verified clients make SwiftGig my go-to platform. I’ve turned freelancing into a full-time income source.",
    },
    {
      name: "Daniel",
      role: "Business Owner",
      text: "Our company found talented developers and translators here for short-term projects. SwiftGig makes hiring freelancers effortless.",
    },
  ];

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0b0012] to-black overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-[#622578] to-[#8b3a9e] rounded-full blur-[130px] opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-[-20%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-[#7a2e94] to-[#9d4ab3] rounded-full blur-[100px] opacity-30 animate-float-medium"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hear From Our{" "}
            <span className="text-[#8b3a9e]">Freelancers</span> &{" "}
            <span className="text-[#8b3a9e]">Clients</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real stories from real people — freelancers earning, and clients
            finding the perfect match.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          <div className="flex animate-scroll space-x-6 w-max">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#622578] transition-all duration-500 ease-out cursor-pointer hover:scale-[1.03]"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#622578] to-[#8b3a9e] flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      @{testimonial.role.toLowerCase().replace(" ", "")}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {testimonial.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 animate-fade-in-up animation-delay-400">
          <h3 className="text-3xl font-semibold text-white mb-4">
            Get Started with{" "}
            <span className="text-[#8b3a9e] font-bold">SwiftGig</span>
          </h3>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of freelancers and clients building success together.
            Post a gig or find work today.
          </p>
          <a href="/create-profile">
            <button className="inline-flex items-center justify-center bg-gradient-to-r from-[#622578] to-[#8b3a9e] hover:from-[#7a2e94] hover:to-[#a347b8] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 cursor-pointer">
              Join SwiftGig Now
            </button>
          </a>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -40px) scale(1.1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1.2s ease-out forwards; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards; }
        body { overflow-x: hidden; }
      `}</style>
    </section>
  );
}