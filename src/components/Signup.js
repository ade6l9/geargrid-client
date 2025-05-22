import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/Signup.css";

const Signup = () => {

  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, [])

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // console.log('Password: ', password);
    // console.log('Validation Results:', {
    //   minLength: password.length >= minLength,
    //   hasUppercase,
    //   hasLowercase,
    //   hasNumber,
    //   hasSpecialChar,
    // });

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUppercase) {
      return 'Password must include at least one uppercase letter.';
    }
    if (!hasLowercase) {
      return 'Password must include at least one lowercase letter.';
    }
    if (!hasNumber) {
      return 'Password must include at least one number.';
    }
    if (!hasSpecialChar) {
      return 'Password must include at least one special character.';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError) {
      alert('Please fix the password issues before submitting.');
      return;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      const response = await fetch('http://localhost:3001/api/signup', { //sends post request to signup api w the form data from line 5 (http://localhost:3007/api/signup) or (/api/signup)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); //clears timeout if request completes in time (5s)
  
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        const errorText = await response.text();
        console.error('Response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        navigate('/login'); //sends u to login if successful
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message.includes('aborted')
        ? 'Request timed out - check server connection'
        : `Signup failed: ${error.message}`);
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
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
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
              onChange={handlePasswordChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
              //   // Eye-off icon (password visible)
              //   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              //     <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.6-1.49 1.38-2.87 2.3-4.11" />
              //     <path d="M1 1l22 22" />
              //     <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
              //   </svg>
              // ) : (
              //   // Eye icon (password hidden)
              //   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              //     <path d="M1 12C3.73 7.55 8 4 12 4s8.27 3.55 11 8c-2.73 4.45-7 8-11 8S3.73 16.45 1 12z" />
              //     <circle cx="12" cy="12" r="3" />
              //   </svg>
                <i className="fas fa-eye"></i> // password visible
              ) : (
                <i className="fas fa-eye-slash"></i> // password hidden
              )}
            </span>
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
      </div>
      <div className="signup-box">
        <p>Already have an account? <a href="/login">Log In</a></p>
      </div>
    </div>
  );
};

export default Signup;