import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Archive.css"; 

const Archive = () => {
  const navigate = useNavigate();

  return (
    <div className="archive-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/profile")}>
        ←
      </button>

      {/* Archive Header */}
      <h2 className="archive-title">Archive</h2>
      <p className="archive-subtitle">
        Only you can see your archived stories unless you choose to share them.
      </p>

      {/* Archive Grid */}
      <div className="archive-grid">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="archive-placeholder">Image Placeholder</div>
        ))}
      </div>
    </div>
  );
};

export default Archive;
