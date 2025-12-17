import { useState, ReactNode, useEffect } from "react";
import AuthContext, { User } from "../Context/AuthContext";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface Props {
    children: ReactNode
}

export default function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate(); // Hook to handle redirection after successful login

  useEffect(() => {
    // This listener runs every time the page loads
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("onAuthStateChanged firebaseUser:",firebaseUser)
        try {
          // 1. Get the ID Token (for your API calls)
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // 2. Fetch the extra user data from db
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // 3. Set custom user object
          setCurrentUser({email: userData.email, id: userData.uid, isAdmin: userData.isAdmin})
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        // User is logged out
        setCurrentUser(null);
        setToken(null);
      }
      // setLoading(false); // Authentication check finished
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      // 1. Authenticate with Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Reference to the user document in Firestore
      const userRef = doc(db, "users", user.uid);
    
      // Check if user already exists to avoid overwriting 'isAdmin'
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
      // NEW USER: Create the document
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: false, // Default to false for security
          createdAt: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      }, { merge: true }); // 'merge: true' is CRITICAL so you don't delete 'isAdmin'
    }
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
        setToken(idToken)
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
    setToken(null);
    //  navigate?
  }
  
  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      onGoogleLogin: handleGoogleSignIn,
      onLogout: handleLogout
      
    }}>
        {children}      
    </AuthContext.Provider>
  )
}
