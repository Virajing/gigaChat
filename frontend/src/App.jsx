import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import './css/Auth.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import axios from 'axios';
import Profile from './pages/Profile';

function App() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={
          <div className="login-container">
            <h1 className="logo">Giga chat</h1>
            {isSignup ? <SignupForm /> : <LoginForm />}
            <div className="divider">OR</div>
            <div className="signup-link">
              <p>
                {isSignup ? "Have an account?" : "Don't have an account?"}{" "}
                <span onClick={() => setIsSignup(!isSignup)}>
                  {isSignup ? "Log in" : "Sign up"}
                </span>
              </p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
