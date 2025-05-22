// src/components/Modal.js
import React from 'react';
import '../css/Modal.css';

// modal component
const Modal = ({ title, content, onClose }) => {
  return (
    // backdrop overlay - clicking this closes the modal
    <div className="modal-backdrop" onClick={onClose}>
      {/* modal content container - clicking inside won't trigger backdrop close */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* close button */}
        <button className="close-btn" onClick={onClose}>×</button>
        {/* modal title */}
        <h2>{title}</h2>
        {/* body of the modal where dynamic content is shown */}
        <div className="modal-body">{content}</div>
      </div>
    </div>
  );
};

export default Modal;
