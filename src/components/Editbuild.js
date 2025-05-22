import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import axios                           from 'axios';
import { vehicleData }                 from '../data/vehicleData';
import { modCategories }               from '../data/modCategories';
import { resolveImageUrl, API_BASE }   from '../utils/imageUrl';
import '../css/EditBuild.css';

// === EditBuild Component ===
export default function EditBuild() {
  // === Router & Navigation ===
  const { id }    = useParams();
  const navigate  = useNavigate();

  // === Loading State ===
  const [loading, setLoading] = useState(true);

  // === Core Fields ===
  const [ownership, setOwnership]         = useState('current');
  const [vehicleType, setVehicleType]     = useState('');
  const [brand, setBrand]                 = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel]     = useState('');
  const [bodyStyle, setBodyStyle]         = useState('');
  const [description, setDescription]     = useState('');

  // === Image State ===
  const [existingCovers, setExistingCovers]   = useState([]); // URLs of already uploaded cover images
  const [coverFiles, setCoverFiles]           = useState([]); // New cover files to upload
  const [existingGallery, setExistingGallery] = useState([]); // URLs of already uploaded gallery images
  const [galleryFiles, setGalleryFiles]       = useState([]); // New gallery files to upload

  // === Mod State ===
  const [mods, setMods]                 = useState([]); // All mods for this build
  const [newModInputs, setNewModInputs] = useState({}); // For custom mod input fields

  // === Fetch build data on mount ===
  useEffect(() => {
    axios.get(`${API_BASE}/api/builds/${id}`, { withCredentials: true })
      .then(({ data }) => {
        // Populate form fields with existing build data
        const b = data.build;
        setOwnership(b.ownership);
        const [br, ...rest] = b.car_name.split(' ');
        setBrand(br);
        setSelectedModel(b.model);
        setCustomModel(rest.join(' ') === b.model ? '' : rest.join(' '));
        const vt = Object.keys(vehicleData).find(t => vehicleData[t][br]);
        setVehicleType(vt || '');
        setBodyStyle(b.bodyStyle || '');
        setDescription(b.description || '');
        setExistingCovers([b.cover_image, b.cover_image2].filter(Boolean));
        setExistingGallery(b.galleryImages || []);
        // Map backend mods to local mod structure
        setMods((data.mods || []).map(m => ({
          main:      m.category,
          sub:       m.sub_category,
          name:      m.mod_name,
          details:   m.mod_note || '',
          image:     null, // No new image file yet
          image_url: m.image_url || null
        })));
      })
      .catch(err => console.error('Failed to load build:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;

  // === Submit Handler ===
  const handleSubmit = async e => {
    e.preventDefault();
    const form = new FormData();
    // Append all form fields and files to FormData for backend
    form.append('ownership', ownership);
    form.append('car_name', `${brand} ${customModel || selectedModel}`.trim());
    form.append('model', customModel || selectedModel);
    form.append('bodyStyle', bodyStyle);
    form.append('description', description);
    // Serialize mods for backend
    form.append('mods', JSON.stringify(
      mods.map(m => ({
        main:        m.main,
        sub:         m.sub,
        name:        m.name,
        details:     m.details,
        image_url:   m.image ? null : m.image_url,
        hasImage:    !!m.image,
        deleteImage: !m.image && !m.image_url
      }))
    ));
    // Keep track of which covers/gallery images to keep
    form.append('keepCovers', JSON.stringify(existingCovers));
    coverFiles.forEach(f => form.append('coverImages', f));
    form.append('keepGallery', JSON.stringify(existingGallery));
    galleryFiles.forEach(f => form.append('galleryImages', f));
    // Attach new mod images
    mods.forEach(m => m.image && form.append('modImages', m.image));

    try {
      const res = await axios.put(`${API_BASE}/api/builds/${id}`, form, { withCredentials: true });
      if (res.data.success) return navigate(-1); // Go back on success
      alert(res.data.message || 'Save failed');
    } catch (err) {
      console.error('Save error:', err);
      if (err.response) {
        alert(`Save failed: ${err.response.status} – ${err.response.data.message || err.response.statusText}`);
      } else {
        alert(`Save failed: ${err.message}`);
      }
    }
  };

  // === Helpers for Mod UI ===
  // Returns true if any mod is selected in this main category
  const mainHasSelection = main => mods.some(m => m.main === main);
  // Returns true if any mod is selected in this subcategory
  const subHasSelection  = (main, sub) => mods.some(m => m.main === main && m.sub === sub);

  // === Render ===
  return (
    <div className="edit-build-page">
      {/* --- Header & Actions --- */}
      <h1>Edit Build</h1>
      <div className="cancel-row">
        {/* Cancel button returns to previous page */}
        <button
          type="button"
          className="top-cancel"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        {/* Delete build button */}
        <button
          type="button"
          className="delete-btn"
          onClick={async () => {
            if (!window.confirm('Are you sure you want to delete this build? This cannot be undone.')) return;
            try {
              const res = await axios.delete(`${API_BASE}/api/builds/${id}`, { withCredentials: true });
              if (res.data.success) navigate('/profile');
              else alert(`Delete failed: ${res.data.message}`);
            } catch (err) {
              console.error('Delete error:', err);
              const status = err.response?.status;
              const msg    = err.response?.data?.message || err.message;
              alert(`Delete failed: [${status}] ${msg}`);
            }
          }}
        >
          Delete Build
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* --- Ownership --- */}
        <fieldset className="ownership">
          <legend>Ownership</legend>
          <label>
            <input
              type="radio"
              value="current"
              checked={ownership === 'current'}
              onChange={() => setOwnership('current')}
            /> Currently Owned
          </label>
          <label>
            <input
              type="radio"
              value="previous"
              checked={ownership === 'previous'}
              onChange={() => setOwnership('previous')}
            /> Previously Owned
          </label>
        </fieldset>

        {/* --- Vehicle Type --- */}
        <div className="form-row">
          <label htmlFor="vehicleType">Vehicle Type</label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={e => {
              setVehicleType(e.target.value);
              setBrand('');
              setSelectedModel('');
              setCustomModel('');
            }}
          >
            <option value="Car">Car</option>
            <option value="Truck">Truck</option>
            <option value="Motorcycle">Motorcycle</option>
          </select>
        </div>

        {/* --- Brand & Model --- */}
        {vehicleType && (
          <>
            <div className="form-row">
              <label htmlFor="brand">Brand</label>
              <select
                id="brand"
                value={brand}
                onChange={e => {
                  setBrand(e.target.value);
                  setSelectedModel('');
                  setCustomModel('');
                }}
              >
                <option value="">— select —</option>
                {/* List brands for selected vehicle type */}
                {Object.keys(vehicleData[vehicleType]).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="model-row form-row">
              <div>
                <label htmlFor="model">Model</label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={e => {
                    setSelectedModel(e.target.value);
                    setCustomModel('');
                  }}
                >
                  <option value="">— select —</option>
                  {/* List models for selected brand */}
                  {(vehicleData[vehicleType][brand] || []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="customModel">Type manually (optional)</label>
                <input
                  id="customModel"
                  type="text"
                  placeholder="Type manually (optional)"
                  value={customModel}
                  onChange={e => setCustomModel(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="bodyStyle">Body Style</label>
              <select
                id="bodyStyle"
                value={bodyStyle}
                onChange={e => setBodyStyle(e.target.value)}
              >
                <option value="">— select —</option>
                {/* Common body styles */}
                <option value="Coupe">Coupe</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Wagon">Wagon</option>
                <option value="Convertible">Convertible</option>
                <option value="Pickup">Pickup</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        )}

        {/* --- Description --- */}
        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* --- Covers Section --- */}
        <label>Current Covers</label>
        <div className="preview-list">
          {/* Show existing cover images with remove buttons */}
          {existingCovers.map((url, i) => (
            <div key={i} className="preview-item small">
              <img src={resolveImageUrl(url)} alt={`Cover ${i+1}`} />
              <button
                type="button"
                onClick={() => setExistingCovers(ec => ec.filter((_, j) => j !== i))}
              >×</button>
            </div>
          ))}
        </div>
        <label>Upload New Covers</label>
        <input
          type="file"
          multiple
          accept="image/*"
          disabled={existingCovers.length + coverFiles.length >= 2}
          onChange={e => {
            // Only allow up to 2 cover images total
            const picked = Array.from(e.target.files);
            const remaining = 2 - existingCovers.length - coverFiles.length;
            if (picked.length > remaining) {
              alert(`You can only add ${remaining} more cover ${remaining===1?'image':'images'}.`);
            }
            setCoverFiles(cf => [...cf, ...picked.slice(0, remaining)]);
            e.target.value = null;
          }}
        />
        <div className="preview-list">
          {/* Show previews for new cover files */}
          {coverFiles.map((file,i) => (
            <div key={i} className="preview-item small">
              <img src={URL.createObjectURL(file)} alt={file.name} />
              <button
                type="button"
                onClick={() => setCoverFiles(cf => cf.filter((_,j) => j!==i))}
              >×</button>
            </div>
          ))}
        </div>

        {/* --- Gallery Section --- */}
        <label>Current Gallery</label>
        <div className="preview-list">
          {/* Show existing gallery images with remove buttons */}
          {existingGallery.map((url, i) => (
            <div key={i} className="preview-item small">
              <img src={resolveImageUrl(url)} alt={`Gallery ${i+1}`} />
              <button
                type="button"
                onClick={() => setExistingGallery(g => g.filter((_,j) => j!==i))}
              >×</button>
            </div>
          ))}
        </div>
        <label>Upload New Gallery</label>
        <input
          type="file"
          multiple
          accept="image/*"
          disabled={existingGallery.length + galleryFiles.length >= 10}
          onChange={e => {
            // Only allow up to 10 gallery images total
            const picked = Array.from(e.target.files);
            const remaining = 10 - existingGallery.length - galleryFiles.length;
            if (picked.length > remaining) {
              alert(`You can only add ${remaining} more gallery ${remaining===1?'image':'images'}.`);
            }
            setGalleryFiles(gf => [...gf, ...picked.slice(0, remaining)]);
            e.target.value = null;
          }}
        />
        <div className="preview-list">
          {/* Show previews for new gallery files */}
          {galleryFiles.map((file,i) => (
            <div key={i} className="preview-item small">
              <img src={URL.createObjectURL(file)} alt={file.name} />
              <button
                type="button"
                onClick={() => setGalleryFiles(gf => gf.filter((_,j) => j!==i))}
              >×</button>
            </div>
          ))}
        </div>

        {/* --- Modifications Section --- */}
        <section className="modifications">
          <h2>Modifications</h2>
          {/* Render all main categories and their subcategories */}
          {Object.entries(modCategories).map(([main, subsObj]) => (
            <details key={main} open={mainHasSelection(main)}>
              <summary>{main}</summary>

              {Object.keys(subsObj).map(sub => (
                <details key={sub} open={subHasSelection(main, sub)}>
                  <summary>{sub}</summary>

                  {/* Built-in mods for this subcategory */}
                  {subsObj[sub].map(name => {
                    const sel = mods.find(
                      m => m.main === main &&
                           m.sub === sub &&
                           m.name === name
                    );
                    return (
                      <div key={name} className="mod-card-vertical">
                        {/* Checkbox to select/deselect mod */}
                        <label>
                          <input
                            type="checkbox"
                            checked={!!sel}
                            onChange={() => {
                              sel
                                ? setMods(ms => ms.filter(x => x !== sel))
                                : setMods(ms => [
                                    ...ms,
                                    { main, sub, name, details:'', image:null, image_url:null }
                                  ]);
                            }}
                          />
                          {name}
                        </label>
                        {/* If selected, show details input and image upload */}
                        {sel && (
                          <div className="mod-extras-vertical">
                            <input
                              type="text"
                              placeholder="Details"
                              value={sel.details}
                              onChange={e => {
                                const d = e.target.value;
                                setMods(ms =>
                                  ms.map(x => x === sel ? { ...x, details: d } : x)
                                );
                              }}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const f = e.target.files[0];
                                setMods(ms =>
                                  ms.map(x => x === sel ? { ...x, image: f } : x)
                                );
                              }}
                            />
                            {/* Show mod image thumbnail if present */}
                            {(sel.image_url || sel.image) && (
                              <div className="mod-thumb-wrapper">
                                <img
                                  src={ sel.image
                                         ? URL.createObjectURL(sel.image)
                                         : resolveImageUrl(sel.image_url)
                                       }
                                  className="mod-thumb"
                                  alt={sel.name}
                                />
                                <button
                                  type="button"
                                  className="remove-thumb"
                                  onClick={() => {
                                    setMods(ms =>
                                      ms.map(x =>
                                        x === sel
                                          ? { ...x, image: null, image_url: null }
                                          : x
                                      )
                                    );
                                  }}
                                >×</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Custom mods for this subcategory */}
                  {mods
                    .filter(m =>
                      m.main === main &&
                      m.sub === sub &&
                      !subsObj[sub].includes(m.name)
                    )
                    .map((m, i) => (
                      <div key={i} className="mod-card-vertical">
                        {/* Checkbox to remove custom mod */}
                        <label>
                          <input
                            type="checkbox"
                            checked
                            onChange={() =>
                              setMods(ms => ms.filter(x => x !== m))
                            }
                          />
                          {m.name}
                        </label>
                        <div className="mod-extras-vertical">
                          <input
                            type="text"
                            placeholder="Details"
                            value={m.details}
                            onChange={e => {
                              const d = e.target.value;
                              setMods(ms =>
                                ms.map(x => x === m ? { ...x, details: d } : x)
                              );
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const f = e.target.files[0];
                              setMods(ms =>
                                ms.map(x => x === m ? { ...x, image: f } : x)
                              );
                            }}
                          />
                          {/* Show mod image thumbnail if present */}
                          {(m.image_url || m.image) && (
                            <div className="mod-thumb-wrapper">
                              <img
                                src={ m.image
                                       ? URL.createObjectURL(m.image)
                                       : resolveImageUrl(m.image_url)
                                     }
                                className="mod-thumb"
                                alt={m.name}
                              />
                              <button
                                type="button"
                                className="remove-thumb"
                                onClick={() => {
                                  setMods(ms =>
                                    ms.map(x =>
                                      x === m
                                        ? { ...x, image: null, image_url: null }
                                        : x
                                    )
                                  );
                                }}
                              >×</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* Add new custom mod input */}
                  <div className="add-custom-mod">
                    <input
                      type="text"
                      placeholder="Other mod name"
                      value={newModInputs[`${main}-${sub}`] || ''}
                      onChange={e =>
                        setNewModInputs(nmi => ({
                          ...nmi,
                          [`${main}-${sub}`]: e.target.value
                        }))
                      }
                    />
                    <button
                      type="button"
                      disabled={!newModInputs[`${main}-${sub}`]?.trim()}
                      onClick={() => {
                        const key = `${main}-${sub}`;
                        const name = newModInputs[key].trim();
                        setMods(ms => [
                          ...ms,
                          { main, sub, name, details:'', image:null, image_url:null }
                        ]);
                        setNewModInputs(nmi => ({ ...nmi, [key]: '' }));
                      }}
                    >+ Add Mod</button>
                  </div>
                </details>
              ))}
            </details>
          ))}
        </section>

        {/* --- Form Actions --- */}
        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}