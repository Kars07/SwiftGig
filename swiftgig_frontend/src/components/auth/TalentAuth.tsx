import { useState } from 'react';

const TalentAuth = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal details & Banking
    dateOfBirth: '',
    country: 'Nigeria',
    streetAddress: '',
    city: '',
    stateProvince: '',
    zipCode: '',
    phone: '',
    profilePhoto: null as File | null,
    accountNumber: '',
    accountName: '',
    bankName: '',
    // Step 2: Skills
    skills: [] as string[],
    customSkill: '',
    // Step 3: Identification
    idType: '',
    idDocument: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (formData.skills.length < 15 && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, profilePhoto: e.target.files![0] }));
    }
  };

  const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, idDocument: e.target.files![0] }));
    }
  };

  const handleAccountNumberChange = (value: string) => {
    // Only allow numbers and max 10 digits
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length <= 10) {
      handleInputChange('accountNumber', numbersOnly);
    }
  };

  const suggestedSkills = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Transcription',
    'Digital Marketing',
    'Video Editing',
    'Data Entry',
    'Virtual Assistant'
  ];

  const nigerianBanks = [
    'Access Bank',
    'GTBank',
    'Zenith Bank',
    'First Bank',
    'UBA',
    'Fidelity Bank',
    'Union Bank',
    'Stanbic IBTC',
    'Sterling Bank',
    'Wema Bank',
    'Polaris Bank',
    'Ecobank',
    'FCMB',
    'Keystone Bank',
    'Unity Bank'
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-[#622578]">Swift</span>Gig
        </h1>
        <div className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">{currentStep}/{totalSteps}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[#622578] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Personal Details & Banking */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-semibold text-white mb-3">
                A few last details, then you can check and publish your profile.
              </h2>
              <p className="text-gray-400 mb-8">
                A professional photo helps you build trust with your clients. To keep things safe and simple, they'll pay you through us - which is why we need your personal information.
              </p>

              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center relative overflow-hidden mb-3">
                    {formData.profilePhoto ? (
                      <img 
                        src={URL.createObjectURL(formData.profilePhoto)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#622578] rounded-full flex items-center justify-center cursor-pointer">
                      <span className="text-white text-xl">+</span>
                    </div>
                  </div>
                  <label className="px-6 py-2 border-2 border-[#622578] text-[#622578] rounded-full cursor-pointer hover:bg-[#622578]/10 transition-all">
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  {/* Date of Birth */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full md:w-1/2 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                    />
                    <p className="text-red-400 text-sm mt-1">
                      You must be at least 16 years old to join SwiftGig.
                    </p>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full md:w-1/2 px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                    </select>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Street address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter street address"
                        value={formData.streetAddress}
                        onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">State/Province</label>
                      <input
                        type="text"
                        placeholder="Enter state/province"
                        value={formData.stateProvince}
                        onChange={(e) => handleInputChange('stateProvince', e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">ZIP/Postal code</label>
                      <input
                        type="text"
                        placeholder="Enter ZIP/Postal code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select className="px-3 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]">
                        <option>🇳🇬 +234</option>
                        <option>🇬🇭 +233</option>
                        <option>🇰🇪 +254</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Enter number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      />
                    </div>
                  </div>

                  {/* Banking Information Section */}
                  <div className="pt-6 border-t border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Banking Information</h3>
                    
                    {/* Account Number */}
                    <div className="mb-4">
                      <label className="block text-white font-medium mb-2">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter account number (10 digits)"
                        value={formData.accountNumber}
                        onChange={(e) => handleAccountNumberChange(e.target.value)}
                        maxLength={10}
                        className="w-full md:w-2/3 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      />
                      <p className="text-gray-500 text-sm mt-1">
                        {formData.accountNumber.length}/10 digits
                      </p>
                    </div>

                    {/* Account Name */}
                    <div className="mb-4">
                      <label className="block text-white font-medium mb-2">
                        Account Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter account name"
                        value={formData.accountName}
                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                        className="w-full md:w-2/3 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="w-full md:w-2/3 px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                      >
                        <option value="">Select your bank</option>
                        {nigerianBanks.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-3xl font-semibold text-white mb-3">
                Nearly there! What work are you here to do?
              </h2>
              <p className="text-gray-400 mb-2">
                Your skills show clients what you can offer, and help us choose which jobs to recommend to you. Add or remove the ones we've suggested, or start typing to pick more. It's up to you.
              </p>
              <a href="#" className="text-[#622578] hover:underline text-sm mb-6 inline-block">
                Why choosing carefully matters
              </a>

              <div className="mt-8">
                <label className="block text-white font-medium mb-3">Your skills</label>
                <div className="flex gap-2 w-full md:w-2/3">
                  <input
                    type="text"
                    placeholder="Enter skills here"
                    value={formData.customSkill}
                    onChange={(e) => handleInputChange('customSkill', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && formData.customSkill.trim()) {
                        e.preventDefault();
                        handleSkillAdd(formData.customSkill.trim());
                        handleInputChange('customSkill', '');
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                  />
                  <button
                    onClick={() => {
                      if (formData.customSkill.trim()) {
                        handleSkillAdd(formData.customSkill.trim());
                        handleInputChange('customSkill', '');
                      }
                    }}
                    disabled={!formData.customSkill.trim() || formData.skills.length >= 15}
                    className="px-6 py-3 bg-[#622578] text-white rounded-lg font-medium hover:bg-[#622578]/90 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">Max 15 skills</p>

                {/* Selected Skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-[#622578] text-white rounded-full flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillRemove(skill)}
                          className="hover:text-gray-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8">
                  <label className="block text-white font-medium mb-3">Suggested skills</label>
                  <div className="flex flex-wrap gap-3">
                    {suggestedSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleSkillAdd(skill)}
                        disabled={formData.skills.includes(skill) || formData.skills.length >= 15}
                        className={`px-4 py-2 rounded-full border-2 transition-all ${
                          formData.skills.includes(skill)
                            ? 'border-[#622578] bg-[#622578]/20 text-gray-500 cursor-not-allowed'
                            : 'border-gray-600 text-white hover:border-[#622578]'
                        }`}
                      >
                        <span className="mr-2">+</span>
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tip Card */}
                <div className="mt-8 bg-[#252525] border border-gray-700 rounded-lg p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white mb-2">
                      "SwiftGig's algorithm will recommend specific job posts to you based on your skills. So choose them carefully to get the best match!"
                    </p>
                    <p className="text-gray-400 text-sm">SwiftGig Pro Tip</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Identification Upload */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-3xl font-semibold text-white mb-3">
                Upload your identification
              </h2>
              <p className="text-gray-400 mb-8">
                To ensure the safety and security of our platform, we require all talents to verify their identity. Please upload a clear copy of one of the accepted identification documents.
              </p>

              <div className="space-y-6">
                {/* ID Type Selection */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Select ID Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.idType}
                    onChange={(e) => handleInputChange('idType', e.target.value)}
                    className="w-full md:w-1/2 px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#622578]"
                  >
                    <option value="">Choose identification type</option>
                    <option value="International Passport">International Passport</option>
                    <option value="National ID Card (NIN)">National ID Card (NIN)</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="Voter's Card">Voter's Card</option>
                    <option value="Student ID Card">Student ID Card</option>
                  </select>
                </div>

                {/* Upload Section */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Upload Document <span className="text-red-500">*</span>
                  </label>
                  
                  {!formData.idDocument ? (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-[#622578] transition-all">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-white mb-2">
                          Drag and drop your document here, or
                        </p>
                        <label className="px-6 py-2 bg-[#622578] text-white rounded-full cursor-pointer hover:bg-[#622578]/90 transition-all">
                          Browse Files
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleIdDocumentUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-gray-500 text-sm mt-4">
                          Accepted formats: JPG, PNG, PDF (Max size: 5MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-[#622578] bg-[#622578]/5 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#622578] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">{formData.idDocument.name}</p>
                            <p className="text-gray-400 text-sm">
                              {(formData.idDocument.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, idDocument: null }))}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Important Notes */}
                <div className="bg-[#252525] border border-gray-700 rounded-lg p-6">
                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-[#622578] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-white font-medium mb-2">Important Notes:</h4>
                      <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                        <li>Make sure your document is clear and all details are visible</li>
                        <li>The document should not be expired</li>
                        <li>Your photo on the ID should be clearly visible</li>
                        <li>We accept only government-issued IDs (except Student ID)</li>
                        <li>Your information will be kept secure and confidential</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-8 py-3 rounded-md font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-white border-2 border-gray-600 hover:border-[#622578]'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-[#622578] text-white rounded-md font-medium hover:bg-[#622578]/90 transition-all"
            >
              {currentStep === totalSteps ? 'Review your profile' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentAuth;