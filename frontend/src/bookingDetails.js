import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './bookingDetails.css'; // Add CSS to style the booking details page

const BookingDetails = () => {
  const [bookingData, setBookingData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch booking data from the backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings/booking');
        setBookingData(response.data); // Assuming response data is an array of bookings
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Unable to fetch booking data. Please try again later.');
      }
    };

    fetchBookings();
  }, []);

  const handleBack = () => {
    // Redirect to the previous page (keepers page)
    window.location.href = '/keepers';
  };

  const handleParkingDetails = () => {
    // Redirect to the Parking Details page
    window.location.href = '/parkingDetails';
  };

  const handleCancel = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/booking/${bookingId}`);
      alert(`Booking with ID: ${bookingId} has been canceled.`);
      setBookingData((prevData) => prevData.filter((booking) => booking._id !== bookingId));
    } catch (err) {
      console.error('Error canceling booking:', err);
      alert('Unable to cancel booking. Please try again.');
    }
  };

  return (
    <div className="booking-details-container">
      <div className="header">
        <button className="back-button" onClick={handleBack}>Back</button>
        <h1>Booking Details</h1>
        <button className="parking-details-button" onClick={handleParkingDetails}>Parking Details</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <table className="booking-details-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Vehicle Type</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Cancel</th>
          </tr>
        </thead>
        <tbody>
          {bookingData.map((booking) => (
            <tr key={booking._id}>
              <td>{booking.username}</td>
              <td>{booking.vehicleType}</td>
              <td>{booking.duration} hours</td>
              <td>{booking.price} LKR</td>
              <td>
                <button
                  className="cancel-button"
                  onClick={() => handleCancel(booking._id)}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingDetails;
