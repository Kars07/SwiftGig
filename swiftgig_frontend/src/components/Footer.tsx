import React from 'react';
import { Zap, Facebook, Linkedin, Twitter, Youtube, Instagram, Apple, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* For Clients */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">For Clients</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">How to hire</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Talent Marketplace</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Project Catalog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Hire an agency</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Enterprise</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Business Plus</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Any Hire</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contract-to-hire</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Direct Contracts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Hire worldwide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Hire in the USA</a></li>
            </ul>
          </div>

          {/* For Talent */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">For Talent</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">How to find work</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Direct Contracts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Find freelance jobs worldwide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Find freelance jobs in the USA</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Win work with ads</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Exclusive resources with Freelancer Plus</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Help & support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Success stories</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">SwiftGig reviews</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Resources</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Affiliate programme</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Free Business Tools</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Release notes</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Leadership</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Investor relations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Our impact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Partners</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Trust, safety & security</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Modern slavery statement</a></li>
            </ul>
          </div>
        </div>

        {/* Social Media and Mobile App Section */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-white/10 mb-8">
          {/* Social Media Links */}
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            <span className="text-gray-400 text-sm">Follow us</span>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* Mobile App Links */}
          <div className="flex items-center space-x-6">
            <span className="text-gray-400 text-sm">Mobile app</span>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Apple className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Smartphone className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            ©2025 SwiftGig®
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <span className="text-gray-600">•</span>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <span className="text-gray-600">•</span>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Notice at Collection</a>
            <span className="text-gray-600">•</span>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Your Privacy Choices</a>
            <span className="text-gray-600">•</span>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}