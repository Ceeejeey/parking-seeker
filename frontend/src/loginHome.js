import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css'; // Styles for HomePage
import homeIcon from './icons/home.png';
import userIcon from './icons/user.png';
import myLocationIcon from './icons/my_location.png';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbmFrYTA1MzAiLCJhIjoiY20xdWExbDVkMGJ1YTJsc2J6bjFmaTVkNyJ9.H4sWjz4eIt0e6jeScvR5-g';

const HomePage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [vehicleType, setVehicleType] = useState('');
  const parkingRadiusCoordinates = [81.21329762709837, 8.654921177392538]; // Circle radius coordinate
  const parkingCenter = [81.21377704290875, 8.654605843273439]; // Circle center coordinate
  const rectangleCoordinates = [
    [81.21376106874192, 8.654654196901934],
    [81.21382946506576, 8.654602489383553],
    [81.21379325524725, 8.654556085194333],
    [81.2137241883712, 8.654607792719089],
  ];
  // Hardcoded user location inside park 
  const userLocation = [81.21377366005822, 8.654610816180755]; 
  // Hardcoded user location inside circle
 //const userLocation = [81.21360098376982, 8.654650313807098];
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [firstTimerEnded, setFirstTimerEnded] = useState(false);
  const { token, bookingDetails } = location.state || {};


  useEffect(() => {
    const checkForActiveParking = async () => {
      const parkingRecords = await fetchParkingRecords();
  
      // Check if there are any active parking records
      if (parkingRecords && parkingRecords.length > 0) {
        console.log('Active parking record found:', parkingRecords);
        clearExistingTimer(); // Stop the timer if an active parking record exists
      } else {
        console.log('No active parking record found.');
      }
    };
  
    checkForActiveParking();
  }, []);
  
  const fetchParkingRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parking/park', {
        headers: { Authorization: `Bearer ${token}` }, // Add authorization header if needed
      });
      return response.data; // Assuming the backend sends an array of parking records
    } catch (error) {
      console.error('Error fetching parking records:', error);
      return [];
    }
  };
  

  // Fetch user data from backend
  useEffect(() => {
    console.log('BookingDetails:', bookingDetails);
    const fetchUser = async () => {
      try {
        if (!token) {
          throw new Error('No token provided');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`http://localhost:5000/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser((prevUser) => {
          // Only update if the data is different
          if (JSON.stringify(prevUser) !== JSON.stringify(response.data)) {
            return response.data;
          }
          return prevUser;
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message || 'An error occurred.');
      }
    };

    fetchUser();
  }, [token]); // Ensure no unnecessary state changes

  // Function to start the first timer
  const startTimer = (durationInSeconds) => {
    if (isTimerRunning || firstTimerEnded) return; // Block if already running or first timer has ended

    const expiryTime = new Date().getTime() + durationInSeconds * 1000;
    localStorage.setItem('parkingTimerExpiry', expiryTime.toString());

    setCountdown(durationInSeconds);
    setIsTimerRunning(true);
  };

  // Function to start the second timer
  const startSecondTimer = (durationInSeconds) => {
    const expiryTime = new Date().getTime() + durationInSeconds * 1000;
    console.log('Starting second timer with expiry:', new Date(expiryTime));

    // Clear the first timer's localStorage and set the second timer's expiry
    localStorage.removeItem('parkingTimerExpiry');
    localStorage.setItem('secondTimerExpiry', expiryTime.toString());

    setCountdown(durationInSeconds);
    setIsTimerRunning(true);
  };

  // Function to clear timers from localStorage
  const clearTimerFromLocalStorage = () => {
    localStorage.removeItem('parkingTimerExpiry');
    localStorage.removeItem('secondTimerExpiry');
  };

  // Function to handle the expiration of the first timer
  const handleFirstTimerExpiration = async () => {
    console.log('First timer expired. Showing popup...');
    setFirstTimerEnded(true); // Block the first timer after it ends
    const activeParkingData = await fetchActiveParking();
    console.log('Active parking data id:', activeParkingData);
    if (!activeParkingData._id) {
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
    <h3>Do you still want to park here?</h3>
    <button id="yes-button">Yes</button>
    <button id="no-button">No</button>
  `;

      let popup;
      if (mapRef.current) {
        popup = new mapboxgl.Popup()
          .setLngLat(userLocation)
          .setDOMContent(popupContent)
          .addTo(mapRef.current);
      }

      const yesButton = popupContent.querySelector('#yes-button');
      const noButton = popupContent.querySelector('#no-button');

      const handleYesClick = () => {
        popup?.remove();
        startSecondTimer(3 * 60); // Start the second timer (3 minutes)
      };

      const handleNoClick = async () => {
        popup?.remove();
        clearExistingTimer();

        try {
          await axios.delete(`http://localhost:5000/api/bookings/booking/${bookingDetails.booking._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert('Booking cancelled successfully.');
        } catch (error) {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking.');
        }
      };

      yesButton.addEventListener('click', handleYesClick);
      noButton.addEventListener('click', handleNoClick);
    }
  };

  // Function to handle the expiration of the second timer
  const handleSecondTimerExpiration = async () => {
    console.log('Second timer expired. Cancelling booking...');
    clearExistingTimer();

    try {
      await axios.delete(`http://localhost:5000/api/bookings/booking/${bookingDetails.booking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Second timer expired. Booking has been cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking after the timer expired.');
    }
  };

  // Function to clear the existing timer
  const clearExistingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
    setCountdown(0);
    clearTimerFromLocalStorage();
  };

  // Hook to manage the first timer
  useEffect(() => {
    console.log('useEffect triggered for first timer.');

    const savedExpiry = localStorage.getItem('parkingTimerExpiry');
    if (savedExpiry && !firstTimerEnded) {
      const expiryTime = parseInt(savedExpiry, 10);
      const timeRemaining = Math.floor((expiryTime - new Date().getTime()) / 1000);

      if (timeRemaining > 0) {
        console.log('First timer is active. Time remaining:', timeRemaining);
        setCountdown(timeRemaining);
        setIsTimerRunning(true);
      } else {
        console.log('First timer expired. Clearing localStorage.');
        clearTimerFromLocalStorage();
        handleFirstTimerExpiration();
      }
    }

    if (isTimerRunning && countdown > 0 && !localStorage.getItem('secondTimerExpiry')) {
      console.log('First timer running with countdown:', countdown);
      if (!timerRef.current) {
        console.log('Starting first timer...');
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            console.log('First timer countdown tick:', prev);
            if (prev <= 1) {
              console.log('First timer expired. Clearing timer and triggering handler.');
              clearInterval(timerRef.current);
              timerRef.current = null;
              setIsTimerRunning(false);

              handleFirstTimerExpiration();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current && !localStorage.getItem('secondTimerExpiry')) {
        console.log('Cleaning up first timer on unmount or state change...');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, countdown, firstTimerEnded]);

  // Hook to manage the second timer
  useEffect(() => {
    console.log('useEffect triggered for second timer.');

    const savedSecondExpiry = localStorage.getItem('secondTimerExpiry');
    if (savedSecondExpiry) {
      const expiryTime = parseInt(savedSecondExpiry, 10);
      const timeRemaining = Math.floor((expiryTime - new Date().getTime()) / 1000);

      if (timeRemaining > 0) {
        console.log('Second timer is active. Time remaining:', timeRemaining);
        setCountdown(timeRemaining);
        setIsTimerRunning(true);
      } else {
        console.log('Second timer expired. Clearing localStorage.');
        clearTimerFromLocalStorage();
        handleSecondTimerExpiration();
      }
    }

    if (isTimerRunning && countdown > 0 && localStorage.getItem('secondTimerExpiry')) {
      console.log('Second timer running with countdown:', countdown);
      if (!timerRef.current) {
        console.log('Starting second timer...');
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            console.log('Second timer countdown tick:', prev);
            if (prev <= 1) {
              console.log('Second timer expired. Clearing timer and triggering handler.');
              clearInterval(timerRef.current);
              timerRef.current = null;
              setIsTimerRunning(false);

              handleSecondTimerExpiration();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current && localStorage.getItem('secondTimerExpiry')) {
        console.log('Cleaning up second timer on unmount or state change...');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, countdown]);

  // Helper function to generate a circle as a GeoJSON polygon
  const createCircle = (center, radiusPoint, points = 64) => {
    try {
      const coords = [];
      const earthRadius = 6371000; // Earth's radius in meters

      const lat1 = (center[1] * Math.PI) / 180;
      const lon1 = (center[0] * Math.PI) / 180;
      const lat2 = (radiusPoint[1] * Math.PI) / 180;
      const lon2 = (radiusPoint[0] * Math.PI) / 180;

      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const radiusInMeters = earthRadius * c;

      for (let i = 0; i < points; i++) {
        const angle = (i * 360) / points;
        const angleRad = (angle * Math.PI) / 180;
        const latitude = Math.asin(
          Math.sin(lat1) * Math.cos(radiusInMeters / earthRadius) +
          Math.cos(lat1) * Math.sin(radiusInMeters / earthRadius) * Math.cos(angleRad)
        );
        const longitude =
          lon1 +
          Math.atan2(
            Math.sin(angleRad) * Math.sin(radiusInMeters / earthRadius) * Math.cos(lat1),
            Math.cos(radiusInMeters / earthRadius) - Math.sin(lat1) * Math.sin(latitude)
          );
        coords.push([longitude * (180 / Math.PI), latitude * (180 / Math.PI)]);
      }
      coords.push(coords[0]); // Close the polygon
      return {
        type: 'Polygon',
        coordinates: [coords],
      };
    } catch (error) {
      console.error('Error creating circle:', error);
      return null;
    }
  };

  useEffect(() => {

    if (!mapContainerRef.current) {
      console.error('Map container is not available.');
      return;
    }

    // Initialize the map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: parkingCenter,
      zoom: 18,
    });

    const map = mapRef.current;

    // Add navigation controls
    const navControl = new mapboxgl.NavigationControl();
    map.addControl(navControl, 'bottom-right');

    // Ensure the map is loaded before interacting with it
    map.on('load', async () => {
      console.log('Map loaded successfully.');

      // Generate the circle GeoJSON data
      const circleGeoJSON = createCircle(parkingCenter, parkingRadiusCoordinates);

      if (!circleGeoJSON) {
        console.error('Failed to create parking circle GeoJSON.');
        return;
      }

      // Add the source for the circle
      map.addSource('parking-circle', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: circleGeoJSON,
          properties: {
            len: 1000, // Example property
            reflen: 6, // Example property
          },
        },
      });

      // Add fill layer for the circle
      map.addLayer({
        id: 'parking-circle-fill',
        type: 'fill',
        source: 'parking-circle',
        paint: {
          'fill-color': '#90EE90', // Light green
          'fill-opacity': 0.5,
        },
      });

      // Add outline layer for the circle
      map.addLayer({
        id: 'parking-circle-outline',
        type: 'line',
        source: 'parking-circle',
        paint: {
          'line-color': '#006400', // Dark green
          'line-width': 2,
        },
      });

      // Add a green marker at the center of the circle
      new mapboxgl.Marker({ color: '#008000' }) // Green marker
        .setLngLat(parkingCenter)
        .setPopup(
          new mapboxgl.Popup().setHTML('<h3>Parking Center</h3><p>This is the center of the parking area.</p>')
        )
        .addTo(map);

      console.log('Parking circle and layers added.');



      // Add red marker for user's location
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(userLocation)
        .setPopup(
          new mapboxgl.Popup().setHTML('<h3>Your Location</h3><p>This is your current location.</p>')
        )
        .addTo(map);


      (async () => {
        // Fetch active booking and location status
        const activeBookingData = await fetchActiveBookings();

        let hasActiveBooking = Array.isArray(activeBookingData) && activeBookingData.length > 0;

        // Store the state in localStorage
        localStorage.setItem('hasActiveBooking', JSON.stringify(hasActiveBooking));

        const isInsideCircle = isLocationInsideCircle(userLocation, parkingCenter, parkingRadiusCoordinates);
        const isOutsideRectangle = !isLocationInsidePolygon(userLocation, rectangleCoordinates);
        const activeParkingData = await fetchActiveParking();

        // Show the popup only if inside the circle, outside the rectangle, and no active booking
        if (isInsideCircle && isOutsideRectangle && !hasActiveBooking && !activeParkingData._id) {
          const popupContent = document.createElement('div');

          popupContent.innerHTML = `
                  <h3>Do you want to park here?</h3>
                  <p><b>Choose vehicle type before press Yes</b></p>
                  <button id="yes-button">Yes</button>
                  <button id="no-button">No</button>
                `;

          const popup = new mapboxgl.Popup()
            .setLngLat(userLocation)
            .setDOMContent(popupContent)
            .addTo(map);

          // Attach event listener to the Yes button
          popupContent.querySelector('#yes-button').addEventListener('click', () => {
            navigate('/bookingPark', { state: { vehicleType, user, token } });
            localStorage.setItem('hasActiveBooking', JSON.stringify(true)); // Update localStorage
            startTimer(2 * 60); // Start the timer
          });

          // Optionally handle the No button
          popupContent.querySelector('#no-button').addEventListener('click', () => {
            popup.remove(); // Close the popup if "No" is clicked
          });
        }

        console.log('Has active booking:', hasActiveBooking);
      })();

      (async () => {
        // Retrieve the booking state from localStorage
        const hasActiveBooking = JSON.parse(localStorage.getItem('hasActiveBooking') || 'false');
        const isInsideCircle = isLocationInsideCircle(userLocation, parkingCenter, parkingRadiusCoordinates);
        const isOutsideRectangle = !isLocationInsidePolygon(userLocation, rectangleCoordinates);
        const activeParkingData = await fetchActiveParking();
        // Show popup or start timer based on conditions
        if (hasActiveBooking) {
          // Directly start the timer if there's an active booking
          startTimer(2 * 60); // 2 minutes
        } else if (isInsideCircle && isOutsideRectangle && !activeParkingData._id && !hasActiveBooking) {
          // Show popup only if inside the circle and outside the rectangle
          const popupContent = document.createElement('div');

          popupContent.innerHTML = `
                  <h3>Do you want to park here?</h3>
                   <p><b>Choose vehicle type before press Yes</b></p>
                  <button id="yes-button">Yes</button>
                  <button id="no-button">No</button>
               `;

          const popup = new mapboxgl.Popup()
            .setLngLat(userLocation)
            .setDOMContent(popupContent)
            .addTo(map);

          // Attach event listener to the Yes button
          popupContent.querySelector('#yes-button').addEventListener('click', () => {
            navigate('/bookingPark', { state: { vehicleType, user, token } });
            localStorage.setItem('hasActiveBooking', JSON.stringify(true)); // Set it as true after confirmation
            startTimer(2 * 60); // Start the timer
          });

          // Optionally handle the No button
          popupContent.querySelector('#no-button').addEventListener('click', () => {
            popup.remove(); // Close the popup if "No" is clicked
          });
        }
      })();


      const activeBooking = await fetchActiveBooking();

      if (activeBooking && activeBooking._id && isLocationInsidePolygon(userLocation, rectangleCoordinates)) {
        const popupContent = document.createElement('div');

        popupContent.innerHTML = `
            <h3>You reached the park</h3>
            <button id="park-button">Park Here</button>
            <button id="leave-button">Leave</button>
          `;

        const popup = new mapboxgl.Popup()
          .setLngLat(userLocation)
          .setDOMContent(popupContent)
          .addTo(map);

          popupContent.querySelector('#park-button').addEventListener('click', async () => {
            try {
              const { _id, username, vehicleType } = activeBooking;
          
              await axios.post('http://localhost:5000/api/parking/park', {
                _id,
                username,
                vehicleType,
                startTime: new Date(),
              });
          
              alert('Parked successfully');
              popup.remove();
          
              // Stop and hide the timer
              clearExistingTimer(); // This function clears the timer and resets state
              console.log('Timer stopped and hidden after parking.');
            } catch (error) {
              console.error('Error parking vehicle:', error);
              alert('Failed to park vehicle.');
            }
          });
          

        popupContent.querySelector('#leave-button').addEventListener('click', () => {
          popup.remove();
        });
      }


    });


    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [vehicleType, user]); // Dependency array includes vehicleType

  const handleVehicleTypeChange = (event) => {
    setVehicleType(event.target.value);
  };

  // Helper function to check if a location is inside a polygon
  const isLocationInsidePolygon = (userLocation, polygon) => {
    const [userLon, userLat] = userLocation;
    let isInside = false;

    const len = polygon.length;
    let j = len - 1;

    for (let i = 0; i < len; i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersect =
        yi > userLat !== yj > userLat &&
        userLon < ((xj - xi) * (userLat - yi)) / (yj - yi) + xi;
      if (intersect) isInside = !isInside;
      j = i;
    }
    console.log('user is inside the park: ' + isInside)
    return isInside;
  };

  // Check for active booking
  const fetchActiveBooking = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/details?username=${user.username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Active booking:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active booking:', error);
      return null;
    }
  };
  const fetchActiveBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/booking', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Active booking:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active booking:', error);
      return null;
    }
  };
  const fetchActiveParking = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/parking/details?username=${user.username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Active booking:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active booking:', error);
      return null;
    }
  };
  // Helper function to check if the user's location is inside the parking circle
  const isLocationInsideCircle = (userLocation, center, radiusPoint) => {
    const [userLon, userLat] = userLocation;
    const [centerLon, centerLat] = center;
    const [radiusLon, radiusLat] = radiusPoint;

    const earthRadius = 6371000; // Earth's radius in meters

    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const dLat = toRadians(userLat - centerLat);
    const dLon = toRadians(userLon - centerLon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(centerLat)) * Math.cos(toRadians(userLat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c; // Distance in meters

    // Calculate radius from center to radiusPoint
    const radiusDLat = toRadians(radiusLat - centerLat);
    const radiusDLon = toRadians(radiusLon - centerLon);
    const aRadius =
      Math.sin(radiusDLat / 2) * Math.sin(radiusDLat / 2) +
      Math.cos(toRadians(centerLat)) * Math.cos(toRadians(radiusLat)) *
      Math.sin(radiusDLon / 2) * Math.sin(radiusDLon / 2);
    const cRadius = 2 * Math.atan2(Math.sqrt(aRadius), Math.sqrt(1 - aRadius));
    const radius = earthRadius * cRadius;

    // Check if user's location is within the circle
    return distance <= radius;
  };


  return (
    <div className="homepage">
      <div className="sidebar">
        <div className="sidebar-icon">
          <img
            src={userIcon}
            alt="User Icon"
            className="user-icon"
            onClick={() => navigate('/userAccount')}
          />
          <img src={homeIcon} alt="Home Icon" />
          <button className="login-button" onClick={() => navigate('/login')}>
            Log Out
          </button>
        </div>
      </div>

      <div className="main-content">

        <div ref={mapContainerRef} className="map-background"></div>

        <div className="top-bar">
          <div className="vehicle-type-container">
            <select
              className="vehicle-type"
              value={vehicleType}
              onChange={handleVehicleTypeChange}
            >
              <option value="" disabled>
                Vehicle Type
              </option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
            {countdown > 0 && (
              <div className="timer-display">
                Time remaining: {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, "0")}
              </div>
            )}
          </div>
        </div>
        <button className="my-location-button">
          <img src={myLocationIcon} alt="My Location" className="my-location-icon" />
        </button>
      </div>
    </div>
  );
};

export default HomePage;

