import { useState, useRef, useEffect } from 'react';

// Individual Code Input Component
const CodeInput = ({ index, value, onChange, onKeyDown, inputRefs }: {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}) => {
  return (
    <input
      ref={(el) => {
        inputRefs.current[index] = el;
      }}
      type="text"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      onKeyDown={(e) => onKeyDown(index, e)}
      className="w-16 h-16 text-center text-2xl font-bold bg-transparent border-2 border-[#622578] rounded-xl text-white focus:border-[#622578]/70 focus:outline-none transition-all duration-300 hover:border-[#622578]/70"
    />
  );
};

const EmailVerifyPage = () => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(600); // 10 min

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Mock email - in real app, get from location.state or props
  const email = 'user@example.com';

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Move to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.join('').length === 6 && !newCode.includes('')) {
      handleVerify();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    const nextEmptyIndex = newCode.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if full code pasted
    if (newCode.join('').length === 6 && !newCode.includes('')) {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // TODO: Add your API call here
      // Example:
      // const response = await fetch('/api/verify-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code: verificationCode })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Email verified successfully!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      // TODO: Add your API call here
      // Example:
      // const response = await fetch('/api/resend-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('New verification code sent to your email!');
      setCanResend(false);
      setCountdown(600);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-[#622578]">Swift</span>Gig
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Verify Your Email</h2>
            <p className="text-gray-400 mb-2">
              Enter the 6-digit code we sent to
            </p>
            <p className="text-[#622578] font-semibold text-lg">{email}</p>
            <button
              onClick={handleBackToLogin}
              className="text-gray-400 hover:text-[#622578] transition-colors mt-4 text-sm"
            >
              ← Back to Login
            </button>
          </div>

          {/* Verification Form */}
          <div className="bg-[#252525] border border-gray-700 rounded-xl p-8">
            <div className="space-y-6">
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <CodeInput
                    key={index}
                    index={index}
                    value={digit}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    inputRefs={inputRefs}
                  />
                ))}
              </div>

              {error && (
                <div className="text-center">
                  <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-400/30">
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="text-center">
                  <p className="text-[#622578] text-sm bg-[#622578]/10 p-3 rounded-lg border border-[#622578]/30">
                    {success}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || code.join('').length !== 6}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                  loading || code.join('').length !== 6
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-[#622578] text-white hover:bg-[#622578]/90"
                }`}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">
                  Didn't receive the code?
                </p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-[#622578] hover:text-[#622578]/80 font-medium underline underline-offset-2 disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Resend code in {formatCountdown(countdown)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifyPage;