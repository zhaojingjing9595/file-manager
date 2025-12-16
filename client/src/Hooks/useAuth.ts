import { useContext } from "react"
import AuthContext from "../Context/AuthContext"

function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context
}

export default useAuth