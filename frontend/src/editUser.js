import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './editUser.css'; // Link to the CSS file for styling
import userIcon from './icons/user1.png';

const EditUser = () => {
  const navigate = useNavigate(); // Hook for navigating between pages

  // State to store user info
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    nic: '',
    tpno: '',
    address: '',
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  // Handle form submission (for saving the edited details)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to handle saving the details (e.g., send data to server or update local state)
    console.log('Updated user details:', userInfo);

    // Redirect to the user account page after saving
    navigate('/userAccount');
  };

  // Handle back button click to return to the UserAccount page
  const handleBack = () => {
    navigate('/userAccount');
  };

  return (
    <div className="edit-user-container">
      <div className="edit-user-profile-picture">
        {/* You can replace this with an actual profile picture */}
        <img src={userIcon} alt="User Avatar" className="avatar" />
      </div>

      <form className="edit-user-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="User name"
          value={userInfo.username}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userInfo.email}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="nic"
          placeholder="NIC"
          value={userInfo.nic}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="tpno"
          placeholder="TPNO"
          value={userInfo.tpno}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={userInfo.address}
          onChange={handleInputChange}
        />

        <div className="button-group">
          {/* Back button */}
          <button type="button" className="back-button" onClick={handleBack}>
            Back
          </button>

          {/* Save button */}
          <button type="submit" className="save-button">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
