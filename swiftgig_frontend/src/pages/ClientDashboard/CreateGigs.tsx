import React, { useState, useEffect } from 'react';
import { Plus, X, Users, Clock, Calendar, CheckCircle, XCircle, Star } from 'lucide-react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313'; // Replace with your deployed package ID
const REGISTRY_ID = '0xa67a472036dfeb14dd622ff9af24fdfec492a09879ea5637091d927159541474';

interface Gig {
  id: string;
  name: string;
  description: string;
  deadline: string;
  talentsNeeded: number;
  timeframe: number;
  amount: number;
  createdAt: string;
  applicants: number;
  waitlist: string[];
  acceptedTalents: string[];
}

interface Talent {
  address: string;
  name: string;
  creditScore: number;
  experience: string;
  avatar: string;
}

export default function CreateGigs() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingGigs, setFetchingGigs] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    talentsNeeded: '',
    timeframe: '',
    amount: ''
  });

  // Fetch user's gigs on mount
  useEffect(() => {
    if (account?.address) {
      fetchUserGigs();
    }
  }, [account?.address]);

  const fetchUserGigs = async () => {
    if (!account?.address) return;
    
    setFetchingGigs(true);
    try {
      // Query for GigCreated events where the creator is the current user
      const gigCreatedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::swiftgig::GigCreated`,
        },
        limit: 100,
      });

      const userGigs: Gig[] = [];

      for (const event of gigCreatedEvents.data) {
        const eventData = event.parsedJson as any;
        
        // Only include gigs created by the current user
        if (eventData.creator === account.address) {
          try {
            const gigObject = await suiClient.getObject({
              id: eventData.gig_id,
              options: { showContent: true },
            });

            if (gigObject.data?.content && 'fields' in gigObject.data.content) {
              const fields = gigObject.data.content.fields as any;
              const metadata = fields.metadata;
              
              userGigs.push({
                id: eventData.gig_id,
                name: metadata.name,
                description: metadata.description,
                deadline: new Date(parseInt(metadata.deadline)).toLocaleDateString(),
                talentsNeeded: parseInt(metadata.talents_needed),
                timeframe: parseInt(metadata.gig_active_timeframe),
                amount: eventData.reward_amount / 1000000000, // Convert from MIST to SUI
                createdAt: new Date(event.timestampMs ?? 0).toLocaleDateString(),
                applicants: fields.waitlist?.length || 0,
                waitlist: fields.waitlist || [],
                acceptedTalents: fields.accepted_talents || []
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
    } finally {
      setFetchingGigs(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateGig = () => {
    if (!account) {
      alert('Please connect your wallet');
      return;
    }

    if (!formData.name || !formData.description || !formData.deadline || !formData.talentsNeeded || !formData.timeframe || !formData.amount) {
      alert('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    const tx = new Transaction();
    
    // Convert deadline to timestamp
    const deadlineDate = new Date(formData.deadline);
    const deadlineMs = deadlineDate.getTime();
    
    // Convert timeframe (days) to milliseconds
    const timeframeMs = parseInt(formData.timeframe) * 24 * 60 * 60 * 1000;
    
    // Convert amount to MIST (1 SUI = 1,000,000,000 MIST)
    const amountInMist = parseFloat(formData.amount) * 1000000000;
    
    // Split the payment coin
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);
    
    tx.moveCall({
      target: `${PACKAGE_ID}::swiftgig::create_gig`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(formData.name),
        tx.pure.string(formData.description),
        tx.pure.u64(deadlineMs),
        tx.pure.u64(parseInt(formData.talentsNeeded)),
        tx.pure.u64(timeframeMs),
        paymentCoin,
        tx.object('0x6'), // Clock object
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          console.error('Error creating gig:', err);
          setLoading(false);
          alert('Failed to create gig. Please try again.');
        },
        onSuccess: (result) => {
          console.log('Gig created successfully:', result);
          setLoading(false);
          setIsCreateModalOpen(false);
          setSuccessMessage('Gig created successfully! 🎉');
          
          // Reset form
          setFormData({
            name: '',
            description: '',
            deadline: '',
            talentsNeeded: '',
            timeframe: '',
            amount: ''
          });

          // Refresh gigs list
          setTimeout(() => {
            fetchUserGigs();
          }, 2000);

          setTimeout(() => setSuccessMessage(''), 3000);
        },
      }
    );
  };

  const handleSelectTalents = async (gigId: string, selectedTalentAddresses: string[]) => {
    if (!account) return;
    
    setLoading(true);
    const tx = new Transaction();
    
    // Create a vector of selected talent addresses
    const talentAddresses = selectedTalentAddresses.map(addr => tx.pure.address(addr));
    
    tx.moveCall({
      target: `${PACKAGE_ID}::swiftgig::select_talents`,
      arguments: [
        tx.object(gigId),
        tx.makeMoveVec({ elements: talentAddresses }),
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          console.error('Error selecting talents:', err);
          setLoading(false);
          alert('Failed to select talents');
        },
        onSuccess: (result) => {
          console.log('Talents selected successfully:', result);
          setLoading(false);
          setSuccessMessage('Talents selected successfully! ✅');
          setIsWaitlistModalOpen(false);
          
          // Refresh gigs
          setTimeout(() => {
            fetchUserGigs();
          }, 2000);

          setTimeout(() => setSuccessMessage(''), 3000);
        },
      }
    );
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 850) return 'text-green-400';
    if (score >= 750) return 'text-blue-400';
    if (score >= 650) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
          <p className="text-gray-400">Please connect your wallet to create and manage gigs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Gigs</h1>
              <p className="text-gray-400">Post new gigs and manage talent applications</p>
            </div>
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search gigs..."
                className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg pl-4 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#622578] transition-colors"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Gigs Created</p>
                <p className="text-4xl font-bold text-white">{gigs.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#622578]/20 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#622578]" />
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Gigs</p>
                <p className="text-4xl font-bold text-white">{gigs.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#622578]/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-[#622578]" />
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Credit Score</p>
                <p className="text-4xl font-bold text-white">300</p>
              </div>
              <div className="w-12 h-12 bg-[#622578]/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#622578]" />
              </div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-500 font-medium">{successMessage}</p>
          </div>
        )}

        {fetchingGigs ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#622578] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your gigs...</p>
            </div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No gigs created yet</h3>
            <p className="text-gray-400 mb-6">Create your first gig to start receiving applications from talented professionals</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Gig</span>
            </button>
          </div>
        ) : (
          <div className="mt-10">
            {/* Section Header for Gigs Created */}
            <div className="flex items-center mb-6">
              <div className="bg-[#622578]/20 border border-[#622578]/40 text-[#622578] font-semibold px-5 py-2 rounded-full text-sm uppercase tracking-wide">
                Gigs Created
              </div>
              <div className="flex-1 border-t border-gray-800 ml-4"></div>
            </div>

            {/* Gigs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div key={gig.id} className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors">
                <h3 className="text-xl font-semibold text-white mb-2">{gig.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{gig.description}</p>
                
                <div className="mb-4 bg-[#622578]/20 border border-[#622578] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Payment Amount</p>
                  <p className="text-2xl font-bold text-[#622578]">{gig.amount.toFixed(2)} SUI</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {gig.deadline}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Talents needed: {gig.talentsNeeded}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Accepted: {gig.acceptedTalents.length}/{gig.talentsNeeded}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-sm text-gray-400">{gig.applicants} applicants</span>
                  <button
                    onClick={() => {
                      setSelectedGig(gig);
                      setIsWaitlistModalOpen(true);
                    }}
                    className="bg-[#622578] hover:bg-[#7a2e94] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    View Waitlist
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>

      {/* Create Gig Modal */}
      {isCreateModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => !loading && setIsCreateModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white">Create New Gig</h2>
                <button
                  onClick={() => !loading && setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
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
                      <h4 className="text-blue-400 font-semibold text-sm mb-1">Payment & Trust Policy</h4>
                      <p className="text-blue-300 text-xs leading-relaxed">
                        When you create this gig, the payment amount will be securely transferred from your wallet to the Gig Treasury. 
                        This ensures trust and security between you and the talents. In case of any dissatisfaction with the work delivered, 
                        you can request a refund through the review process.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gig Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Mobile App Development"
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the gig requirements and expectations..."
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors resize-none"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Amount (SUI) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g., 10.5"
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Total payment for this gig in SUI tokens</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Talents Needed *</label>
                    <input
                      type="number"
                      name="talentsNeeded"
                      value={formData.talentsNeeded}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 3"
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Application Timeframe (days) *</label>
                    <input
                      type="number"
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 7"
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Days talents can apply</p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGig}
                    disabled={loading}
                    className="bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Gig'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Waitlist Modal */}
      {isWaitlistModalOpen && selectedGig && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => !loading && setIsWaitlistModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedGig.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">Talent Waitlist ({selectedGig.waitlist.length} applicants)</p>
                </div>
                <button
                  onClick={() => !loading && setIsWaitlistModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedGig.waitlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No applications yet</p>
                  </div>
                ) : (
                  selectedGig.waitlist.map((talentAddress, index) => {
                    const isSelected = selectedGig.acceptedTalents.includes(talentAddress);
                    
                    return (
                      <div key={index} className={`bg-[#1a1a1a] border rounded-lg p-4 transition-colors ${
                        isSelected ? 'border-green-500' : 'border-gray-800 hover:border-[#622578]'
                      }`}>
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full bg-[#622578] flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {talentAddress.slice(2, 4).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {talentAddress.slice(0, 6)}...{talentAddress.slice(-4)}
                              </h3>
                              <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
                              {isSelected && (
                                <span className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Selected</span>
                                </span>
                              )}
                            </div>
                          </div>
                          {!isSelected && selectedGig.acceptedTalents.length < selectedGig.talentsNeeded && (
                            <button
                              onClick={() => handleSelectTalents(selectedGig.id, [...selectedGig.acceptedTalents, talentAddress])}
                              disabled={loading}
                              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{loading ? 'Selecting...' : 'Select'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                
                {selectedGig.acceptedTalents.length >= selectedGig.talentsNeeded && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-green-400 font-medium">
                        All talent slots filled ({selectedGig.acceptedTalents.length}/{selectedGig.talentsNeeded})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}