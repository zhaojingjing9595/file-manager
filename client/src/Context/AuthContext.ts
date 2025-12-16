import { createContext } from "react";

export interface User {
    id: string;
    email: string;
}

export interface AuthContextType {
    currentUser: User | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default AuthContext