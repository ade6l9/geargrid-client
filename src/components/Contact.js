import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Contact.css";
import { Helmet } from 'react-helmet';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "General Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState(""); 
  const [error, setError] = useState(""); 
  const [isVisible, setIsVisible] = useState(false); 
  const [previousRequests, setPreviousRequests] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  
  useEffect(() => {
    if (formData.email) {
      const storedRequests = JSON.parse(localStorage.getItem(formData.email)) || [];
      setPreviousRequests(storedRequests);
    }
  }, [formData.email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

  
    const newTicketNumber = `TICKET-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  
    const submissionData = { ...formData, ticketNumber: newTicketNumber };

    try {
      const response = await fetch("https://formspree.io/f/mpwdypop", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setTicketNumber(newTicketNumber);
        setSubmitted(true);

       
        const updatedRequests = [...previousRequests, { ticketNumber: newTicketNumber, reason: formData.interest }];
        localStorage.setItem(formData.email, JSON.stringify(updatedRequests));
        setPreviousRequests(updatedRequests);

        setFormData({ name: "", email: "", interest: "General Inquiry", message: "" });
      } else {
        setError("An error occurred while submitting your request.");
      }
    } catch (err) {
      setError("There was a problem submitting the form. Please try again later.");
    }
  };

  return (
    <div className="contact-page">
    <Helmet>
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap"
        rel="stylesheet"
      />
    </Helmet>
    <div className="back-button-wrapper">
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>
    </div>
      <div className={`contact-container ${isVisible ? "slide-down" : ""}`}>
        <h2>Contact Us</h2>
        <p>Have questions? Reach out to us, and we’ll get back to you as soon as possible.</p>

        {}
        {previousRequests.length > 0 && (
          <div className="previous-tickets">
            <h4>Your Previous Requests</h4>
            <ul>
              {previousRequests.map((req, index) => (
                <li key={index}>
                  <strong>Ticket #{req.ticketNumber}</strong> - {req.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="input-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>What are you interested in?</label>
              <select name="interest" value={formData.interest} onChange={handleChange}>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Opportunities">Opportunities</option>
                <option value="Business Partnerships">Business Partnerships</option>
                <option value="Technical Support">Technical Support</option>
              </select>
            </div>

            <div className="input-group">
              <label>Your Message</label>
              <textarea
                name="message"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        ) : (
          <div className="confirmation-box">
            <h3>Thank You!</h3>
            <p>Your request has been submitted successfully.</p>
            <p><strong>Ticket Number: {ticketNumber}</strong></p>
            <button className="submit-btn" onClick={() => setSubmitted(false)}>Submit Another Request</button>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Contact;
