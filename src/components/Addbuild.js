import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleData } from '../data/vehicleData';
import { modCategories } from '../data/modCategories';
import '../css/AddBuild.css';

// AddBuild component: lets user create a new car build with details, images, and mods
const AddBuild = () => {

  // Set a data attribute on the body for page-specific styling
  useEffect(() => {
    document.body.setAttribute('data-page', 'add-build');
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  // ====== Form State ======
  const [ownership, setOwnership] = useState('current'); // current or previous
  const [vehicleType, setVehicleType] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [bodyStyle, setBodyStyle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFiles, setCoverFiles] = useState([]); // up to 2 cover images
  const [galleryFiles, setGalleryFiles] = useState([]); // up to 10 gallery images
  const [mods, setMods] = useState([]); // selected mods
  const [customSubs, setCustomSubs] = useState({}); // custom sub-categories by main category
  const [newSubInputs, setNewSubInputs] = useState({}); // input values for new sub-categories
  const [customModInput, setCustomModInput] = useState(''); // input for custom mod name
  const [currentMain, setCurrentMain] = useState(''); // currently selected main category
  const [currentSub, setCurrentSub] = useState(''); // currently selected sub-category

  // For sidebar navigation between main categories
  const mainCategories = Object.keys(modCategories);
  const [stepIndex, setStepIndex] = useState(0);
  const currentCategory = mainCategories[stepIndex];

  const navigate = useNavigate();

  // ====== Form Submit Handler ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    const finalModel = customModel || selectedModel;
    if (!vehicleType || !brand || !finalModel || !bodyStyle || !coverFiles[0]) {
      alert("Please select vehicle type, brand, model, body style, and upload at least 1 cover image.");
      return;
    }

    // Prepare form data for backend (multipart/form-data)
    const formData = new FormData();
    formData.append('ownership', ownership);
    formData.append('car_name', `${brand} ${finalModel}`.trim());
    formData.append('model', finalModel);
    formData.append('bodyStyle', bodyStyle);
    formData.append('description', description);

    // Serialize mods for backend
    const modsPayload = mods.map(({ main, sub, name, details }) => ({ main, sub, name, details }));
    formData.append('mods', JSON.stringify(modsPayload));
    mods.forEach(mod => {
      if (mod.image) formData.append('modImages', mod.image);
    });

    // Attach cover and gallery images
    coverFiles.slice(0, 2).forEach(file => file && formData.append('coverImages', file));
    galleryFiles.forEach(file => file && formData.append('galleryImages', file));

    try {
      const res = await fetch('/api/builds', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (data.success) navigate('/profile');
      else console.error('Server error:', data.message);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  return (
    <div className="add-build-container-with-sidebar">
      {/* ====== Sidebar Navigation for Main Categories ====== */}
      <div className="sidebar-nav">
        <h3>Categories</h3>
        <ul>
          {mainCategories.map((cat, index) => (
            <li
              key={cat}
              className={index === stepIndex ? 'active' : ''}
              onClick={() => {
                setCurrentMain(cat);
                setCurrentSub('');
                setStepIndex(index);
              }}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* ====== Main Form Area ====== */}
      <div className="main-form-area">
        <h2>Add a New Build</h2>
        <div className="add-build-form">
          {/* Cancel button returns to profile */}
          <button type="button" onClick={() => navigate('/profile')}>Cancel</button>
        </div>
        <br/>
        <form onSubmit={handleSubmit} className="add-build-form">

          {/* ====== Vehicle Info Section ====== */}
          <fieldset>
            <legend>Is this car currently owned or a previous car?</legend>
            <label>
              <input type="radio" value="current" checked={ownership === 'current'} onChange={() => setOwnership('current')} />
              Currently owned
            </label>
            <label>
              <input type="radio" value="previous" checked={ownership === 'previous'} onChange={() => setOwnership('previous')} />
              Previously owned
            </label>
          </fieldset>

          {/* Vehicle type selection */}
          <label>Vehicle Type</label>
          <select value={vehicleType} onChange={e => {
            setVehicleType(e.target.value);
            setBrand(''); setSelectedModel(''); setCustomModel(''); setBodyStyle('');
          }}>
            <option value="">-- Select Type --</option>
            {Object.keys(vehicleData).map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          {/* Brand selection, shown after vehicle type is picked */}
          {vehicleType && (
            <>
              <label>Brand</label>
              <select value={brand} onChange={e => {
                setBrand(e.target.value);
                setSelectedModel(''); setCustomModel('');
              }}>
                <option value="">-- Select Brand --</option>
                {Object.keys(vehicleData[vehicleType]).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </>
          )}

          {/* Model selection and manual input, shown after brand is picked */}
          {brand && (
            <>
              <label>Model</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                  <option value="">-- Select Model --</option>
                  {vehicleData[vehicleType][brand].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {/* Manual model input */}
                <input placeholder="Type manually" value={customModel} onChange={e => setCustomModel(e.target.value)} />
              </div>
            </>
          )}

          {/* Body style selection, shown after model is picked or typed */}
          {(selectedModel || customModel) && (
            <>
              <label>Body Style</label>
              <select value={bodyStyle} onChange={e => setBodyStyle(e.target.value)}>
                <option value="">-- Select Body Style --</option>
                {/* Common body styles */}
                {['Coupe', 'Sedan', 'Hatchback', 'SUV', 'Wagon', 'Convertible', 'Pickup Truck', 'Van', 'Motorcycle', 'Other'].map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </>
          )}

          {/* Build description */}
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows="4" placeholder="Describe your build..." />

          {/* ====== Mod Selection Section ====== */}
          <h3>{currentCategory}</h3>

          {/* List all sub-categories (built-in and custom) for the current main category */}
          {[...(Object.keys(modCategories[currentCategory] || [])), ...(customSubs[currentCategory] || [])].map(sub => {
            const isCustom = (customSubs[currentCategory] || []).includes(sub);
            // Sub-category is open if selected or if any mod is selected in it
            const isSubOpen = currentSub === sub || mods.some(m => m.main === currentCategory && m.sub === sub);
            return (
              <div key={sub} className="mod-sub-block">
                {/* Sub-category button (toggles open/close) */}
                <button
                  type="button"
                  className={`mod-sub-btn ${currentSub === sub ? 'active' : ''}`}
                  onClick={() => setCurrentSub(s => s === sub ? '' : sub)}
                >
                  <span className="label-text">{sub}</span>

                  {/* ====== Delete Custom Sub-Category Button ====== */}
                  {isCustom && (
                    <button
                      type="button"
                      className="mod-sub-delete"
                      onClick={() => {
                        if (!window.confirm(`Delete sub-category “${sub}”?`)) return;
                        setCustomSubs(cs => {
                          const filtered = cs[currentCategory].filter(s => s !== sub);
                          return { ...cs, [currentCategory]: filtered };
                        });
                        if (currentSub === sub) setCurrentSub('');
                      }}
                    >
                      ×
                    </button>
                  )}
                </button>

                {/* ====== Mods in This Sub-Category ====== */}
                {isSubOpen && (
                  <div className="mods-items">
                    {/* List built-in and custom mods for this sub-category */}
                    {[...(modCategories[currentCategory][sub] || []),
                      ...mods.filter(m => m.main === currentCategory && m.sub === sub && !(modCategories[currentCategory][sub] || []).includes(m.name)).map(m => m.name)
                    ].map(item => {
                      const isChecked = mods.some(m => m.main === currentCategory && m.sub === sub && m.name === item);
                      const mod = mods.find(m => m.main === currentCategory && m.sub === sub && m.name === item);
                      return (
                        <div key={item}>
                          {/* Checkbox for mod selection */}
                          <label>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setMods(ms => ms.filter(m => !(m.main === currentCategory && m.sub === sub && m.name === item)));
                                } else {
                                  setMods(ms => [...ms, { main: currentCategory, sub, name: item, details: '', image: null }]);
                                }
                              }}
                            />
                            {item}
                          </label>
                          {/* If checked, show details and image upload */}
                          {isChecked && (
                            <div>
                              <input
                                type="text"
                                placeholder="Details"
                                value={mod?.details || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setMods(ms => ms.map(m =>
                                    m.main === currentCategory && m.sub === sub && m.name === item
                                      ? { ...m, details: val }
                                      : m
                                  ));
                                }}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                  const file = e.target.files[0];
                                  setMods(ms => ms.map(m =>
                                    m.main === currentCategory && m.sub === sub && m.name === item
                                      ? { ...m, image: file }
                                      : m
                                  ));
                                }}
                              />
                              {/* Show preview if image is selected */}
                              {mod?.image && (
                                <div className="mod-image-preview">
                                  <img src={URL.createObjectURL(mod.image)} alt={item} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* ====== Add Custom Mod Input ====== */}
                    <div className="custom-mod">
                      <input
                        type="text"
                        placeholder="Other mod name"
                        value={customModInput}
                        onChange={e => setCustomModInput(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={!customModInput.trim()}
                        onClick={() => {
                          setMods(ms => [...ms, {
                            main: currentCategory,
                            sub,
                            name: customModInput.trim(),
                            details: '',
                            image: null
                          }]);
                          setCustomModInput('');
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ====== Add New Sub-Category Input ====== */}
          <div className="custom-sub">
            <input
              type="text"
              placeholder="New sub-category"
              value={newSubInputs[currentCategory] || ''}
              onChange={e => setNewSubInputs(i => ({ ...i, [currentCategory]: e.target.value }))}
            />
            <button
              type="button"
              disabled={!newSubInputs[currentCategory]?.trim()}
              onClick={() => {
                const subName = newSubInputs[currentCategory].trim();
                setCustomSubs(cs => ({
                  ...cs,
                  [currentCategory]: [...(cs[currentCategory] || []), subName]
                }));
                setNewSubInputs(i => ({ ...i, [currentCategory]: '' }));
              }}
            >
              Add Sub-category
            </button>
          </div>

          {/* ====== Step Navigation Buttons ====== */}
          <div className="step-nav-buttons">
            <button type="button" onClick={() => setStepIndex(i => Math.max(0, i - 1))} disabled={stepIndex === 0}>Back</button>
            <button type="button" onClick={() => setStepIndex(i => Math.min(mainCategories.length - 1, i + 1))} disabled={stepIndex === mainCategories.length - 1}>Next</button>
          </div>

          {/* ====== Upload Section ====== */}
          <div className="upload-box">
            <label>Cover Images (up to 2)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                setCoverFiles(prev => {
                  const names = new Set(prev.map(f => f.name));
                  const next = [...prev];
                  if (!names.has(file.name)) {
                    next.push(file);
                  }
                  return next.slice(0, 2);
                });
              }}
            />
            {/* Preview selected cover images */}
            <div className="preview-list">
              {coverFiles.map((file, i) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={i} className="preview-item">
                    <button type="button" className="remove-btn" onClick={() => setCoverFiles(prev => prev.filter((_, j) => j !== i))}>×</button>
                    <img src={url} alt={file.name} className="preview-thumb" />
                    <span className="preview-name">{file.name}</span>
                  </div>
                );
              })}
            </div>

            <label>Gallery Images (up to 10)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files);
                setGalleryFiles(prev => {
                  const names = new Set(prev.map(f => f.name));
                  const combined = [...prev];
                  for (let f of files) {
                    if (!names.has(f.name)) combined.push(f);
                    if (combined.length >= 10) break;
                  }
                  return combined.slice(0, 10);
                });
              }}
            />
            {/* Preview selected gallery images */}
            <div className="preview-list">
              {galleryFiles.map((file, i) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={i} className="preview-item">
                    <button type="button" className="remove-btn" onClick={() => setGalleryFiles(prev => prev.filter((_, j) => j !== i))}>×</button>
                    <img src={url} alt={file.name} className="preview-thumb" />
                    <span className="preview-name">{file.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ====== Submit Button ====== */}
          <button type="submit" disabled={!coverFiles[0]}>Submit Build</button>
        </form>
      </div>
    </div>
  );
};

export default AddBuild;