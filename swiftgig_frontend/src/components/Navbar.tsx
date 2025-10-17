import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">SwiftGig</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            How It Works
          </a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            About
          </a>
          <a href="#contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Contact
          </a>
        </div>

        {/* Connect Wallet */}
        <div className="p-[4px] bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}