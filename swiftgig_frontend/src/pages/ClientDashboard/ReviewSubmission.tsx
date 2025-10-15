import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, Eye, X, Loader, AlertTriangle, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313';

interface Submission {
  talent: string;
  submissionLink: string;
  timestamp: string;
}

interface Gig {
  id: string;
  name: string;
  description: string;
  deadline: string;
  amount: string;
  submissions: Submission[];
  state: number;
  acceptedTalents: string[];
  clientSatisfaction: boolean | null;
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

export default function ReviewSubmission() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewType, setReviewType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [distributingRewards, setDistributingRewards] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Gig state constants
  const GIG_ACTIVE = 0;
  const GIG_SUBMITTED = 1;
  const GIG_REVIEW_SATISFIED = 2;
  const GIG_REVIEW_UNSATISFIED = 3;
  const GIG_DISPUTED = 4;
  const GIG_CLOSED = 5;

  useEffect(() => {
    if (account?.address) {
      fetchGigsWithSubmissions();
    }
  }, [account?.address]);

  const fetchGigsWithSubmissions = async () => {
    if (!account?.address) return;

    setLoadingGigs(true);
    try {
      const gigCreatedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
        },
        limit: 100,
      });

      const clientGigs: Gig[] = [];

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
              const state = parseInt(fields.state) || 0;

              let clientSatisfaction: boolean | null = null;
              if (fields.client_satisfaction) {
                if (fields.client_satisfaction.vec && fields.client_satisfaction.vec.length > 0) {
                  clientSatisfaction = fields.client_satisfaction.vec[0];
                } else if (typeof fields.client_satisfaction === 'boolean') {
                  clientSatisfaction = fields.client_satisfaction;
                }
              }

              const rawSubmissions = fields.submissions || [];
              const submissions: Submission[] = [];

              for (const sub of rawSubmissions) {
                const subFields = sub.fields || sub;
                const link = subFields.submission_link?.fields?.vec
                  ? String.fromCharCode(...subFields.submission_link.fields.vec)
                  : subFields.submission_link || '';
                
                submissions.push({
                  talent: subFields.talent || '',
                  submissionLink: link,
                  timestamp: subFields.timestamp
                    ? new Date(parseInt(subFields.timestamp)).toLocaleDateString()
                    : 'N/A',
                });
              }

              if (submissions.length > 0 && (state === GIG_SUBMITTED || state === GIG_REVIEW_SATISFIED)) {
                clientGigs.push({
                  id: eventData.gig_id,
                  name: name || "Unnamed Gig",
                  description: description || "No description",
                  deadline: deadline > 0 ? new Date(deadline).toLocaleDateString() : "N/A",
                  amount: (eventData.reward_amount / 1000000000).toFixed(2),
                  submissions,
                  state,
                  acceptedTalents: fields.accepted_talents || [],
                  clientSatisfaction,
                });
              }
            }
          } catch (error) {
            console.warn(`Could not fetch gig ${eventData.gig_id}:`, error);
          }
        }
      }

      setGigs(clientGigs);
    } catch (error) {
      console.error('Error fetching gigs with submissions:', error);
      showNotif('Failed to load submissions');
    } finally {
      setLoadingGigs(false);
    }
  };

  const showNotif = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const handleReviewClick = (gig: Gig, submission: Submission, type: 'approve' | 'reject') => {
    setSelectedGig(gig);
    setSelectedSubmission(submission);
    setReviewType(type);
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmission = async () => {
    if (!account || !selectedGig || reviewType === null) return;

    if (reviewType === 'reject' && !rejectionReason.trim()) {
      showNotif('Please provide a reason for rejection');
      return;
    }

    setReviewing(true);
    const tx = new Transaction();

    try {
      const satisfied = reviewType === 'approve';
      const reason = reviewType === 'reject' ? rejectionReason : '';

      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::review_submission`,
        arguments: [
          tx.object(selectedGig.id),
          tx.pure.bool(satisfied),
          reason ? tx.pure.option('string', reason) : tx.pure.option('string', null),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Review error:', err);
            showNotif('Failed to submit review. Try again');
            setReviewing(false);
          },
          onSuccess: () => {
            const message = reviewType === 'approve' 
              ? 'Work approved! Click "Distribute Rewards" to send payment 🎉'
              : 'Work rejected. Talent can contest this decision';
            showNotif(message);
            setIsReviewModalOpen(false);
            setReviewing(false);
            setRejectionReason('');

            setTimeout(() => {
              fetchGigsWithSubmissions();
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setReviewing(false);
    }
  };

  const handleDistributeRewards = async (gigId: string) => {
    if (!account) return;

    setDistributingRewards(true);
    const tx = new Transaction();

    try {
      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::distribute_rewards`,
        arguments: [
          tx.object(gigId),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Distribute rewards error:', err);
            showNotif('Failed to distribute rewards. Try again');
            setDistributingRewards(false);
          },
          onSuccess: () => {
            showNotif('Rewards distributed successfully! 💰🎉');
            setDistributingRewards(false);

            setTimeout(() => {
              fetchGigsWithSubmissions();
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setDistributingRewards(false);
    }
  };

  if (!account) {
    return (
      <div className="w-full min-h-screen bg-[#1A031F] px-4 md:pl-10 py-6 flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-white">Connect Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to review submissions</p>
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
            <h1 className="text-white font-bold mt-2 md:mt-4 text-xl">Review Submissions</h1>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Total Submissions</h3>
              <p className="text-2xl font-bold">{gigs.reduce((sum, g) => sum + g.submissions.length, 0)}</p>
            </div>
            <Briefcase className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Pending Review</h3>
              <p className="text-2xl font-bold">{gigs.filter(g => g.state === GIG_SUBMITTED).length}</p>
            </div>
            <Eye className="text-purple-400 w-8 h-8" />
          </div>
          <div className="bg-[#2B0A2F]/70 p-5 rounded-2xl border border-[#641374]/50 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Approved</h3>
              <p className="text-2xl font-bold">{gigs.filter(g => g.state === GIG_REVIEW_SATISFIED).length}</p>
            </div>
            <CheckCircle className="text-purple-400 w-8 h-8" />
          </div>
        </div>

        <Notification message={notificationMsg} show={showNotification} />

        {/* Content Section */}
        {loadingGigs ? (
          <div className="bg-[#2B0A2F]/50 rounded-2xl p-12 flex flex-col justify-center items-center">
            <Loader className="w-8 h-8 text-purple-400 mb-3 animate-spin" />
            <p className="text-gray-400">Loading submissions...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-[#2B0A2F]/50 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#1A031F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No submissions to review</h3>
            <p className="text-gray-400">Submitted work from talents will appear here for your review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {gigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-2xl p-6 hover:border-purple-500 transition-colors"
              >
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-lg font-bold">
                          {gig.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{gig.name}</h3>
                          <p className="text-gray-400 text-sm">{gig.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {gig.state === GIG_REVIEW_SATISFIED && gig.clientSatisfaction === true && (
                      <button
                        onClick={() => handleDistributeRewards(gig.id)}
                        disabled={distributingRewards}
                        className="ml-4 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg whitespace-nowrap"
                      >
                        {distributingRewards ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Distributing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Distribute Rewards</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#1A031F]/50 rounded-lg p-3 border border-[#641374]/30">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Amount</span>
                      </div>
                      <p className="text-sm font-bold text-purple-400">{gig.amount} SUI</p>
                    </div>
                    <div className="bg-[#1A031F]/50 rounded-lg p-3 border border-[#641374]/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Deadline</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{gig.deadline}</p>
                    </div>
                    <div className="bg-[#1A031F]/50 rounded-lg p-3 border border-[#641374]/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Submissions</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{gig.submissions.length}</p>
                    </div>
                    <div className="bg-[#1A031F]/50 rounded-lg p-3 border border-[#641374]/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Status</span>
                      </div>
                      {gig.state === GIG_SUBMITTED && (
                        <p className="text-sm font-semibold text-yellow-400">Pending</p>
                      )}
                      {gig.state === GIG_REVIEW_SATISFIED && (
                        <p className="text-sm font-semibold text-green-400">Approved</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
                    <span>Submitted Work ({gig.submissions.length})</span>
                  </h4>

                  {gig.submissions.map((submission, index) => (
                    <div
                      key={index}
                      className="bg-[#1A031F]/50 border border-[#641374]/30 rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">
                            {submission.talent.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-base font-bold text-white mb-1">
                              {submission.talent.slice(0, 6)}...{submission.talent.slice(-4)}
                            </h5>
                            <p className="text-xs text-gray-400">Talent Address</p>
                            <p className="text-xs text-gray-500 mt-1">
                              📅 Submitted on {submission.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 bg-[#2B0A2F]/30 border border-[#641374]/20 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-2">🔗 Submission Link</p>
                        <p className="text-sm text-white break-all mb-3 font-mono">
                          {submission.submissionLink}
                        </p>
                        <a
                          href={submission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Submission</span>
                        </a>
                      </div>

                      <div className="flex items-center space-x-3">
                        {gig.state === GIG_SUBMITTED ? (
                          <>
                            <button
                              onClick={() => handleReviewClick(gig, submission, 'approve')}
                              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-lg"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReviewClick(gig, submission, 'reject')}
                              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-lg"
                            >
                              <XCircle className="w-5 h-5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : gig.state === GIG_REVIEW_SATISFIED ? (
                          <div className="w-full bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center justify-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-semibold">Work Approved - Ready to Distribute</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedGig && selectedSubmission && reviewType && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !reviewing && setIsReviewModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A031F] border border-[#2B0A2F] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">
                  {reviewType === 'approve' ? 'Approve Work' : 'Reject Work'}
                </h2>
                <button
                  onClick={() => !reviewing && setIsReviewModalOpen(false)}
                  disabled={reviewing}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {reviewType === 'approve' ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-green-400 font-semibold text-sm mb-2">Confirm Approval</h4>
                        <p className="text-green-300 text-sm leading-relaxed">
                          By approving this work, you confirm that you are satisfied with the results. 
                          After approval, you'll need to click "Distribute Rewards" to send the payment.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-400 font-semibold text-sm mb-2">Important Notice</h4>
                        <p className="text-yellow-300 text-xs leading-relaxed">
                          The talent can contest your decision. If contested, a community poll 
                          will determine the outcome. If not contested, your payment will be refunded.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#2B0A2F]/50 border border-[#641374]/30 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-white mb-3">Submission Details</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Gig</span>
                      <span className="text-sm text-white font-medium">{selectedGig.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Talent</span>
                      <span className="text-sm text-white font-mono">
                        {selectedSubmission.talent.slice(0, 6)}...{selectedSubmission.talent.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Amount</span>
                      <span className="text-lg font-bold text-purple-400">{selectedGig.amount} SUI</span>
                    </div>
                  </div>
                </div>

                {reviewType === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason for Rejection *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      placeholder="Please provide a detailed reason..."
                      className="w-full bg-[#2B0A2F]/50 border border-[#641374]/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      disabled={reviewing}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Be specific about what didn't meet your expectations
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={reviewing}
                    className="flex-1 px-6 py-3 text-gray-400 hover:text-white border border-[#641374]/50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmission}
                    disabled={reviewing || (reviewType === 'reject' && !rejectionReason.trim())}
                    className={`flex-1 ${
                      reviewType === 'approve'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    } text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
                  >
                    {reviewing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {reviewType === 'approve' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm & Approve</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Confirm Rejection</span>
                          </>
                        )}
                      </>
                    )}
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