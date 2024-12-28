import React, { useState } from 'react';
import axios from 'axios'; // Make sure to install axios if you haven't
import './login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBack = () => {
    window.location.href = '/home'; // Redirect to the previous page (keepers page)
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
  
    try {
      console.log('Sending login request:', { email, password }); // Log what is being sent

      // Make a POST request to your backend login route
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
  
      console.log('Login response:', response.data); // Log the token to verify it's being received
      
      if (response.data.token) {
        console.log('Token received:', response.data.token); // Log the token to verify

        localStorage.setItem('token', response.data.token); // On successful login, save the token in localStorage
        
        window.location.href = '/loginHome'; // Redirect to the loginHome page
      } else {
        setErrorMessage('Login failed: No token received.');
      }
  
    } catch (error) {
      console.log('Login error:', error); // Log any error

      // Handle login error (e.g., invalid credentials)
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }

    console.log('Login form submitted'); // To check if form is submitting
    console.log('Email:', email, 'Password:', password); // To check if email and password are populated
  };
  
  //Handle Keepers login
  const handleKeeperLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    try {
      // Make a POST request to the keeper login route
      const response = await axios.post('http://localhost:5000/api/auth/klogin', {
        email,
        password,
      });
  
      console.log('Keeper login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Save the keeper token in localStorage
        
        window.location.href = '/keepers'; // Redirect to keepers page
      } else {
        setErrorMessage('Keeper login failed: No token received.');
      }
    
    } catch (error) {
      console.log('Keeper login error:', error);
      
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="header">
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        
        <div className="input-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="button-group">
          <button type="submit" className="user-login">User Login</button>
          <button type="button" className="keeper-login" onClick={handleKeeperLogin}>Keeper Login</button>
        </div>
        <div className="signup">
          <p>If you don’t have an account</p>
          <button type="button" className="signup-btn" onClick={() => window.location.href = 'signup'}>Sign Up</button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
