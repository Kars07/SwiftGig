import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Briefcase, Star, Mail, Phone, MapPin, Calendar, Award, TrendingUp, Loader } from "lucide-react";

const API_URL = 'http://localhost:1880/api';

const DashboardProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<any>(null);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData.userId || '';
  const userRole = userData.role || '';

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    if (userRole !== 'Client') {
      navigate('/talent-dashboard');
      return;
    }
    fetchProfileData();
  }, [userId, userRole]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch client profile data
      const response = await fetch(`${API_URL}/client/clientprofile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data.data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white p-6 md:px-10 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#622578] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white p-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error || 'Profile not found'}</p>
            <button 
              onClick={() => navigate('/client-dashboard')}
              className="px-6 py-2 bg-[#622578] rounded-lg hover:bg-[#7a2e94] transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Client User';

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <p className="text-[#622578] text-sm mb-2">Client Dashboard</p>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-gray-400">Manage your profile information</p>
          </div>
          <button 
            onClick={() => navigate('/edit-client-profile')}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-[#622578] hover:bg-[#7a2e94] cursor-pointer px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        </div>

        {/* Profile Hero Section */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-8 md:p-10 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile Image & Quick Stats */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={profileData.photourl || "/default-avatar.png"}
                alt="Profile"
                className="w-40 h-40 rounded-2xl border-4 border-[#622578] object-cover"
              />
              <div className="mt-6 flex gap-3">
                <div className="bg-[#622578]/20 border border-[#622578] rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-[#622578]">{profileData.rating || '5.0'}</p>
                  <p className="text-xs text-gray-400 mt-1">Rating</p>
                </div>
                <div className="bg-[#622578]/20 border border-[#622578] rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-[#622578]">{profileData.gigsCreated || '0'}</p>
                  <p className="text-xs text-gray-400 mt-1">Gigs</p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{fullName}</h2>
              <p className="text-xl text-[#622578] font-medium mb-4">Client</p>
              
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {profileData.bio || 'Welcome to SwiftGig! Looking forward to working with talented professionals.'}
              </p>

              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-lg border border-gray-700">
                  <Mail size={18} className="text-[#622578]" />
                  <span className="text-sm text-gray-300">{userData.email || 'No email'}</span>
                </div>
                {profileData.phoneNumber && (
                  <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-lg border border-gray-700">
                    <Phone size={18} className="text-[#622578]" />
                    <span className="text-sm text-gray-300">{profileData.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Location & DOB */}
              <div className="flex flex-wrap gap-4 mb-6">
                {profileData.country && (
                  <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-lg border border-gray-700">
                    <MapPin size={18} className="text-[#622578]" />
                    <span className="text-sm text-gray-300">
                      {profileData.city && profileData.state 
                        ? `${profileData.city}, ${profileData.state}, ${profileData.country}`
                        : profileData.country
                      }
                    </span>
                  </div>
                )}
                {profileData.Dob && (
                  <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-lg border border-gray-700">
                    <Calendar size={18} className="text-[#622578]" />
                    <span className="text-sm text-gray-300">{formatDate(profileData.Dob)}</span>
                  </div>
                )}
              </div>

              {/* Quick Stats Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2">
                  <Briefcase size={16} className="text-[#622578]" />
                  <span className="text-sm font-medium text-gray-300">Active Client</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2">
                  <TrendingUp size={16} className="text-[#622578]" />
                  <span className="text-sm font-medium text-gray-300">
                    {profileData.verified ? 'Top Client' : 'New Client'}
                  </span>
                </div>
                {profileData.verified && (
                  <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2">
                    <Award size={16} className="text-[#622578]" />
                    <span className="text-sm font-medium text-gray-300">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information & Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Status */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Award className="text-[#622578]" size={22} />
              Verification Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                <div>
                  <p className="text-sm text-gray-400">ID Type</p>
                  <p className="text-white font-medium">{profileData.idType || 'Not provided'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  profileData.verified 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {profileData.verified ? '✓ Verified' : '⏳ Pending'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                <div>
                  <p className="text-sm text-gray-400">Email Status</p>
                  <p className="text-white font-medium">{userData.email}</p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                  ✓ Verified
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <MapPin className="text-[#622578]" size={22} />
              Address Information
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Street Address</p>
                <p className="text-white">{profileData.streetAddress || 'Not provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">City</p>
                  <p className="text-white">{profileData.city || 'N/A'}</p>
                </div>
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">State</p>
                  <p className="text-white">{profileData.state || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Zip Code</p>
                  <p className="text-white">{profileData.zipCode || 'N/A'}</p>
                </div>
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Country</p>
                  <p className="text-white font-medium text-[#622578]">{profileData.country || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mt-8 bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Star className="text-[#622578]" size={22} />
            Account Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-[#622578] mb-1">{profileData.gigsCreated || '0'}</p>
              <p className="text-sm text-gray-400">Total Gigs Created</p>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-[#622578] mb-1">{profileData.activeGigs || '0'}</p>
              <p className="text-sm text-gray-400">Active Gigs</p>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-[#622578] mb-1">{profileData.completedGigs || '0'}</p>
              <p className="text-sm text-gray-400">Completed Gigs</p>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-[#622578] mb-1">{profileData.rating || '5.0'}</p>
              <p className="text-sm text-gray-400">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;