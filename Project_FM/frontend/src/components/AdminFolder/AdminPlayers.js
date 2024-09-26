import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [newPlayer, setNewPlayer] = useState({
    first_name: '',
    last_name: '',
    age: '',
    market_value: '',
    position_id: '',
    team_id: '',
    country_id: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const token = localStorage.getItem('token');

  // Oyuncuları yükleyen fonksiyon
  const loadPlayers = useCallback(async () => {
    try {
      const response = await axios.get('/admin/players', { headers: { Authorization: `Bearer ${token}` } });
      setPlayers(response.data);
    } catch (error) {
      setError("Error loading players");
      console.error(error);
    }
  }, [token]);

  // Takımları yükleyen fonksiyon
  const loadTeams = useCallback(async () => {
    try {
      const response = await axios.get('/admin/teams', { headers: { Authorization: `Bearer ${token}` } });
      setTeams(response.data);
    } catch (error) {
      setError("Error loading teams");
      console.error(error);
    }
  }, [token]);

  // Ülkeleri yükleyen fonksiyon
  const loadCountries = useCallback(async () => {
    try {
      const response = await axios.get('/admin/countries', { headers: { Authorization: `Bearer ${token}` } });
      console.log("Countries loaded:", response.data);
      setCountries(response.data);
    } catch (error) {
      setError("Error loading countries: " + (error.response ? error.response.data : error.message));
      console.error(error);
    }
  }, [token]);
  
  // Verileri yükleyen ana fonksiyon
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([loadPlayers(), loadTeams(), loadCountries()]);
      } catch (error) {
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loadPlayers, loadTeams, loadCountries]);

  // Yeni oyuncu oluşturan fonksiyon
  const createPlayer = async () => {
    if (!newPlayer.first_name || !newPlayer.last_name || !newPlayer.age || !newPlayer.market_value || !newPlayer.position_id || !newPlayer.team_id || !newPlayer.country_id) {
      alert("All player fields are required.");
      return;
    }
    try {
      const response = await axios.post('/admin/players', newPlayer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      resetPlayerForm(); 
      await loadPlayers();
      alert(response.data.message);
    } catch (error) {
      console.error("Error creating player:", error.response ? error.response.data : error.message);
      alert("Error creating player. Please try again.");
    }
  };
  
  // Oyuncu güncelleyen fonksiyon
  const updatePlayer = async (playerId, updatedData) => {
    try {
      if (updatedData.country_id === '') {
        delete updatedData.country_id;
      }
  
      const response = await axios.put(`/admin/players`, {
        player_id: playerId,
        ...updatedData,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message);
      await loadPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
      alert("Error updating player. Please try again.");
    }
  };
  
  // Oyuncu silen fonksiyon
  const deletePlayer = async (player_id) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        const response = await axios.delete('/admin/players', {
          data: { player_id },
          headers: { Authorization: `Bearer ${token}` }
        });
        await loadPlayers();
        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting player:", error.response ? error.response.data : error.message);
        alert("Error deleting player. Please try again.");
      }
    }
  };

  // Oyuncu formunu sıfırlayan fonksiyon
  const resetPlayerForm = () => {
    setNewPlayer({
      first_name: '',
      last_name: '',
      age: '',
      market_value: '',
      position_id: '',
      team_id: '',
      country_id: ''
    });
    setEditingPlayerId(null);
  };

  // Oyuncu düzenleyen fonksiyon
  const editPlayer = (player) => {
    console.log("Editing player:", player);
    setEditingPlayerId(player.id);
    setNewPlayer({
      first_name: player.first_name,
      last_name: player.last_name,
      age: player.age,
      market_value: player.market_value,
      position_id: player.position === "Attacker" ? "1" :
                   player.position === "Midfielder" ? "2" :
                   player.position === "Defender" ? "3" :
                   player.position === "Goalkeeper" ? "4" : "",
      team_id: player.team_id,
      country_id: player.country_id
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>PLAYERS</h2>
      <div>
        <h3>{editingPlayerId ? 'Edit Player' : 'Create New Player'}</h3>
        <input
          type="text"
          value={newPlayer.first_name}
          onChange={(e) => setNewPlayer({ ...newPlayer, first_name: e.target.value })}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          value={newPlayer.last_name}
          onChange={(e) => setNewPlayer({ ...newPlayer, last_name: e.target.value })}
          placeholder="Last Name"
          required
        />
        <input
          type="number"
          value={newPlayer.age}
          onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
          placeholder="Age"
          required
        />
        <input
          type="text"
          value={newPlayer.market_value}
          onChange={(e) => setNewPlayer({ ...newPlayer, market_value: e.target.value })}
          placeholder="Market Value"
          required
        />
        <select
          value={newPlayer.position_id}
          onChange={(e) => setNewPlayer({ ...newPlayer, position_id: e.target.value })}
          required
        >
          <option value="">Select Position</option>
          <option value="1">Attacker</option>
          <option value="2">Midfielder</option>
          <option value="3">Defender</option>
          <option value="4">Goalkeeper</option>
        </select>
        <select
          value={newPlayer.team_id}
          onChange={(e) => setNewPlayer({ ...newPlayer, team_id: e.target.value })}
          required
        >
          <option value="">Select Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <select
          value={newPlayer.country_id}
          onChange={(e) => setNewPlayer({ ...newPlayer, country_id: e.target.value })}
          required
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.id} value={country.id}>{country.country}</option> 
          ))}
        </select>

        {editingPlayerId ? (
          <button onClick={() => updatePlayer(editingPlayerId, newPlayer)}>Update Player</button>
        ) : (
          <button onClick={createPlayer}>Create Player</button>
        )}
      </div>
      <h3>Player List</h3>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Market Value</th>
            <th>Position</th>
            <th>Team ID</th>
            <th>Country ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{player.first_name}</td>
              <td>{player.last_name}</td>
              <td>{player.age}</td>
              <td>{player.market_value}</td>
              <td>{player.position}</td>
              <td>{player.team_id}</td>
              <td>{player.country_id}</td>
              <td>
                <button onClick={() => editPlayer(player)}>Edit</button>
                <button onClick={() => deletePlayer(player.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPlayers;
