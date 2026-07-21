import { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { AnimatePresence } from 'motion/react';
import Login from './pages/auth/Login';
import TopBar from './components/layout/TopBar';
import PageTransition from './components/layout/PageTransition';
import { getCurrentUser } from './services/api';
import { getToken } from './services/apiClient';

// Page Imports
import Dashboard from './pages/Dashboard';
import ResumeView from './pages/resume/ResumeView';
import JobMatch from './pages/JobMatch';
import GapAnalysis from './pages/GapAnalysis';
import MockInterview from './pages/interview/MockInterview';
import ContentGenerator from './pages/ContentGenerator';
import Tracker from './pages/Tracker';
import SalarySimulator from './pages/SalarySimulator';
import Analytics from './pages/Analytics';

export default function App() {
  const { user, activeTab, setActiveTab, setUser, bootstrap } = useAppStore();
  const [checkingSession, setCheckingSession] = useState(true);

  // On refresh, if a token is already saved, restore the session instead of
  // bouncing back to the login screen
  useEffect(() => {
    const restoreSession = async () => {
      if (getToken()) {
        try {
          const me = await getCurrentUser();
          setUser(me);
          await bootstrap();
        } catch {
          // token expired/invalid — user will just see the login screen
        }
      }
      setCheckingSession(false);
    };
    restoreSession();
  }, []);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs text-mid-grey uppercase tracking-widest">
        Restoring workspace...
      </div>
    );
  }

  // If user is not locked in, force split-screen login/signup
  if (!user || !user.email) {
    return <Login />;
  }

  // Active page selector
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'resume':
        return <ResumeView />;
      case 'match':
        return <JobMatch />;
      case 'gap':
        return <GapAnalysis />;
      case 'interview':
        return <MockInterview />;
      case 'content':
        return <ContentGenerator />;
      case 'tracker':
        return <Tracker />;
      case 'salary':
        return <SalarySimulator />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-signal selection:text-ink">
      
      {/* Top Header Navigation */}
      <TopBar />

      {/* Primary Context Sub-Navigation (Modern Bento Segmented Capsule Toolbar) */}
      {['resume', 'match', 'gap', 'interview', 'salary', 'content', 'tracker', 'analytics'].includes(activeTab) && (
        <div className="w-full bg-paper-warm border-b border-hairline py-3 px-6 md:px-12 select-none animate-fade-in">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
            
            {/* Category Groups */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Prepare Group */}
              <div className="flex items-center gap-1.5 bg-paper border border-hairline p-1.5 rounded-full shadow-xs">
                <span className="text-[11px] font-mono font-bold text-mid-grey/80 uppercase tracking-widest pl-3.5 pr-3 border-r border-hairline select-none">
                  Prep
                </span>
                <button 
                  onClick={() => setActiveTab('resume', 'upload')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    ['resume', 'resume-builder'].includes(activeTab) 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  Resume Vector
                </button>
              </div>

              {/* Practice Group */}
              <div className="flex items-center gap-1.5 bg-paper border border-hairline p-1.5 rounded-full shadow-xs">
                <span className="text-[11px] font-mono font-bold text-mid-grey/80 uppercase tracking-widest pl-3.5 pr-3 border-r border-hairline select-none">
                  Practice
                </span>
                <button 
                  onClick={() => setActiveTab('interview')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === 'interview' 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  Mock Interview
                </button>
                <button 
                  onClick={() => setActiveTab('salary')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === 'salary' 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  Salary Negotiation
                </button>
              </div>

              {/* Apply Group */}
              <div className="flex items-center gap-1.5 bg-paper border border-hairline p-1.5 rounded-full shadow-xs">
                <span className="text-[11px] font-mono font-bold text-mid-grey/80 uppercase tracking-widest pl-3.5 pr-3 border-r border-hairline select-none">
                  Apply
                </span>
                <button 
                  onClick={() => setActiveTab('match')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === 'match' 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  Job Match
                </button>
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === 'content' 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  AI Generator
                </button>
              </div>

              {/* Track Group */}
              <div className="flex items-center gap-1.5 bg-paper border border-hairline p-1.5 rounded-full shadow-xs">
                <span className="text-[11px] font-mono font-bold text-mid-grey/80 uppercase tracking-widest pl-3.5 pr-3 border-r border-hairline select-none">
                  Track
                </span>
                <button 
                  onClick={() => setActiveTab('tracker')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === 'tracker' 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  Kanban Pipeline
                </button>
                <button 
                  onClick={() => setActiveTab('gap')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === 'gap' 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  Profile Gaps
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`text-[13.5px] font-medium px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === 'analytics' 
                      ? 'bg-ink text-paper font-semibold shadow-xs' 
                      : 'text-mid-grey hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  Deep Analytics
                </button>
              </div>

            </div>

            {/* Right Status Capsule */}
            <div className="hidden lg:flex items-center gap-2 bg-paper border border-hairline py-1.5 px-3 rounded-full text-[11px] font-mono text-mid-grey/90 shadow-xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-signal"></span>
              </span>
              <span>Workspace Sync Active</span>
            </div>

          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <PageTransition key={activeTab}>
            {renderActivePage()}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Footer (Austerely Clean Agency Footer) */}
      <footer className="border-t border-hairline py-8 px-6 md:px-12 bg-paper text-xs text-mid-grey select-none">
  <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
    <div className="flex items-center gap-3">
      <span className="font-heading font-medium text-ink">CareerAI</span>
      <span className="text-mid-grey/30">|</span>
      <span>AI Career Copilot</span>
    </div>
    <p className="font-sans text-mid-grey/80 text-center md:text-right">
      Built to help you land the role you're aiming for.
    </p>
  </div>
</footer>

    </div>
  );
}
