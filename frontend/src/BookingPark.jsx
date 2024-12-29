import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Bookingpark.css'; // Ensure this file includes the enhanced styles

const BookingPark = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract user and vehicleType from location state
  const { vehicleType, user } = location.state || {};
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState(0);

  const handleDurationChange = (e) => {
    const hours = e.target.value;
    setDuration(hours);
    setPrice(hours * 100); // 100 LKR per hour
  };

  const handleBooking = () => {
    alert(
      `Booking confirmed for ${vehicleType} by ${user?.username || 'Unknown User'}. Total price: ${price} LKR`
    );
    navigate('/'); // Navigate back to the home page or another relevant page
  };

  return (
    <div className="container1">
      <div className="container">
        <h1>Parking Booking</h1>
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
        <form>
          <div>
            <label>
              Duration (hours):
              <input
                type="number"
                value={duration}
                onChange={handleDurationChange}
                min="1"
              />
            </label>
          </div>
          <div className="total-price">
            Total Price: {price} LKR
          </div>
          <button type="button" onClick={handleBooking}>
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPark;
