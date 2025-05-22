import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { Helmet } from 'react-helmet';

const Menu = ({ closeMenu }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      const response = await fetch('http://localhost:3001/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        navigate("/login");
      } else {
        console.error('Logout failed on server:', data.message);
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        navigate("/login");
      }
    } catch (error) {
      console.error('Logout fetch error:', error);
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      navigate("/login");
    }
  };

  const handleCancel = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    { path: "/events", label: "EVENTS" },
    { path: "/profile", label: "PROFILE" },
    { path: "/businesses", label: "BUSINESSES" },
    { path: "/contact", label: "CONTACT" },
  ];

  return (
    <div className="menu-overlay">
    <Helmet>
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap"
        rel="stylesheet"
      />
    </Helmet>
      <div className="menu-image"></div>
      <div className="menu-container">
        <div className="close-icon" onClick={closeMenu}></div>
        <ul className="menu-links">
          {menuItems.map((item, index) => (
            <li key={index} onClick={() => navigate(item.path)}>
              <Link to={item.path} className="menu-link">
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <span className="logout-link" onClick={handleLogoutClick}>
              LOG OUT
            </span>
          </li>
        </ul>

        {showLogoutModal && (
          <div className="logout-modal-overlay">
            <div className="logout-modal">
              <p>Are you sure you want to log out?</p>
              <button onClick={handleLogout}>Yes</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
