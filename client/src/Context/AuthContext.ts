import { createContext } from "react";

export interface User {
    id: string;
    email: string;
    isAdmin: boolean;
}

export interface AuthContextType {
    currentUser: User | null;
    token: string | null;
    onGoogleLogin: () => Promise<void>;
    onLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default AuthContext