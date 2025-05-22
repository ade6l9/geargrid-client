import React, { useEffect } from "react";
import "../css/Login.css";

const ForgotPassword = () => {
  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="brand-name">GearGrid</h1>
        <p className="forgot-text">Enter your email or username to reset your password.</p>
        <form>
          <input type="text" placeholder="Email or Username" required />
          <button type="submit" className="auth-btn">Send Reset Link</button>
        </form>
        <p className="back-login"><a href="/login">Back to Login</a></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
