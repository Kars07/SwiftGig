import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle, X, Loader, ExternalLink } from 'lucide-react';
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
}

export default function Submission() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const getStatusBadge = (gig: Gig) => {
    if (gig.hasSubmitted) {
      if (gig.state === 2) {
        return (
          <span className="flex items-center space-x-1 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      } else if (gig.state === 3) {
        return (
          <span className="flex items-center space-x-1 bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" />
            <span>Rejected</span>
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
          <div className="bg-[#2B0A2F]/70 border border-[#641374]/50  rounded-xl p-12 text-center">
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

                {gig.hasSubmitted ? (
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
    </div>
  );
}