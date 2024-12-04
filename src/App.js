import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Alert from './components/Alert';
import Dashboard from './components/Dashboard';
import IndividualReg from './components/IndividualReg';
import AuthenticationCard from './components/AuthenticationCard';
import AuthenticationCardCNN from './components/AuthenticationCardCNN';
import IndividualRegCNN from './components/IndividualRegCNN';
import UserProfile from './components/UserProfile';
import GroupAuthentication from './components/GroupAuthentication';
import History from './components/History';

function App() {
  const [alert, setAlert] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      <BrowserRouter>
        <Alert alert={alert} />
        <Routes>
          <Route path="/" element={<Signup showAlert={showAlert} />} />
          <Route path="/login" element={<Login showAlert={showAlert} onLogin={handleLogin} />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/individualregistration" element={<IndividualReg />} />
          <Route path="/individualregistrationcnn" element={<IndividualRegCNN />} />
          <Route path="/individualauthentication" element={<AuthenticationCard />} />
          <Route path="/individualauthenticationcnn" element={<AuthenticationCardCNN />} />
          <Route path="/groupauthentication" element={<GroupAuthentication />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
