import React, { useState } from "react";
import { ArrowRight, Briefcase, User, Star, X } from "lucide-react";

interface Gig {
  id: number;
  name: string;
  title: string;
  company: string;
  desc: string;
  job: string;
  type: string;
  talent: number;
  pay: string;
  deadline: string;
  timeframe?: string;
}

interface NotificationProps {
  message: string;
  show: boolean;
}

const Notification: React.FC<NotificationProps> = ({ message, show }) => {
  if (!show) return null;
  
  return (
    <div className="fixed top-4 right-4 z-[60] bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
      {message}
    </div>
  );
};

const Gigs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"remote" | "physical">("remote");
  const [showAllGigs, setShowAllGigs] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const remoteGigs: Gig[] = [
    {
      id: 1,
      name: "Omilabu Wuraola",
      title: "Frontend Developer",
      company: "SwiftGig",
      desc: "I need a frontend developer to help with a dashboard project.",
      job: "Frontend Dev",
      type: "Remote",
      talent: 2,
      pay: "$700",
      deadline: "7/06/25",
      timeframe: "10",
    },
    {
      id: 2,
      name: "Ariweli Daniel",
      title: "UI Designer",
      company: "Creative Studio",
      desc: "Seeking a UI designer for mobile and web interfaces.",
      job: "UI Designer",
      type: "Remote",
      talent: 1,
      pay: "$500",
      deadline: "8/06/25",
      timeframe: "19",
    },
    {
      id: 3,
      name: "John Doe",
      title: "React Developer",
      company: "TechHive",
      desc: "Looking for a React dev to maintain an existing codebase.",
      job: "React Developer",
      type: "Remote",
      talent: 3,
      pay: "$800",
      deadline: "9/06/25",
      timeframe: "40",
    },
    {
      id: 4,
      name: "Jane Smith",
      title: "Frontend Developer",
      company: "Designify",
      desc: "Need help with dashboard UI improvements and bug fixes.",
      job: "Frontend Dev",
      type: "Remote",
      talent: 2,
      pay: "$750",
      deadline: "10/06/25",
      timeframe: "30",
    },
  ];

  const physicalGigs: Gig[] = [
    {
      id: 5,
      name: "Lagos Creative Hub",
      title: "Graphic Designer",
      company: "Lagos Creative Hub",
      desc: "On-site graphic designer needed for branding project.",
      job: "Graphic Designer",
      type: "Physical",
      talent: 1,
      pay: "$600",
      deadline: "15/06/25",
      timeframe: "10",
    },
    {
      id: 6,
      name: "Tech Village",
      title: "Tech Instructor",
      company: "Tech Village",
      desc: "Need an on-site coding instructor for bootcamp sessions.",
      job: "Instructor",
      type: "Physical",
      talent: 2,
      pay: "$900",
      deadline: "20/06/25",
      timeframe: "10",
    },
  ];

  const pending = [
    { name: "Google", status: "Pending", job: "Designer" },
    { name: "Netflix", status: "Pending", job: "Frontend Dev" },
    { name: "Spotify", status: "Pending", job: "UI/UX Designer" },
    { name: "Meta", status: "Pending", job: "Game Dev" },
  ];

  const gigsToShow = activeTab === "remote" ? remoteGigs : physicalGigs;

  const handleApply = () => {
    setShowNotification(true);
    setIsModalOpen(false);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <div className="px-4 md:pl-10 py-6 text-white rounded-xl bg-[#1A031F]/80 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-purple-400 text-sm">Talent Dashboard</h1>
          <h1 className="text-white font-bold mt-2 md:mt-4 text-xl">Gigs</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-1 bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-[15px] px-2 py-2 text-white">
            <img src="/Search.svg" alt="" className="w-8 h-8" />
            <input
              type="text"
              className="outline-none bg-transparent text-sm w-full placeholder-gray-400"
              placeholder="Type here..."
            />
          </div>
          <img src="/notifi.svg" className="w-6 h-6" alt="notifications" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm">Pending Gigs</h3>
            <p className="text-2xl font-bold">10</p>
          </div>
          <Briefcase className="text-purple-400 w-8 h-8" />
        </div>
        <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm">Accepted Gigs</h3>
            <p className="text-2xl font-bold">35</p>
          </div>
          <Star className="text-purple-400 w-8 h-8" />
        </div>
        <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm">Rating</h3>
            <p className="text-2xl font-bold">4.8</p>
          </div>
          <User className="text-purple-400 w-8 h-8" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mt-8 bg-[#2B0A2F]/50 rounded-2xl p-1 w-full max-w-[300px]">
        <button
          onClick={() => setActiveTab("remote")}
          className={`flex-1 text-sm sm:text-base rounded-2xl py-2 transition-all duration-300 ${
            activeTab === "remote"
              ? "bg-purple-500 font-semibold"
              : "text-white/70 hover:bg-white/10"
          }`}
        >
          Remote
        </button>
        <button
          onClick={() => setActiveTab("physical")}
          className={`flex-1 text-sm sm:text-base rounded-2xl py-2 transition-all duration-300 ${
            activeTab === "physical"
              ? "bg-purple-500 font-semibold"
              : "text-white/70 hover:bg-white/10"
          }`}
        >
          Physical
        </button>
      </div>

      {/* Gigs List */}
      <div className="mt-10 bg-[#2B0A2F]/50 py-5 px-5 rounded-2xl overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-4 font-semibold text-sm md:text-base border-b border-white/10 pb-2 mb-3">
          <h1>Name</h1>
          <h1>Job</h1>
          <h1>No. of Talent</h1>
          <h1>Deadline</h1>
        </div>

        {(showAllGigs ? gigsToShow : gigsToShow.slice(0, 3)).map((gig) => (
          <div
            key={gig.id}
            onClick={() => {
              setSelectedGig(gig);
              setIsModalOpen(true);
            }}
            className="flex flex-col sm:grid sm:grid-cols-4 gap-2 border-b border-white/10 py-3 cursor-pointer hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h1 className="font-medium">{gig.name}</h1>
                <p className="text-white/70 text-sm truncate w-[100px]">
                  {gig.desc}
                </p>
              </div>
            </div>
            <h1>{gig.job}</h1>
            <h1>{gig.talent}</h1>
            <h1>{gig.deadline}</h1>
          </div>
        ))}

        {gigsToShow.length > 2 && (
          <div
            onClick={() => setShowAllGigs(!showAllGigs)}
            className="flex justify-center items-center gap-2 cursor-pointer mt-4 hover:text-purple-300 transition"
          >
            <h1 className="text-sm sm:text-lg">
              {showAllGigs ? "Show Less" : "View All"}
            </h1>
            <ArrowRight
              className={`transition-transform ${showAllGigs ? "rotate-90" : ""}`}
            />
          </div>
        )}
      </div>

      {/* Pending Gigs */}
      <div className="mt-8 bg-[#2B0A2F]/50 py-5 px-5 rounded-2xl overflow-hidden">
        <h1 className="text-lg font-semibold mb-1">Pending Gigs</h1>
        <p className="text-white/50 text-sm mb-4">
          You applied for 10 jobs this month
        </p>

        <div className="hidden sm:grid sm:grid-cols-3 font-semibold text-sm md:text-base border-b border-white/10 pb-2 mb-3">
          <span>Company</span>
          <span>Status</span>
          <span>Job</span>
        </div>

        {(showAllPending ? pending : pending.slice(0, 2)).map((item, i) => (
          <div
            key={i}
            className="flex flex-col sm:grid sm:grid-cols-3 items-start sm:items-center border-b border-white/10 py-3"
          >
            <span>{item.name}</span>
            <span className="bg-yellow-500/20 text-yellow-400 rounded-xl text-center px-2 py-1 w-fit">
              {item.status}
            </span>
            <span>{item.job}</span>
          </div>
        ))}

        {pending.length > 2 && (
          <div
            onClick={() => setShowAllPending(!showAllPending)}
            className="flex justify-center items-center gap-2 cursor-pointer mt-4 hover:text-purple-300 transition"
          >
            <h1 className="text-sm sm:text-lg">
              {showAllPending ? "Show Less" : "View All"}
            </h1>
            <ArrowRight
              className={`transition-transform ${showAllPending ? "rotate-90" : ""}`}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedGig && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Box */}
          <div className="fixed z-50 inset-0 flex items-center justify-center px-4">
            <div className="bg-[#1A031F] border border-[#2B0A2F] p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto text-white shadow-2xl">
              
              <div className="flex justify-between">
                <div>
                  <p className="text-xl font-bold mb-2">{selectedGig.company}</p>
                  <h2 className="text-lg text-gray-300 mb-4">{selectedGig.title}</h2>
                </div>
                <div 
                onClick={() => setIsModalOpen(false)} className="cursor-pointer "><X  className="text-[#641374] hover:text-[#7b2390]"/></div> 
              </div>
              <p>
                <span className="font-semibold">Pay:</span> {selectedGig.pay}
              </p>
              <p>
                <span className="font-semibold">Deadline:</span> {selectedGig.deadline}
              </p>
              <p>
                <span className="font-semibold">No of Talents Needed:</span> {selectedGig.talent}
              </p>
              {selectedGig.timeframe && (
                <p>
                  <span className="font-semibold">Timeframe:</span> {selectedGig.timeframe} days
                </p>
              )}
              <p className="mt-2">
                <span className="font-semibold">Description:</span> <br />
                <span className="text-gray-300 text-sm">{selectedGig.desc}</span>
              </p>

              <button
               onClick={handleApply}
                className="mt-6 bg-[#641374] hover:bg-[#7b2390] transition px-4 py-2 rounded-xl text-sm shadow-lg shadow-purple-500/30 w-full"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notification */}
      <Notification 
        message="You have been added to the wait list" 
        show={showNotification} 
      />
    </div>
  );
};

export default Gigs;