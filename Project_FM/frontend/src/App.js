import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import UserHome from './components/UserFolder/UserHome';
import AdminHome from './components/AdminFolder/AdminHome';

const App = () => {
 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/admin"  element={<AdminHome />} />
      </Routes>
    </Router>
  );
};

export default App;
