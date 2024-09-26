import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Designer.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Giriş formunu gönderen fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      console.log(response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ email, role_id: response.data.role_id }));
  
      // Rol kontrolü yapar ve yönlendirir
      if (response.data.role_id === 1) {
        navigate('/admin'); // Admin paneline yönlendirme
      } else {
        navigate('/user-home'); // Kullanıcı paneline yönlendirme
      }
    } catch (error) {
      const errorMsg = error.response ? error.response.data.message : "An error occurred";
      setErrorMessage(errorMsg);
    }
  };

  // Kayıt sayfasına yönlendiren fonksiyon
  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <div>
      <h1 >LOGIN </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
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
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default Login;
