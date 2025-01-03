import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Bookingpark.css'; // Ensure this file includes the enhanced styles
import axios from 'axios';

const BookingPark = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract user, vehicleType, and token from location state
  const { vehicleType, user, token } = location.state || {};
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState(0);
  const [bookingDetails, setBookingDetails] = useState(null); // Store fetched booking details

  const handleDurationChange = (e) => {
    const hours = e.target.value;
    setDuration(hours);
    setPrice(hours * 100); // 100 LKR per hour
  };

  // Fetch existing booking details for the user
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!user?.username || !token) return; // Skip if no user or token is available

      try {
        const response = await axios.get('http://localhost:5000/api/bookings/booking', {
          headers: { Authorization: `Bearer ${token}` },
          params: { username: user.username }, // Pass username as query parameter
        });

        if (response.data) {
          setBookingDetails(response.data);
        } else {
          setBookingDetails(null); // No active bookings found
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setBookingDetails(null);
      }
    };

    fetchBookingDetails();
  }, [user, token]);

  const handleBooking = async () => {
    const newBookingDetails = {
      username: user?.username || 'Unknown User',
      vehicleType,
      duration,
      price,
    };

    try {
      // Make a POST request to save the booking details
      const response = await axios.post('http://localhost:5000/api/bookings/booking', newBookingDetails);
      alert(`Booking confirmed for ${vehicleType} by ${user?.username || 'Unknown User'}. Total price: ${price} LKR`);

      // Navigate back to LoginHome, passing the updated booking details
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
