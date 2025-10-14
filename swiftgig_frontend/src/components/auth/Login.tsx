import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/signup");
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white overflow-hidden">
      {/* Left Side with Animated Eclipse Design */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Animated Eclipses */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-[#622578] opacity-70 blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 25, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "-80px", left: "-100px" }}
        ></motion.div>

        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-[#C279DC] opacity-60 blur-3xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -25, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "-80px", left: "80px" }}
        ></motion.div>

        {/* Branding Text */}
        <div className="z-10 px-8 text-center md:text-left">
          <motion.h1
            className="text-4xl font-bold text-white mb-4 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            SWIFTGIG
          </motion.h1>
          <motion.p
            className="text-gray-300 max-w-md leading-relaxed text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Welcome back to your account — start working or creating gigs again.
          </motion.p>
        </div>
      </div>

      {/* Right Side Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[#121212]">
        <motion.div
          className="w-[500px] bg-[#1e1e1e] rounded-2xl p-10 shadow-[0_0_30px_rgba(124,58,237,0.15)] border border-[#2e2e2e]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-semibold text-center mb-8 text-white">
            Welcome Back
          </h2>

          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 bg-transparent border border-[#383838] rounded-lg focus:outline-none focus:border-[#7a2e94] text-white placeholder-gray-500 transition"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 bg-transparent border border-[#383838] rounded-lg focus:outline-none focus:border-[#7a2e94] text-white placeholder-gray-500 transition"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-[#7a2e94]" /> Remember me
            </label>
            <a href="#" className="text-[#C279DC] hover:underline">
              Forgot password?
            </a>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 w-full py-3 bg-gradient-to-r from-[#622578] to-[#7a2e94] hover:opacity-90 rounded-lg font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition"
          >
            Sign In
          </motion.button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don’t have an account?{" "}
            <span
              onClick={handleRegisterClick}
              className="text-[#C279DC] hover:underline cursor-pointer"
            >
              Register here
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;