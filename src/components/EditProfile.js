import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import "../css/EditProfile.css";

const EditProfile = () => {
  const [formData, setFormData] = useState({ username: "", name: "", bio: "" });
  const [avatar, setAvatar] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "";
    const storedDisplayName = localStorage.getItem("displayName") || localStorage.getItem("name") || storedUsername;
    const storedBio = localStorage.getItem("bio") || "";
    setFormData({ username: storedUsername, name: storedDisplayName, bio: storedBio });
    setAvatar(localStorage.getItem("avatar") || null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not identified. Please log in again.");
      return;
    }

    const payload = {
      name: formData.name,
      bio: formData.bio,
      avatar_url: avatar,
    };
    try {
      const response = await fetch(`http://localhost:3001/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem("displayName", data.user.display_name);
        localStorage.setItem("bio", data.user.bio || "");
        if (data.user.avatar_url) {
          localStorage.setItem("avatar", data.user.avatar_url);
          setAvatar(data.user.avatar_url);
        } else {
          localStorage.removeItem("avatar");
          setAvatar(null);
        }
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          navigate("/profile"); // Navigate after success
        }, 1500);
      } else {
        alert(`Update failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const handlePhotoClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImage = (imageSrc, cropPixels) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = cropPixels.width;
        canvas.height = cropPixels.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          image,
          cropPixels.x,
          cropPixels.y,
          cropPixels.width,
          cropPixels.height,
          0,
          0,
          cropPixels.width,
          cropPixels.height
        );
        resolve(canvas.toDataURL("image/jpeg"));
      };
    });
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImg = await getCroppedImage(imageSrc, croppedAreaPixels);
      setAvatar(croppedImg);
      setImageSrc(null);
      setAvatarUrlInput("");
    } catch (err) {
      console.error("Cropping failed", err);
      alert("Failed to crop image.");
    }
  };

  const handleRemovePhoto = () => {
    setAvatar(null);
    setImageSrc(null);
    setAvatarUrlInput("");
  };

  const handleSetAvatarFromUrl = () => {
    if (avatarUrlInput.trim()) {
      if (avatarUrlInput.startsWith('http://') || avatarUrlInput.startsWith('https://')) {
        setAvatar(avatarUrlInput.trim());
        setImageSrc(null);
      } else {
        alert("Please enter a valid image URL (e.g., starting with http:// or https://).");
      }
    } else {
      alert("Please enter an image URL.");
    }
  };

    return (
    <div className="edit-profile-container">
      <div className="profile-top-card">
        <div className="profile-preview centered">
          <div className="avatar-wrapper">
            {avatar ? (
              <img src={avatar} alt="avatar" className="avatar-preview" />
            ) : (
              <div className="avatar-preview">
                <span className="avatar-placeholder-text">No Profile Picture</span>
              </div>
            )}
          </div>
          <div className="avatar-controls">
            <button className="change-photo-btn" onClick={handlePhotoClick}>
              Upload File
            </button>
            {avatar && (
              <button className="remove-photo-btn" onClick={handleRemovePhoto}>
                Remove Photo
              </button>
            )}
            <input
              type="file" accept="image/*" ref={fileInputRef}
              style={{ display: "none" }} onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      <div className="form-group" style={{maxWidth: '500px', margin: '20px auto', padding: '0 20px'}}>
        <label htmlFor="avatarUrlInput">Or Set by Image URL:</label>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <input
                type="url"
                id="avatarUrlInput"
                name="avatarUrlInput"
                placeholder="https://example.com/image.jpg"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                style={{flexGrow: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px'}}
            />
            <button onClick={handleSetAvatarFromUrl} className="save-btn" style={{padding: '10px 15px', fontSize: '16px'}}>Set URL</button>
        </div>
      </div>

      {imageSrc && (
        <div className="cropper-overlay">
          <div className="cropper-container">
            <div className="cropper-box">
              <Cropper
                image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round"
                showGrid={false} onCropChange={setCrop} onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="cropper-controls-side">
              <label>Zoom</label>
              <input
                type="range" min={1} max={3} step={0.1} value={zoom}
                onChange={(e) => setZoom(e.target.value)} className="zoom-slider"
              />
              <button className="save-btn" onClick={handleCropSave}>Crop & Use</button>
              <button className="cancel-btn" onClick={() => setImageSrc(null)}>Cancel Crop</button>
            </div>
          </div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate("/profile")} style={{margin: '20px auto', display: 'block'}}>
        ← Back to Profile
      </button>

      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username (cannot change)</label>
          <input type="text" name="username" value={formData.username} readOnly disabled 
                 style={{backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}/>
        </div>
        <div className="form-group">
          <label>Display Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" />
        </div>
        <button type="submit" className="save-btn">Save All Changes</button>
        {successMessage && <p style={{color: 'green', textAlign: 'center', marginTop: '10px'}}>{successMessage}</p>}
      </form>
    </div>
  );
};

export default EditProfile;