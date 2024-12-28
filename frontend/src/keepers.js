import React, { useEffect, useState } from 'react';
import './keepers.css'; // Ensure you create and style the CSS file

const KeepersPage = () => {
  // State to hold vehicle counts
  const [vehicleData, setVehicleData] = useState({
    parked: { cars: 0, bikes: 0 },
    booked: { cars: 0, bikes: 0 },
    remain: { cars: 3, bikes: 2 },
  });

  const [availability, setAvailability] = useState({ cars: true, bikes: true });

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/parking/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ remain: vehicleData.remain })
        });
        const data = await response.json();
        setAvailability({
          cars: data.carsAvailable,
          bikes: data.bikesAvailable,
        });
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    };

    checkAvailability();
  }, [vehicleData.remain]);


  const handleLogout = () => {
    // Handle logout functionality, redirect to login page
    window.location.href = '/login';
  };

  const handleDetails = (type) => {
    // Handle showing details based on type (parked, booked)
    console.log(`Showing details for ${type}`);
    if (type === 'parked') {
      window.location.href = '/parkingDetails'; // Redirect to parking details page
    } else if (type === 'booked') {
      window.location.href = '/bookingDetails'; // Redirect to booking details page
    }
  };

  return (
    <div className="keepers-container">
      <div className="header">
        <h1>Vehicle Count</h1>
        <button className="logout-button" onClick={handleLogout}>Log out</button>
      </div>
      
      <div className="vehicle-count">
        <div className="row">
          <h3>Parked</h3>
          <div className="count-box">
            <div className="count-item">
              <p>Cars</p>
              <input type="number" value={vehicleData.parked.cars} readOnly />
            </div>
            <div className="count-item">
              <p>Bikes</p>
              <input type="number" value={vehicleData.parked.bikes} readOnly />
            </div>
            <button className="details-button" onClick={() => handleDetails('parked')}>Details</button>
          </div>
        </div>

        <div className="row">
          <h3>Booked</h3>
          <div className="count-box">
            <div className="count-item">
              <p>Cars</p>
              <input type="number" value={vehicleData.booked.cars} readOnly />
            </div>
            <div className="count-item">
              <p>Bikes</p>
              <input type="number" value={vehicleData.booked.bikes} readOnly />
            </div>
            <button className="details-button" onClick={() => handleDetails('booked')}>Details</button>
          </div>
        </div>

        <div className="row">
          <h3>Remain</h3>
          <div className="count-box">
            <div className="count-item">
              <p>Cars</p>
              <input type="number" value={vehicleData.remain.cars} readOnly />
            </div>
            <div className="count-item">
              <p>Bikes</p>
              <input type="number" value={vehicleData.remain.bikes} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeepersPage;
