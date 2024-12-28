import React, { useEffect, useState } from 'react';
import axios from 'axios'; // For making API requests
import './userAccount.css';
import userIcon from './icons/user1.png';

const UserAccount = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Assuming the token is stored in localStorage after login
        const token = localStorage.getItem('token');
        console.log('Token retrieved from localStorage:', token);

        if (!token) {
          setError('User is not authenticated');
          setLoading(false);
          return;
        }

        // Fetch user data from the backend
        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleBack = () => {
    window.location.href = '/loginhome';
  };

  const handleEdit = () => {
    window.location.href = '/editUser';
  };

  if (loading) {
    return <p>Loading user data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="user-account-container">
      <div className="profile-picture">
        <img src={userIcon} alt="User Avatar" className="avatar" />
      </div>
      
      {userInfo && (
        <div className="user-info">
          <h2>{userInfo.username}</h2>
          <p>Email: {userInfo.email}</p>
          <p>NIC: {userInfo.nic}</p>
          <p>TPNO: {userInfo.tpno}</p>
          <p>Address: {userInfo.address}</p>
        </div>
      )}

      <div className="button-group">
        <button className="back-button" onClick={handleBack}>Back</button>
        <button className="edit-button" onClick={handleEdit}>Edit</button>
      </div>
    </div>
  );
};

export default UserAccount;
