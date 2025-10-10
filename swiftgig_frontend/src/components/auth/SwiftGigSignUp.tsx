import { useState } from 'react';

export default function SwiftGigSignUp() {
  const [selectedRole, setSelectedRole] = useState<'client' | 'talent' | null>(null);

  const handleRoleSelect = (role: 'client' | 'talent') => {
    setSelectedRole(role);
  };

  const handleRegister = () => {
    if (selectedRole === 'client') {
      window.location.href = '/register/client';
    } else if (selectedRole === 'talent') {
      window.location.href = '/register/talent';
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-white"><span className='text-[#622578]'>Swift</span>Gig</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 pt-16">
        <h2 className="text-3xl font-semibold text-white mb-12">
          Join as a client or Talent
        </h2>

        {/* Selection Cards */}
        <div className="flex gap-5 mb-8">
          {/* Client Card */}
          <button
            onClick={() => handleRoleSelect('client')}
            className={`w-60 p-6 rounded-lg border-2 transition-all cursor-pointer ${
              selectedRole === 'client'
                ? 'border-[#622578] bg-[#622578]/10'
                : 'border-gray-600 hover:border-[#622578]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              {/* Client (Profile + Briefcase) */}
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
                {/* BreifCase */}
                <path d="M19.28 21h-6.9a1.6 1.6 0 01-1.73-1.5v-4a1.6 1.6 0 011.73-1.5h6.9A1.59 1.59 0 0121 15.5v4a1.66 1.66 0 01-1.72 1.5z" />
                <path d="M16.9 12h-2.15a.65.65 0 00-.72.66V14h3.59v-1.34a.65.65 0 00-.72-.66z" />
                <line x1="10.65" y1="17.29" x2="21" y2="17.29" />

                {/* Profile */}
                <circle cx="10.04" cy="5.73" r="2.73" />
                <path d="M3 18.45v-.9a7 7 0 017-7h.09a6.73 6.73 0 011.91.27" />
              </svg>
        
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'client'
                    ? 'border-[#622578]'
                    : 'border-gray-500'
                }`}
              >
                {selectedRole === 'client' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#622578]"></div>
                )}
              </div>
            </div>
            <p className="text-left text-lg font-medium text-white">
              I'm a client, hiring
              <br />
              for a Gig.
            </p>
          </button>

          {/* Talent Card */}
          <button
            onClick={() => handleRoleSelect('talent')}
            className={`w-60 p-6 rounded-lg border-2 transition-all cursor-pointer ${
              selectedRole === 'talent'
                ? 'border-[#622578] bg-[#622578]/10'
                : 'border-gray-600 hover:border-[#622578]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              {/* Freelancer (Profile + Work Platform) */}
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
              
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'talent'
                    ? 'border-[#622578]'
                    : 'border-gray-500'
                }`}
              >
                {selectedRole === 'talent' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#622578]"></div>
                )}
              </div>
            </div>
            <p className="text-left text-lg font-medium text-white">
              I'm a Talent,
              <br />
              looking for Gigs.
            </p>
          </button>
        </div>

        {/* Create Account Button */}
        <button
          onClick={handleRegister}
          disabled={!selectedRole}
          className={`px-16 py-3 rounded-md font-medium transition-all border-2 ${
            selectedRole
              ? 'bg-[#622578] border-[#622578] text-white hover:bg-[#622578]/90 hover:border-[#622578]/90 cursor-pointer'
              : 'bg-gray-700 border-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selectedRole
            ? `Register as a ${selectedRole}`
            : 'Create Account'}
        </button>

        {/* Login Link */}
        <p className="mt-6 text-gray-400">
          Already have an account?{' '}
          <a href="#" className="text-[#622578] font-medium hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}