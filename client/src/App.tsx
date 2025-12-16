import { Route, Routes } from 'react-router-dom';
import './App.css'
import SignUp from './Pages/Auth/SignUp';
import Login from './Pages/Auth/Login';
import Home from './Pages/Home/Home';
import AuthProvider from './ContextProviders/AuthProvider';

function App() {

  return (
    <AuthProvider>
      <div className='app'>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp/>} />
        </Routes>
    </div>
    </AuthProvider>
  );
}

export default App
