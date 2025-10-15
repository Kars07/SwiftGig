import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313'; // Replace with your deployed package ID
const REGISTRY_ID = '0xa67a472036dfeb14dd622ff9af24fdfec492a09879ea5637091d927159541474';

export default function CreateProfile() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);
  const [profileType, setProfileType] = useState<'talent' | 'client' | null>(null);
  
  // Common form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    // Talent specific
    skill: '',
    preferredMode: 'remote',
    // Client specific
    extraInfo: '',
    // Checkboxes
    sendEmails: true,
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const createTalentProfile = () => {
    if (!account) return;
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the Terms of Service');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!fullName || !formData.skill) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    const tx = new Transaction();
    
    // Determine preferred mode enum
    let preferredModeArg;
    if (formData.preferredMode === 'remote') {
      preferredModeArg = tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::is_remote`,
        arguments: [],
      });
    } else if (formData.preferredMode === 'physical') {
      preferredModeArg = tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::is_physical`,
        arguments: [],
      });
    } else {
      preferredModeArg = tx.moveCall({
        target: `${PACKAGE_ID}::swiftgig::is_both`,
        arguments: [],
      });
    }
    
    tx.moveCall({
      target: `${PACKAGE_ID}::swiftgig::create_talent_profile`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(fullName),
        tx.pure.string(formData.skill),
        preferredModeArg,
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          console.error('Error creating talent profile:', err);
          setLoading(false);
          alert('Failed to create talent profile');
        },
        onSuccess: (result) => {
          console.log('Talent profile created successfully:', result);
          setLoading(false);
          alert('Talent profile created successfully!');
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            skill: '',
            preferredMode: 'remote',
            extraInfo: '',
            sendEmails: true,
            agreeToTerms: false
          });
        },
      }
    );
  };

  const createClientProfile = () => {
    if (!account) return;
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the Terms of Service');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!fullName) {
      alert('Please fill in your name');
      return;
    }
    
    setLoading(true);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::swiftgig::create_client_profile`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(fullName),
        tx.pure.string(formData.extraInfo || ''),
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          console.error('Error creating client profile:', err);
          setLoading(false);
          alert('Failed to create client profile');
        },
        onSuccess: (result) => {
          console.log('Client profile created successfully:', result);
          setLoading(false);
          alert('Client profile created successfully!');
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            skill: '',
            preferredMode: 'remote',
            extraInfo: '',
            sendEmails: true,
            agreeToTerms: false
          });
        },
      }
    );
  };

  const handleSubmit = () => {
    if (profileType === 'talent') {
      createTalentProfile();
    } else if (profileType === 'client') {
      createClientProfile();
    }
  };

  const handleSwitchProfile = () => {
    if (profileType === 'talent') {
      window.location.href = '/create-profile?type=client';
    } else {
      window.location.href = '/create-profile?type=talent';
    }
  };

  // If no profile type selected yet, show selection screen
  if (!profileType) {
    return (
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header */}
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-white"><span className='text-[#622578]'>Swift</span>Gig</h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center px-4 pt-16">
          <h2 className="text-3xl font-semibold text-white mb-12">
            Create Profile as Talent or Client
          </h2>

          {/* Selection Cards */}
          <div className="flex gap-5 mb-8">
            {/* Client Card */}
            <button
              onClick={() => setProfileType('client')}
              className="w-60 p-6 rounded-lg border-2 border-gray-600 hover:border-[#622578]/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19.28 21h-6.9a1.6 1.6 0 01-1.73-1.5v-4a1.6 1.6 0 011.73-1.5h6.9A1.59 1.59 0 0121 15.5v4a1.66 1.66 0 01-1.72 1.5z" />
                  <path d="M16.9 12h-2.15a.65.65 0 00-.72.66V14h3.59v-1.34a.65.65 0 00-.72-.66z" />
                  <line x1="10.65" y1="17.29" x2="21" y2="17.29" />
                  <circle cx="10.04" cy="5.73" r="2.73" />
                  <path d="M3 18.45v-.9a7 7 0 017-7h.09a6.73 6.73 0 011.91.27" />
                </svg>
              </div>
              <p className="text-left text-lg font-medium text-white">
                I'm a client, hiring
                <br />
                for a Gig.
              </p>
            </button>

            {/* Talent Card */}
            <button
              onClick={() => setProfileType('talent')}
              className="w-60 p-6 rounded-lg border-2 border-gray-600 hover:border-[#622578]/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.43 21H5.99M3 18.45v-.9a7 7 0 017-7h.09a6.94 6.94 0 013.79 1.12" />
                  <path d="M19.38 21h-11L10 14h11l-1.62 7z" />
                  <path d="M15.69 18a.5.5 0 100-1 .5.5 0 000 1z" />
                  <circle cx="10.04" cy="5.73" r="2.73" />
                </svg>
              </div>
              <p className="text-left text-lg font-medium text-white">
                I'm a Talent,
                <br />
                looking for Gigs.
              </p>
            </button>
          </div>

          {/* Wallet Connection Notice */}
          {!account && (
            <div className="mt-6 text-gray-400">
              <p>Please connect your wallet first</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Talent Profile Form
  if (profileType === 'talent') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black"><span className='text-[#622578]'>Swift</span>Gig</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Want to hire talent?</span>
            <button
              onClick={handleSwitchProfile}
              className="text-[#622578] font-medium hover:underline"
            >
              Create Client Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto px-4 py-12">
          <h2 className="text-3xl font-semibold text-black text-center mb-8">
            Create Talent Profile
          </h2>

          <div>
            {/* Wallet Connection Button */}
            {!account ? (
              <div className="mb-6">
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-[#622578] text-white rounded-full font-medium hover:bg-[#622578]/90 transition-all"
                >
                  Connect Wallet to Continue
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="w-full py-3 px-4 bg-green-100 text-green-800 rounded-full font-medium text-center">
                    ✓ Wallet Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </div>
                </div>
              </>
            )}

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Profile Information</span>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
                />
              </div>
            </div>

            {/* Skill */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Primary Skill
              </label>
              <input
                type="text"
                name="skill"
                value={formData.skill}
                onChange={handleInputChange}
                placeholder="e.g., Web Development, Graphic Design"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
              />
            </div>

            {/* Preferred Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Preferred Work Mode
              </label>
              <select
                name="preferredMode"
                value={formData.preferredMode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
              >
                <option value="remote">Remote</option>
                <option value="physical">Physical</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password (8 or more characters)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="sendEmails"
                  checked={formData.sendEmails}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 accent-[#622578] cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Send me helpful emails to find rewarding work and job leads.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 accent-[#622578] cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Yes, I understand and agree to the{' '}
                  <a href="#" className="text-[#622578] hover:underline">
                    SwiftGig Terms of Service
                  </a>
                  , including the{' '}
                  <a href="#" className="text-[#622578] hover:underline">
                    User Agreement
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#622578] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.agreeToTerms || !account || loading}
              className={`w-full py-3 rounded-full font-medium transition-all ${
                formData.agreeToTerms && account && !loading
                  ? 'bg-[#622578] text-white hover:bg-[#622578]/90 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating Profile...' : 'Create my account'}
            </button>

            {/* Login Link */}
            <p className="text-center mt-6 text-gray-600">
              Already have an account?{' '}
              <a href="#" className="text-[#622578] font-medium hover:underline">
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Client Profile Form
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-black"><span className='text-[#622578]'>Swift</span>Gig</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Looking for work?</span>
          <button
            onClick={handleSwitchProfile}
            className="text-[#622578] font-medium hover:underline"
          >
            Create Talent Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-12">
        <h2 className="text-3xl font-semibold text-black text-center mb-8">
          Create Client Profile
        </h2>

        <div>
          {/* Wallet Connection Button */}
          {!account ? (
            <div className="mb-6">
              <button
                type="button"
                className="w-full py-3 px-4 bg-[#622578] text-white rounded-full font-medium hover:bg-[#622578]/90 transition-all"
              >
                Connect Wallet to Continue
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-full py-3 px-4 bg-green-100 text-green-800 rounded-full font-medium text-center">
                  ✓ Wallet Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </div>
              </div>
            </>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Profile Information</span>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
              />
            </div>
          </div>

          {/* Extra Info */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Company/Additional Info (Optional)
            </label>
            <input
              type="text"
              name="extraInfo"
              value={formData.extraInfo}
              onChange={handleInputChange}
              placeholder="Company name, industry, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password (8 or more characters)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#622578] focus:ring-1 focus:ring-[#622578]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="sendEmails"
                checked={formData.sendEmails}
                onChange={handleInputChange}
                className="mt-1 w-5 h-5 accent-[#622578] cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                Send me helpful emails to find talented professionals.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 w-5 h-5 accent-[#622578] cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                Yes, I understand and agree to the{' '}
                <a href="#" className="text-[#622578] hover:underline">
                  SwiftGig Terms of Service
                </a>
                , including the{' '}
                <a href="#" className="text-[#622578] hover:underline">
                  User Agreement
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#622578] hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.agreeToTerms || !account || loading}
            className={`w-full py-3 rounded-full font-medium transition-all ${
              formData.agreeToTerms && account && !loading
                ? 'bg-[#622578] text-white hover:bg-[#622578]/90 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Creating Profile...' : 'Create my account'}
          </button>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <a href="#" className="text-[#622578] font-medium hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
