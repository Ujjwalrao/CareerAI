import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Menu, X, Radio } from 'lucide-react';

export default function TopBar() {
  const { activeTab, setActiveTab } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Map primary navigation categories to pages
  const navItems = [
    { label: 'Prepare', tab: 'resume' },
    { label: 'Practice', tab: 'interview' },
    { label: 'Apply', tab: 'match' },
    { label: 'Track', tab: 'tracker' }
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo and static glyph */}
        <div 
          onClick={() => handleNavClick('dashboard')} 
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="h-2 w-2 bg-signal animate-pulse rounded-full" />
          <span className="font-heading text-lg tracking-tight text-ink font-medium">
            CareerAI
          </span>
        </div>

        {/* Desktop Comma-Separated Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-[14px]">
          {navItems.map((item, index) => {
            // Determine active based on tab groups
            let isActive = false;
            if (item.tab === 'resume' && ['resume', 'resume-builder', 'resume-score'].includes(activeTab)) isActive = true;
            if (item.tab === 'interview' && ['interview', 'salary'].includes(activeTab)) isActive = true;
            if (item.tab === 'match' && ['match', 'content'].includes(activeTab)) isActive = true;
            if (item.tab === 'tracker' && ['tracker', 'gap', 'analytics'].includes(activeTab)) isActive = true;

            return (
              <span key={item.tab} className="text-mid-grey">
                <button
                  onClick={() => handleNavClick(item.tab)}
                  className={`font-sans tracking-tight cursor-pointer py-1 transition-colors duration-200 outline-none text-ink hover:text-signal ${
                    isActive ? 'border-b-2 border-signal font-medium text-ink' : ''
                  }`}
                >
                  {item.label}
                </button>
                {index < navItems.length - 1 && <span className="ml-1.5 text-mid-grey/40 select-none">,</span>}
              </span>
            );
          })}
        </nav>

        {/* Desktop CTA Link */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNavClick('analytics')}
            className={`font-sans text-[13px] tracking-tight cursor-pointer hover:text-signal transition-colors ${
              activeTab === 'analytics' ? 'text-signal border-b border-signal' : 'text-mid-grey'
            }`}
          >
            System Analytics
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className="rounded-full border border-ink/10 bg-ink px-5 py-1.5 text-[13px] font-medium text-paper hover:bg-paper hover:text-ink hover:border-ink transition-colors duration-200 cursor-pointer"
          >
            Terminal Home
          </button>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center md:hidden text-ink outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Mobile Fullscreen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 w-full bg-paper/98 backdrop-blur-md md:hidden animate-fade-in flex flex-col justify-between px-8 py-12">
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[11px] uppercase tracking-widest text-mid-grey border-b border-hairline pb-2">
              Career Engine Navigation
            </span>
            <nav className="flex flex-col gap-5">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`text-left font-heading text-[28px] tracking-tight ${
                  activeTab === 'dashboard' ? 'text-signal' : 'text-ink'
                }`}
              >
                Dashboard Home
              </button>
              {navItems.map((item) => {
                let isActive = false;
                if (item.tab === 'resume' && ['resume', 'resume-builder'].includes(activeTab)) isActive = true;
                if (item.tab === 'interview' && ['interview', 'salary'].includes(activeTab)) isActive = true;
                if (item.tab === 'match' && ['match', 'content'].includes(activeTab)) isActive = true;
                if (item.tab === 'tracker' && ['tracker', 'gap', 'analytics'].includes(activeTab)) isActive = true;

                return (
                  <button
                    key={item.tab}
                    onClick={() => handleNavClick(item.tab)}
                    className={`text-left font-heading text-[28px] tracking-tight ${
                      isActive ? 'text-signal' : 'text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => handleNavClick('analytics')}
                className={`text-left font-heading text-[28px] tracking-tight ${
                  activeTab === 'analytics' ? 'text-signal' : 'text-ink'
                }`}
              >
                Analytics Terminal
              </button>
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-t border-hairline pt-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-positive" />
              <span className="font-sans text-[13px] text-mid-grey">
                Platform: Online & Configured
              </span>
            </div>
            <p className="font-sans text-xs text-mid-grey/80 leading-relaxed">
              CareerAI is active. Workspaces are local. Data persistence enabled via simulated state.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
