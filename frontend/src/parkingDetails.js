import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './parkingDetails.css';

const ParkingDetails = () => {
  const [parkingDetails, setParkingDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupDetails, setPopupDetails] = useState(null);

  useEffect(() => {
    const fetchParkingDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/parking/park'); // Replace with your actual endpoint
        setParkingDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching parking details:', err);
        setError('Failed to fetch parking details. Please try again.');
        setLoading(false);
      }
    };

    fetchParkingDetails();
  }, []);

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const calculatePrice = (startTime, vehicleType) => {
    const start = new Date(startTime);
    const end = new Date();
    const duration = Math.ceil((end - start) / (1000 * 60 * 60));
    const price = vehicleType === 'car' ? duration * 100 : vehicleType === 'bike' ? duration * 50 : 0;
    return { duration, price };
  };

  const handleStop = (index) => {
    const detail = parkingDetails[index];
    const { duration, price } = calculatePrice(detail.startTime, detail.vehicleType);

    setPopupDetails({
      ...detail,
      duration,
      price,
      index,
    });
  };

  const confirmStop = () => {
    const { index, duration, price } = popupDetails;

    setParkingDetails((prevDetails) =>
      prevDetails.map((detail, i) =>
        i === index ? { ...detail, duration, price } : detail
      )
    );

    setPopupDetails(null);
  };

  const removeRecord = async (index) => {
    const detailToRemove = parkingDetails[index];

    try {
      const { username, vehicleType, startTime } = detailToRemove;
      const stopTime = new Date().toISOString();
      const { duration, price } = detailToRemove;

      const archiveData = {
        username,
        vehicleType,
        startTime,
        stopTime,
        duration,
        price,
      };

      await axios.post('http://localhost:5000/api/parking/archive', archiveData);
      await axios.delete(`http://localhost:5000/api/parking/park/${detailToRemove._id}`);

      const updatedDetails = parkingDetails.filter((_, i) => i !== index);
      setParkingDetails(updatedDetails);
    } catch (err) {
      console.error('Error removing record:', err);
      alert('Failed to remove record. Please try again.');
    }
  };

  const downloadLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parking/log', {
        responseType: 'json',
      });

      const logs = response.data;

      const worksheet = XLSX.utils.json_to_sheet(logs);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Parking Logs');

      XLSX.writeFile(workbook, 'ParkingLogs.xlsx');
    } catch (err) {
      console.error('Error fetching logs:', err);
      alert('Failed to download logs. Please try again.');
    }
  };

  const goBack = () => {
    window.location.href = '/keepers';
  };

  const viewBookingDetails = () => {
    window.location.href = '/bookingDetails';
  };

  if (loading) {
    return <div>Loading parking details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="parking-details-container">
      <div className="header">
        <button className="back-button" onClick={goBack}>Back</button>
        <h1>Parking Details</h1>
        <button className="booking-details-button" onClick={viewBookingDetails}>Booking Details</button>
        <button className="download-logs-button" onClick={downloadLogs}>Download Logs</button>
      </div>

      <table className="parking-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Vehicle Type</th>
            <th>Start Time</th>
            <th>Stop Timer</th>
            <th>Parked Time</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parkingDetails.map((detail, index) => (
            <tr key={index}>
              <td>{detail.username}</td>
              <td>{detail.vehicleType}</td>
              <td>{formatTime(detail.startTime)}</td>
              <td>
                {!detail.duration ? (
                  <button className="stop-button" onClick={() => handleStop(index)}>Stop</button>
                ) : (
                  'Stopped'
                )}
              </td>
              <td>{detail.duration ? `${detail.duration} Hours` : 'N/A'}</td>
              <td>{detail.price || 'N/A'}</td>
              <td>
                {detail.duration && (
                  <button className="remove-button" onClick={() => removeRecord(index)}>Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {popupDetails && (
        <div className="popup">
          <div className="popup-content">
            <h3>Parking Details</h3>
            <p>User Name: {popupDetails.username}</p>
            <p>Vehicle Type: {popupDetails.vehicleType}</p>
            <p>Parked Time: {popupDetails.duration} Hours</p>
            <p>Total Price: {popupDetails.price} LKR</p>
            <button onClick={confirmStop}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingDetails;
