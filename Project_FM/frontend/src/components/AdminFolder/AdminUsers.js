import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role_id: 2 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await axios.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(response.data);
    } catch (error) {
      setError("Error loading users");
      console.error(error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        await loadUsers();
      } catch (error) {
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loadUsers]);

  const createUser = async () => {
    if (!newUser.email || !newUser.password) {
      alert("Email and password are required.");
      return;
    }
    try {
      const response = await axios.post('/admin/users', newUser, { headers: { Authorization: `Bearer ${token}` } });
      setNewUser({ email: '', password: '', role_id: 2 });
      await loadUsers();
      alert(response.data.message);
    } catch (error) {
      console.error("Error creating user:", error.response ? error.response.data : error.message);
      alert("Error creating user. Please try again.");
    }
  };

  const unblockUser = async (email) => {
    try {
      const response = await axios.post('/admin/unblock_user', { email }, { headers: { Authorization: `Bearer ${token}` } });
      await loadUsers();
      alert(response.data.message);
    } catch (error) {
      console.error("Error unblocking user:", error.response ? error.response.data : error.message);
    }
  };

  const updateUser = async () => {
    try {
      const response = await axios.put(`/admin/users`, 
        { 
          user_id: editingUserId,  
          email: newUser.email,  
          role_id: newUser.role_id,  
          password: newUser.password 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadUsers(); 
      alert(response.data.message); 
      resetUserForm(); 
    } catch (error) {
      console.error("Error updating user:", error); 
      alert("Error updating user. Please try again."); 
    }
  };

  const deleteUser = async (user_id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete('/admin/users', { data: { user_id }, headers: { Authorization: `Bearer ${token}` } });
        await loadUsers();
        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting user:", error.response ? error.response.data : error.message);
      }
    }
  };

  const verifyUser = async (user_id) => {
    try {
      const response = await axios.post(`/admin/users/${user_id}/verify`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await loadUsers();
      alert(response.data.message);
    } catch (error) {
      console.error("Error verifying user:", error.response ? error.response.data : error.message);
      alert("Error verifying user. Please try again.");
    }
  };

  const resetUserForm = () => {
    setNewUser({ email: '', password: '', role_id: 2 });
    setEditingUserId(null);
  };

  const editUser = (user) => {
    setNewUser({ email: user.email, password: '', role_id: user.role_id });
    setEditingUserId(user.id);
  };

  return (
    <div>
      <h2>USERS</h2>
      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h3>{editingUserId ? 'Edit User' : 'Create New User'}</h3>
        <input
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          placeholder="Email"
        />
        <input
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          placeholder="Password"
        />
        <select
          value={newUser.role_id}
          onChange={(e) => setNewUser({ ...newUser, role_id: parseInt(e.target.value) })}
        >
          <option value={2}>User</option>
          <option value={1}>Admin</option>
        </select>
        {editingUserId ? (
          <button onClick={updateUser}>Update User</button>
        ) : (
          <button onClick={createUser}>Create User</button>
        )}
      </div>
      <h3>User List</h3>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Blocked</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role_id === 1 ? 'Admin' : 'User'}</td>
              <td>{user.is_blocked ? 'Yes' : 'No'}</td>
              <td>{user.is_verified ? 'Yes' : 'No'}</td>
              <td>
                {user.is_blocked ? (
                  <button onClick={() => unblockUser(user.email)}>Unblock</button>
                ) : (
                  <>
                     <button onClick={() => editUser(user)}>Edit</button>
                    <button onClick={() => deleteUser(user.id)}>Delete</button>
                    {!user.is_verified && (
                      <button onClick={() => verifyUser(user.id)}>Verify</button>
                    )}
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

export default AdminUsers;
