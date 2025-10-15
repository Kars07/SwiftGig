import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle, X, Loader, ExternalLink, XCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313';

interface Gig {
  id: string;
  name: string;
  description: string;
  deadline: string;
  amount: string;
  creator: string;
  hasSubmitted: boolean;
  submissionLink?: string;
  submissionTimestamp?: string;
  state: number;
  clientSatisfaction: boolean | null;
  unsatisfactionReason?: string;
}

// Gig state constants
const GIG_ACTIVE = 0;
const GIG_SUBMITTED = 1;
const GIG_REVIEW_SATISFIED = 2;
const GIG_REVIEW_UNSATISFIED = 3;
const GIG_DISPUTED = 4;
const GIG_CLOSED = 5;

export default function Submission() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [contestReason, setContestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contesting, setContesting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (account?.address) {
      fetchAcceptedGigs();
    }
  }, [account?.address]);

  const fetchAcceptedGigs = async () => {
    if (!account?.address) return;

    setLoadingGigs(true);
    try {
      const talentSelectedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::TalentSelected`,
        },
        limit: 200,
      });

      const userAcceptedGigs: Gig[] = [];

      for (const event of talentSelectedEvents.data) {
        const eventData = event.parsedJson as any;

        if (eventData.talent === account.address) {
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

              // Get client satisfaction and unsatisfaction reason
              let clientSatisfaction: boolean | null = null;
              if (fields.client_satisfaction) {
                if (fields.client_satisfaction.vec && fields.client_satisfaction.vec.length > 0) {
                  clientSatisfaction = fields.client_satisfaction.vec[0];
                } else if (typeof fields.client_satisfaction === 'boolean') {
                  clientSatisfaction = fields.client_satisfaction;
                }
              }

              let unsatisfactionReason = '';
              if (fields.unsatisfaction_reason && fields.unsatisfaction_reason.vec && fields.unsatisfaction_reason.vec.length > 0) {
                const reasonData = fields.unsatisfaction_reason.vec[0];
                if (reasonData.fields?.vec) {
                  unsatisfactionReason = String.fromCharCode(...reasonData.fields.vec);
                } else if (typeof reasonData === 'string') {
                  unsatisfactionReason = reasonData;
                }
              }

              // Check if talent has submitted
              const submissions = fields.submissions || [];
              let hasSubmitted = false;
              let submissionLink = '';
              let submissionTimestamp = '';

              for (const submission of submissions) {
                const subFields = submission.fields || submission;
                if (subFields.talent === account.address) {
                  hasSubmitted = true;
                  submissionLink = subFields.submission_link?.fields?.vec
                    ? String.fromCharCode(...subFields.submission_link.fields.vec)
                    : subFields.submission_link || '';
                  submissionTimestamp = subFields.timestamp
                    ? new Date(parseInt(subFields.timestamp)).toLocaleDateString()
                    : '';
                  break;
                }
              }

              // Get reward amount from GigCreated event
              const gigCreatedEvents = await suiClient.queryEvents({
                query: {
                  MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
                },
                limit: 100,
              });

              let rewardAmount = '0';
              for (const createdEvent of gigCreatedEvents.data) {
                const createdData = createdEvent.parsedJson as any;
                if (createdData.gig_id === eventData.gig_id) {
                  rewardAmount = (createdData.reward_amount / 1000000000).toFixed(2);
                  break;
                }
              }

              userAcceptedGigs.push({
                id: eventData.gig_id,
                name: name || "Unnamed Gig",
                description: description || "No description",
                deadline: deadline > 0 ? new Date(deadline).toLocaleDateString() : "N/A",
                amount: rewardAmount,
                creator: fields.creator || "Unknown",
                hasSubmitted,
                submissionLink,
                submissionTimestamp,
                state,
                clientSatisfaction,
                unsatisfactionReason,
              });
            }
          } catch (error) {
            console.warn(`Could not fetch gig ${eventData.gig_id}:`, error);
          }
        }
      }

      setGigs(userAcceptedGigs);
    } catch (error) {
      console.error('Error fetching accepted gigs:', error);
      showNotif('Failed to load your gigs');
    } finally {
      setLoadingGigs(false);
    }
  };

  const showNotif = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSubmitClick = (gig: Gig) => {
    setSelectedGig(gig);
    setSubmissionLink('');
    setIsModalOpen(true);
  };

  const handleContestClick = (gig: Gig) => {
    setSelectedGig(gig);
    setContestReason('');
    setIsContestModalOpen(true);
  };

  const handleSubmitWork = async () => {
    if (!account || !selectedGig) return;

    if (!submissionLink.trim()) {
      showNotif('Please provide a submission link');
      return;
    }

    setSubmitting(true);
    const tx = new Transaction();

    try {
      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::submit_work`,
        arguments: [
          tx.object(selectedGig.id),
          tx.pure.string(submissionLink),
          tx.object('0x6'), // Clock object
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Submit error:', err);
            showNotif('Failed to submit work. Try again');
            setSubmitting(false);
          },
          onSuccess: () => {
            showNotif('Work submitted successfully! 🎉');
            setIsModalOpen(false);
            setSubmitting(false);
            setSubmissionLink('');

            setTimeout(() => {
              fetchAcceptedGigs();
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setSubmitting(false);
    }
  };

  const handleContestDecision = async () => {
    if (!account || !selectedGig) return;

    if (!contestReason.trim()) {
      showNotif('Please provide a reason for contesting');
      return;
    }

    setContesting(true);
    const tx = new Transaction();

    try {
      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::contest_decision`,
        arguments: [
          tx.object(selectedGig.id),
          tx.pure.string(contestReason),
          tx.object('0x6'), // Clock object
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Contest error:', err);
            showNotif('Failed to contest decision. Try again');
            setContesting(false);
          },
          onSuccess: () => {
            showNotif('Dispute created successfully! Community will vote 🗳️');
            setIsContestModalOpen(false);
            setContesting(false);
            setContestReason('');

            setTimeout(() => {
              fetchAcceptedGigs();
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setContesting(false);
    }
  };

  const handleAcceptRejection = async (gigId: string) => {
    if (!account) return;

    setProcessing(true);
    const tx = new Transaction();

    try {
      tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::refund_client`,
        arguments: [
          tx.object(gigId),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onError: (err) => {
            console.error('Refund client error:', err);
            showNotif('Failed to process refund. Try again');
            setProcessing(false);
          },
          onSuccess: () => {
            showNotif('Client refunded successfully. Gig closed.');
            setProcessing(false);

            setTimeout(() => {
              fetchAcceptedGigs();
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      showNotif('Transaction failed');
      setProcessing(false);
    }
  };

  const getStatusBadge = (gig: Gig) => {
    if (gig.state === GIG_DISPUTED) {
      return (
        <span className="flex items-center space-x-1 bg-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full">
          <MessageSquare className="w-3 h-3" />
          <span>In Dispute</span>
        </span>
      );
    }
    
    if (gig.hasSubmitted) {
      if (gig.state === GIG_REVIEW_SATISFIED) {
        return (
          <span className="flex items-center space-x-1 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      } else if (gig.state === GIG_REVIEW_UNSATISFIED) {
        return (
          <span className="flex items-center space-x-1 bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      } else if (gig.state === GIG_CLOSED) {
        return (
          <span className="flex items-center space-x-1 bg-gray-500/20 text-gray-400 text-xs font-semibold px-3 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Closed</span>
          </span>
        );
      } else {
        return (
          <span className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      }
    }
    return (
      <span className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
        <Upload className="w-3 h-3" />
        <span>Pending Submission</span>
      </span>
    );
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400">Please connect your wallet to view submission tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A031F] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Submit Work</h1>
          <p className="text-gray-400">Submit your completed work for gigs you've been accepted to</p>
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
          <div className="bg-[#2B0A2F]/70 border border-[#641374]/50 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-[#2B0A2F]/70 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No accepted gigs yet</h3>
            <p className="text-gray-400">Once you're accepted to a gig, you can submit your work here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{gig.name}</h3>
                    {getStatusBadge(gig)}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{gig.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3">
                    <span className="text-xs text-gray-400">Reward</span>
                    <span className="text-lg font-bold text-[#622578]">{gig.amount} SUI</span>
                  </div>

                  <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3">
                    <span className="text-xs text-gray-400">Deadline</span>
                    <span className="text-sm font-semibold text-white">{gig.deadline}</span>
                  </div>

                  {gig.hasSubmitted && gig.submissionTimestamp && (
                    <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3">
                      <span className="text-xs text-gray-400">Submitted On</span>
                      <span className="text-sm font-semibold text-white">{gig.submissionTimestamp}</span>
                    </div>
                  )}
                </div>

                {/* Rejection Notice */}
                {gig.state === GIG_REVIEW_UNSATISFIED && gig.unsatisfactionReason && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-red-400 font-semibold text-sm mb-1">Rejection Reason</h4>
                        <p className="text-red-300 text-xs leading-relaxed">{gig.unsatisfactionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {gig.hasSubmitted ? (
                  <div className="space-y-3">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Submission Link</p>
                          <p className="text-sm text-white break-all">{gig.submissionLink}</p>
                        </div>
                        {gig.submissionLink && (
                          <a
                            href={gig.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-[#622578] hover:text-[#7a2e94] transition-colors"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action buttons for rejected work */}
                    {gig.state === GIG_REVIEW_UNSATISFIED && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleContestClick(gig)}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span>Contest Decision</span>
                        </button>
                        <button
                          onClick={() => handleAcceptRejection(gig.id)}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          {processing ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span>Accept & Close</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubmitClick(gig)}
                    className="w-full flex items-center justify-center space-x-2 bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Submit Work</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Work Modal */}
      {isModalOpen && selectedGig && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !submitting && setIsModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedGig.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">Submit your completed work</p>
                </div>
                <button
                  onClick={() => !submitting && setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
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
                      <h4 className="text-blue-400 font-semibold text-sm mb-1">Submission Guidelines</h4>
                      <p className="text-blue-300 text-xs leading-relaxed">
                        Provide a link to your completed work (Google Drive, GitHub, Figma, etc.). 
                        Make sure the link is accessible to the client for review.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Submission Link *
                  </label>
                  <input
                    type="url"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ensure the link is publicly accessible or shared with the client
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Payment Amount</span>
                    <span className="text-xl font-bold text-[#622578]">{selectedGig.amount} SUI</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Will be released upon client approval
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitWork}
                    disabled={submitting || !submissionLink.trim()}
                    className="flex-1 bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Submit Work</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contest Decision Modal */}
      {isContestModalOpen && selectedGig && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !contesting && setIsContestModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Contest Rejection</h2>
                  <p className="text-gray-400 text-sm mt-1">Create a dispute for community voting</p>
                </div>
                <button
                  onClick={() => !contesting && setIsContestModalOpen(false)}
                  disabled={contesting}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-orange-400 font-semibold text-sm mb-1">Community Dispute</h4>
                      <p className="text-orange-300 text-xs leading-relaxed">
                        By contesting this decision, a poll will be created where community members with high credibility (≥70) 
                        can vote. The voting period lasts 7 days. If you win, you'll receive the payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-white mb-3">Gig Details</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Gig</span>
                      <span className="text-sm text-white font-medium">{selectedGig.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Amount</span>
                      <span className="text-lg font-bold text-[#622578]">{selectedGig.amount} SUI</span>
                    </div>
                  </div>
                </div>

                {selectedGig.unsatisfactionReason && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-red-400 mb-2">Client's Rejection Reason</h5>
                    <p className="text-red-300 text-xs leading-relaxed">{selectedGig.unsatisfactionReason}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Response / Contest Reason *
                  </label>
                  <textarea
                    value={contestReason}
                    onChange={(e) => setContestReason(e.target.value)}
                    rows={4}
                    placeholder="Explain why you disagree with the client's decision..."
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors resize-none"
                    disabled={contesting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be clear and professional. The community will review both sides.
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => setIsContestModalOpen(false)}
                    disabled={contesting}
                    className="flex-1 px-6 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContestDecision}
                    disabled={contesting || !contestReason.trim()}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {contesting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Creating Dispute...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Create Dispute</span>
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