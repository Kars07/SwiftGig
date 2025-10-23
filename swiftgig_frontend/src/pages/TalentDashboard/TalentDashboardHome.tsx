import React, { useState, useEffect } from "react";
import {
  Briefcase,
  User,
  FileText,
  Wallet,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import ChatSystem from "../../components/ChatSystem";

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313';
const REGISTRY_ID = '0xa67a472036dfeb14dd622ff9af24fdfec492a09879ea5637091d927159541474';

interface TalentProfile {
  fullName: string;
  credibilityScore: number;
}

interface GigStats {
  activeGigs: number;
  completedGigs: number;
  totalGigs: number;
}

interface RecentActivity {
  type: string;
  gigId: string;
  timestamp: string;
  amount: string;
}

const DashboardHome: React.FC = () => {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const [isUnlocked, setIsUnlocked] = useState(true);
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [gigStats, setGigStats] = useState<GigStats>({ activeGigs: 0, completedGigs: 0, totalGigs: 0 });
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const [pendingBalance, setPendingBalance] = useState<string>('0.00');
  const [completedBalance, setCompletedBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [profileViews, setProfileViews] = useState<number>(0);

  const toggleEye = () => setIsUnlocked((prev) => !prev);

  useEffect(() => {
    if (account?.address) {
      fetchTalentData();
      fetchWalletBalance();
      fetchGigStats();
      fetchRecentActivity();
    }
  }, [account?.address]);

  const fetchTalentData = async () => {
    if (!account?.address) return;

    try {
      const registryObject = await suiClient.getObject({
        id: REGISTRY_ID,
        options: { showContent: true },
      });

      if (registryObject.data?.content && 'fields' in registryObject.data.content) {
        const fields = registryObject.data.content.fields as any;
        const talentProfiles = fields.talent_profiles || [];

        for (const profileData of talentProfiles) {
          const profileFields = profileData.fields || profileData;
          
          if (profileFields.talent_addr === account.address) {
            let fullName = "Talent";
            if (profileFields.full_name) {
              if (profileFields.full_name.fields?.vec) {
                fullName = String.fromCharCode(...profileFields.full_name.fields.vec);
              } else if (typeof profileFields.full_name === 'string') {
                fullName = profileFields.full_name;
              }
            }

            const credibilityScore = parseInt(profileFields.credibility_score) || 300;
            
            // Profile views - you can track this from application events or store separately
            const views = parseInt(profileFields.profile_views) || 28;

            setTalentProfile({
              fullName,
              credibilityScore,
            });
            setProfileViews(views);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching talent profile:', error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!account?.address) return;

    try {
      const balance = await suiClient.getBalance({
        owner: account.address,
        coinType: '0x2::sui::SUI',
      });

      const balanceInSui = (parseInt(balance.totalBalance) / 1000000000).toFixed(2);
      setWalletBalance(balanceInSui);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchGigStats = async () => {
    if (!account?.address) return;

    try {
      // Query for gigs where this talent applied or was selected
      const gigCreatedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
        },
        limit: 100,
      });

      const applicationEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::TalentApplied`,
        },
        limit: 100,
      });

      let activeCount = 0;
      let completedCount = 0;
      let pendingAmount = 0;
      let completedAmount = 0;

      // Track gigs this talent applied to
      const appliedGigIds = new Set<string>();
      for (const event of applicationEvents.data) {
        const eventData = event.parsedJson as any;
        if (eventData.talent === account.address) {
          appliedGigIds.add(eventData.gig_id);
        }
      }

      // Check status of applied gigs
      for (const gigId of appliedGigIds) {
        try {
          const gigObject = await suiClient.getObject({
            id: gigId,
            options: { showContent: true },
          });

          if (gigObject.data?.content && 'fields' in gigObject.data.content) {
            const fields = gigObject.data.content.fields as any;
            const state = fields.state;
            const rewardAmount = parseInt(fields.reward_amount) / 1000000000;

            // Check if this talent was selected
            const selectedTalent = fields.selected_talent;
            if (selectedTalent === account.address) {
              if (state === 5) { // GIG_CLOSED
                completedCount++;
                completedAmount += rewardAmount;
              } else if (state === 3 || state === 4) { // GIG_IN_PROGRESS or GIG_AWAITING_APPROVAL
                activeCount++;
                pendingAmount += rewardAmount;
              }
            }
          }
        } catch (error) {
          console.warn(`Could not fetch gig ${gigId}:`, error);
        }
      }

      setGigStats({
        activeGigs: activeCount,
        completedGigs: completedCount,
        totalGigs: activeCount + completedCount,
      });

      setPendingBalance(pendingAmount.toFixed(2));
      setCompletedBalance(completedAmount.toFixed(2));

    } catch (error) {
      console.error('Error fetching gig stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!account?.address) return;

    try {
      // Get talent application events
      const applicationEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::TalentApplied`,
        },
        limit: 10,
        order: 'descending',
      });

      // Get work submitted events
      const workSubmittedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::WorkSubmitted`,
        },
        limit: 10,
        order: 'descending',
      });

      // Get gig closed events where talent was paid
      const gigClosedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigClosed`,
        },
        limit: 10,
        order: 'descending',
      });

      const activities: RecentActivity[] = [];

      // Process applications
      for (const event of applicationEvents.data) {
        const eventData = event.parsedJson as any;
        if (eventData.talent === account.address) {
          activities.push({
            type: 'Applied to Gig',
            gigId: eventData.gig_id,
            timestamp: event.timestampMs ? new Date(Number(event.timestampMs)).toLocaleDateString() : 'N/A',
            amount: '0',
          });
        }
      }

      // Process work submissions
      for (const event of workSubmittedEvents.data) {
        const eventData = event.parsedJson as any;
        if (eventData.talent === account.address) {
          activities.push({
            type: 'Work Submitted',
            gigId: eventData.gig_id,
            timestamp: event.timestampMs ? new Date(Number(event.timestampMs)).toLocaleDateString() : 'N/A',
            amount: '0',
          });
        }
      }

      // Process completed gigs
      for (const event of gigClosedEvents.data) {
        const eventData = event.parsedJson as any;
        if (eventData.talent === account.address) {
          activities.push({
            type: 'Gig Completed',
            gigId: eventData.gig_id,
            timestamp: event.timestampMs ? new Date(Number(event.timestampMs)).toLocaleDateString() : 'N/A',
            amount: eventData.reward_amount ? (eventData.reward_amount / 1000000000).toFixed(2) : '0',
          });
        }
      }

      // Sort by timestamp and take top 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-[#1A031F] flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-white">Connect Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 rounded-xl md:pl-10 py-6 min-h-screen bg-[#1A031F]/80 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-purple-400 text-sm">Talent Dashboard</h1>
          <h1 className="text-white font-bold mt-2 md:mt-4 text-xl">
            Welcome back, {talentProfile?.fullName || 'Talent'}!
          </h1>
        </div>
        <div className="flex justify-between md:justify-center items-center gap-3">
          <div className="flex bg-[#2B0A2F]/70 border border-[#641374]/50 text-white rounded-[15px] px-2 py-2 w-full md:w-auto">
            <img src="/Search.svg" alt="" className="w-8 h-8" />
            <input
              type="text"
              className="outline-none bg-transparent text-sm w-full placeholder-gray-400"
              placeholder="Type here..."
            />
          </div>
          <img src="/notifi.svg" className="w-6 h-6" alt="" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="flex md:flex-row flex-col gap-5 mt-8">
            <div className="flex justify-between items-center bg-[#2B0A2F]/70 rounded-2xl p-4 w-full sm:w-[48%] lg:w-[32%] border border-[#641374]/50">
              <div>
                <h1 className="text-gray-300 text-sm">Active Gigs</h1>
                <h1 className="text-white text-xl">{gigStats.activeGigs}</h1>
              </div>
              <div className="bg-purple-500 flex justify-center items-center px-3 py-2 rounded-2xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#2B0A2F]/70 rounded-2xl p-4 w-full sm:w-[48%] lg:w-[32%] border border-[#641374]/50">
              <div>
                <h1 className="text-gray-300 text-sm">Total Gigs</h1>
                <h1 className="text-white text-xl">{gigStats.totalGigs}</h1>
              </div>
              <div className="bg-purple-500 flex justify-center items-center px-3 py-2 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#2B0A2F]/70 rounded-2xl p-4 w-full sm:w-[48%] lg:w-[32%] border border-[#641374]/50">
              <div>
                <h1 className="text-gray-300 text-sm">Profile View</h1>
                <h1 className="text-white text-xl">{profileViews}</h1>
              </div>
              <div className="bg-purple-500 flex justify-center items-center px-3 py-2 rounded-2xl">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Wallet + Credit Score */}
          <div className="flex flex-col md:flex-row w-full gap-6 mt-10">
            {/* Wallet Section */}
            <div className="relative z-10 bg-gradient-to-br from-[#4B1656]/80 via-[#65206E]/70 to-[#2E0936]/70 p-6 md:p-8 rounded-2xl w-full md:w-[70%] text-center shadow-lg backdrop-blur-md border border-purple-700/40">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-3 justify-center items-center">
                    <div>
                      <p className="text-sm text-white/80">Total Balance</p>
                      {isUnlocked ? (
                        <h2 className="text-3xl font-bold">{walletBalance} SUI</h2>
                      ) : (
                        <div className="text-xl">***</div>
                      )}
                    </div>
                    <button
                      onClick={toggleEye}
                      className="cursor-pointer mb-4 text-white transition-all"
                    >
                      {isUnlocked ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xs text-white/60">Wallet ID</p>
                  <p className="text-sm font-mono">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-xs text-white/70 mb-1">Pending</p>
                  <p className="text-xl font-semibold">{pendingBalance} SUI</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-xs text-white/70 mb-1">Completed</p>
                  <p className="text-xl font-semibold">{completedBalance} SUI</p>
                </div>
              </div>
            </div>

            {/* Credit Score Card */}
            <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl p-6 text-center flex flex-col justify-center w-full md:w-[30%]">
              <h3 className="text-gray-300 text-sm mb-3">Credit Score</h3>
              <div className="relative flex items-center justify-center mb-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-8 border-purple-500 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {talentProfile?.credibilityScore || 300}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400">Your current credit standing</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#1A031F]/50 rounded-lg border border-[#641374]/30 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{activity.type}</p>
                        <p className="text-xs text-gray-400">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                    {activity.amount !== '0' && (
                      <div className="text-right">
                        <p className="text-purple-400 font-semibold">{activity.amount} SUI</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#1A031F]/70 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-400">No recent activity</p>
                <p className="text-sm text-gray-500 mt-2">
                  Your gig activities will appear here
                </p>
              </div>  
            )}
         
            {/* ✅ ChatSystem always visible */}
            <div className="mt-6">
              <ChatSystem />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;