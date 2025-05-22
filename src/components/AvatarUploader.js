import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import '../css/AvatarUploader.css';

const AvatarUploader = ({ onComplete }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onComplete(croppedImage);
    setImageSrc(null);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageSrc && (
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="controls">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
            />
            <button onClick={handleDone}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

const readFile = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.readAsDataURL(file);
  });

export default AvatarUploader;
