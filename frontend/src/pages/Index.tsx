
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import RoleSelector from "@/components/RoleSelector";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import EventsBulletin from "@/components/EventsBulletin";
import JobCategories from "@/components/JobCategories";
import FeaturedJobs from "@/components/FeaturedJobs";
import TestimonialSection from "@/components/TestimonialSection";
import StatisticsSection from "@/components/StatisticsSection";


const Index = () => {
  // State to track which components are visible for animation
  const [componentsVisible, setComponentsVisible] = useState([false, false, false, false, false, false, false]);

  useEffect(() => {
    // Staggered animation for components
    const timeouts = [];
    for (let i = 0; i < 7; i++) {
      const timeout = setTimeout(() => {
        setComponentsVisible(prev => {
          const newState = [...prev];
          newState[i] = true;
          return newState;
        });
      }, i * 300); // 300ms delay between each component
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main>
        <HeroSection />
        <div className={`transition-all duration-1000 ${componentsVisible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <JobCategories />
        </div>
        <div className={`transition-all duration-1000 ${componentsVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <FeaturedJobs />
        </div>
        <div className={`transition-all duration-1000 ${componentsVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <EventsBulletin />
        </div>
        <div className={`transition-all duration-1000 ${componentsVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <AboutSection />
        </div>
        <div className={`transition-all duration-1000 ${componentsVisible[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <TestimonialSection />
      </div>

      <div className={`transition-all duration-1000 ${componentsVisible[5] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <StatisticsSection />
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
