import React, { useState } from 'react';
import { Plus, X, Users, Clock, Calendar, CheckCircle, XCircle, Star } from 'lucide-react';

interface Gig {
  id: number;
  name: string;
  description: string;
  deadline: string;
  talentsNeeded: number;
  timeframe: number;
  amount: number;
  createdAt: string;
  applicants: number;
}

interface Talent {
  id: number;
  name: string;
  creditScore: number;
  experience: string;
  avatar: string;
}

export default function CreateGigs() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    talentsNeeded: '',
    timeframe: '',
    amount: ''
  });

  const mockTalents: Talent[] = [
    { id: 1, name: 'John Doe', creditScore: 850, experience: '5 years in web development', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', creditScore: 780, experience: '3 years in UI/UX design', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', creditScore: 920, experience: '7 years in full-stack development', avatar: 'MJ' },
    { id: 4, name: 'Sarah Williams', creditScore: 810, experience: '4 years in mobile development', avatar: 'SW' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateGig = () => {
    if (!formData.name || !formData.description || !formData.deadline || !formData.talentsNeeded || !formData.timeframe || !formData.amount) {
      return;
    }
    
    const newGig: Gig = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      deadline: formData.deadline,
      talentsNeeded: parseInt(formData.talentsNeeded),
      timeframe: parseInt(formData.timeframe),
      amount: parseInt(formData.amount),
      createdAt: new Date().toLocaleDateString(),
      applicants: Math.floor(Math.random() * 10) + 1
    };

    setGigs([newGig, ...gigs]);
    setIsCreateModalOpen(false);
    setSuccessMessage('Gig created successfully! 🎉');
    
    setFormData({
      name: '',
      description: '',
      deadline: '',
      talentsNeeded: '',
      timeframe: '',
      amount: ''
    });

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleApprove = (talentName: string) => {
    setSuccessMessage(`You have selected ${talentName} for this gig! ✅`);
    setIsWaitlistModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleReject = (talentName: string) => {
    setSuccessMessage(`${talentName} has been rejected.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 850) return 'text-green-400';
    if (score >= 750) return 'text-blue-400';
    if (score >= 650) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Gigs</h1>
            <p className="text-gray-400">Post new gigs and manage talent applications</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Gig</span>
          </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div key={gig.id} className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 hover:border-[#622578] transition-colors">
                <h3 className="text-xl font-semibold text-white mb-2">{gig.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{gig.description}</p>
                
                <div className="mb-4 bg-[#622578]/20 border border-[#622578] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Payment Amount</p>
                  <p className="text-2xl font-bold text-[#622578]">₦{gig.amount.toLocaleString()}</p>
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
                    <span>Available for: {gig.timeframe} days</span>
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
        )}
      </div>

      {isCreateModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white">Create New Gig</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
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
                        When you activate this gig, the payment amount will be securely transferred from your wallet to our Treasury account. 
                        This ensures trust and security between you and the talents. In case of any dissatisfaction with the work delivered, 
                        you will be refunded immediately.
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Amount (₦) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₦</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="50000"
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total payment for this gig</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gig Timeframe (days) *</label>
                    <input
                      type="number"
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 12"
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#622578] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGig}
                    className="bg-[#622578] hover:bg-[#7a2e94] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Create Gig
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {isWaitlistModalOpen && selectedGig && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsWaitlistModalOpen(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedGig.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">Talent Waitlist</p>
                </div>
                <button
                  onClick={() => setIsWaitlistModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {mockTalents.map((talent) => (
                  <div key={talent.id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 hover:border-[#622578] transition-colors">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-[#622578] flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {talent.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{talent.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{talent.experience}</p>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className={`text-sm font-semibold ${getCreditScoreColor(talent.creditScore)}`}>
                              Credit Score: {talent.creditScore}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(talent.name)}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(talent.name)}
                          className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}