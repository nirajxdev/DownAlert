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
import Testimonials from './components/Testimonials';
import { type User, me, logout, getToken } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [infoModalPage, setInfoModalPage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Restore session from saved token on boot.
  useEffect(() => {
    if (!getToken()) {
      setAuthChecked(true);
      return;
    }
    me()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setAuthChecked(true));
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

  if (!authChecked) return null;

  const handleLogout = () => {
    logout();
    setUser(null);
    showNotification('Successfully logged out.');
  };

  if (user) {
    return <Dashboard user={user} onUpdateUser={setUser} onLogout={handleLogout} />;
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

        {/* Section 03.5 — SIMPLE BY DESIGN */}
        <SectionWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#080D18] mb-6">
                Simple <span className="text-[#4169FF]">by design.</span>
              </h2>
              <p className="text-[#555C67] text-lg leading-relaxed">
                No SDK to install, no DevOps setup, no charts to interpret. Just a clear UP/DOWN status and an email when it changes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
              {[
                { title: 'NO SDK', text: 'Paste your URL and you’re done. Nothing to install in your app.' },
                { title: 'EMAIL ALERTS', text: 'Plain-language DOWN and recovery emails, straight to your inbox.' },
                { title: 'CHECK HISTORY', text: 'Every check is saved, so you can see exactly when things broke.' },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-[#DDE1E7] p-6 text-left">
                  <h3 className="font-mono text-sm tracking-widest text-[#080D18] mb-3">{item.title}</h3>
                  <p className="text-[#555C67] text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
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
            onSelectPro={() => handleOpenSignup('free')}
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
