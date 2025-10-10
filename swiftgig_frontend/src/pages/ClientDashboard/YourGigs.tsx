import React, { useState } from 'react';
import { Briefcase, Calendar, Users, Clock, DollarSign, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface Gig {
  id: number;
  name: string;
  description: string;
  deadline: string;
  talentsNeeded: number;
  timeframe: number;
  amount: number;
  status: 'ongoing' | 'completed';
  talent?: string;
}

export default function YourGigs() {
  const [gigs, setGigs] = useState<Gig[]>([
    {
      id: 1,
      name: 'Mobile App Development',
      description: 'Need a cross-platform mobile app with React Native',
      deadline: '2025-11-15',
      talentsNeeded: 2,
      timeframe: 30,
      amount: 150000,
      status: 'ongoing',
      talent: 'John Doe'
    },
    {
      id: 2,
      name: 'Website Redesign',
      description: 'Complete website redesign with modern UI/UX',
      deadline: '2025-10-25',
      talentsNeeded: 1,
      timeframe: 15,
      amount: 80000,
      status: 'completed',
      talent: 'Jane Smith'
    },
    {
      id: 3,
      name: 'Logo Design',
      description: 'Create a professional logo for tech startup',
      deadline: '2025-10-20',
      talentsNeeded: 1,
      timeframe: 7,
      amount: 25000,
      status: 'completed',
      talent: 'Mike Johnson'
    }
  ]);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      setSuccessMessage(`Payment of ₦${selectedGig.amount.toLocaleString()} has been sent to ${selectedGig.talent}! 🎉`);
      setGigs(gigs.filter(g => g.id !== selectedGig.id));
      setIsApproveModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const confirmRejection = () => {
    if (!rejectReason.trim()) {
      return;
    }
    if (selectedGig) {
      setSuccessMessage('Your rejection has been submitted. A conflict poll may be raised within 2 days. If no poll is activated, your payment will be refunded.');
      setIsRejectModalOpen(false);
      setRejectReason('');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ongoing') {
      return (
        <span className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          <span>Ongoing</span>
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

        {gigs.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No active gigs</h3>
            <p className="text-gray-400">Your gigs will appear here once talents start working on them</p>
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

                <p className="text-gray-400 text-sm mb-4">{gig.description}</p>

                {gig.talent && (
                  <div className="mb-4 bg-[#622578]/10 border border-[#622578]/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Assigned Talent</p>
                    <p className="text-white font-semibold">{gig.talent}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#622578]" />
                      <p className="text-xs text-gray-400">Amount</p>
                    </div>
                    <p className="text-lg font-bold text-[#622578]">₦{gig.amount.toLocaleString()}</p>
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
                  <span>{gig.talentsNeeded} talent(s) needed</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4" />
                  <span>{gig.timeframe} days</span>
                </div>

                {gig.status === 'completed' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
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

                {gig.status === 'ongoing' && (
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center space-x-2 text-sm text-blue-400">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>Work in progress...</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {isApproveModalOpen && selectedGig && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsApproveModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Approve Work</h2>
                <button
                  onClick={() => setIsApproveModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
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
                        By approving this work, you confirm that you have reviewed the deliverables from <span className="font-semibold">{selectedGig.talent}</span> and are satisfied with the results.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Payment Amount</span>
                    <span className="text-2xl font-bold text-[#622578]">₦{selectedGig.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    This amount will be immediately released to the talent's wallet
                  </p>
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
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsRejectModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Reject Work</h2>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
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
                        By rejecting this work, a conflict poll may be raised by <span className="font-semibold">{selectedGig.talent}</span> to ensure fairness. 
                        If no poll is activated within 2 days, your payment of <span className="font-semibold">₦{selectedGig.amount.toLocaleString()}</span> will be refunded to your wallet.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    placeholder="Please provide a detailed reason for rejecting this work..."
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This reason will be shared with the talent and may be reviewed in case of a conflict poll
                  </p>
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
                    Submit Rejection
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