import { useEffect } from "react"
import FullPageLoader from "../../Components/FullPageLoader"
import useAuth from "../../Hooks/useAuth"
import AuthForm from "./AuthForm"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const { currentUser, authLoading } = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
        if (currentUser) {
           navigate('/')
       } 
    }, [currentUser, navigate])


    if (!authLoading && !currentUser) { // loading is false and current user is null 
        return (<AuthForm mode="login"/>)
    }
    return (<FullPageLoader/>)
}

export default Login