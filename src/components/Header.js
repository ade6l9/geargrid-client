import React, { useState, useEffect } from "react"; 
import { useNavigate, useLocation } from "react-router-dom"; 
import "../css/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId);
  }, [location.pathname]);

  const handleMenuClick = () => {
    if (!isAuthenticated) {
      navigate("/login"); 
    } else {
      navigate("/menu"); 
    }
  };

  const handleLogoClick = () => {
    navigate("/home"); 
    setIsAuthenticated(false); 
  };

  // List of auth-related pages where the menu should be hidden
  const authPages = ["/login", "/signup", "/forgot-password"];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <header className="header">
      <img
        src="/logo-transparent.png"
        alt="Logo"
        className="header-logo"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      />

      {/* Hide menu icon on auth pages */}
      {!isAuthPage && (
        <div className="menu-icon" onClick={handleMenuClick}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      )}
    </header>
  );
};

export default Header;