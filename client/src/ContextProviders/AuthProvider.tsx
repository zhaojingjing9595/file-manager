import { useState, ReactNode } from "react";
import AuthContext, { User } from "../Context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";

interface Props {
    children: ReactNode
}

export default function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const navigate = useNavigate(); // Hook to handle redirection after successful login

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
      
      if (data) {
        // 4. Handle success (e.g., store backend session/user info, redirect)
        console.log("Backend verification successful!");
        setCurrentUser({email: data.email, id: data.firebase_uid, isAdmin: data.isAdmin})
        navigate('/'); 
        return;
      } 
      console.log("nothing returned", data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Sign-in failed:", error.message);
      } else {
        console.error("Sign-in failed:", String(error));
      }
    }
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    // set token? navigate?
  }
  
  return (
    <AuthContext.Provider value={{
      currentUser,
      onGoogleLogin: handleGoogleSignIn,
      onLogout: handleLogout
      
    }}>
        {children}      
    </AuthContext.Provider>
  )
}
