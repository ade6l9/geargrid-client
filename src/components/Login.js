import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

const Login = () => {
  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('userId', data.userId);
        if (data.username) localStorage.setItem('username', data.username); 
        if (data.email) localStorage.setItem('userEmail', data.email);
        if (data.displayName) localStorage.setItem('displayName', data.displayName);
        if (data.avatarUrl) {
          localStorage.setItem('avatar', data.avatarUrl);
        } else {
          localStorage.removeItem('avatar');
        }
        navigate('/profile');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="gear-icon">
          <i className="fas fa-cog fa-spin"></i>
        </div>
        <h1 className="brand-name">GearGrid</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? (
              //   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              //     <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.6-1.49 1.38-2.87 2.3-4.11" />
              //     <path d="M1 1l22 22" />
              //     <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
              //   </svg>
              // ) : (
              //   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              //     <path d="M1 12C3.73 7.55 8 4 12 4s8.27 3.55 11 8c-2.73 4.45-7 8-11 8S3.73 16.45 1 12z" />
              //     <circle cx="12" cy="12" r="3" />
              //   </svg>
              <i className="fas fa-eye"></i>           // password is shown
              ) : (
                <i className="fas fa-eye-slash"></i>     // password is hidden
              )}
            </span>
          </div>
          <button type="submit" className="auth-btn">Log In</button>
        </form>
        <p>
          <a href="/forgot-password" className="forgot-password">Forgot password?</a>
        </p>
      </div>
      <div className="signup-box">
        <p>Don't have an account? <a href="/signup">Sign up</a></p>
      </div>
    </div>
  );
};

export default Login;
