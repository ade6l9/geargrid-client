import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Events.css";
import { Helmet } from 'react-helmet';

const Events = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        
        const response = await fetch('http://localhost:3001/api/events' , {
          credentials: 'include',
        });
        
        const data = await response.json();
        if (data.success) {
          setEvents(data.events);
        } else {
          console.error('Failed to fetch events:', data.message);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleRegisterClick = async (event) => {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
      alert('Please log in to register for events.');
      return;
    }

    try {
      console.log('Attempting to check registration for event:', event.id, 'with email:', userEmail);
      const response = await fetch('http://localhost:3001/api/check-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: event.id, 
          email: userEmail
        }),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
    
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
        }
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.registered) { 
        localStorage.setItem(`event_${event.id}_${userEmail}_registered`, 'true');
        alert(data.message + " We'll take you to edit your registration.");
        navigate("/register", { state: { event, editMode: true, userEmail: userEmail } });
        return;
      }

      navigate("/register", { state: { event } });
    } catch (error) {
      console.error('Error checking registration:', error);
      alert('Failed to check registration status.');
    }
  };

  const handleEditClick = (event) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert('Please log in to edit your registration.');
      return;
    }
    navigate("/register", { state: { event, editMode: true, userEmail: userEmail } });
  };

  return (
    <div className="events-page">
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <h1 className="events-title">Upcoming Car Events</h1>

      <div className="events-container">
        {events.map((event, index) => {
          const userEmail = localStorage.getItem('userEmail');
          let isRegistered = userEmail && localStorage.getItem(`event_${event.id}_${userEmail}_registered`) === 'true';

          if (!isRegistered && userEmail && event.registrations) {
            isRegistered = event.registrations.some(reg => reg.email === userEmail);
            if (isRegistered) {
              localStorage.setItem(`event_${event.id}_${userEmail}_registered`, 'true');
            }
          }

          return (
            <div key={index} className="event">
              <img src={event.image_url} alt={event.name} className="event-image" />
              <div className="event-details">
                <h2 className="event-name">{event.name}</h2>
                <p className="event-description">{event.description}</p>
                <div className="event-info">
                  <span>⏰ {event.time ? new Date(event.time).toLocaleString() : 'Date TBD'}</span>
                  <span>📍 {event.location || 'Location TBD'}</span>
                  <span>🏆 {event.organizer || 'Organizer TBD'}</span>
                </div>
                <button
                  className="register-button"
                  onClick={() => isRegistered ? handleEditClick(event) : handleRegisterClick(event)} 
                >
                  {isRegistered ? "Edit Registration ✏️" : "Register Now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="organize-event-section">
        <p className="organize-event-prompt">Want to organize an event on GearGrid ? Click bellow!</p>
        <button 
          onClick={() => navigate('/organize-event')} 
          className="organize-event-toggle-button"
        >
          Organize an Event
        </button>
      </div>
    </div>
  );
};

export default Events;
