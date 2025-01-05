import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Bookingpark.css'; // Ensure this file includes the enhanced styles
import axios from 'axios';

const BookingPark = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract user, vehicleType, and token from location state
  const { vehicleType, user, token } = location.state || {};

  const handleBooking = async () => {
    const newBookingDetails = {
      username: user?.username || 'Unknown User',
      vehicleType,
    };

    try {
      // Make a POST request to save the booking details
      const response = await axios.post('http://localhost:5000/api/bookings/booking', newBookingDetails);
      alert(`Booking confirmed for ${vehicleType} by ${user?.username || 'Unknown User'}.`);
      
      // Navigate back to LoginHome
      navigate('/loginHome', { state: { vehicleType, user, token, bookingDetails: response.data } });
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('An error occurred while saving the booking. Please try again.');
    }
  };

  return (
    <div className="container1">
      <div className="container">
        <h1>Parking Booking</h1>

        {/* Display user and vehicle details */}
        {user?.username ? (
          <div>
            <label>User Name:</label>
            <span>{user.username}</span>
          </div>
        ) : (
          <p>No user information provided</p>
        )}
        {vehicleType ? (
          <div>
            <label>Vehicle Type:</label>
            <span>{vehicleType}</span>
          </div>
        ) : (
          <p>No vehicle type selected</p>
        )}

        {/* Display fixed price ranges */}
        <div className="price-info">
          <p>Prices:</p>
          <ul>
            <li>Car: 100 LKR per hour</li>
            <li>Bike: 50 LKR per hour</li>
          </ul>
        </div>

        <button type="button" onClick={handleBooking}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default BookingPark;
