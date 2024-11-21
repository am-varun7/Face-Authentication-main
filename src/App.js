import './App.css';
import { useState } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Signup from './components/Signup';
import Login from './components/Login';
import Alert from './components/Alert';
import Dashboard from './components/Dashboard';
import IndividualReg  from './components/IndividualReg';
import AuthenticationCard from './components/AuthenticationCard';


function App() {
  const [alert, setAlert] = useState(null)
  const [isLoggedIn, setIsLoggedIn]=  useState(false)
  const showAlert = (message,type) =>{
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  }

  
  const handleLogin = () => {
    setIsLoggedIn(true); // Update login status
  };



  return (
    <>
    <BrowserRouter>
    <Alert alert = {alert} />
    {/* { window.location.pathname !== '/signup' && window.location.pathname !== '/login'&& <Navbar />} */}
    <Routes>
      <Route path='/signup' element={<Signup showAlert={showAlert}/>}/>
      <Route path='/login' element={<Login showAlert={showAlert} onLogin={handleLogin}/>}/>
      <Route path='/' element={<Dashboard />}/>
      <Route path='/individualregistration' element={<IndividualReg/>}/>
      <Route path='/individualauthentication' element={<AuthenticationCard/>}/>
    </Routes>
    </BrowserRouter>
    
    </>
  );
}

export default App;
