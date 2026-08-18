import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BuiltFor from './components/BuiltFor';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import DocsModal from './components/DocsModal';
import InfoModal from './components/InfoModal';
import SectionWrapper from './components/SectionWrapper';
import ScrollProgress from './components/ScrollProgress';
import Dashboard from './components/Dashboard';
import GlobalNodeDistribution from './components/GlobalNodeDistribution';
import Testimonials from './components/Testimonials';
import { type User, store } from './lib/store';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [infoModalPage, setInfoModalPage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    store.init();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenLogin = () => {
    setAuthMode('login');
    setSelectedPlan('free');
    setAuthModalOpen(true);
  };

  const handleOpenSignup = (plan: 'free' | 'pro' = 'free') => {
    setAuthMode('signup');
    setSelectedPlan(plan);
    setAuthModalOpen(true);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (user) {
    return <Dashboard user={user} onUpdateUser={setUser} onLogout={() => {
      setUser(null);
      showNotification('Successfully logged out.');
    }} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F2] text-[#080D18] selection:bg-[#4169FF]/20 selection:text-[#080D18]">
      <ScrollProgress />
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#080D18] text-white px-4 py-3 rounded-none shadow-xl border border-[#DDE1E7]/20 font-mono text-[11px] flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#19B98A] animate-pulse"></span>
          <span className="uppercase tracking-widest">{notification}</span>
        </div>
      )}

      {/* 1. Navbar */}
      <Navbar
        onOpenLogin={handleOpenLogin}
        onOpenSignup={() => handleOpenSignup('free')}
        onOpenDocs={() => setDocsModalOpen(true)}
        onOpenEnterprise={() => setInfoModalPage('sales')}
      />

      {/* Main Content Sections: Exactly 1. Hero, 2. Built For, 3. How It Works, 4. Pricing, 5. Footer */}
      <main className="flex-1">
        {/* Section 01 — HERO */}
        <SectionWrapper>
          <Hero
            onStartFree={() => handleOpenSignup('free')}
            onSeeHowItWorks={scrollToHowItWorks}
          />
        </SectionWrapper>

        {/* Section 02 — BUILT FOR */}
        <SectionWrapper>
          <BuiltFor />
        </SectionWrapper>

        {/* Section 03 — HOW IT WORKS */}
        <SectionWrapper>
          <HowItWorks
            onAddMonitorClick={(url) => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
          />
        </SectionWrapper>

        {/* Section 03.5 — GLOBAL NETWORK */}
        <SectionWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#080D18] mb-6">
                Tested from <span className="text-[#4169FF]">everywhere.</span>
              </h2>
              <p className="text-[#555C67] text-lg leading-relaxed">
                We distribute your uptime checks across multiple edge locations globally to ensure your service is accessible from every corner of the internet.
              </p>
            </div>
            <GlobalNodeDistribution />
          </div>
        </SectionWrapper>

        {/* Section 03.75 — TESTIMONIALS */}
        <SectionWrapper>
          <Testimonials />
        </SectionWrapper>

        {/* Section 04 — PRICING */}
        <SectionWrapper>
          <Pricing
            onSelectFree={() => handleOpenSignup('free')}
            onSelectPro={() => handleOpenSignup('pro')}
          />
        </SectionWrapper>

        {/* Section 05 — FINAL CTA */}
        <SectionWrapper>
          <FinalCTA onStartFree={() => handleOpenSignup('free')} />
        </SectionWrapper>
      </main>

      {/* Section 05 — FOOTER */}
      <Footer
        onOpenContent={(pageId) => setInfoModalPage(pageId)}
      />

      {/* Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        planType={selectedPlan}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setAuthModalOpen(false);
          showNotification(`Authenticated as ${authenticatedUser.email}. Connected to monitoring engine.`);
        }}
      />

      {/* Interactive Docs Modal */}
      <DocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />

      {/* Generic Info Modal (Legal / Company) */}
      <InfoModal 
        isOpen={infoModalPage !== null}
        onClose={() => setInfoModalPage(null)}
        pageId={infoModalPage}
      />
    </div>
  );
}
