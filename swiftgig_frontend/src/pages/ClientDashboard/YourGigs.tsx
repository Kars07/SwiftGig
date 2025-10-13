import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Users, Clock, DollarSign, CheckCircle, XCircle, AlertCircle, X, Loader } from 'lucide-react';
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
  status: 'active' | 'completed';
  applicants: number;
  waitlist: string[];
  acceptedTalents: string[];
  creator: string;
}

export default function YourGigs() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // States
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [selectingTalents, setSelectingTalents] = useState(false);

  // Modal States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSelectTalentsModalOpen, setIsSelectTalentsModalOpen] = useState(false);
  
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedTalents, setSelectedTalents] = useState<Set<string>>(new Set());
  const [rejectReason, setRejectReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user's gigs on mount
  useEffect(() => {
    if (account?.address) {
      fetchUserGigs();
    }
  }, [account?.address]);

  const fetchUserGigs = async () => {
    if (!account?.address) return;

    setLoadingGigs(true);
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

        // Only include gigs created by current user
        if (eventData.creator === account.address) {
          try {
            const gigObject = await suiClient.getObject({
              id: eventData.gig_id,
              options: { showContent: true },
            });

            if (gigObject.data?.content && 'fields' in gigObject.data.content) {
              const fields = gigObject.data.content.fields as any;
              const metadata = fields.metadata?.fields || fields.metadata;

              // Extract strings properly
              const name = metadata?.name?.fields?.vec
                ? String.fromCharCode(...metadata.name.fields.vec)
                : metadata?.name || "Unnamed Gig";

              const description = metadata?.description?.fields?.vec
                ? String.fromCharCode(...metadata.description.fields.vec)
                : metadata?.description || "No description";

              const deadline = parseInt(metadata?.deadline) || 0;
              const timeframeMs = parseInt(metadata?.gig_active_timeframe) || 0;

              userGigs.push({
                id: eventData.gig_id,
                name: name || "Unnamed Gig",
                description: description || "No description",
                deadline: deadline > 0 ? new Date(deadline).toLocaleDateString() : "N/A",
                talentsNeeded: parseInt(metadata?.talents_needed) || 0,
                timeframe: calculateTimeframe(timeframeMs),
                amount: eventData.reward_amount ? (eventData.reward_amount / 1000000000).toFixed(2) : "0",
                status: fields.acceptedTalents?.length >= parseInt(metadata?.talents_needed) ? 'completed' : 'active',
                applicants: fields.waitlist?.length || 0,
                waitlist: fields.waitlist || [],
                acceptedTalents: fields.accepted_talents || [],
                creator: eventData.creator,
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
      showNotif('Failed to load your gigs');
    } finally {
      setLoadingGigs(false);
    }
  };

  const calculateTimeframe = (ms: number): string => {
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const showNotif = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSelectTalentsClick = (gig: Gig) => {
    setSelectedGig(gig);
    setSelectedTalents(new Set(gig.acceptedTalents));
    setIsSelectTalentsModalOpen(true);
  };

  const handleTalentToggle = (talentAddress: string) => {
    const newSelected = new Set(selectedTalents);
    if (newSelected.has(talentAddress)) {
      newSelected.delete(talentAddress);
    } else {
      newSelected.add(talentAddress);
    }
    setSelectedTalents(newSelected);
  };

  const confirmSelectTalents = async () => {
    if (!account || !selectedGig) return;

    if (selectedTalents.size === 0) {
      showNotif('Please select at least one talent');
      return;
    }

    setSelectingTalents(true);
    const tx = new Transaction();

    try {
      const talentAddressesArray = Array.from(selectedTalents);

      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::select_talents`,
        arguments: [
          tx.object(selectedGig.id),
          tx.pure.vector('address', talentAddressesArray),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Error selecting talents:', err);
            showNotif('Failed to select talents');
            setSelectingTalents(false);
          },
          onSuccess: () => {
            showNotif('Talents selected successfully! ✅');
            setIsSelectTalentsModalOpen(false);
            setSelectingTalents(false);

            setTimeout(() => {
              fetchUserGigs();
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setSelectingTalents(false);
    }
  };

  const handleApproveClick = (gig: Gig) => {
    setSelectedGig(gig);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (gig: Gig) => {
    setSelectedGig(gig);
    setIsRejectModalOpen(true);
  };

  const confirmApproval = () => {
    if (selectedGig) {
      showNotif(`Payment of ${selectedGig.amount} SUI has been sent! 🎉`);
      setGigs(gigs.filter(g => g.id !== selectedGig.id));
      setIsApproveModalOpen(false);
    }
  };

  const confirmRejection = () => {
    if (!rejectReason.trim()) {
      return;
    }
    if (selectedGig) {
      showNotif('Your rejection has been submitted. A conflict poll may be raised within 2 days.');
      setIsRejectModalOpen(false);
      setRejectReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          <span>Active</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
        <CheckCircle className="w-3 h-3" />
        <span>Completed</span>
      </span>
    );
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] p-8 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400">Please connect your wallet to view your gigs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Gigs</h1>
          <p className="text-gray-400">Track and manage your active and completed gigs</p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-500 font-medium">{successMessage}</p>
          </div>
        )}

        {loadingGigs ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
              <p className="text-gray-400">Loading your gigs...</p>
            </div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No gigs created yet</h3>
            <p className="text-gray-400">Your gigs will appear here once you create them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gigs.map((gig) => (
              <div key={gig.id} className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{gig.name}</h3>
                    {getStatusBadge(gig.status)}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{gig.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#622578]" />
                      <p className="text-xs text-gray-400">Amount</p>
                    </div>
                    <p className="text-lg font-bold text-[#622578]">{gig.amount} SUI</p>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">Deadline</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{gig.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{gig.acceptedTalents.length}/{gig.talentsNeeded} talents</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4" />
                  <span>{gig.timeframe}</span>
                </div>

                <div className="mb-4 bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Applications</p>
                  <p className="text-lg font-bold text-white">{gig.applicants} applicants</p>
                </div>

                {gig.status === 'active' && (
                  <button
                    onClick={() => handleSelectTalentsClick(gig)}
                    className="w-full flex items-center justify-center space-x-2 bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span>Select Talents ({gig.acceptedTalents.length}/{gig.talentsNeeded})</span>
                  </button>
                )}

                {gig.status === 'completed' && (
                  <div className="flex items-center space-x-3 gap-3">
                    <button
                      onClick={() => handleApproveClick(gig)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectClick(gig)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Select Talents Modal */}
      {isSelectTalentsModalOpen && selectedGig && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => !selectingTalents && setIsSelectTalentsModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedGig.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">Select talents from {selectedGig.applicants} applicants</p>
                </div>
                <button
                  onClick={() => !selectingTalents && setIsSelectTalentsModalOpen(false)}
                  disabled={selectingTalents}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    Select <span className="font-semibold">{selectedGig.talentsNeeded} talents</span> from the waitlist below. Currently selected: <span className="font-semibold">{selectedTalents.size}</span>
                  </p>
                </div>

                {selectedGig.waitlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No applicants yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {selectedGig.waitlist.map((talentAddress, index) => {
                      const isSelected = selectedTalents.has(talentAddress);
                      const isAlreadyAccepted = selectedGig.acceptedTalents.includes(talentAddress);

                      return (
                        <div
                          key={index}
                          onClick={() => !isAlreadyAccepted && handleTalentToggle(talentAddress)}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#622578]/20 border-[#622578]'
                              : isAlreadyAccepted
                              ? 'bg-green-500/10 border-green-500 opacity-60 cursor-not-allowed'
                              : 'bg-[#1a1a1a] border-gray-800 hover:border-[#622578]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                disabled={isAlreadyAccepted}
                                className="w-5 h-5 rounded cursor-pointer accent-[#622578]"
                              />
                              <div>
                                <p className="font-semibold text-white">
                                  {talentAddress.slice(0, 6)}...{talentAddress.slice(-4)}
                                </p>
                                <p className="text-xs text-gray-400">Wallet Address</p>
                              </div>
                            </div>
                            {isAlreadyAccepted && (
                              <span className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded">
                                <CheckCircle className="w-3 h-3" />
                                <span>Already Selected</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => setIsSelectTalentsModalOpen(false)}
                    disabled={selectingTalents}
                    className="flex-1 px-6 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSelectTalents}
                    disabled={selectingTalents || selectedTalents.size !== selectedGig.talentsNeeded}
                    className="flex-1 bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {selectingTalents ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Selecting...</span>
                      </>
                    ) : (
                      <span>Confirm Selection ({selectedTalents.size}/{selectedGig.talentsNeeded})</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && selectedGig && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsApproveModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Approve Work</h2>
                <button onClick={() => setIsApproveModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-green-400 font-semibold text-sm mb-2">Confirm Approval</h4>
                      <p className="text-green-300 text-sm leading-relaxed">
                        By approving this work, you confirm that you are satisfied with the results.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Payment Amount</span>
                    <span className="text-2xl font-bold text-[#622578]">{selectedGig.amount} SUI</span>
                  </div>
                  <p className="text-xs text-gray-500">This amount will be released to the talents</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsApproveModalOpen(false)}
                    className="flex-1 px-6 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproval}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedGig && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsRejectModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Reject Work</h2>
                <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-400 font-semibold text-sm mb-2">Important Notice</h4>
                      <p className="text-yellow-300 text-xs leading-relaxed">
                        A conflict poll may be raised. If no poll is activated within 2 days, your payment will be refunded.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Rejection *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    placeholder="Please provide a detailed reason..."
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsRejectModalOpen(false)}
                    className="flex-1 px-6 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejection}
                    disabled={!rejectReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}