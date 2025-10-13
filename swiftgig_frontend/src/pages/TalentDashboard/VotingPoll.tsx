'use client';
import React, { useState } from 'react';
import { PlusCircle, ThumbsUp, ThumbsDown, X, CheckCircle } from 'lucide-react';
import Notification from '../../components/Notifications'; // adjust path if needed

interface Poll {
  id: number;
  title: string;
  description: string;
  client: string;
  talent: string;
  votesForClient: number;
  votesForTalent: number;
}

const VotingPoll: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: 1,
      title: 'Logo Design Dispute',
      description:
        'Client claims the final logo does not match agreed specs, while the designer insists all requirements were met.',
      client: 'SwiftGig Client',
      talent: 'John Doe',
      votesForClient: 12,
      votesForTalent: 8,
    },
    {
      id: 2,
      title: 'Delivery Time Conflict',
      description:
        'Client says the project was late; the talent insists deadline was extended.',
      client: 'Creative Studio',
      talent: 'Jane Smith',
      votesForClient: 5,
      votesForTalent: 14,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    client: '',
    talent: '',
  });
  const [showNotification, setShowNotification] = useState(false);

  // Track which polls the user has voted on (id + choice)
  const [userVotes, setUserVotes] = useState<Record<number, 'client' | 'talent' | null>>({});

  const handleCreatePoll = () => {
    if (!newPoll.title || !newPoll.description || !newPoll.client || !newPoll.talent) return;

    const newEntry: Poll = {
      id: polls.length + 1,
      ...newPoll,
      votesForClient: 0,
      votesForTalent: 0,
    };

    setPolls([...polls, newEntry]);
    setIsModalOpen(false);
    setNewPoll({ title: '', description: '', client: '', talent: '' });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleVote = (id: number, voteType: 'client' | 'talent') => {
    if (userVotes[id]) return; // already voted on this poll

    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === id
          ? {
              ...poll,
              votesForClient: poll.votesForClient + (voteType === 'client' ? 1 : 0),
              votesForTalent: poll.votesForTalent + (voteType === 'talent' ? 1 : 0),
            }
          : poll
      )
    );

    // mark user's choice
    setUserVotes((prev) => ({ ...prev, [id]: voteType }));
  };

  return (
    <div className="px-4 md:pl-10 py-6 text-white rounded-xl bg-[#1A031F]/80 min-h-screen relative">
      {/* Notification */}
      <Notification message="Poll created successfully!" show={showNotification} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-purple-400 text-sm">Talent Dashboard</h1>
          <h1 className="text-white font-bold mt-2 text-xl">Voting Polls</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#641374] hover:bg-[#7b2390] transition px-4 py-2 rounded-xl text-sm shadow-lg shadow-purple-500/30"
        >
          <PlusCircle className="w-5 h-5" />
          Create Poll
        </button>
      </div>

      {/* Ongoing Polls */}
      <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Ongoing Conflicts</h2>
        {polls.length === 0 ? (
          <p className="text-gray-400 text-sm">No polls available yet.</p>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => {
              const userVote = userVotes[poll.id];
              return (
                <div
                  key={poll.id}
                  className="bg-[#1A031F]/80 border border-[#2B0A2F] p-4 rounded-2xl hover:bg-[#2B0A2F]/60 transition"
                >
                  <h3 className="font-semibold text-lg mb-1 text-purple-300">{poll.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{poll.description}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    <span className="font-semibold text-purple-400">Client:</span> {poll.client}{" "}
                    | <span className="font-semibold text-purple-400">Talent:</span> {poll.talent}
                  </p>

                  <div className="flex gap-3 items-center">
                    <button
                      disabled={!!userVote}
                      onClick={() => handleVote(poll.id, 'client')}
                      className={`flex-1 transition px-4 py-2 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 
                        ${
                          userVote === 'client'
                            ? 'bg-purple-800 text-white border border-purple-500'
                            : 'bg-purple-600/80 hover:bg-purple-700'
                        } ${userVote ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {userVote === 'client' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <ThumbsDown className="w-4 h-4" />
                      )}
                      For Client ({poll.votesForClient})
                    </button>
                    <button
                      disabled={!!userVote}
                      onClick={() => handleVote(poll.id, 'talent')}
                      className={`flex-1 transition px-4 py-2 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 
                        ${
                          userVote === 'talent'
                            ? 'bg-[#7b2390] border border-purple-500'
                            : 'bg-[#641374] hover:bg-[#7b2390]'
                        } ${userVote ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {userVote === 'talent' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <ThumbsUp className="w-4 h-4" />
                      )}
                      For Talent ({poll.votesForTalent})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Creating Poll */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="fixed z-50 inset-0 flex items-center justify-center px-4">
            <div
              className="bg-[#1A031F] border border-[#2B0A2F] p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto text-white shadow-2xl
                scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-purple-900/20
                scrollbar-thumb-rounded-lg scrollbar-track-rounded-lg hover:scrollbar-thumb-purple-400/70 transition-all"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-300">Create a New Poll</h2>
                <X
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#641374] hover:text-[#7b2390] cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Poll Title"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                  className="w-full bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl px-3 py-2 text-sm outline-none text-gray-200 placeholder-gray-400"
                />
                <textarea
                  placeholder="Poll Description"
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                  className="w-full bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl px-3 py-2 text-sm outline-none text-gray-200 placeholder-gray-400 min-h-[100px]"
                />
                <input
                  type="text"
                  placeholder="Client Name"
                  value={newPoll.client}
                  onChange={(e) => setNewPoll({ ...newPoll, client: e.target.value })}
                  className="w-full bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl px-3 py-2 text-sm outline-none text-gray-200 placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Talent Name"
                  value={newPoll.talent}
                  onChange={(e) => setNewPoll({ ...newPoll, talent: e.target.value })}
                  className="w-full bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl px-3 py-2 text-sm outline-none text-gray-200 placeholder-gray-400"
                />

                <button
                  onClick={handleCreatePoll}
                  className="w-full bg-[#641374] hover:bg-[#7b2390] transition px-4 py-2 rounded-xl text-sm shadow-lg shadow-purple-500/30"
                >
                  Submit Poll
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VotingPoll;