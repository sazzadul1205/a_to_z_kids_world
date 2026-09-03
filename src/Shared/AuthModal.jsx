import { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, UserRound, X } from 'lucide-react';
import { useAuth } from './useAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    login(event.currentTarget.elements.email.value, mode);
    setIsSubmitted(true);
  };

  const handleGoogleLogin = () => {
    login(undefined, 'google');
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-text/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="relative w-full max-w-md rounded-3xl bg-surface p-6 text-text shadow-2xl sm:p-8">
        <button type="button" aria-label="Close account dialog" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-text-muted transition hover:bg-primary-100 hover:text-primary-700"><X className="h-5 w-5" /></button>
        {isSubmitted ? (
          <div className="py-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700"><UserRound className="h-7 w-7" /></div><h2 id="auth-modal-title" className="mt-5 text-2xl font-black">You&apos;re all set!</h2><p className="mt-2 text-sm leading-relaxed text-text-muted">This demo {mode === 'login' ? 'login' : 'account'} form was submitted successfully.</p><button type="button" onClick={onClose} className="mt-6 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white transition hover:bg-primary-700">Continue</button></div>
        ) : (
          <>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600">A to Z Kids World</p>
            <h2 id="auth-modal-title" className="mt-2 text-3xl font-black">{mode === 'login' ? 'Welcome back!' : 'Join the club!'}</h2>
            <p className="mt-2 text-sm text-text-muted">{mode === 'login' ? 'Pick up where your next adventure begins.' : 'Create an account to save your favorite discoveries.'}</p>
            <div className="mt-6 grid grid-cols-2 rounded-xl bg-surface-soft p-1"><button type="button" onClick={() => { setMode('login'); setIsSubmitted(false); }} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${mode === 'login' ? 'bg-surface text-primary-700 shadow-sm' : 'text-text-muted'}`}>Log in</button><button type="button" onClick={() => { setMode('signup'); setIsSubmitted(false); }} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${mode === 'signup' ? 'bg-surface text-primary-700 shadow-sm' : 'text-text-muted'}`}>Sign up</button></div>
            {mode === 'login' && <div className="mt-5 rounded-2xl border border-secondary-200 bg-secondary-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-secondary-1000">Local demo</p><p className="mt-1 text-xs text-text-muted">demo@atozkids.local · password123</p></div><button type="button" onClick={() => { login('demo@atozkids.local', 'demo'); setIsSubmitted(true); }} className="shrink-0 rounded-lg bg-secondary-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-secondary-1000">Use demo account</button></div></div>}
            <button type="button" onClick={handleGoogleLogin} className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-5 py-3 font-bold text-text transition hover:border-secondary-400 hover:bg-secondary-50"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-[#4285f4] shadow-sm">G</span> Continue with Google</button>
            <div className="mt-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-text-muted"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'signup' && <label className="block"><span className="mb-2 block text-sm font-bold">Your name</span><input required type="text" autoComplete="name" placeholder="Alex Explorer" className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" /></label>}
              <label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><input required type="email" autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" /></label>
              <label className="block"><span className="mb-2 block text-sm font-bold">Password</span><div className="relative"><input required type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" minLength="8" className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 pr-12 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-2 rounded-lg p-2 text-text-muted hover:bg-secondary-100 hover:text-text">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-bold text-white transition hover:bg-primary-700"><LockKeyhole className="h-4 w-4" /> {mode === 'login' ? 'Log in' : 'Create account'}</button>
            </form>
            <p className="mt-5 text-center text-xs text-text-muted">By continuing, you agree to our friendly terms and privacy policy.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
