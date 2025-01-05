import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './parkingDetails.css';

const ParkingDetails = () => {
  const [parkingDetails, setParkingDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupDetails, setPopupDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const fetchParkingLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parking/park');
      const logs = response.data;

      // Include `stopped` records and format timestamps
      const formattedLogs = logs.map((log) => ({
        ...log,
        startTime: new Date(log.startTime).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        stopTime: log.stopTime
          ? new Date(log.stopTime).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
          : null, // Show null for active records
      }));

      setParkingDetails(formattedLogs);
    } catch (err) {
      console.error('Error fetching parking logs:', err);
      setError('Failed to fetch parking logs. Please try again.');
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchParkingLogs();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load parking details. Please try again.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const calculatePrice = (startTime, vehicleType) => {
    const start = new Date(startTime);
    const end = new Date();
    const duration = Math.ceil((end - start) / (1000 * 60 * 60)); // Hours
    const price = vehicleType === 'car' ? duration * 100 : vehicleType === 'bike' ? duration * 50 : 0;
    return { duration, price };
  };

  const handleStop = async (index) => {
    const detail = parkingDetails[index];
    const { duration, price } = calculatePrice(detail.startTime, detail.vehicleType);

    try {
      const stopTime = new Date().toISOString();
      const updatedDetail = { ...detail, stopTime, duration, price };

      // Update the record on the server
      await axios.put(`http://localhost:5000/api/parking/park/${detail._id}`, updatedDetail);

      // Update the frontend state
      setParkingDetails((prevDetails) =>
        prevDetails.map((item, i) => (i === index ? updatedDetail : item))
      );

      // Show popup with details
      setPopupDetails(updatedDetail);
      setShowPopup(true);
    } catch (err) {
      console.error('Error stopping timer:', err);
      alert('Failed to stop timer. Please try again.');
    }
  };

  const removeRecord = async (index) => {
    const detailToRemove = parkingDetails[index];

    try {
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
      const response = await axios.get('http://localhost:5000/api/parking/logs', {
        responseType: 'json',
      });
      const logs = response.data;

      const formattedLogs = logs.map((log) => ({
        ...log,
        startTime: new Date(log.startTime).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        stopTime: log.stopTime
          ? new Date(log.stopTime).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
          : 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedLogs);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Parking Logs');
      XLSX.writeFile(workbook, 'ParkingLogs.xlsx');
    } catch (err) {
      console.error('Error downloading logs:', err);
      alert('Failed to download logs. Please try again.');
    }
  };

  const goBack = () => {
    window.location.href = '/keepers';
  };

  const viewBookingDetails = () => {
    window.location.href = '/bookingDetails';
  };

  const closePopup = () => {
    setShowPopup(false);
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
              <td>{detail.startTime}</td>
              <td>
                {detail.stopTime ? (
                  'Stopped'
                ) : (
                  <button className="stop-button" onClick={() => handleStop(index)}>Stop</button>
                )}
              </td>
              <td>{detail.duration ? `${detail.duration} Hours` : 'N/A'}</td>
              <td>{detail.price || 'N/A'}</td>
              <td>
                {detail.stopTime && (
                  <button className="remove-button" onClick={() => removeRecord(index)}>Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup for displaying parking details */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Parking Details</h2>
            <p><strong>Username:</strong> {popupDetails.username}</p>
            <p><strong>Vehicle Type:</strong> {popupDetails.vehicleType}</p>
            <p><strong>Start Time:</strong> {popupDetails.startTime}</p>
            <p><strong>Stop Time:</strong> {popupDetails.stopTime ? new Date(popupDetails.stopTime).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }) : 'N/A'}</p>
            <p><strong>Duration:</strong> {popupDetails.duration} Hours</p>
            <p><strong>Price:</strong> ${popupDetails.price}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingDetails;
