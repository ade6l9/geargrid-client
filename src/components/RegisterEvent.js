import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/RegisterEvent.css";
import { Helmet } from 'react-helmet';

const initialCarState = {
  make: "",
  model: "",
  year: "",
  color: "",
  mileage: "",
  modified: "No",
  clubMember: "No",
};

const RegisterEvent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;
  const editMode = location.state?.editMode;
  const userEmailForEdit = location.state?.userEmail;

  const [registrantDetails, setRegistrantDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agree: false,
  });
  const [cars, setCars] = useState([{ ...initialCarState }]);
  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem('userEmail');
    if (!editMode && loggedInUserEmail) {
      setRegistrantDetails(prev => ({ ...prev, email: loggedInUserEmail }));
    }

    if (editMode && event?.id && userEmailForEdit) {
      setIsLoading(true);
      setError("");
      const fetchRegistrationDetails = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/get-registration-details?eventId=${event.id}&email=${userEmailForEdit}`, {
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch registration details.");
          }
          if (data.success && data.registrationDetails) {
            const { cars: fetchedCars, ...fetchedRegistrantDetails } = data.registrationDetails;
            setRegistrantDetails({
              id: fetchedRegistrantDetails.id,
              firstName: fetchedRegistrantDetails.firstName || "",
              lastName: fetchedRegistrantDetails.lastName || "",
              email: fetchedRegistrantDetails.email || "",
              phone: fetchedRegistrantDetails.phone || "",
              agree: fetchedRegistrantDetails.agree !== undefined ? fetchedRegistrantDetails.agree : true,
            });
            setCars(fetchedCars && fetchedCars.length > 0 ? fetchedCars.map(car => ({...initialCarState, ...car})) : [{ ...initialCarState }]);
            setActiveCarIndex(0);
          } else {
            setError(data.message || "Could not load existing registration data.");
          }
        } catch (err) {
          console.error("Error fetching registration details:", err);
          setError(err.message || "Error loading your registration. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchRegistrationDetails();
    } else if (editMode) {
        setError("Could not enter edit mode: Event ID or User Email missing.");
    }
  }, [editMode, event?.id, userEmailForEdit, location.state]);

  const handleRegistrantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegistrantDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCarChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCars = cars.map((car, i) =>
      i === index ? { ...car, [name]: value } : car
    );
    setCars(updatedCars);
  };

  const addCar = () => {
    if (cars.length >= 5) {
      setError("You can register a maximum of 5 vehicles.");
      return;
    }

    setCars([...cars, { ...initialCarState }]);
    setActiveCarIndex(cars.length);
    setError("");
  };

  const removeCar = (index) => {
    if (cars.length <= 1) {
      setError("You must register at least one car.");
      return;
    }
    const updatedCars = cars.filter((_, i) => i !== index);
    setCars(updatedCars);
    setActiveCarIndex(prevIndex => Math.max(0, Math.min(prevIndex, updatedCars.length - 1)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!event || !event.id) {
      setError("Event information is missing. Cannot register.");
      setIsLoading(false);
      return;
    }
    if (!registrantDetails.firstName || !registrantDetails.lastName || !registrantDetails.email) {
        setError("Please fill in your First Name, Last Name, and Email.");
        setIsLoading(false);
        return;
    }
    if (!registrantDetails.agree) {
        setError("You must agree to the terms to register.");
        setIsLoading(false);
        return;
    }
    if (cars.some(car => !car.make || !car.model || !car.year)) {
        setError("Please provide Make, Model, and Year for each car.");
        setIsLoading(false);
        return;
    }

    const loggedInUserId = localStorage.getItem('userId');

    const registrationPayload = {
      ...registrantDetails,
      eventId: event.id,
      cars: cars,
      userId: loggedInUserId || null,
    };

    const endpoint = editMode 
      ? `http://localhost:3001/api/update-event-registration/${registrantDetails.id}`
      : 'http://localhost:3001/api/register-event';
    
    const method = editMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload),
        credentials: 'include', 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setSuccess(true);
        localStorage.setItem(`event_${event.id}_${registrantDetails.email}_registered`, 'true');
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setError(error.message || `Failed to ${editMode ? 'update' : 'submit'} registration.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return <p>No event selected. Please go back to Events and choose an event.</p>;
  if (isLoading) return <div className="loading-container"><p>Loading registration details...</p></div>;

  const currentCar = cars[activeCarIndex] || {};

  return (
    <div className="register-event-container wide">
      <div className="register-card wide-card">
        {!success ? (
          <>
            <Helmet>
              <link
                href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap"
                rel="stylesheet"
              />
            </Helmet>
            <h2 className="wide-title">{editMode ? `Edit Your Registration for ${event.name}` : `Register for ${event.name}`}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="register-form two-column">
              {[
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["email", "Email"],
                ["phone", "Phone"],
              ].map(([name, label]) => (
                <div key={name} className="form-group">
                  <label>{label}:</label>
                  <input
                    type={name === "email" ? "email" : "text"}
                    name={name}
                    value={registrantDetails[name]}
                    onChange={handleRegistrantChange}
                    required={name === "firstName" || name === "lastName" || name === "email"}
                  />
                </div>
              ))}

              <hr className="section-divider" />
              
              <div className="cars-section-header">
                <h3>Vehicle Details</h3>
                <div className="car-tabs">
                  {cars.map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`car-tab-button ${index === activeCarIndex ? "active" : ""}`}
                      onClick={() => setActiveCarIndex(index)}
                    >
                      Vehicle {index + 1}
                    </button>
                  ))}
                  {cars.length < 5 && (
                    <button type="button" className="add-car-button" onClick={addCar}>+ Add Vehicle</button>
                  )}
                </div>
              </div>

              {cars.length > 0 && (
                <div className="car-form-fields">
                   <div className="form-group car-field">
                    <label>Car Make:</label>
                    <input type="text" name="make" value={currentCar.make || ""} onChange={(e) => handleCarChange(activeCarIndex, e)} required />
                  </div>
                  <div className="form-group car-field">
                    <label>Car Model:</label>
                    <input type="text" name="model" value={currentCar.model || ""} onChange={(e) => handleCarChange(activeCarIndex, e)} required />
                  </div>
                  <div className="form-group car-field">
                    <label>Color:</label>
                    <input type="text" name="color" value={currentCar.color || ""} onChange={(e) => handleCarChange(activeCarIndex, e)} />
                  </div>
                  <div className="form-group car-field">
                    <label>Mileage:</label>
                    <input type="number" name="mileage" value={currentCar.mileage || ""} onChange={(e) => handleCarChange(activeCarIndex, e)} />
                  </div>
                  <div className="form-group car-field">
                    <label>Year:</label>
                    <select name="year" value={currentCar.year || ""} onChange={(e) => handleCarChange(activeCarIndex, e)} required>
                      <option value="">Select Year</option>
                      {[...Array(new Date().getFullYear() - 1900 + 1)].map((_, i) => {
                        const yearValue = new Date().getFullYear() - i;
                        return <option key={yearValue} value={yearValue}>{yearValue}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div className="form-group car-field">
                    <label>Is this a modified vehicle?</label>
                    <select name="modified" value={currentCar.modified || "No"} onChange={(e) => handleCarChange(activeCarIndex, e)}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div className="form-group car-field">
                    <label>Are you part of a car club?</label>
                    <select name="clubMember" value={currentCar.clubMember || "No"} onChange={(e) => handleCarChange(activeCarIndex, e)}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  {cars.length > 1 && (
                    <button type="button" className="remove-car-button" onClick={() => removeCar(activeCarIndex)}>Remove Vehicle {activeCarIndex + 1}</button>
                  )}
                </div>
              )}
              
              <hr className="section-divider" />

              <div className="form-group full-width checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="agree"
                    checked={registrantDetails.agree}
                    onChange={handleRegistrantChange}
                    required
                  /> I agree to have my build featured publicly if selected
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? (editMode ? 'Updating...' : 'Submitting...') : (editMode ? 'Update Registration' : 'Submit Registration')}
                </button>
                <button type="button" className="cancel-btn" onClick={() => navigate("/events")} disabled={isLoading}>Cancel</button>
              </div>
            </form>
          </>
        ) : (
          <div className="confirmation-box receipt">
            <h2>✅Registration {editMode ? 'Updated' : 'Confirmed'}!</h2>
            <p>Thank you, <strong>{registrantDetails.firstName} {registrantDetails.lastName}</strong>.</p>
            <p>You've officially {editMode ? 'updated your registration' : 'registered'} for <strong>{event.name}</strong>.</p>
            <div className="receipt-details">
              <p><strong>Email:</strong> {registrantDetails.email}</p>
              <p><strong>Phone:</strong> {registrantDetails.phone}</p>
              <p><strong>Event Date:</strong> {event.time}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <h4>Registered Vehicles:</h4>
              {cars.map((car, index) => (
                <div key={index} className="receipt-car-details">
                  <p><strong>Vehicle {index + 1}:</strong> {car.year} {car.make} {car.model} ({car.color})</p>
                  <p>Mileage: {car.mileage}, Modified: {car.modified}, Club Member: {car.clubMember}</p>
                </div>
              ))}
              <p><strong>Consent to Feature:</strong> {registrantDetails.agree ? "Yes" : "No"}</p>
            </div>
            <button className="submit-btn" onClick={() => navigate("/events")}>Back to Events</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterEvent;
