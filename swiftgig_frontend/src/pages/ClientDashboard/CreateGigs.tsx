import React, { useState, useEffect } from 'react';
import { Plus, X, Users, Clock, Calendar, CheckCircle, XCircle, Star, Briefcase, ArrowRight, Loader } from 'lucide-react';
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
  waitlist: string[];
  acceptedTalents: string[];
}

interface TalentProfile {
  address: string;
  name: string;
  skill: string;
  creditScore: number;
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

export default function CreateGigs() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [talentProfiles, setTalentProfiles] = useState<Map<string, TalentProfile>>(new Map());
  const [loading, setLoading] = useState(false);
  const [fetchingGigs, setFetchingGigs] = useState(false);
  const [showAllGigs, setShowAllGigs] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    talentsNeeded: '',
    timeframe: '',
    amount: ''
  });

  useEffect(() => {
    if (account?.address) {
      fetchUserGigs();
      fetchTalentProfiles();
    }
  }, [account?.address]);

  const fetchTalentProfiles = async () => {
    try {
      const talentProfileEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::TalentProfileCreated`,
        },
        limit: 200,
      });

      const profiles = new Map<string, TalentProfile>();

      for (const event of talentProfileEvents.data) {
        const eventData = event.parsedJson as any;
        
        // Store profile directly from event data first (as fallback)
        if (eventData.talent_addr) {
          profiles.set(eventData.talent_addr, {
            address: eventData.talent_addr,
            name: "Loading...",
            skill: eventData.skill || "N/A",
            creditScore: 50,
          });
        }

        // Then try to fetch the full profile object
        try {
          const profileObject = await suiClient.getObject({
            id: eventData.talent_id,
            options: { showContent: true },
          });

          if (profileObject.data?.content && 'fields' in profileObject.data.content) {
            const fields = profileObject.data.content.fields as any;
            
            // Try multiple ways to extract the name
            let name = "Unknown";
            if (fields.full_name) {
              if (fields.full_name.fields?.vec) {
                name = String.fromCharCode(...fields.full_name.fields.vec);
              } else if (typeof fields.full_name === 'string') {
                name = fields.full_name;
              }
            }
            
            // Try multiple ways to extract the skill
            let skill = "N/A";
            if (fields.skill) {
              if (fields.skill.fields?.vec) {
                skill = String.fromCharCode(...fields.skill.fields.vec);
              } else if (typeof fields.skill === 'string') {
                skill = fields.skill;
              }
            }

            console.log('Fetched talent profile:', {
              address: eventData.talent_addr,
              name,
              skill,
              credibility: fields.credibility_score
            });

            profiles.set(eventData.talent_addr, {
              address: eventData.talent_addr,
              name,
              skill,
              creditScore: parseInt(fields.credibility_score) || 50,
            });
          }
        } catch (error) {
          console.warn(`Could not fetch profile ${eventData.talent_id}:`, error);
        }
      }

      console.log('Total talent profiles fetched:', profiles.size);
      setTalentProfiles(profiles);
    } catch (error) {
      console.error('Error fetching talent profiles:', error);
    }
  };

  const fetchUserGigs = async () => {
    if (!account?.address) return;
    
    setFetchingGigs(true);
    try {
      const gigCreatedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
        },
        limit: 100,
      });

      const userGigs: Gig[] = [];

      for (const event of gigCreatedEvents.data) {
        const eventData = event.parsedJson as any;
        
        if (eventData.creator === account.address) {
          try {
            const gigObject = await suiClient.getObject({
              id: eventData.gig_id,
              options: { showContent: true },
            });

            if (gigObject.data?.content && 'fields' in gigObject.data.content) {
              const fields = gigObject.data.content.fields as any;
              const metadata = fields.metadata?.fields || fields.metadata;

              const name = metadata?.name?.fields?.vec
                ? String.fromCharCode(...metadata.name.fields.vec)
                : metadata?.name || "Unnamed Gig";
              
              const description = metadata?.description?.fields?.vec
                ? String.fromCharCode(...metadata.description.fields.vec)
                : metadata?.description || "No description";

              const deadline = parseInt(metadata?.deadline) || 0;
              const talentsNeeded = parseInt(metadata?.talents_needed) || 0;
              const timeframeMs = parseInt(metadata?.gig_active_timeframe) || 0;
              
              userGigs.push({
                id: eventData.gig_id,
                name: name || "Unnamed Gig",
                description: description || "No description",
                deadline: deadline > 0 ? new Date(deadline).toLocaleDateString() : "N/A",
                talentsNeeded: talentsNeeded || 0,
                timeframe: timeframeMs > 0 ? calculateTimeframe(timeframeMs) : "N/A",
                amount: eventData.reward_amount ? (eventData.reward_amount / 1000000000).toFixed(2) : "0",
                createdAt: event.timestampMs ? new Date(event.timestampMs).toLocaleDateString() : "N/A",
                applicants: fields.waitlist?.length || 0,
                waitlist: fields.waitlist || [],
                acceptedTalents: fields.accepted_talents || []
              });
            }
          } catch (error) {
            console.warn(`Could not fetch gig ${eventData.gig_id}:`, error);
          }
        }
      }

      setGigs(userGigs);
    } catch (error) {
      console.error('Error fetching user gigs:', error);
    } finally {
      setFetchingGigs(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateGig = () => {
    if (!account) {
      showNotif('Please connect your wallet');
      return;
    }

    if (!formData.name || !formData.description || !formData.deadline || !formData.talentsNeeded || !formData.timeframe || !formData.amount) {
      showNotif('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    const tx = new Transaction();
    
    const deadlineDate = new Date(formData.deadline);
    const deadlineMs = deadlineDate.getTime();
    const timeframeMs = parseInt(formData.timeframe) * 24 * 60 * 60 * 1000;
    const amountInMist = parseFloat(formData.amount) * 1000000000;
    
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);
    
    tx.moveCall({
      target: `${PACKAGE_ID}::swiftgig::create_gig`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(formData.name),
        tx.pure.string(formData.description),
        tx.pure.u64(deadlineMs),
        tx.pure.u64(parseInt(formData.talentsNeeded)),
        tx.pure.u64(timeframeMs),
        paymentCoin,
        tx.object('0x6'),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onError: (err) => {
          console.error('Error creating gig:', err);
          setLoading(false);
          showNotif('Failed to create gig');
        },
        onSuccess: (result) => {
          console.log('Gig created successfully:', result);
          setLoading(false);
          setIsCreateModalOpen(false);
          showNotif('Gig created successfully! 🎉');
          
          setFormData({
            name: '',
            description: '',
            deadline: '',
            talentsNeeded: '',
            timeframe: '',
            amount: ''
          });

          setTimeout(() => fetchUserGigs(), 2000);
        },
      }
    );
  };

  const handleSelectTalents = async (gigId: string, selectedTalentAddresses: string[]) => {
    if (!account) return;
    
    setLoading(true);
    const tx = new Transaction();
    
    const talentAddresses = selectedTalentAddresses.map(addr => tx.pure.address(addr));
    
    tx.moveCall({
      target: `${PACKAGE_ID}::swiftgig::select_talents`,
      arguments: [
        tx.object(gigId),
        tx.makeMoveVec({ elements: talentAddresses }),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onError: (err) => {
          console.error('Error selecting talents:', err);
          setLoading(false);
          showNotif('Failed to select talents');
        },
        onSuccess: (result) => {
          console.log('Talents selected successfully:', result);
          setLoading(false);
          showNotif('Talents selected successfully! ✅');
          setIsWaitlistModalOpen(false);
          
          setTimeout(() => fetchUserGigs(), 2000);
        },
      }
    );
  };

  const getTalentName = (address: string): string => {
    const profile = talentProfiles.get(address);
    return profile?.name || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTalentSkill = (address: string): string => {
    const profile = talentProfiles.get(address);
    return profile?.skill || "N/A";
  };

  const getTalentCredibility = (address: string): number => {
    const profile = talentProfiles.get(address);
    return profile?.creditScore || 50;
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const gigsToDisplay = showAllGigs ? gigs : gigs.slice(0, 3);

  if (!account) {
    return (
      <div className="w-full min-h-screen bg-[#1A031F] px-4 md:pl-10 py-6 flex items-center justify-center">
        <div className="text-center">
          <Plus className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-white">Connect Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to create and manage gigs</p>
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
            <h1 className="text-purple-400 text-sm">Client Dashboard</h1>
            <h1 className="text-white font-bold mt-2 md:mt-4 text-xl">Create Gigs</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Gig</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Gigs Created</h3>
              <p className="text-2xl font-bold">{gigs.length}</p>
            </div>
            <Plus className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Active Gigs</h3>
              <p className="text-2xl font-bold">{gigs.length}</p>
            </div>
            <Star className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Total Applicants</h3>
              <p className="text-2xl font-bold">{gigs.reduce((sum, g) => sum + g.applicants, 0)}</p>
            </div>
            <Users className="text-purple-400 w-8 h-8" />
          </div>
        </div>

        <Notification message={notificationMsg} show={showNotification} />

        {/* Content Section */}
        {fetchingGigs ? (
          <div className="bg-[#2B0A2F]/50 rounded-2xl p-12 flex flex-col justify-center items-center">
            <Loader className="w-8 h-8 text-purple-400 mb-3 animate-spin" />
            <p className="text-gray-400">Loading your gigs...</p>
          </div>
        ) : (
          <div className="bg-[#2B0A2F]/50 py-5 px-5 rounded-2xl overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-5 font-semibold text-sm md:text-base border-b border-white/10 pb-2 mb-3">
              <h1>Name</h1>
              <h1>Amount (SUI)</h1>
              <h1>Talents Needed</h1>
              <h1>Deadline</h1>
              <h1>Applicants</h1>
            </div>

            {gigsToDisplay.length > 0 ? (
              <>
                {gigsToDisplay.map((gig) => (
                  <div
                    key={gig.id}
                    onClick={() => {
                      setSelectedGig(gig);
                      setIsWaitlistModalOpen(true);
                    }}
                    className="flex flex-col sm:grid sm:grid-cols-5 gap-2 border-b border-white/10 py-3 cursor-pointer hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {gig.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="font-medium truncate">{gig.name}</h1>
                        <p className="text-white/70 text-xs truncate w-[150px]">
                          {gig.description}
                        </p>
                      </div>
                    </div>
                    <h1 className="text-sm">{gig.amount} SUI</h1>
                    <h1 className="text-sm">{gig.acceptedTalents.length}/{gig.talentsNeeded}</h1>
                    <h1 className="text-sm">{gig.deadline}</h1>
                    <h1 className="text-sm">{gig.applicants}</h1>
                  </div>
                ))}

                {gigs.length > 3 && (
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
                <p className="text-gray-400 mb-4">No gigs created yet</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Gig</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Gig Modal */}
      {isCreateModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => !loading && setIsCreateModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A031F] border border-[#2B0A2F] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Create New Gig</h2>
                <button
                  onClick={() => !loading && setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <div>
                      <h4 className="text-blue-400 font-semibold text-sm mb-1">Payment & Trust Policy</h4>
                      <p className="text-blue-300 text-xs leading-relaxed">
                        When you create this gig, the payment amount will be securely transferred from your wallet to the Gig Treasury. 
                        This ensures trust and security between you and the talents.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gig Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Mobile App Development"
                    className="w-full bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the gig requirements..."
                    className="w-full bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Amount (SUI) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g., 10.5"
                    className="w-full bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Talents Needed *</label>
                    <input
                      type="number"
                      name="talentsNeeded"
                      value={formData.talentsNeeded}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 3"
                      className="w-full bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Application Timeframe (days) *</label>
                    <input
                      type="number"
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 7"
                      className="w-full bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGig}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Gig</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Waitlist Modal */}
      {isWaitlistModalOpen && selectedGig && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => !loading && setIsWaitlistModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A031F] border border-[#2B0A2F] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedGig.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">Talent Waitlist ({selectedGig.waitlist.length} applicants)</p>
                </div>
                <button
                  onClick={() => !loading && setIsWaitlistModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {selectedGig.waitlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedGig.waitlist.map((talentAddress, index) => {
                      const isSelected = selectedGig.acceptedTalents.includes(talentAddress);
                      const profile = talentProfiles.get(talentAddress);
                      const talentName = profile?.name || "Anonymous Talent";
                      const talentSkill = profile?.skill || "N/A";
                      const credibility = profile?.creditScore || 50;
                      
                      return (
                        <div key={index} className={`bg-[#2B0A2F]/50 border rounded-xl p-5 transition-all ${
                          isSelected ? 'border-green-500 bg-green-500/5' : 'border-[#641374]/50 hover:border-purple-500'
                        }`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Avatar */}
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg">
                                {talentName.charAt(0).toUpperCase()}
                              </div>
                              
                              {/* Talent Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-white truncate">
                                    {talentName}
                                  </h3>
                                  {isSelected && (
                                    <span className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Selected</span>
                                    </span>
                                  )}
                                </div>
                                
                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div className="bg-[#1A031F]/50 rounded-lg p-3 border border-[#641374]/30">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Briefcase className="w-4 h-4 text-purple-400" />
                                      <span className="text-xs text-gray-400 font-medium">Primary Skill</span>
                                    </div>
                                    <p className="text-sm text-white font-semibold">{talentSkill}</p>
                                  </div>
                                  
                                  <div className="bg-[#1A031F]/50 rounded-lg p-3 border border-[#641374]/30">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Star className={`w-4 h-4 ${getCreditScoreColor(credibility)}`} />
                                      <span className="text-xs text-gray-400 font-medium">Credibility Score</span>
                                    </div>
                                    <p className={`text-sm font-bold ${getCreditScoreColor(credibility)}`}>
                                      {credibility} / 100
                                    </p>
                                  </div>
                                </div>

                                {/* Wallet Address */}
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500">Wallet:</span>
                                  <code className="bg-[#1A031F]/50 px-2 py-1 rounded border border-[#641374]/30 text-purple-300 font-mono">
                                    {talentAddress.slice(0, 8)}...{talentAddress.slice(-8)}
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(talentAddress);
                                      showNotif('Address copied!');
                                    }}
                                    className="text-purple-400 hover:text-purple-300 transition"
                                  >
                                    📋
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Button */}
                            {!isSelected && selectedGig.acceptedTalents.length < selectedGig.talentsNeeded && (
                              <button
                                onClick={() => handleSelectTalents(selectedGig.id, [...selectedGig.acceptedTalents, talentAddress])}
                                disabled={loading}
                                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold whitespace-nowrap"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>{loading ? 'Selecting...' : 'Select Talent'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {selectedGig.acceptedTalents.length >= selectedGig.talentsNeeded && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-green-400 font-bold text-sm">All Talent Slots Filled!</p>
                        <p className="text-green-300/70 text-xs">
                          {selectedGig.acceptedTalents.length} of {selectedGig.talentsNeeded} talents selected
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}