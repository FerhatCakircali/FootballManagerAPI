import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Team from './Team';
import TransferMarket from './TransferMarket'; 
import TransferList from './TransferList'; 



const UserHome = () => {
  const [userInfo, setUserInfo] = useState(null); // Kullanıcı bilgilerini saklamak için
  const [activeTab, setActiveTab] = useState('teamInfo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendirir
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Kullanıcı bilgilerini çek
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfoResponse = await axios.get('/user-info', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(userInfoResponse.data);
      } catch (error) {
        const errorMessage = error.response ? error.response.data.message : "An error occurred while fetching user info.";
        setError(errorMessage);
        if (error.response.status === 401 || error.response.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token, navigate]);

  // Çıkış işlemi
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

return (
    <div style={{ position: 'relative' }}> 
        <h1>USER PANEL</h1>
        <button onClick={() => setActiveTab('teamInfo')}>Team Information</button>
        <button onClick={() => setActiveTab('transferMarket')}>Transfer Market</button>
        <button onClick={() => setActiveTab('transferList')}>Transfer List</button>
        <button onClick={() => setActiveTab('userInfo')}>User Information</button>
        <button id="exitButton" onClick={handleLogout}>EXIT</button>

        {activeTab === 'teamInfo' && <Team />}
        {activeTab === 'transferMarket' && <TransferMarket />} 
        {activeTab === 'transferList' && <TransferList />} 
        {activeTab === 'userInfo' && userInfo && (
            <div>
                <h2>User Information</h2>
                <p>Email: {userInfo.email}</p>
                <p>Budget:  ${userInfo.team_budget}</p>
                <p>Team Value: ${userInfo.team_value}</p>
            </div>
        )}
    </div>
);
  
};

export default UserHome;
