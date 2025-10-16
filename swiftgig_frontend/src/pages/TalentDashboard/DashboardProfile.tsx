import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit3, Briefcase, Star, Mail, Globe, Award, TrendingUp, Phone, MapPin, Calendar, Loader } from "lucide-react";

const API_URL = 'http://localhost:1880/api';

const Profile: React.FC = () => {
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
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch talent profile data
      const response = await fetch(`${API_URL}/talent/talentprofile/${userId}`, {
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

  const getSkillsArray = (skills: string) => {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A031F]/80 text-white p-6 md:px-10 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#1A031F]/80 text-white p-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error || 'Profile not found'}</p>
            <button 
              onClick={() => navigate('/talent-dashboard')}
              className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
  const skills = getSkillsArray(profileData.skills);

  return (
    <div className="min-h-screen bg-[#1A031F]/80 text-white p-6 md:px-10 rounded-xl relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-purple-400 text-sm mb-5">Talent Dashboard</h1>
            <motion.h1
              className="text-3xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Profile
            </motion.h1>
          </div>
          <button 
            onClick={() => navigate('/edit-profile')}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-purple-500 cursor-pointer px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/30 hover:bg-purple-600 transition"
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        </div>

        {/* Profile Hero Section */}
        <div className="bg-[#2B0A2F]/70 rounded-3xl p-8 md:p-10 shadow-lg mb-8 backdrop-blur-sm border border-[#641374]/50">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile Image & Quick Stats */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={profileData.photourl || "/default-avatar.png"}
                alt="Profile"
                className="w-40 h-40 rounded-2xl border-4 border-purple-500 object-cover"
              />
              <div className="mt-6 flex gap-3">
                <div className="bg-[#641374]/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-purple-300">{profileData.rating || '4.8'}</p>
                  <p className="text-xs text-gray-300 mt-1">Rating</p>
                </div>
                <div className="bg-[#641374]/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-purple-300">{profileData.completedProjects || '0'}</p>
                  <p className="text-xs text-gray-300 mt-1">Projects</p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{fullName}</h2>
              <p className="text-xl text-purple-400 font-medium mb-4">{profileData.category || 'Freelancer'}</p>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {profileData.bio || 'Passionate freelancer dedicated to delivering quality work.'}
              </p>

              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-[#2B0A2F]/60 px-4 py-2 rounded-lg border border-[#3A0F3F]">
                  <Mail size={18} className="text-purple-400" />
                  <span className="text-sm text-gray-200">{userData.email || 'No email'}</span>
                </div>
                {profileData.phoneNumber && (
                  <div className="flex items-center gap-2 bg-[#2B0A2F]/60 px-4 py-2 rounded-lg border border-[#3A0F3F]">
                    <Phone size={18} className="text-purple-400" />
                    <span className="text-sm text-gray-200">{profileData.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Location & DOB */}
              <div className="flex flex-wrap gap-4 mb-6">
                {profileData.country && (
                  <div className="flex items-center gap-2 bg-[#2B0A2F]/60 px-4 py-2 rounded-lg border border-[#3A0F3F]">
                    <MapPin size={18} className="text-purple-400" />
                    <span className="text-sm text-gray-200">
                      {profileData.city && profileData.state 
                        ? `${profileData.city}, ${profileData.state}, ${profileData.country}`
                        : profileData.country
                      }
                    </span>
                  </div>
                )}
                {profileData.Dob && (
                  <div className="flex items-center gap-2 bg-[#2B0A2F]/60 px-4 py-2 rounded-lg border border-[#3A0F3F]">
                    <Calendar size={18} className="text-purple-400" />
                    <span className="text-sm text-gray-200">{formatDate(profileData.Dob)}</span>
                  </div>
                )}
              </div>

              {/* Quick Stats Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-[#3A0F3F]/30 border border-[#641374]/40 rounded-lg px-4 py-2">
                  <Briefcase size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">Active Member</span>
                </div>
                <div className="flex items-center gap-2 bg-[#3A0F3F]/30 border border-[#641374]/40 rounded-lg px-4 py-2">
                  <TrendingUp size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">
                    {profileData.verified ? 'Top Rated' : 'Rising Talent'}
                  </span>
                </div>
                {profileData.verified && (
                  <div className="flex items-center gap-2 bg-[#3A0F3F]/30 border border-[#641374]/40 rounded-lg px-4 py-2">
                    <Award size={16} className="text-purple-400" />
                    <span className="text-sm font-medium text-gray-200">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skills */}
          <div className="lg:col-span-1">
            <div className="bg-[#2B0A2F]/70 rounded-2xl p-6 shadow-md backdrop-blur-sm border border-[#641374]/50">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Star className="text-purple-400" size={22} />
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-[#641374]/20 border border-[#641374]/40 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No skills added yet</p>
                )}
              </div>
            </div>

            {/* ID Verification Status */}
            <div className="bg-[#2B0A2F]/70 rounded-2xl p-6 shadow-md backdrop-blur-sm border border-[#641374]/50 mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="text-purple-400" size={22} />
                Verification
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">ID Type:</span>
                  <span className="text-sm font-medium text-purple-300">
                    {profileData.idType || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Status:</span>
                  <span className={`text-sm font-medium ${profileData.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {profileData.verified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio/Additional Info */}
          <div className="lg:col-span-2">
            <div className="bg-[#2B0A2F]/70 rounded-2xl p-6 shadow-md backdrop-blur-sm border border-[#641374]/50">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Briefcase className="text-purple-400" size={22} />
                Portfolio & Documents
              </h3>
              
              {profileData.portfolioPdf ? (
                <div className="space-y-4">
                  <a 
                    href={profileData.portfolioPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-[#3A0F3F]/30 hover:bg-[#641374]/20 border border-[#641374]/40 rounded-xl p-5 transition-all duration-300 shadow-md hover:shadow-purple-500/30 block"
                  >
                    <h4 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition flex items-center gap-2">
                      <Globe size={18} />
                      Portfolio Document
                    </h4>
                    <p className="text-gray-300 text-sm">Click to view portfolio</p>
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No portfolio uploaded yet</p>
                  <button 
                    onClick={() => navigate('/edit-profile')}
                    className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition text-sm"
                  >
                    Upload Portfolio
                  </button>
                </div>
              )}
            </div>

            {/* Address Information */}
            <div className="bg-[#2B0A2F]/70 rounded-2xl p-6 shadow-md backdrop-blur-sm border border-[#641374]/50 mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-purple-400" size={22} />
                Address
              </h3>
              <div className="space-y-2 text-gray-300">
                <p className="text-sm">{profileData.streetAddress || 'No street address'}</p>
                <p className="text-sm">
                  {profileData.city && profileData.state 
                    ? `${profileData.city}, ${profileData.state}`
                    : profileData.city || 'No city'
                  }
                  {profileData.zipCode && ` ${profileData.zipCode}`}
                </p>
                <p className="text-sm font-medium text-purple-300">{profileData.country || 'No country'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;