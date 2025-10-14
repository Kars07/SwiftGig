import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, Eye, X, Loader, AlertTriangle } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState('');

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

              // Get client satisfaction status
              const clientSatisfaction = fields.client_satisfaction?.vec?.[0] ?? null;

              // Parse submissions
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

              // Only include gigs that have submissions and are in submitted state OR approved state
              if (submissions.length > 0 && (state === 1 || state === 2)) {
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
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
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
              ? 'Work approved! Payment will be distributed 🎉'
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
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
        <div className="text-center">
          <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400">Please connect your wallet to review submissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Review Submissions</h1>
          <p className="text-gray-400">Review and approve or reject work submitted by talents</p>
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
              <p className="text-gray-400">Loading submissions...</p>
            </div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">{gig.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{gig.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Amount:</span>
                      <span className="font-bold text-[#622578]">{gig.amount} SUI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Deadline:</span>
                      <span className="font-semibold text-white">{gig.deadline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Submissions:</span>
                      <span className="font-semibold text-white">{gig.submissions.length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                      Submitted Work ({gig.submissions.length})
                    </h4>
                    {gig.state === 2 && gig.clientSatisfaction === true && (
                      <button
                        onClick={() => handleDistributeRewards(gig.id)}
                        disabled={distributingRewards}
                        className="flex items-center space-x-2 bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {gig.submissions.map((submission, index) => (
                    <div
                      key={index}
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-full bg-[#622578] flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {submission.talent.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-base font-semibold text-white mb-1">
                              {submission.talent.slice(0, 6)}...{submission.talent.slice(-4)}
                            </h5>
                            <p className="text-xs text-gray-400">Talent Address</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted on {submission.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 mb-2">Submission Link</p>
                            <p className="text-sm text-white break-all mb-3">
                              {submission.submissionLink}
                            </p>
                            <a
                              href={submission.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-[#622578] hover:text-[#7a2e94] text-sm font-medium transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View Submission</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {gig.state === 1 ? (
                          <>
                            <button
                              onClick={() => handleReviewClick(gig, submission, 'approve')}
                              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReviewClick(gig, submission, 'reject')}
                              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                            >
                              <XCircle className="w-5 h-5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : gig.state === 2 ? (
                          <div className="w-full bg-green-500/10 border border-green-500 rounded-lg p-3 flex items-center justify-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-500 font-semibold">Work Approved - Ready to Distribute</span>
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
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
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
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-green-400 font-semibold text-sm mb-2">Confirm Approval</h4>
                        <p className="text-green-300 text-sm leading-relaxed">
                          By approving this work, you confirm that you are satisfied with the results. 
                          The payment will be distributed to the talents from the gig treasury.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-400 font-semibold text-sm mb-2">Important Notice</h4>
                        <p className="text-yellow-300 text-xs leading-relaxed">
                          The talent can contest your decision within 2 days. If contested, a community poll 
                          will determine the outcome. If not contested, your payment will be refunded.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
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
                      <span className="text-lg font-bold text-[#622578]">{selectedGig.amount} SUI</span>
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
                      placeholder="Please provide a detailed reason for rejecting this work..."
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors resize-none"
                      disabled={reviewing}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Be specific about what didn't meet your expectations
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={reviewing}
                    className="flex-1 px-6 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmission}
                    disabled={reviewing || (reviewType === 'reject' && !rejectionReason.trim())}
                    className={`flex-1 ${
                      reviewType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
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