import { Building2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { auth, googleProvider, signInWithPopup } from "../../firebase"

type AuthFormProps = { mode?: 'signup' | 'login' }
    
const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isSignUp = mode === "signup";
  const navigate = useNavigate(); // Hook to handle redirection after successful login
  const handleSignUp = () => {

  }
  const handleLogin = () => {

  }
const handleGoogleSignIn = async () => {
  try {
    // 1. Authenticate with Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 2. Get the ID Token for the backend
    const idToken = await user.getIdToken();
    console.log("Firebase ID Token:", idToken);

    // 3. Send the ID Token to the Express Backend
    // This is the CRITICAL step for authentication
    const backendResponse = await fetch('http://localhost:3000/api/v1/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Send the token in the Authorization header (standard practice)
        'Authorization': `Bearer ${idToken}` 
      },
      // You can send the token in the body as well, but header is standard
      body: JSON.stringify({ token: idToken }) 
    });

    const data = await backendResponse.json();
    console.log("Backend response:", data);
    
    // 4. Handle success (e.g., store backend session/user info, redirect)
    console.log("Backend verification successful!");
    navigate('/'); 

  } catch (error) {
    if (error instanceof Error) {
      console.error("Sign-in failed:", error.message);
    } else {
      console.error("Sign-in failed:", String(error));
    }
  }
};
  return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-md border border-gray-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                File Manager
              </h1>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@realestate.ai"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              
              <button
                onClick={isSignUp ? handleSignUp : handleLogin}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition font-medium"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
  
              <button
                onClick={handleGoogleSignIn}
                className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <Link
                to={isSignUp ? '/login' : '/signup'}
                className="text-gray-600 hover:text-gray-900 text-sm transition"
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Link>
            </div>
            
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium mb-1 text-gray-900 text-xs">Demo:</p>
              <p className="text-gray-600 text-xs">admin@realestate.ai / admin</p>
              <p className="text-gray-600 text-xs">agent@realestate.ai / agent</p>
            </div>
          </div>
        </div>
  )
}

export default AuthForm