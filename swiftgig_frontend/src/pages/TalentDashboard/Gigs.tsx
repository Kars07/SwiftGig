import React, { useState, useEffect } from "react";
import { ArrowRight, Briefcase, User, Star, X, Loader } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313';
const REGISTRY_ID = '0xa67a472036dfeb14dd622ff9af24fdfec492a09879ea5637091d927159541474';

interface Gig {
  id: string;
  name: string;
  description: string;
  deadline: string;
  talentsNeeded: number;
  timeframe: string;
  amount: string;
  createdAt: string;
  applicants: number;
  creator: string;
  isApplied?: boolean;
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
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // UI States
  const [activeTab, setActiveTab] = useState<"all" | "applied">("all");
  const [showAllGigs, setShowAllGigs] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Data States
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [appliedGigs, setAppliedGigs] = useState<string[]>([]);
  
  // Loading States
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [applyingGigId, setApplyingGigId] = useState<string | null>(null);

  // Fetch all gigs on mount
  useEffect(() => {
    const init = async () => {
      setLoadingGigs(true);
      if (account?.address) {
        await fetchAllGigs();
        await fetchUserApplications();
      } else {
        setLoadingGigs(false);
      }
    };
    init();
  }, [account?.address]);

  const fetchAllGigs = async () => {
    try {
      const gigCreatedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
        },
        limit: 100,
      });

      const fetchedGigs: Gig[] = [];

      for (const event of gigCreatedEvents.data) {
        const eventData = event.parsedJson as any;
        
        try {
          const gigObject = await suiClient.getObject({
            id: eventData.gig_id,
            options: { showContent: true },
          });

          if (gigObject.data?.content && 'fields' in gigObject.data.content) {
            const fields = gigObject.data.content.fields as any;
            const metadata = fields.metadata?.fields || fields.metadata;

            // Extract string values properly
            const name = metadata?.name?.fields?.vec 
              ? String.fromCharCode(...metadata.name.fields.vec)
              : metadata?.name || "Unnamed Gig";
            
            const description = metadata?.description?.fields?.vec
              ? String.fromCharCode(...metadata.description.fields.vec)
              : metadata?.description || "No description";

            const deadline = parseInt(metadata?.deadline) || 0;
            const talentsNeeded = parseInt(metadata?.talents_needed) || 0;
            const timeframeMs = parseInt(metadata?.gig_active_timeframe) || 0;

            console.log('Parsed metadata:', { name, description, deadline, talentsNeeded, timeframeMs });

            fetchedGigs.push({
              id: eventData.gig_id,
              name: name || "Unnamed Gig",
              description: description || "No description",
              deadline: deadline > 0 ? new Date(deadline).toLocaleDateString() : "N/A",
              talentsNeeded: talentsNeeded || 0,
              timeframe: timeframeMs > 0 ? calculateTimeframe(timeframeMs) : "N/A",
              amount: eventData.reward_amount ? (eventData.reward_amount / 1000000000).toFixed(2) : "0",
              createdAt: event.timestampMs ? new Date(event.timestampMs).toLocaleDateString() : "N/A",
              applicants: fields.waitlist?.length || 0,
              creator: eventData.creator || "Unknown",
            });
          }
        } catch (error) {
          console.warn(`Could not fetch gig ${eventData.gig_id}:`, error);
        }
      }

      console.log('All fetched gigs:', fetchedGigs);
      setGigs(fetchedGigs);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      showNotif('Failed to fetch gigs');
      setGigs([]);
    } finally {
      setLoadingGigs(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!account?.address) return;

    try {
      const talentAppliedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::TalentApplied`,
        },
        limit: 200,
      });

      const userAppliedGigIds = talentAppliedEvents.data
        .filter(e => {
          const eventData = e.parsedJson as any;
          return eventData.talent === account.address;
        })
        .map(e => {
          const eventData = e.parsedJson as any;
          return eventData.gig_id;
        });

      setAppliedGigs(userAppliedGigIds);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const calculateTimeframe = (ms: number): string => {
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const showNotif = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleApply = async () => {
    if (!account || !selectedGig) {
      showNotif('Connect wallet first');
      return;
    }

    if (appliedGigs.includes(selectedGig.id)) {
      showNotif('Already applied to this gig');
      return;
    }

    setApplyingGigId(selectedGig.id);
    const tx = new Transaction();

    try {
      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::apply_to_gig`,
        arguments: [
          tx.object(selectedGig.id),
          tx.object('0x6'),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Apply error:', err);
            showNotif('Failed to apply. Try again');
            setApplyingGigId(null);
          },
          onSuccess: () => {
            showNotif('Applied successfully! 🎉');
            setIsModalOpen(false);
            setApplyingGigId(null);
            setAppliedGigs([...appliedGigs, selectedGig.id]);
            
            setGigs(gigs.map(g => 
              g.id === selectedGig.id 
                ? { ...g, applicants: g.applicants + 1 }
                : g
            ));
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setApplyingGigId(null);
    }
  };

  const filteredGigs = activeTab === "applied" 
    ? gigs.filter(g => appliedGigs.includes(g.id))
    : gigs;

  const gigsToDisplay = showAllGigs ? filteredGigs : filteredGigs.slice(0, 3);

  if (!account) {
    return (
      <div className="w-full min-h-screen bg-[#1A031F] px-4 md:pl-10 py-6 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-white">Connect Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view and apply for gigs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#1A031F]">
      <div className="px-4 md:pl-10 py-6 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-purple-400 text-sm">Talent Dashboard</h1>
            <h1 className="text-white font-bold mt-2 md:mt-4 text-xl">Gigs</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex flex-1 bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-[15px] px-2 py-2 text-white">
              <img src="/Search.svg" alt="search" className="w-8 h-8" />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Available Gigs</h3>
              <p className="text-2xl font-bold">{gigs.length}</p>
            </div>
            <Briefcase className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Applied Gigs</h3>
              <p className="text-2xl font-bold">{appliedGigs.length}</p>
            </div>
            <Star className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Pending</h3>
              <p className="text-2xl font-bold">{appliedGigs.length}</p>
            </div>
            <User className="text-purple-400 w-8 h-8" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#2B0A2F]/50 rounded-2xl p-1 w-full max-w-[300px] mb-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 text-sm sm:text-base rounded-2xl py-2 transition-all duration-300 ${
              activeTab === "all"
                ? "bg-purple-500 font-semibold"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            All Gigs
          </button>
          <button
            onClick={() => setActiveTab("applied")}
            className={`flex-1 text-sm sm:text-base rounded-2xl py-2 transition-all duration-300 ${
              activeTab === "applied"
                ? "bg-purple-500 font-semibold"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            Applied ({appliedGigs.length})
          </button>
        </div>

        {/* Content Section */}
        {loadingGigs ? (
          <div className="bg-[#2B0A2F]/50 rounded-2xl p-12 flex flex-col justify-center items-center">
            <Loader className="w-8 h-8 text-purple-400 mb-3 animate-spin" />
            <p className="text-gray-400">Loading gigs...</p>
          </div>
        ) : (
          <div className="bg-[#2B0A2F]/50 py-5 px-5 rounded-2xl overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-4 font-semibold text-sm md:text-base border-b border-white/10 pb-2 mb-3">
              <h1>Name</h1>
              <h1>Amount (SUI)</h1>
              <h1>Talents Needed</h1>
              <h1>Deadline</h1>
            </div>

            {gigsToDisplay.length > 0 ? (
              <>
                {gigsToDisplay.map((gig) => {
                  const displayName = gig.name || "Unnamed Gig";
                  const displayDesc = gig.description || "No description";
                  return (
                    <div
                      key={gig.id}
                      onClick={() => {
                        setSelectedGig(gig);
                        setIsModalOpen(true);
                      }}
                      className="flex flex-col sm:grid sm:grid-cols-4 gap-2 border-b border-white/10 py-3 cursor-pointer hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h1 className="font-medium truncate">{displayName}</h1>
                          <p className="text-white/70 text-xs truncate w-[100px]">
                            {displayDesc}
                          </p>
                        </div>
                      </div>
                      <h1 className="text-sm">{gig.amount} SUI</h1>
                      <h1 className="text-sm">{gig.talentsNeeded}</h1>
                      <h1 className="text-sm">{gig.deadline}</h1>
                    </div>
                  );
                })}

                {filteredGigs.length > 3 && (
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
              </>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  {activeTab === "applied" ? "No applications yet" : "No gigs available"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedGig && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => !applyingGigId && setIsModalOpen(false)}
            />

            <div className="fixed z-50 inset-0 flex items-center justify-center px-4">
              <div className="bg-[#1A031F] border border-[#2B0A2F] p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto text-white shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xl font-bold mb-2">{selectedGig.name}</p>
                    <h2 className="text-sm text-gray-300">{selectedGig.creator.slice(0, 6)}...{selectedGig.creator.slice(-4)}</h2>
                  </div>
                  <button
                    onClick={() => !applyingGigId && setIsModalOpen(false)}
                    disabled={!!applyingGigId}
                    className="cursor-pointer disabled:opacity-50"
                  >
                    <X className="text-[#641374] hover:text-[#7b2390]" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="font-semibold text-sm text-gray-400">Pay</span>
                    <p className="text-lg font-bold text-purple-400">{selectedGig.amount} SUI</p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm text-gray-400">Deadline</span>
                    <p className="text-base">{selectedGig.deadline}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm text-gray-400">Talents Needed</span>
                    <p className="text-base">{selectedGig.talentsNeeded}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm text-gray-400">Applicants</span>
                    <p className="text-base">{selectedGig.applicants}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm text-gray-400">Time to Apply</span>
                    <p className="text-base">{selectedGig.timeframe}</p>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-t border-white/10">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold">Description:</span>
                    <br />
                    {selectedGig.description}
                  </p>
                </div>

                <button
                  onClick={handleApply}
                  disabled={applyingGigId === selectedGig.id || appliedGigs.includes(selectedGig.id)}
                  className="w-full bg-[#641374] hover:bg-[#7b2390] disabled:bg-gray-600 disabled:cursor-not-allowed transition px-4 py-3 rounded-xl text-sm shadow-lg shadow-purple-500/30 font-semibold flex items-center justify-center gap-2"
                >
                  {applyingGigId === selectedGig.id ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : appliedGigs.includes(selectedGig.id) ? (
                    <span>✓ Already Applied</span>
                  ) : (
                    <span>Apply Now</span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Notification 
        message={notificationMsg}
        show={showNotification} 
      />
    </div>
  );
};

export default Gigs;