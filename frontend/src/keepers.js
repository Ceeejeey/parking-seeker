import React, { useEffect, useState } from 'react';
import './keepers.css';

const KeepersPage = () => {
  const TOTAL_SPACES = { cars: 0, bike: 4}; // Hardcoded total spaces

  // State to hold vehicle counts
  const [vehicleData, setVehicleData] = useState({
    parked: { cars: 0, bike: 0 },
    booked: { cars: 0, bike: 0 },
    remain: { cars: TOTAL_SPACES.cars, bike: TOTAL_SPACES.bike },
  });

  const [availability, setAvailability] = useState({ cars: true, bike: true });

  // Function to update availability in the database
  const updateAvailabilityInDatabase = async (availabilityData) => {
    try {
      await fetch('http://localhost:5000/api/keepers/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
           
        },
        body: JSON.stringify(availabilityData),
      });
      console.log('Availability updated successfully:', availabilityData);
    } catch (error) {
      console.error('Error updating availability in the database:', error);
    }
  };

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // Fetch parked vehicles
        const parkedResponse = await fetch('http://localhost:5000/api/parking/park');
        const parkedData = await parkedResponse.json();

        // Fetch booked vehicles
        const bookedResponse = await fetch('http://localhost:5000/api/bookings/booking');
        const bookedData = await bookedResponse.json();

        // Count parked cars and bikes
        const parkedCars = parkedData.filter((item) => item.vehicleType === 'car').length;
        const parkedBike = parkedData.filter((item) => item.vehicleType === 'bike').length;

        // Count booked cars and bikes
        const bookedCars = bookedData.filter((item) => item.vehicleType === 'car').length;
        const bookedBike = bookedData.filter((item) => item.vehicleType === 'bike').length;

        // Calculate remaining spaces
    const remainCars = Math.max(TOTAL_SPACES.cars - (parkedCars + bookedCars), 0); // Ensure no negative values
    const remainBike = Math.max(TOTAL_SPACES.bike - (parkedBike + bookedBike), 0);


        // Update state with fetched data
        setVehicleData({
          parked: { cars: parkedCars, bike: parkedBike },
          booked: { cars: bookedCars, bike: bookedBike },
          remain: { cars: remainCars, bike: remainBike },
        });

        // Update availability state and database
        const updatedAvailability = {
          cars: remainCars > 0,
          bike: remainBike > 0,
        };

        setAvailability(updatedAvailability);

        // Send updated availability to the database
        await updateAvailabilityInDatabase(updatedAvailability);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    fetchVehicleData();
  }, []);

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
        {/* Parked Section */}
        <div className="row">
          <h3>Parked</h3>
          <div className="count-box">
            <div className="count-item">
              <p>Cars</p>
              <input type="number" value={vehicleData.parked.cars} readOnly />
            </div>
            <div className="count-item">
              <p>Bike</p>
              <input type="number" value={vehicleData.parked.bike} readOnly />
            </div>
            <button className="details-button" onClick={() => handleDetails('parked')}>Details</button>
          </div>
        </div>

        {/* Booked Section */}
        <div className="row">
          <h3>Booked</h3>
          <div className="count-box">
            <div className="count-item">
              <p>Cars</p>
              <input type="number" value={vehicleData.booked.cars} readOnly />
            </div>
            <div className="count-item">
              <p>Bike</p>
              <input type="number" value={vehicleData.booked.bike} readOnly />
            </div>
            <button className="details-button" onClick={() => handleDetails('booked')}>Details</button>
          </div>
        </div>

        {/* Remaining Spaces Section */}
        <div className="row">
          <h3>Remain</h3>
          <div className="count-box">
            <div className="count-item">
              <p>Cars</p>
              <input type="number" value={vehicleData.remain.cars} readOnly />
            </div>
            <div className="count-item">
              <p>Bike</p>
              <input type="number" value={vehicleData.remain.bike} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeepersPage;
