import React from 'react';
import { useNavigate } from 'react-router-dom';
import FirstSection from '../components/FirstSection';
import ExploreCategories from '../components/ExploreCategories';
import HowItWorks from '../components/HowItWorks';
import FeaturesSection from '../components/FeaturesSection';
import WhoWeHelpSection from '../components/WhoWeHelpSection';
import TestimonialSection from '../components/TestimonialSection';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/create-profile');
  };

  return (
    <div className="relative overflow-hidden">
      <FirstSection onGetStarted={handleGetStarted} />
      <ExploreCategories />
      <HowItWorks />
      <FeaturesSection />
      <WhoWeHelpSection />
      <TestimonialSection />
    </div>
  );
}
