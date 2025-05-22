import React, { useEffect, useState } from "react";
import { Link, useNavigate} from "react-router-dom"; 
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import "../css/Businesses.css";

const Businesses = () => {
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); //centers on USA
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/businesses");
        const data = await response.json();
        if (data.success) {
          setBusinesses(data.businesses);
        } else {
          console.error("Failed to fetch businesses:", data.message);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };
    fetchBusinesses();
  }, []);

  const geocodeAddress = async (address) => {
    if (!API_KEY) {
      console.error("Google Maps API Key is missing.");
      return null;
    }
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
      const data = await response.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].geometry.location;
      } else {
        console.error("Geocoding failed:", data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error("Error calling Geocoding API:", error);
      return null;
    }
  };

  const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return Infinity;
    const R = 3963; //radius of Earth in miles
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSearch = async () => {
    setSelectedBusiness(null);
    const searchRadiusMiles = 25;
    let geocodedUserLoc = null;

    if (address.trim()) {
      geocodedUserLoc = await geocodeAddress(address);
      if (geocodedUserLoc) {
        setUserLocation(geocodedUserLoc);
        setMapCenter(geocodedUserLoc);
        setMapZoom(10);
      } else {
        console.error("Could not find coordinates for the address entered.");
        setUserLocation(null);
      }
    } else {
      setUserLocation(null); //clear user location if no address given
      setMapCenter({ lat: 39.8283, lng: -98.5795 });
      setMapZoom(4);
    }

    const filtered = businesses.filter((business) => {
      const categoryMatch = category ? business.category.toLowerCase() === category.toLowerCase() : true;

      let distanceMatch = true;
      //this "if" is only for if a user location is found
      if (geocodedUserLoc) {
        if (!business.latitude || !business.longitude) {
          distanceMatch = false;
        } else {
          const businessLoc = { lat: parseFloat(business.latitude), lng: parseFloat(business.longitude) };
          const distance = calculateDistance(geocodedUserLoc, businessLoc);
          distanceMatch = distance <= searchRadiusMiles;
        }
      }
      //if no address was entered, geocodedUserLoc is null, distanceMatch stays true

      return categoryMatch && distanceMatch;
    });
    setFilteredBusinesses(filtered);
    setSearchPerformed(true);
  };

  if (!API_KEY) {
    return <div className="error-message">Google Maps API Key is missing. Please configure it in your environment variables.</div>;
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="businesses-container">
        <h2>Find a Business</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter ZIP code: "
            value={address}
            onChange={handleAddressChange}
            className="address-input"
          />
          <select
            value={category}
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="">All Categories</option>
            <option value="Maintenance & Repairs">Maintenance & Repairs</option>
            <option value="Cosmetic & Detailing">Cosmetic & Detailing</option>
            <option value="Upgrades & Customization">Upgrades & Customization</option>
            <option value="Emergency & Support Services">Emergency & Support Services</option>
            <option value="Motorcycle Services">Motorcycle Services</option>
            <option value="Truck & Off-Road Services">Truck & Off-Road Services</option>
          </select>
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>

        {userLocation && (
          <div style={{ height: '500px', width: '100%', marginTop: '20px', marginBottom: '20px' }}>
            <Map
              mapId={'YOUR_MAP_ID'}
              defaultCenter={mapCenter}
              defaultZoom={mapZoom}
              //center={mapCenter} //these 2 are commented out bc they mess up pan/zoom, might be bug idk
              //zoom={mapZoom}
              gestureHandling={'greedy'}
            >
              {/* <AdvancedMarker position={userLocation} title={'Your Location'}>
                <span style={{ fontSize: '2.5rem' }}>📍</span>
              </AdvancedMarker> */}

              {filteredBusinesses.map((business) => (
                business.latitude && business.longitude ? (
                  <AdvancedMarker
                    key={business.id || business.name}
                    position={{ lat: parseFloat(business.latitude), lng: parseFloat(business.longitude) }}
                    title={business.name}
                    onClick={() => setSelectedBusiness(business)}
                  />
                ) : null
              ))}

              {selectedBusiness && selectedBusiness.latitude && selectedBusiness.longitude && (
                  <InfoWindow
                    position={{ lat: parseFloat(selectedBusiness.latitude), lng: parseFloat(selectedBusiness.longitude) }}
                    onCloseClick={() => setSelectedBusiness(null)}
                  >
                    <div>
                      <h3>
                        <Link to={`/businesses/${encodeURIComponent(selectedBusiness.name)}`}>
                          {selectedBusiness.name}
                        </Link>
                      </h3>
                        <p>{selectedBusiness.address}</p>
                        <p><strong>Category:</strong> {selectedBusiness.category}</p>
                    </div>
                  </InfoWindow>
              )}
            </Map>
          </div>
        )}



        <div className="businesses-list">
          {!searchPerformed ? (
            <p> Enter an address and/or select a category, then click "Search". </p>
          ) : filteredBusinesses.length === 0 ? (
            <p> No businesses found matching your criteria. </p>
          ) : (
            filteredBusinesses.map((business, index) => (
              <div key={index} className="business-card">
                 <h3>
                  <Link to={`/businesses/${encodeURIComponent(business.name)}`}>
                    {business.name}
                  </Link>
                </h3>
                <p>
                  <strong>Category:</strong> {business.category}
                </p>
                <p>
                  <strong>Address:</strong> {business.address}
                </p>
                {business.description && <p>{business.description}</p>}
              </div>
            ))
          )}
        </div>
        <div className="add-business-link-container">
          <p>Want to list your business on GearGrid? Click here!</p>
          <button onClick={() => navigate('/add-business')} className="add-business-button">
            Add Your Business
          </button>
        </div>
      </div>
    </APIProvider>
  );
};

export default Businesses;