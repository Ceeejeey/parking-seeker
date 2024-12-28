import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './home'; // Assuming your homepage is in HomePage.js
import LoginPage from './login'; // You can create a new component for login or link to your HTML
import SignupPage from './signup';
import KeepersPage from './keepers';
import ParkingDetails from './parkingDetails';
import BookingDetails from './bookingDetails';
import LoginHome from './loginHome';
import UserAccount from './userAccount';
import EditUser from './editUser';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/keepers" element={<KeepersPage />} />
        <Route path="/parkingDetails" element={<ParkingDetails />} />
        <Route path="/bookingDetails" element={<BookingDetails />} />
        <Route path="/loginHome" element={<LoginHome />} />
        <Route path="/userAccount" element={<UserAccount />} />
        <Route path="/editUser" element={<EditUser />} />
      </Routes>
    </Router>
  );
};

export default App;
