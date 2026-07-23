import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { registerUser, loginUser, loginWithGoogle } from '../../services/api';
import ScoreReadout from '../../components/ui/ScoreReadout';
import Button from '../../components/ui/Button';
import { Mail, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { setUser, setActiveTab, bootstrap } = useAppStore();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  // Simulated Mouse scrub interactive grid/particles on Left panel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const container = canvas.parentElement;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const draw = () => {
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      ctx.fillStyle = '#0B1220';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const gradient = ctx.createRadialGradient(mouseX, mouseY, 10, mouseX, mouseY, 250);
      gradient.addColorStop(0, 'rgba(227, 179, 65, 0.08)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
      gradient.addColorStop(1, 'rgba(10, 10, 10, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 8; i++) {
        const timeOffset = (mouseX / width) * 200;
        const x = ((Math.sin(i * 45 + timeOffset * 0.05) + 1) / 2) * width;
        const y = ((Math.cos(i * 12 + timeOffset * 0.02) + 1) / 2) * height;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Initialize Google Identity Services once the script (loaded in index.html) is ready,
  // and render Google's real button into a hidden div — our custom-styled button
  // just forwards its click to this hidden real button.
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !googleButtonRef.current) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setLoading(true);
          setError('');
          try {
            const user = await loginWithGoogle(response.credential);
            setUser(user);
            await bootstrap();
            setActiveTab('dashboard');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed, try again.');
          } finally {
            setLoading(false);
          }
        },
      });
      google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large', width: 320 });
    };

    if ((window as any).google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const user = isSignup
        ? await registerUser(name || 'New User', email, password)
        : await loginUser(email, password);
      setUser(user);
      await bootstrap();
      setActiveTab('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong, try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google sign-in is not configured yet — set VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    const realButton = googleButtonRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
    realButton?.click();
  };

  return (
    <div id="auth-container" className="flex min-h-screen w-full flex-col md:flex-row bg-paper">
      
      <div id="auth-hero" className="relative flex w-full flex-col justify-between bg-ink px-8 py-10 text-paper md:w-1/2 md:px-16 md:py-14 overflow-hidden min-h-[340px]">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 h-full w-full pointer-events-none opacity-90"
        />

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-signal animate-pulse" />
          <span className="font-heading text-lg font-medium tracking-tight">CareerAI</span>
        </div>

        <div className="relative z-10 my-auto py-12">
          <h1 className="max-w-md font-heading text-[40px] sm:text-[48px] md:text-[56px] leading-[1.1] tracking-tight font-medium text-paper">
            The quiet operating system for your career.
          </h1>
          <p className="mt-4 max-w-sm font-sans text-[14px] text-mid-grey leading-relaxed">
            Configure resumes, score applications, simulate negotiation, and automate tracking within a single, austere terminal.
          </p>
          
          <div className="mt-12 border-t border-hairline-dark pt-4 max-w-xs">
            <ScoreReadout
              value={87}
              label="Average match score after one week."
              suffix="%"
              delay={300}
              speed={1000}
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs font-mono text-mid-grey/80">
          <ShieldCheck size={14} className="text-signal" />
          <span>AES-256 Encrypted Client Space</span>
        </div>
      </div>

      <div id="auth-form" className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-20 md:py-16 bg-paper">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="font-heading text-[24px] sm:text-[28px] tracking-tight font-medium text-ink">
            {isSignup ? "Create your account" : "Sign in"}
          </h2>
          <p className="mt-1 text-[13px] text-mid-grey font-sans">
            {isSignup ? "Create your CareerAI profile to get started." : "Log in to continue tracking your applications."}
          </p>

          <form onSubmit={handleLoginSubmit} className="mt-8 flex flex-col gap-4">
            {isSignup && (
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-medium tracking-tight text-ink">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Gopal Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-full border border-ink/10 bg-paper-warm/50 px-4 py-2.5 text-[14px] font-sans text-ink placeholder:text-mid-grey/50 focus:border-ink focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-medium tracking-tight text-ink">Email</label>
              <input
                type="email"
                required
                placeholder="gopalrao18191@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-ink/10 bg-paper-warm/50 px-4 py-2.5 text-[14px] font-sans text-ink placeholder:text-mid-grey/50 focus:border-ink focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[12px] font-medium tracking-tight text-ink">Password</label>
                {!isSignup && (
                  <button type="button" className="font-sans text-[11px] text-mid-grey hover:text-ink">
                    Forgot key?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-ink/10 bg-paper-warm/50 px-4 py-2.5 text-[14px] font-sans text-ink placeholder:text-mid-grey/50 focus:border-ink focus:outline-none transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="dark"
              disabled={loading}
              className="mt-2 py-3"
            >
              {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
            </Button>

            {error && (
              <p className="text-[12px] text-negative font-sans -mt-2">{error}</p>
            )}
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline" />
            </div>
            <span className="relative bg-paper px-3 text-[11px] font-mono text-mid-grey uppercase tracking-widest">
              Or bypass
            </span>
          </div>

          {/* Google's real button renders invisibly here — our styled button forwards clicks to it */}
          <div ref={googleButtonRef} className="hidden" />

          <button
            onClick={handleGoogleOAuth}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 bg-paper px-5 py-2.5 font-sans text-[13px] font-medium text-ink hover:bg-paper-warm transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Unlock instantly with Google
          </button>

          <p className="mt-8 text-center text-xs font-sans text-mid-grey">
            {isSignup ? "Already have an account?" : "New to CareerAI?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-ink font-medium underline underline-offset-4 hover:text-signal transition-colors"
            >
              {isSignup ? "Sign in instead" : "Create local key"}
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
