import React, { useState, useEffect } from 'react';
import { Briefcase, BarChart3, User, Wallet, Bell, Settings, LogOut, Briefcase as BriefcaseIcon, Loader } from 'lucide-react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import ChatSystem from '../../components/ClientChatSystem';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313';
const REGISTRY_ID = '0xa67a472036dfeb14dd622ff9af24fdfec492a09879ea5637091d927159541474';

interface ClientProfile {
  fullName: string;
  credibilityScore: number;
}

interface GigStats {
  activeGigs: number;
  completedGigs: number;
  totalGigs: number;
}

export default function DashboardHome() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [gigStats, setGigStats] = useState<GigStats>({ activeGigs: 0, completedGigs: 0, totalGigs: 0 });
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (account?.address) {
      fetchClientData();
      fetchWalletBalance();
      fetchGigStats();
      fetchRecentActivity();
    }
  }, [account?.address]);

  const fetchClientData = async () => {
    if (!account?.address) return;

    try {
      const registryObject = await suiClient.getObject({
        id: REGISTRY_ID,
        options: { showContent: true },
      });

      if (registryObject.data?.content && 'fields' in registryObject.data.content) {
        const fields = registryObject.data.content.fields as any;
        const clientProfiles = fields.client_profiles || [];

        for (const profileData of clientProfiles) {
          const profileFields = profileData.fields || profileData;
          
          if (profileFields.client_addr === account.address) {
            let fullName = "Client";
            if (profileFields.full_name) {
              if (profileFields.full_name.fields?.vec) {
                fullName = String.fromCharCode(...profileFields.full_name.fields.vec);
              } else if (typeof profileFields.full_name === 'string') {
                fullName = profileFields.full_name;
              }
            }

            const credibilityScore = parseInt(profileFields.credibility_score) || 50;

            setClientProfile({
              fullName,
              credibilityScore,
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
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
      const gigCreatedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
        },
        limit: 100,
      });

      let activeCount = 0;
      let completedCount = 0;

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
              const state = fields.state;

              if (state === 5) { // GIG_CLOSED
                completedCount++;
              } else {
                activeCount++;
              }
            }
          } catch (error) {
            console.warn(`Could not fetch gig ${eventData.gig_id}:`, error);
          }
        }
      }

      setGigStats({
        activeGigs: activeCount,
        completedGigs: completedCount,
        totalGigs: activeCount + completedCount,
      });
    } catch (error) {
      console.error('Error fetching gig stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!account?.address) return;

    try {
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
        },
        limit: 5,
        order: 'descending',
      });

      const activities = events.data
        .filter((event: any) => event.parsedJson?.creator === account.address)
        .map((event: any) => ({
          type: 'Gig Created',
          gigId: event.parsedJson?.gig_id,
          timestamp: event.timestampMs ? new Date(event.timestampMs).toLocaleDateString() : 'N/A',
          amount: event.parsedJson?.reward_amount ? (event.parsedJson.reward_amount / 1000000000).toFixed(2) : '0',
        }));

      setRecentActivity(activities);
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
    <div className="min-h-screen bg-[#1A031F] relative">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#2B0A2F] to-[#641374] p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {clientProfile?.fullName || 'Client'}
            </h1>
            <p className="text-gray-200">Your personal gig management dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm hover:bg-purple-700 transition-colors cursor-pointer"
            >
              {clientProfile?.fullName?.charAt(0).toUpperCase() || 'C'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-2xl p-6 hover:border-purple-500 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">This month</span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Active Gigs</h3>
                <p className="text-3xl font-bold text-white">{gigStats.activeGigs}</p>
              </div>
              
              <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-2xl p-6 hover:border-purple-500 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">All time</span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total Gigs</h3>
                <p className="text-3xl font-bold text-white">{gigStats.totalGigs}</p>
              </div>
              
              <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-2xl p-6 hover:border-purple-500 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">Completed</span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Completed Gigs</h3>
                <p className="text-3xl font-bold text-white">{gigStats.completedGigs}</p>
              </div>
            </div>

            {/* Wallet + Credit Score Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Wallet Card (2/3 width) */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#2B0A2F] to-[#641374] rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Total Balance</p>
                        <h2 className="text-3xl font-bold">{walletBalance} SUI</h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">Wallet ID</p>
                      <p className="text-sm font-mono">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs text-white/70 mb-1">Active Gigs</p>
                      <p className="text-xl font-semibold">{gigStats.activeGigs}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs text-white/70 mb-1">Completed</p>
                      <p className="text-xl font-semibold">{gigStats.completedGigs}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Score Card (1/3 width) */}
              <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-2xl p-6 text-center flex flex-col justify-center">
                <h3 className="text-gray-300 text-sm mb-3">Credibility Score</h3>
                <div className="relative flex items-center justify-center mb-3">
                  <div className="w-24 h-24 rounded-full border-8 border-purple-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {clientProfile?.credibilityScore || 50}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Your current credit standing</p>
              </div>
            </div>
               
          <ChatSystem />
            {/* Recent Activity */}
            <div className="mt-8 bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
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
                      <div className="text-right">
                        <p className="text-purple-400 font-semibold">{activity.amount} SUI</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#1A031F]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-2">Your gig activities will appear here</p>
                </div>
                
              )}
            </div>
          </>
        )}
      </div>

      {/* Profile Dropdown Modal */}
      {isProfileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsProfileMenuOpen(false)}
          ></div>

          <div className="fixed top-20 right-8 w-64 bg-[#2B0A2F] rounded-xl shadow-2xl z-50 border border-[#641374]/50">
            <div className="p-4 border-b border-[#641374]/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                    {clientProfile?.fullName?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-[#2B0A2F]">
                    <BriefcaseIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{clientProfile?.fullName || 'Client'}</p>
                  <p className="text-gray-400 text-xs">Client Account</p>
                </div>
              </div>
              <div className="bg-purple-600 rounded-lg px-3 py-2 text-center">
                <p className="text-white text-xs font-semibold">Status: Active</p>
              </div>
            </div>

            <div className="py-2">
              <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1A031F]/50 flex items-center space-x-3 transition-colors">
                <User className="w-4 h-4" />
                <span>Your client profile</span>
              </button>
              <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1A031F]/50 flex items-center space-x-3 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1A031F]/50 flex items-center space-x-3 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Get desktop app</span>
              </button>
            </div>

            <div className="border-t border-[#641374]/50 p-2">
              <button className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-[#1A031F]/50 flex items-center space-x-3 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}