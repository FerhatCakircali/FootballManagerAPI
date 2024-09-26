import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Parola kontrolü
    if (password !== passwordVerify) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post('register', { email, password });
      alert(response.data.message); 
      navigate('/login');
    } catch (error) {
      console.error("Error details:", error); 
      const errorMsg = error.response ? error.response.data.message : "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1 >REGISTER </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="input" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Verify Password"
          value={passwordVerify}
          onChange={(e) => setPasswordVerify(e.target.value)}
          required
        />
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Register</button>
      </form>
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default Register;
