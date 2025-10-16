import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, CheckCircle, XCircle, Clock, TrendingUp, MessageSquare, Star, Loader, Briefcase } from 'lucide-react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313';
const REGISTRY_ID = '0xa67a472036dfeb14dd622ff9af24fdfec492a09879ea5637091d927159541474';

interface TalentProfile {
  address: string;
  name: string;
  skill: string;
  credibilityScore: number;
}

interface ClientProfile {
  address: string;
  name: string;
  extraInfo: string;
  credibilityScore: number;
}

interface Poll {
  id: string;
  gigId: string;
  gigName: string;
  talentAddress: string;
  talentName: string;
  talentSkill: string;
  talentCredibility: number;
  clientAddress: string;
  clientName: string;
  clientCredibility: number;
  clientReason: string;
  talentReason: string;
  votesForTalent: number;
  votesForClient: number;
  startTime: string;
  endTime: string;
  resolved: boolean;
  winner: string | null;
  hasVoted: boolean;
  isActive: boolean;
  isYourDispute: boolean;
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

export default function Disputes() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [activeTab, setActiveTab] = useState<'your' | 'ongoing'>('your');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [voting, setVoting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [userCredibility, setUserCredibility] = useState<number>(0);
  const [canVote, setCanVote] = useState(false);

  useEffect(() => {
    if (account?.address) {
      fetchUserCredibility();
      fetchPolls();
    }
  }, [account?.address]);

  const fetchUserCredibility = async () => {
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
            const credibility = parseInt(profileFields.credibility_score) || 50;
            setUserCredibility(credibility);
            setCanVote(credibility >= 70);
            return;
          }
        }

        const clientProfiles = fields.client_profiles || [];
        for (const profileData of clientProfiles) {
          const profileFields = profileData.fields || profileData;
          if (profileFields.client_addr === account.address) {
            const credibility = parseInt(profileFields.credibility_score) || 50;
            setUserCredibility(credibility);
            setCanVote(credibility >= 70);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user credibility:', error);
    }
  };

  const fetchPolls = async () => {
    if (!account?.address) return;

    setLoadingPolls(true);
    try {
      const disputeEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::DisputeCreated`,
        },
        limit: 100,
      });

      const registryObject = await suiClient.getObject({
        id: REGISTRY_ID,
        options: { showContent: true },
      });

      const talentProfiles = new Map<string, TalentProfile>();
      const clientProfiles = new Map<string, ClientProfile>();

      if (registryObject.data?.content && 'fields' in registryObject.data.content) {
        const fields = registryObject.data.content.fields as any;

        const talentProfilesList = fields.talent_profiles || [];
        for (const profileData of talentProfilesList) {
          const profileFields = profileData.fields || profileData;
          const talentAddr = profileFields.talent_addr;
          
          let name = "Unknown";
          if (profileFields.full_name) {
            if (profileFields.full_name.fields?.vec) {
              name = String.fromCharCode(...profileFields.full_name.fields.vec);
            } else if (typeof profileFields.full_name === 'string') {
              name = profileFields.full_name;
            }
          }
          
          let skill = "N/A";
          if (profileFields.skill) {
            if (profileFields.skill.fields?.vec) {
              skill = String.fromCharCode(...profileFields.skill.fields.vec);
            } else if (typeof profileFields.skill === 'string') {
              skill = profileFields.skill;
            }
          }

          const credibility = parseInt(profileFields.credibility_score) || 50;

          if (talentAddr) {
            talentProfiles.set(talentAddr, {
              address: talentAddr,
              name,
              skill,
              credibilityScore: credibility,
            });
          }
        }

        const clientProfilesList = fields.client_profiles || [];
        for (const profileData of clientProfilesList) {
          const profileFields = profileData.fields || profileData;
          const clientAddr = profileFields.client_addr;
          
          let name = "Unknown";
          if (profileFields.full_name) {
            if (profileFields.full_name.fields?.vec) {
              name = String.fromCharCode(...profileFields.full_name.fields.vec);
            } else if (typeof profileFields.full_name === 'string') {
              name = profileFields.full_name;
            }
          }

          let extraInfo = "";
          if (profileFields.extra_info) {
            if (profileFields.extra_info.fields?.vec) {
              extraInfo = String.fromCharCode(...profileFields.extra_info.fields.vec);
            } else if (typeof profileFields.extra_info === 'string') {
              extraInfo = profileFields.extra_info;
            }
          }

          const credibility = parseInt(profileFields.credibility_score) || 50;

          if (clientAddr) {
            clientProfiles.set(clientAddr, {
              address: clientAddr,
              name,
              extraInfo,
              credibilityScore: credibility,
            });
          }
        }
      }

      const fetchedPolls: Poll[] = [];

      for (const event of disputeEvents.data) {
        const eventData = event.parsedJson as any;
        
        try {
          const pollObject = await suiClient.getObject({
            id: eventData.poll_id,
            options: { showContent: true },
          });

          if (pollObject.data?.content && 'fields' in pollObject.data.content) {
            const pollFields = pollObject.data.content.fields as any;

            let clientReason = "No reason provided";
            if (pollFields.client_reason) {
              if (pollFields.client_reason.fields?.vec) {
                clientReason = String.fromCharCode(...pollFields.client_reason.fields.vec);
              } else if (typeof pollFields.client_reason === 'string') {
                clientReason = pollFields.client_reason;
              }
            }

            let talentReason = "No reason provided";
            if (pollFields.talent_reason) {
              if (pollFields.talent_reason.fields?.vec) {
                talentReason = String.fromCharCode(...pollFields.talent_reason.fields.vec);
              } else if (typeof pollFields.talent_reason === 'string') {
                talentReason = pollFields.talent_reason;
              }
            }

            const talentAddress = pollFields.talent;
            const clientAddress = pollFields.client;
            const voters = pollFields.voters || [];
            const hasVoted = voters.includes(account.address);
            
            const resolved = pollFields.resolved || false;
            let winner: string | null = null;
            if (pollFields.winner && pollFields.winner.vec && pollFields.winner.vec.length > 0) {
              winner = pollFields.winner.vec[0];
            }

            const startTime = parseInt(pollFields.start_time) || 0;
            const endTime = parseInt(pollFields.end_time) || 0;
            const currentTime = Date.now();
            const isActive = currentTime < endTime && !resolved;
            const isYourDispute = clientAddress === account.address || talentAddress === account.address;

            let gigName = "Unknown Gig";
            try {
              const gigObject = await suiClient.getObject({
                id: eventData.gig_id,
                options: { showContent: true },
              });

              if (gigObject.data?.content && 'fields' in gigObject.data.content) {
                const gigFields = gigObject.data.content.fields as any;
                const metadata = gigFields.metadata?.fields || gigFields.metadata;
                
                if (metadata?.name) {
                  if (metadata.name.fields?.vec) {
                    gigName = String.fromCharCode(...metadata.name.fields.vec);
                  } else if (typeof metadata.name === 'string') {
                    gigName = metadata.name;
                  }
                }
              }
            } catch (error) {
              console.warn('Could not fetch gig name:', error);
            }

            const talentProfile = talentProfiles.get(talentAddress);
            const clientProfile = clientProfiles.get(clientAddress);

            fetchedPolls.push({
              id: eventData.poll_id,
              gigId: eventData.gig_id,
              gigName,
              talentAddress,
              talentName: talentProfile?.name || `${talentAddress.slice(0, 6)}...${talentAddress.slice(-4)}`,
              talentSkill: talentProfile?.skill || "N/A",
              talentCredibility: talentProfile?.credibilityScore || 50,
              clientAddress,
              clientName: clientProfile?.name || `${clientAddress.slice(0, 6)}...${clientAddress.slice(-4)}`,
              clientCredibility: clientProfile?.credibilityScore || 50,
              clientReason,
              talentReason,
              votesForTalent: parseInt(pollFields.votes_for_talent) || 0,
              votesForClient: parseInt(pollFields.votes_for_client) || 0,
              startTime: startTime > 0 ? new Date(startTime).toLocaleDateString() : "N/A",
              endTime: endTime > 0 ? new Date(endTime).toLocaleDateString() : "N/A",
              resolved,
              winner,
              hasVoted,
              isActive,
              isYourDispute,
            });
          }
        } catch (error) {
          console.warn(`Could not fetch poll ${eventData.poll_id}:`, error);
        }
      }

      fetchedPolls.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return 0;
      });

      setPolls(fetchedPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      showNotif('Failed to load disputes');
    } finally {
      setLoadingPolls(false);
    }
  };

  const showNotif = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const handleVote = async (pollId: string, voteForTalent: boolean) => {
    if (!account) return;

    if (!canVote) {
      showNotif('You need a credibility score of at least 70 to vote');
      return;
    }

    setVoting(true);
    const tx = new Transaction();

    try {
      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::vote_in_dispute`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.object(pollId),
          tx.pure.bool(voteForTalent),
          tx.object('0x6'),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Vote error:', err);
            showNotif('Failed to submit vote');
            setVoting(false);
          },
          onSuccess: () => {
            showNotif('Vote submitted successfully! 🗳️');
            setVoting(false);
            setTimeout(() => fetchPolls(), 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setVoting(false);
    }
  };

  const handleResolveDispute = async (pollId: string, gigId: string) => {
    if (!account) return;

    setResolving(true);
    const tx = new Transaction();

    try {
      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::resolve_dispute`,
        arguments: [
          tx.object(pollId),
          tx.object(gigId),
          tx.object('0x6'),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Resolve error:', err);
            showNotif('Failed to resolve dispute');
            setResolving(false);
          },
          onSuccess: () => {
            showNotif('Dispute resolved successfully! ⚖️');
            setResolving(false);
            setTimeout(() => fetchPolls(), 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setResolving(false);
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const yourDisputes = polls.filter(p => p.isYourDispute);
  const ongoingDisputes = polls.filter(p => !p.isYourDispute);
  const displayedPolls = activeTab === 'your' ? yourDisputes : ongoingDisputes;

  if (!account) {
    return (
      <div className="w-full min-h-screen bg-[#1A031F] px-4 md:pl-10 py-6 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-white">Connect Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view disputes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#1A031F]">
      <div className="px-4 md:pl-10 py-6 text-white">
        <Notification message={notificationMsg} show={showNotification} />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-purple-400 text-sm">Dashboard</h1>
            <h1 className="text-white font-bold mt-2 md:mt-4 text-xl">Disputes & Conflicts</h1>
          </div>
          
          <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl px-5 py-3">
            <div className="flex items-center gap-3">
              <Star className={`w-5 h-5 ${getCreditScoreColor(userCredibility)}`} />
              <div>
                <p className="text-xs text-gray-400">Your Credibility</p>
                <p className={`text-lg font-bold ${getCreditScoreColor(userCredibility)}`}>
                  {userCredibility} / 100
                </p>
              </div>
            </div>
            {!canVote && (
              <p className="text-xs text-red-400 mt-2">
                You need ≥70 to vote
              </p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Your Disputes</h3>
              <p className="text-2xl font-bold">{yourDisputes.length}</p>
            </div>
            <AlertTriangle className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Ongoing Disputes</h3>
              <p className="text-2xl font-bold">{ongoingDisputes.filter(p => p.isActive).length}</p>
            </div>
            <Clock className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Your Votes</h3>
              <p className="text-2xl font-bold">{polls.filter(p => p.hasVoted).length}</p>
            </div>
            <Users className="text-purple-400 w-8 h-8" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#2B0A2F]/50 rounded-2xl p-1 w-full max-w-[400px] mb-8">
          <button
            onClick={() => setActiveTab('your')}
            className={`flex-1 text-sm sm:text-base rounded-2xl py-2 transition-all duration-300 ${
              activeTab === 'your'
                ? 'bg-purple-500 font-semibold'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            Your Disputes ({yourDisputes.length})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 text-sm sm:text-base rounded-2xl py-2 transition-all duration-300 ${
              activeTab === 'ongoing'
                ? 'bg-purple-500 font-semibold'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            Ongoing ({ongoingDisputes.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            {activeTab === 'your' ? 'Your Disputes' : 'Ongoing Disputes'}
          </h2>
          
          {loadingPolls ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
                <p className="text-gray-400">Loading disputes...</p>
              </div>
            </div>
          ) : displayedPolls.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {activeTab === 'your' ? 'No disputes found' : 'No ongoing disputes available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPolls.map((poll) => (
                <div
                  key={poll.id}
                  className="bg-[#1A031F]/80 border border-[#2B0A2F] p-6 rounded-2xl hover:bg-[#2B0A2F]/60 transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-xl text-purple-300">{poll.gigName}</h3>
                        {poll.resolved ? (
                          <span className="inline-flex items-center space-x-1 bg-gray-500/20 text-gray-400 text-xs font-semibold px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>Resolved</span>
                          </span>
                        ) : poll.isActive ? (
                          <span className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeRemaining(poll.endTime)}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>Ended</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Poll ends: {poll.endTime}
                      </p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Talent Side */}
                    <div className="bg-[#2B0A2F]/50 border border-[#641374]/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">
                          {poll.talentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-sm">{poll.talentName}</h4>
                          <p className="text-xs text-gray-400">Talent</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Skill</span>
                          <span className="text-white font-medium">{poll.talentSkill}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Credibility</span>
                          <span className={`font-bold ${getCreditScoreColor(poll.talentCredibility)}`}>
                            {poll.talentCredibility}/100
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Votes</span>
                          <span className="text-purple-400 font-bold">{poll.votesForTalent}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-[#1A031F]/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Talent's Argument:</p>
                        <p className="text-xs text-purple-300 leading-relaxed">{poll.talentReason}</p>
                      </div>
                    </div>

                    {/* Client Side */}
                    <div className="bg-[#2B0A2F]/50 border border-[#641374]/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                          {poll.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-sm">{poll.clientName}</h4>
                          <p className="text-xs text-gray-400">Client</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Role</span>
                          <span className="text-white font-medium">Gig Creator</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Credibility</span>
                          <span className={`font-bold ${getCreditScoreColor(poll.clientCredibility)}`}>
                            {poll.clientCredibility}/100
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Votes</span>
                          <span className="text-blue-400 font-bold">{poll.votesForClient}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-[#1A031F]/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Client's Reason:</p>
                        <p className="text-xs text-blue-300 leading-relaxed">{poll.clientReason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex gap-3 items-center">
                    {poll.resolved ? (
                      <div className="w-full bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm mb-2">Poll Resolved</p>
                        {poll.winner && (
                          <p className="text-white font-semibold">
                            Winner: {poll.winner === poll.talentAddress ? poll.talentName : poll.clientName}
                          </p>
                        )}
                      </div>
                    ) : poll.isYourDispute ? (
                      <>
                        {!poll.isActive && (
                          <button
                            onClick={() => handleResolveDispute(poll.id, poll.gigId)}
                            disabled={resolving}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {resolving ? (
                              <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Resolving...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Resolve Dispute</span>
                              </>
                            )}
                          </button>
                        )}
                        {poll.isActive && (
                          <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold">
                              <AlertTriangle className="w-5 h-5" />
                              <span>This is your dispute. You cannot vote on it.</span>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-3">
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Talent Votes</p>
                                <p className="text-lg font-bold text-purple-400">{poll.votesForTalent}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Client Votes</p>
                                <p className="text-lg font-bold text-blue-400">{poll.votesForClient}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : poll.hasVoted ? (
                      <div className="w-full bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          <span>You've already voted on this dispute</span>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Talent Votes</p>
                            <p className="text-lg font-bold text-purple-400">{poll.votesForTalent}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Client Votes</p>
                            <p className="text-lg font-bold text-blue-400">{poll.votesForClient}</p>
                          </div>
                        </div>
                      </div>
                    ) : poll.isActive ? (
                      <div className="flex gap-3 w-full">
                        <button
                          className="flex-1 flex flex-col items-center justify-center gap-2 bg-purple-600/80 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={voting || !canVote}
                          onClick={() => handleVote(poll.id, true)}
                        >
                          <TrendingUp className="w-6 h-6 mb-1" />
                          <span>Vote Talent</span>
                        </button>
                        <button
                          className="flex-1 flex flex-col items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={voting || !canVote}
                          onClick={() => handleVote(poll.id, false)}
                        >
                          <TrendingUp className="w-6 h-6 mb-1" />
                          <span>Vote Client</span>
                        </button>
                        {voting && (
                          <Loader className="w-6 h-6 text-purple-400 animate-spin ml-3" />
                        )}
                      </div>
                    ) : (
                      <div className="w-full bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm mb-2">Poll Ended - Awaiting Resolution</p>
                        <div className="flex items-center justify-center gap-6 mt-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Talent Votes</p>
                            <p className="text-lg font-bold text-purple-400">{poll.votesForTalent}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Client Votes</p>
                            <p className="text-lg font-bold text-blue-400">{poll.votesForClient}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}