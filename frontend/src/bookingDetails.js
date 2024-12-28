import React from 'react';
import './bookingDetails.css'; // Add CSS to style the booking details page

const BookingDetails = () => {

  const handleBack = () => {
    // Redirect to the previous page (keepers page)
    window.location.href = '/keepers';
  };

  const handleParkingDetails = () => {
    // Redirect to the Parking Details page
    window.location.href = '/parkingDetails';
  };

  const handleCancel = (bookingId) => {
    // Functionality to cancel the booking
    console.log(`Canceling booking with ID: ${bookingId}`);
    // Implement cancellation logic here
  };

  // Sample data for bookings
  const bookingData = [
    { id: 1, userName: 'John Doe', vehicleType: 'Car', bookedTime: '2 hours' },
  ];

  return (
    <div className="booking-details-container">
      <div className="header">
        <button className="back-button" onClick={handleBack}>Back</button>
        <h1>Booking Details</h1>
        <button className="parking-details-button" onClick={handleParkingDetails}>Parking Details</button>
      </div>
      
      <table className="booking-details-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Vehicle Type</th>
            <th>Booked Time</th>
            <th>Cancel</th>
          </tr>
        </thead>
        <tbody>
          {bookingData.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.userName}</td>
              <td>{booking.vehicleType}</td>
              <td>{booking.bookedTime}</td>
              <td>
                <button className="cancel-button" onClick={() => handleCancel(booking.id)}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingDetails;
