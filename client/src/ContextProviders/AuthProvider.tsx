import { useState, ReactNode } from "react";
import AuthContext, { User } from "../Context/AuthContext";

interface Props {
    children: ReactNode
}

export default function AuthProvider({ children }: Props) {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    
  return (
    <AuthContext.Provider value={ {currentUser, setCurrentUser}}>
        {children}      
    </AuthContext.Provider>
  )
}
