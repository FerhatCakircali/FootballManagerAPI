import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: '', user_id: '', country: '' });
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

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
        await Promise.all([loadTeams(), loadCountries()]);
      } catch (error) {
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loadTeams, loadCountries]);

  // Yeni takım oluşturan fonksiyon
  const createTeam = async () => {
    if (!newTeam.name || !newTeam.user_id || !newTeam.country) {
      alert("Team name, user ID and country are required.");
      return;
    }
    try {
      const response = await axios.post('/admin/teams', newTeam, { headers: { Authorization: `Bearer ${token}` } });
      setNewTeam({ name: '', user_id: '', country: '' });
      await loadTeams();
      alert(response.data.message);
    } catch (error) {
      console.error("Error creating team:", error.response ? error.response.data : error.message);
      alert("Error creating team. Please try again.");
    }
  };

  // Takım güncelleyen fonksiyon
  const updateTeam = async () => {
    try {
      const response = await axios.put(`/admin/teams`, 
          { team_id: editingTeamId, ...newTeam }, 
          { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadTeams();
      alert(response.data.message);
      resetTeamForm();
    } catch (error) {
      console.error("Error updating team:", error);
      alert("Error updating team. Please try again.");
    }
  };

  // Takım silen fonksiyon
  const deleteTeam = async (team_id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const response = await axios.delete('/admin/teams', { data: { team_id }, headers: { Authorization: `Bearer ${token}` } });
        await loadTeams();
        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting team:", error.response ? error.response.data : error.message);
      }
    }
  };

  // Takım formunu sıfırlayan fonksiyon
  const resetTeamForm = () => {
    setNewTeam({ name: '', user_id: '', country: '' });
    setEditingTeamId(null);
  };

  // Takım düzenleyen fonksiyon
  const editTeam = (team) => {
    setNewTeam({ name: team.name, user_id: team.user_id, country: team.country });
    setEditingTeamId(team.id);
  };

  return (
    <div>
      <h2>TEAMS</h2>
      <div>
        <h3>{editingTeamId ? 'Edit Team' : 'Create New Team'}</h3>
        <input
          type="text"
          value={newTeam.name}
          onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          placeholder="Team Name"
        />
        <input
          type="text"
          value={newTeam.user_id}
          onChange={(e) => setNewTeam({ ...newTeam, user_id: e.target.value })}
          placeholder="User ID"
        />
        <select 
          value={newTeam.country}
          onChange={(e) => setNewTeam({ ...newTeam, country: e.target.value })}
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.id} value={country.country}>{country.country}</option>
          ))}
        </select>
        {editingTeamId ? (
          <button onClick={updateTeam}>Update Team</button>
        ) : (
          <button onClick={createTeam}>Create Team</button>
        )}
      </div>
      <h3>Team List</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>User ID</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>{team.user_id}</td>
                <td>{team.country}</td>
                <td>
                  <button onClick={() => editTeam(team)}>Edit</button>
                  <button onClick={() => deleteTeam(team.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTeams;
