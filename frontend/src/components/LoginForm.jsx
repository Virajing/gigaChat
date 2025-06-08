import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authRedirect from '../hooks/authRedirect'; // ✅ Correct import

function LoginForm() {
  authRedirect(); // ✅ Hook called at the top

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    try {
      const res = await axios.post('http://localhost:3000/login', {
        username,
        password
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        navigate('/dashboard');
      } else {
        alert(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Log in</button>
    </form>
  );
}

export default LoginForm;
