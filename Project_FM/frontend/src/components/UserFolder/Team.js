import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const Team = () => {
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [askingPrices, setAskingPrices] = useState({});
  const token = localStorage.getItem('token');

  // Takım verilerini çeken fonksiyon
  const fetchTeamData = useCallback(async () => {
    try {
      const response = await axios.get('/team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeam(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while fetching the team.";
      setError(errorMessage);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTeamData();
    } else {
      setError("You need to be logged in to view the team.");
    }
  }, [token, fetchTeamData]);

  // Oyuncuyu transfer listesine ekleyen fonksiyon
  const addToTransferList = async (playerId) => {
    const asking_price = askingPrices[playerId] || 0;
    if (!asking_price || isNaN(asking_price) || asking_price <= 0) {
      alert("Invalid price.");
      return;
    }
    try {
      const response = await axios.post('/transfer-list', { player_id: playerId, asking_price }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(response.data.message);
      setAskingPrices((prev) => ({ ...prev, [playerId]: '' }));
      fetchTeamData(); 
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while adding to transfer list.";
      setError(errorMessage);
    }
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!team) return <div>Loading...</div>;

  return (
    <div>
      <h1>{team.team_name}</h1>
      <p>Country: {team.country}</p>
      <p>Team Value: ${team.value}</p>
      <h2>Players</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Market Value</th>
            <th>Position</th>
            <th>Country</th>
            <th>Is On Transfer List</th>
            <th>Asking Price</th>
            <th>Add to Transfer List</th>
          </tr>
        </thead>
        <tbody>
          {team.players.map(player => (
            <tr key={player.id}>
              <td>{player.first_name}</td>
              <td>{player.last_name}</td>
              <td>{player.age}</td>
              <td>${player.market_value}</td>
              <td>{player.position || '-'}</td>
              <td>{player.country || '-'}</td>
              <td>{player.is_on_transfer_list ? 'Yes' : 'No'}</td>
              <td>{player.asking_price !== null ? player.asking_price : '-'}</td>
              <td>
                {!player.is_on_transfer_list && (
                  <>
                    <input 
                      type="number" 
                      value={askingPrices[player.id] || ''} 
                      onChange={(e) => setAskingPrices(prev => ({ ...prev, [player.id]: e.target.value }))} 
                      placeholder="Asking Price" 
                    />
                    <button onClick={() => addToTransferList(player.id)}>Add</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Team;
