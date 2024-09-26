import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUsers from './AdminUsers'; 
import AdminTeams from './AdminTeams'; 
import AdminPlayers from './AdminPlayers'; 

const AdminPanel = () => {
  const [activeTab, setActiveTab]  = useState('users');
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');

  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendirir
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


return (
  <div style={{ position: 'relative' }}> 
      <h1>ADMIN PANEL</h1>
       <div>
        <button onClick={() => setActiveTab('users')}>Users</button>
        <button onClick={() => setActiveTab('teams')}>Teams</button>
        <button onClick={() => setActiveTab('players')}>Players</button>
        <button id="exitButton" onClick={handleLogout}>EXIT</button>
      </div>
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'teams' && <AdminTeams />}
      {activeTab === 'players' && <AdminPlayers />}
    </div>    
);

};

export default AdminPanel;
