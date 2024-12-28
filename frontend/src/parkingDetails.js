import React, { useState } from 'react';
import './parkingDetails.css'; 

const ParkingDetails = () => {
  // State to hold the parking details data (Example data, you can replace it with real data from an API or database)
  const [parkingDetails, setParkingDetails] = useState([
    {
      username: 'John Doe',
      vehicleType: 'Car',
      startTime: '09:00 AM',
      stopTime: '12:00 PM',
      parkedTime: '3 hours',
      price: '$15.00',
    },
    {
      username: 'Jane Smith',
      vehicleType: 'Bike',
      startTime: '10:00 AM',
      stopTime: '1:00 PM',
      parkedTime: '3 hours',
      price: '$10.00',
    },
  ]);

  const handleStop = (index) => {
    // Logic to stop the parked vehicle time (you can implement the actual logic here)
    const updatedDetails = [...parkingDetails];
    updatedDetails[index].stopTime = 'Now'; // Example of updating the stop time
    setParkingDetails(updatedDetails);
  };

  const goBack = () => {
    // Logic to go back to the previous page (Keepers page)
    window.location.href = '/keepers'; // Or use React Router navigation
  };

  const viewBookingDetails = () => {
    // Logic to view booking details page
    window.location.href = '/bookingDetails'; // Or use React Router navigation
  };

  return (
    <div className="parking-details-container">
      <div className="header">
        <button className="back-button" onClick={goBack}>Back</button>
        <h1>Parking Details</h1>
        <button className="booking-details-button" onClick={viewBookingDetails}>Booking Details</button>
      </div>

      <table className="parking-table">
        <thead>
          <tr>
            <th>User name</th>
            <th>Vehicle Type</th>
            <th>Start Time</th>
            <th>Stop Timer</th>
            <th>Parked Time</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {parkingDetails.map((detail, index) => (
            <tr key={index}>
              <td>{detail.username}</td>
              <td>{detail.vehicleType}</td>
              <td>{detail.startTime}</td>
              <td>
                <button className="stop-button" onClick={() => handleStop(index)}>Stop</button>
              </td>
              <td>{detail.parkedTime}</td>
              <td>{detail.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParkingDetails;
