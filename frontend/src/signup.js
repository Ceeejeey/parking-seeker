import React, { useState } from 'react';
import axios from 'axios'; // Import axios for HTTP requests
import './signup.css'; 

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nic: '',        
    tpno: '',       
    address: ''     
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    try {
      // Make POST request to signup route
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        nic: formData.nic,
        tpno: formData.tpno,
        address: formData.address,
        password: formData.password
      });

      if (response.status === 200) {
        setSuccessMessage('Signup successful! Please login.');
        setErrorMessage('');
        // Optionally, redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      // Handle errors from the backend
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred during signup. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="nic"
            placeholder="NIC"
            value={formData.nic}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="tpno"
            placeholder="Telephone Number"
            value={formData.tpno}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="signup-button">Sign Up</button>
        </div>
        <div className="login-redirect">
          <p>Already have an account?</p>
          <button
            type="button"
            className="login-btn"
            onClick={() => window.location.href = '/login'}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
