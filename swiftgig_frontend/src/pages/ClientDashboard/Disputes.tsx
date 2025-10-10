import React, { useState } from 'react';
import { AlertTriangle, Users, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface Poll {
  id: string;
  gigId: string;
  gigName: string;
  talent: string;
  client: string;
  clientReason: string;
  talentReason: string;
  votesForTalent: number;
  votesForClient: number;
  voters: string[];
  startTime: string;
  endTime: string;
  resolved: boolean;
  winner: string | null;
  currentUserVoted: boolean;
  userVote?: 'talent' | 'client';
}

export default function Disputes() {
  const [activeTab, setActiveTab] = useState<'your' | 'ongoing'>('your');
  const [successMessage, setSuccessMessage] = useState('');

  // Mock data for "Your Disputes"
  const yourDisputes: Poll[] = [
    {
      id: '1',
      gigId: '0xbe98...46b973',
      gigName: 'Mobile App Development',
      talent: '0xa1b2...c3d4',
      client: '0xbe98...46b973 (You)',
      clientReason: 'The mobile app delivered does not meet the specifications outlined in the project requirements. Several key features are missing and the UI is not responsive.',
      talentReason: 'I delivered all the core features as discussed. The client is requesting additional features that were not part of the original scope.',
      votesForTalent: 3,
      votesForClient: 5,
      voters: ['0x123...456', '0x789...abc', '0xdef...012'],
      startTime: '8/27/2025, 9:50:57 PM',
      endTime: '8/29/2025, 9:50:57 PM',
      resolved: false,
      winner: null,
      currentUserVoted: false
    },
    {
      id: '2',
      gigId: '0xab12...cd34',
      gigName: 'Website Redesign',
      talent: '0xef56...gh78',
      client: '0xbe98...46b973 (You)',
      clientReason: 'Work was not completed by the agreed deadline. Multiple revisions were needed.',
      talentReason: 'Client kept changing requirements after project started. Additional time was needed for the new requests.',
      votesForTalent: 7,
      votesForClient: 2,
      voters: ['0x111...222', '0x333...444'],
      startTime: '8/26/2025, 3:20:15 PM',
      endTime: '8/28/2025, 3:20:15 PM',
      resolved: true,
      winner: '0xef56...gh78',
      currentUserVoted: false
    }
  ];

  // Mock data for "Ongoing Disputes"
  const ongoingDisputes: Poll[] = [
    {
      id: '3',
      gigId: '0x774e...5b46f8',
      gigName: 'Logo Design Project',
      talent: '0x9abc...def0',
      client: '0x1234...5678',
      clientReason: 'The logo design does not match the brand guidelines provided. Colors and typography are completely different from what was requested.',
      talentReason: 'I followed the brief exactly as provided. The client approved initial sketches before I proceeded with the final design.',
      votesForTalent: 12,
      votesForClient: 8,
      voters: ['0xaaa...bbb', '0xccc...ddd', '0xeee...fff'],
      startTime: '8/27/2025, 5:30:42 PM',
      endTime: '8/29/2025, 5:30:42 PM',
      resolved: false,
      winner: null,
      currentUserVoted: false
    },
    {
      id: '4',
      gigId: '0x886f...7c59g9',
      gigName: 'Content Writing',
      talent: '0x2468...ace0',
      client: '0x1357...bdf9',
      clientReason: 'Content is plagiarized and does not meet SEO requirements discussed.',
      talentReason: 'All content is 100% original and passed plagiarism checks. SEO keywords were integrated as per the provided list.',
      votesForTalent: 15,
      votesForClient: 5,
      voters: ['0x999...888', '0x777...666'],
      startTime: '10/07/2025, 9:00:00 AM',
      endTime: '10/10/2025, 9:00:00 AM', //
      resolved: false,
      winner: null,
      currentUserVoted: false,   
    }
  ];

  const handleVote = (pollId: string, voteFor: 'talent' | 'client') => {
    setSuccessMessage(`Your vote for ${voteFor === 'talent' ? 'Talent' : 'Client'} has been recorded! 🗳️`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  const isExpired = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const renderPollCard = (poll: Poll, isYourDispute: boolean) => {
    const totalVotes = poll.votesForTalent + poll.votesForClient;
    const talentPercentage = calculatePercentage(poll.votesForTalent, totalVotes);
    const clientPercentage = calculatePercentage(poll.votesForClient, totalVotes);
    const expired = isExpired(poll.endTime);

    return (
      <div key={poll.id} className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-white">Conflict #{poll.id}</h3>
              {poll.resolved && (
                <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                  Resolved
                </span>
              )}
              {expired && !poll.resolved && (
                <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full">
                  Expired
                </span>
              )}
              {!expired && !poll.resolved && (
                <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-1">Gig: {poll.gigName}</p>
            <p className="text-xs text-gray-500">Created by: {poll.client}</p>
          </div>
          <p className="text-xs text-gray-500">{poll.startTime}</p>
        </div>

        {/* Voting Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{poll.votesForTalent}</div>
            <div className="text-xs text-gray-400 uppercase">Talent Votes</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{poll.votesForClient}</div>
            <div className="text-xs text-gray-400 uppercase">Client Votes</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{totalVotes}</div>
            <div className="text-xs text-gray-400 uppercase">Total</div>
          </div>
        </div>

        {/* Reasons */}
        <div className="space-y-4 mb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-semibold text-red-400">Client's Reason</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{poll.clientReason}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">{poll.client}</span>
              <span className="text-sm font-semibold text-red-400">{clientPercentage}%</span>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <h4 className="text-sm font-semibold text-green-400">Talent's Reason</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{poll.talentReason}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">{poll.talent}</span>
              <span className="text-sm font-semibold text-green-400">{talentPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Voters */}
        <div className="mb-4 bg-[#1a1a1a] border border-gray-800 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Voters ({poll.voters.length})</h4>
          <div className="flex flex-wrap gap-2">
            {poll.voters.slice(0, 5).map((voter, idx) => (
              <span key={idx} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                {voter}
              </span>
            ))}
            {poll.voters.length > 5 && (
              <span className="text-xs text-gray-500">+{poll.voters.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Expiry Time */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
          <Clock className="w-4 h-4" />
          <span>Expires: {poll.endTime}</span>
          {expired && <span className="text-red-400 font-semibold">(Expired)</span>}
        </div>

        {/* Winner Display */}
        {poll.resolved && poll.winner && (
          <div className="bg-[#622578]/20 border border-[#622578] rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-[#622578]" />
              <div>
                <p className="text-sm font-semibold text-white">Winner: {poll.winner === poll.talent ? 'Talent' : 'Client'}</p>
                <p className="text-xs text-gray-400">{poll.winner}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vote Buttons */}
        {!isYourDispute && !poll.resolved && !expired && (
          <>
            {poll.currentUserVoted ? (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-blue-400 font-semibold">
                    You voted for {poll.userVote === 'talent' ? 'Talent' : 'Client'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleVote(poll.id, 'talent')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Vote for Talent</span>
                </button>
                <button
                  onClick={() => handleVote(poll.id, 'client')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Vote for Client</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Your Dispute Message */}
        {isYourDispute && !poll.resolved && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-yellow-400 font-semibold">
                This is your dispute. You cannot vote on it.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Disputes & Conflicts</h1>
          <p className="text-gray-400">Vote on treasury fund distribution proposals</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-500 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center space-x-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('your')}
            className={`pb-4 px-2 font-semibold transition-colors relative ${
              activeTab === 'your'
                ? 'text-[#622578]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Your Disputes
            {activeTab === 'your' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#622578]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`pb-4 px-2 font-semibold transition-colors relative ${
              activeTab === 'ongoing'
                ? 'text-[#622578]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ongoing Disputes
            {activeTab === 'ongoing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#622578]"></div>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'your' ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Active Conflicts ({yourDisputes.filter(p => !p.resolved).length})
              </h2>
            </div>
            {yourDisputes.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No disputes</h3>
                <p className="text-gray-400">You don't have any active conflicts</p>
              </div>
            ) : (
              <div className="space-y-6">
                {yourDisputes.map((poll) => renderPollCard(poll, true))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Active Conflicts ({ongoingDisputes.filter(p => !p.resolved).length})
              </h2>
            </div>
            {ongoingDisputes.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No ongoing disputes</h3>
                <p className="text-gray-400">There are no active conflicts on the platform</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ongoingDisputes.map((poll) => renderPollCard(poll, false))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}