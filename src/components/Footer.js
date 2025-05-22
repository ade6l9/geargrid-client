import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Footer.css';
import Modal from './Modal';

// component for the website's footer
const Footer = () => {
  const [modalType, setModalType] = useState(null); // tracks which modal is open

   // functions to open/close a specific modal 
  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  // content for Privacy Policy modal
  const privacyContent = (
    <>
      <p>
        At GearGrid, your privacy is important to us. We do not sell or share your personal data with third parties. 
        Any information you provide is used solely to enhance your experience on our platform.
      </p>
      <p>
        Our site may collect non-identifiable data for analytics and performance tracking. You can disable cookies 
        in your browser settings.
      </p>
    </>
  );

  // content for the Terms & Conditions modal
  const termsContent = (
    <>
      <p>
        By using GearGrid, you agree to use our platform respectfully and legally. We are not responsible for 
        the conduct of users or accuracy of information submitted by third parties.
      </p>
      <p>
        We reserve the right to suspend accounts that violate our community guidelines, and to update these 
        terms at any time.
      </p>
    </>
  );

  return (
    <footer className="gg-footer">  {/* main footer container */}
      <div className="footer-main"> {/* top section of footer */}
        {/* brand logo */}
        <div className="footer-brand">
          <img src="/logo-transparent.png" alt="GearGrid Logo" />
        </div>

        {/* footer links */}
        <div className="footer-columns">
          <div className="footer-column">
            <h4>Company</h4>
            <Link to="/">Home</Link>
            <Link to="/contact">Contact</Link>
            <a href="/#about-section">About</a>
          </div>

          {/* services */}
          <div className="footer-column">
            <h4>Services</h4>
            <Link to="/businesses">Find a Business</Link>
            <Link to="/events">Events</Link>
            <Link to="/organize-event">Register Event</Link>
          </div>

          {/* account Links */}
          <div className="footer-column">
            <h4>Account</h4>
            <Link to="/profile">Profile</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>
        </div>
      </div>

      {/* bottom section */}
      <div className="footer-bottom">
        {/* social media icons */}
        <div className="social-icons">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-twitter"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-linkedin-in"></i>
          </a>
        </div>

        {/* copyright notice with current year */}
        <p>&copy; {new Date().getFullYear()} GearGrid. All rights reserved.</p>

        {/* legal links that trigger modals */}
        <div className="legal-links">
          <button onClick={() => openModal('privacy')}>Privacy Policy</button>
          <button onClick={() => openModal('terms')}>Terms & Conditions</button>
        </div>
      </div>

      {/* conditionally render modal based on type */}
      {modalType && (
        <Modal
          title={modalType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
          content={modalType === 'privacy' ? privacyContent : termsContent}
          onClose={closeModal}
        />
      )}
    </footer>
  );
};

export default Footer;
