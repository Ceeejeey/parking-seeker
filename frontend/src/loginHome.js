import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css'; // Styles for HomePage
import homeIcon from './icons/home.png';
import userIcon from './icons/user.png';
import myLocationIcon from './icons/my_location.png';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbmFrYTA1MzAiLCJhIjoiY20xdWExbDVkMGJ1YTJsc2J6bjFmaTVkNyJ9.H4sWjz4eIt0e6jeScvR5-g';

const HomePage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [vehicleType, setVehicleType] = useState('');
  const parkingRadiusCoordinates = [81.21329762709837, 8.654921177392538]; // Circle radius coordinate
  const parkingCenter = [81.21377704290875, 8.654605843273439]; // Circle center coordinate

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
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: parkingCenter,
      zoom: 18, // Adjusted zoom for better visibility
    });
  
    mapRef.current = map;
  
    // Add navigation controls
    const navControl = new mapboxgl.NavigationControl();
    map.addControl(navControl, 'bottom-right');
  
    // Ensure the map is loaded before interacting with it
    map.on('load', () => {
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
  
      // Get user's current location and add red marker
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.longitude, position.coords.latitude];
          
          // Add red marker for user's location
          new mapboxgl.Marker({ color: 'red' })
            .setLngLat(userLocation)
            .setPopup(
              new mapboxgl.Popup().setHTML('<h3>Your Location</h3><p>This is your current location.</p>')
            )
            .addTo(map);
  
          // Check if the user is inside the parking circle
          const isInsideCircle = isLocationInsideCircle(userLocation, parkingCenter, parkingRadiusCoordinates);
          
          if (isInsideCircle) {
            const popup = new mapboxgl.Popup()
              .setLngLat(userLocation)
              .setHTML('<h3>Do you want to park here?</h3><button>Yes</button><button>No</button>')
              .addTo(map);
            
            // You can add event listeners to the buttons if needed
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    });
  
    return () => map.remove();
  }, []); // Empty dependency array to only run once when the component mounts
  

  const handleVehicleTypeChange = (event) => {
    setVehicleType(event.target.value);
  };

  // Helper function to check if the user's location is inside the parking circle
  const isLocationInsideCircle = (userLocation, center, radiusPoint) => {
    const circleGeoJSON = createCircle(center, radiusPoint);
    const circleCoordinates = circleGeoJSON.coordinates[0];
    const [userLon, userLat] = userLocation;

    let isInside = false;

    // Check if the user location is inside the circle polygon
    const x = userLon;
    const y = userLat;
    const polygon = circleCoordinates.map(coord => [coord[0], coord[1]]);
    const len = polygon.length;

    let j = len - 1;
    for (let i = 0; i < len; i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) isInside = !isInside;
      j = i;
    }

    return isInside;
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
              <option value="motorcycle">Motorcycle</option>
            </select>
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
