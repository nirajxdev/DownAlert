import { useState, type FormEvent } from 'react';
import { X, Globe, Mail, User as UserIcon, Activity } from 'lucide-react';
import { store, type User } from '../lib/store';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  planType?: 'free' | 'pro';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({
  isOpen,
  initialMode,
  planType = 'free',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    // Prevent the default form submission behavior (page reload)
    e.preventDefault();
    // Clear any previous error messages before starting a new request
    setError('');
    
    // Validate signup form fields: ensure name, email, and password are all provided
    if (mode === 'signup' && (!email || !name || !password)) {
      setError('Name, email, and password are required');
      return; // Stop execution if validation fails
    }
    // Validate login form fields: ensure email and password are provided
    if (mode === 'login' && (!email || !password)) {
      setError('Email and password are required');
      return; // Stop execution if validation fails
    }

    // Set loading state to true to show loading UI (spinners, disabled buttons)
    setLoading(true);
    
    // Simulate network delay for the authentication process
    setTimeout(() => {
      // =====================================================================
      // TODO (DATABASE/API): INJECT BACKEND AUTHENTICATION LOGIC HERE
      // =====================================================================
      // 1. For Login: Send a POST request to your auth endpoint.
      //    Example:
      //    try {
      //      const response = await fetch('https://api.yourdomain.com/auth/login', {
      //        method: 'POST',
      //        headers: { 'Content-Type': 'application/json' },
      //        body: JSON.stringify({ email, password })
      //      });
      //      if (!response.ok) throw new Error('Invalid credentials');
      //      const { user, token } = await response.json();
      //      // Save token to localStorage or secure cookie here
      //      onSuccess(user);
      //    } catch (err) {
      //      setError(err.message);
      //    }
      //
      // 2. For Signup: Send a POST request to create a new user.
      //    Example:
      //    try {
      //      const response = await fetch('https://api.yourdomain.com/auth/signup', {
      //        method: 'POST',
      //        headers: { 'Content-Type': 'application/json' },
      //        body: JSON.stringify({ name, email, password, plan: planType, websiteUrl })
      //      });
      //      const { user, token } = await response.json();
      //      // Save token and proceed
      //      onSuccess(user);
      //    }
      // =====================================================================
      
      // Look up the user by email from the local mocked store
      let user = store.getUserByEmail(email);

      if (mode === 'login') {
        // LOGIN LOGIC
        // If no user is found in the local store, throw an error
        if (!user) {
          setError('User not found. Please register first.');
          setLoading(false); // Reset loading state
          return;
        }
        // If a password exists in the store and it doesn't match the input, throw an error
        if (user.password && user.password !== password) {
          setError('Incorrect password.');
          setLoading(false); // Reset loading state
          return;
        }
      } else {
        // SIGNUP LOGIC
        // If a user with this email already exists, prevent duplicate signup
        if (user) {
          setError('User already exists. Please log in.');
          setLoading(false); // Reset loading state
          return;
        }
        
        // Determine user role (this is a demo hack to allow testing the admin dashboard)
        const role = name.toLowerCase().includes('admin') ? 'admin' : 'user';
        
        // Create the new user object structure
        user = {
          id: `user-${Date.now()}`, // Generate a unique mock ID based on timestamp
          name, // Assign the provided name
          email, // Assign the provided email
          password, // Assign the provided password (in a real app, never store plain text)
          role, // Assign the calculated role
          plan: planType // Assign the plan type selected during signup flow
        };
        
        // =====================================================================
        // TODO (DATABASE): SAVE NEW USER TO DATABASE
        // Replace store.saveUser with a database insert query if running server-side,
        // or ensure the API handles this during the signup POST request above.
        // =====================================================================
        store.saveUser(user); // Save to local mock store
        
        // If the user provided a website URL during signup, automatically add it as a monitor
        if (websiteUrl) {
           // =====================================================================
           // TODO (DATABASE): SAVE DEFAULT INITIAL MONITOR FOR NEW USER
           // When the user signs up, insert this monitor record into your Monitors table
           // linked to the newly created user ID.
           // =====================================================================
           store.saveMonitor({
             id: `mon-${Date.now()}`, // Generate mock monitor ID
             userId: user.id, // Link monitor to the new user
             name: 'My Website', // Default fallback name
             url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`, // Ensure http prefix exists
             type: 'Website', // Set monitor type
             status: 'operational', // Default initial status
             uptime: '100%', // Default initial uptime string
             response: '120ms', // Default initial response time string
             lastCheck: 'Just now' // Default check timestamp string
           });
        }
      }

      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess(user!);
        onClose();
        setSubmitted(false);
      }, 1200);
    }, 800);
  };

  const isFormValid = mode === 'signup' ? (email.length > 0 && name.length > 0 && password.length > 0) : (email.length > 0 && password.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D18]/80 backdrop-blur-sm font-sans">
      <div
        id="auth-modal-card"
        className="relative w-full max-w-[440px] bg-[#FFFFFF] rounded-2xl p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-[#E5E5E5]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B6B6B] hover:text-[#111111] bg-[#F7F7F9] hover:bg-[#E5E5E5] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-8 mt-2">
          <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center shadow-md shadow-black/10">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-semibold text-[#111111] tracking-tight">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h3>
          <p className="text-[#6B6B6B] text-sm mt-2">
            {mode === 'signup' 
              ? <>Start monitoring with the <span className="font-semibold text-[#3154FF] uppercase tracking-wider text-[10px] bg-[#3154FF]/10 px-1.5 py-0.5 rounded ml-1">{planType}</span> plan</>
              : 'Enter your credentials to access your dashboard'}
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
             <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto">
               <div className="w-8 h-8 rounded-full bg-[#10B981] animate-pulse"></div>
             </div>
             <p className="text-sm font-medium text-[#111111]">
               Workspace ready. Connecting...
             </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] text-[#111111] placeholder-[#A3A3A3] text-sm transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide">
                    Website to monitor <span className="text-[#A3A3A3] font-normal normal-case tracking-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="mywebsite.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] text-[#111111] placeholder-[#A3A3A3] text-sm transition-all shadow-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@example.com"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] text-[#111111] placeholder-[#A3A3A3] text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide">
                  Password
                </label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-[#3154FF] hover:underline font-medium">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] text-[#111111] placeholder-[#A3A3A3] text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm mt-2 ${
                isFormValid && !loading
                  ? 'bg-[#111111] text-white hover:bg-[#000000] hover:shadow-md'
                  : 'bg-[#F7F7F9] text-[#A3A3A3] cursor-not-allowed'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Log in'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-4">
              <div className="h-px bg-[#E5E5E5] flex-1"></div>
              <span className="text-[#A3A3A3] text-xs font-medium uppercase tracking-wider">Or continue with</span>
              <div className="h-px bg-[#E5E5E5] flex-1"></div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#F7F7F9] border border-[#E5E5E5] rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-[#111111] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>

            {/* Footer Links */}
            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'login' : 'signup');
                  setError('');
                }}
                className="text-[#6B6B6B] text-sm hover:text-[#111111] transition-colors"
              >
                {mode === 'signup' ? (
                  <>Already have an account? <span className="font-medium text-[#3154FF]">Log in</span></>
                ) : (
                  <>Don't have an account? <span className="font-medium text-[#3154FF]">Sign up</span></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
