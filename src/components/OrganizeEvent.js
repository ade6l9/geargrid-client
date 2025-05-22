import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/OrganizeEvent.css';
import { Helmet } from 'react-helmet';

const OrganizeEvent = () => {
    const navigate = useNavigate();
    const [organizerFormData, setOrganizerFormData] = useState({
        name: "",
        description: "",
        time: "",
        location: "",
        theme: "",
        organizer: "",
        image_url: "",
        organizer_email: localStorage.getItem('userEmail') || ""
    });
    const [organizerSubmitted, setOrganizerSubmitted] = useState(false);
    const [organizerError, setOrganizerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOrganizerInputChange = (e) => {
        const { name, value } = e.target;
        setOrganizerFormData({ ...organizerFormData, [name]: value });
    };

    const handleOrganizerSubmit = async (e) => {
        e.preventDefault();
        setOrganizerError("");
        setOrganizerSubmitted(false);
        setIsSubmitting(true);

        if (!organizerFormData.name || !organizerFormData.description || !organizerFormData.time || !organizerFormData.location) {
            setOrganizerError("Please fill in all required fields: Name, Description, Time, and Location.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('https://formspree.io/f/xyzwvpqo', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(organizerFormData),
            });

        if (response.ok) {
            setOrganizerSubmitted(true);
            setOrganizerFormData({
            name: "", description: "", time: "", location: "", theme: "",
            organizer: "", image_url: "", organizer_email: localStorage.getItem('userEmail') || ""
            });
        } else {
            const errorData = await response.json();
            setOrganizerError(errorData.error || 'An error occurred while submitting the form.');
        }
        } catch (error) {
        console.error('Error submitting event:', error);
        setOrganizerError('An error occurred. Please try again.');
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <div className="organize-event-page">
            <Helmet>
                <title>Organize an Event - GearGrid</title>
                <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap" rel="stylesheet" />
            </Helmet>
            <div className="organize-event-container">
                <div className="back-button-wrapper">
                    <button onClick={() => navigate(-1)} className="back-button">← Back</button>
                </div>
                <h2>Organize an Event</h2>
                <p>Fill out the details below to organize a new event for the community.</p>

                {organizerSubmitted && <div className="success-message">Event organization submitted successfully! Thank you.</div>}
                {organizerError && <div className="error-message">{organizerError}</div>}
        
                {!organizerSubmitted && (
                    <form onSubmit={handleOrganizerSubmit} className="organize-event-form">
                        <div className="form-group">
                            <label>Event Name *</label>
                            <input type="text" name="name" value={organizerFormData.name} onChange={handleOrganizerInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description *</label>
                            <textarea name="description" value={organizerFormData.description} onChange={handleOrganizerInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Date and Time *</label>
                            <input type="datetime-local" name="time" value={organizerFormData.time} onChange={handleOrganizerInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Location *</label>
                            <input type="text" name="location" value={organizerFormData.location} onChange={handleOrganizerInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Theme (Optional)</label>
                            <input type="text" name="theme" value={organizerFormData.theme} onChange={handleOrganizerInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Organizer *</label>
                            <input type="text" name="organizer" value={organizerFormData.organizer} onChange={handleOrganizerInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Image URL (Optional)</label>
                            <input type="url" name="image_url" value={organizerFormData.image_url} onChange={handleOrganizerInputChange} placeholder="https://example.com/image.jpg"/>
                        </div>
                        <input type="hidden" name="organizer_email" value={organizerFormData.organizer_email} />
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Event'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default OrganizeEvent;