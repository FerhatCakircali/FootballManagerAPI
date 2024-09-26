import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransferMarket = () => {
  const [transferList, setTransferList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Transfer listesini getirir
  useEffect(() => {
    const fetchTransferList = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/transfer-list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransferList(response.data);
      } catch (error) {
        const errorMessage = error.response
          ? error.response.data.message
          : "An error occurred while fetching the transfer list.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTransferList();
  }, [token]);

  // Oyuncuyu takıma ekleyen fonksiyon
  const addToTeamList = async (playerId) => {
    try {
      const response = await axios.post(`/transfer/${playerId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message);
      setTransferList((prevPlayers) => 
        prevPlayers.filter(player => player.id !== playerId)
      );
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message
        : "An error occurred while transferring.";
      setError(errorMessage);
    }
  };

  // Transfer listesinden oyuncuyu kaldıran fonksiyon
  const removeFromTransferList = async (playerId) => {
    if (window.confirm("Are you sure you want to remove this player from the transfer list?")) {
      try {
        const response = await axios.post(`/remove-from-transfer-list/${playerId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert(response.data.message);

        setTransferList((prevPlayers) => 
          prevPlayers.map(player => 
            player.id === playerId ? { ...player, is_on_transfer_list: false, asking_price: null } : player
          )
        );
      } catch (error) {
        const errorMessage = error.response
          ? error.response.data.message
          : "An error occurred while removing from the transfer list.";
        setError(errorMessage);
      }
    }
  };
   // Transfer listesini "Remove" olanları en üstte gösterecek şekilde sıralar
   const sortedTransferList = transferList.sort((a, b) => {
    return (b.can_remove ? 1 : 0) - (a.can_remove ? 1 : 0);
  });

  // Sıralama fonksiyonu
  const sortPlayers = (key, ascending) => {
    const sortedPlayers = [...transferList].sort((a, b) => {
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return ascending ? a[key] - b[key] : b[key] - a[key];
      }
      return ascending ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
    });
    setTransferList(sortedPlayers);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Transfer Market</h2>
      {sortedTransferList.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>
                Age 
                <button id="age-asc" onClick={() => sortPlayers('age', true)} style={{ color: '#FFFFF',}}>↑</button>
                <button id="age-desc" onClick={() => sortPlayers('age', false)} style={{ color: '#FFFFF' }}>↓</button>
              </th>
              <th>
                Market Value 
                <button id="value-asc" onClick={() => sortPlayers('market_value', true)} style={{ color: '#FFFFF' }}>↑</button>
                <button id="value-desc" onClick={() => sortPlayers('market_value', false)} style={{ color: '#FFFFF' }}>↓</button>
              </th>
              <th>
                Position 
                <button id="position-asc" onClick={() => sortPlayers('position', true)} style={{ color: '#FFFFF' }}>↑</button>
                <button id="position-desc" onClick={() => sortPlayers('position', false)} style={{ color: '#FFFFF' }}>↓</button>
              </th>
              <th>
                Country 
                <button id="country-asc" onClick={() => sortPlayers('country', true)} style={{ color: '#FFFFF' }}>↑</button>
                <button id="country-desc" onClick={() => sortPlayers('country', false)} style={{ color: '#FFFFF' }}>↓</button>
              </th>
              <th>
                Team 
                <button id="team-asc" onClick={() => sortPlayers('team', true)} style={{ color: '#FFFFF' }}>↑</button>
                <button id="team-desc" onClick={() => sortPlayers('team', false)} style={{ color: '#FFFFF' }}>↓</button>
              </th>
              <th>Asking Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transferList.map(player => (
              <tr key={player.id}>
                <td>{player.first_name}</td>
                <td>{player.last_name}</td>
                <td>{player.age}</td>
                <td>${player.market_value}</td>
                <td>{player.position || '-'}</td>
                <td>{player.country || '-'}</td>
                <td>{player.team || '-'}</td>
                <td>{player.asking_price || '-'}</td>
                <td>
                  {player.can_remove ? (
                    <button onClick={() => removeFromTransferList(player.id)}>Remove</button>
                  ) : (
                    <button onClick={() => addToTeamList(player.id)}>Add to Team List</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No players found in the transfer list.</p>
      )}
    </div>
  );
};

export default TransferMarket;
