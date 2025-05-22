import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import '../css/CarBuild.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { API_BASE, resolveImageUrl } from '../utils/imageUrl';
import { modCategories } from '../data/modCategories';

// CarBuild component displays a single car build, including covers, description, mods, and gallery
const CarBuild = () => {
  const { id } = useParams(); // Get build ID from URL
  const navigate = useNavigate();

  // State for build details, mods, gallery images, and ownership
  const [build, setBuild]   = useState(null);
  const [mods, setMods]     = useState([]);    // flat array of mods
  const [gallery, setGallery] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  
  // Helper to ensure mods is always an array (handles both array and object input)
  const normalizeMods = (m) => {
    // For debugging: log groupedMods (may be undefined on first render)
    console.log('groupedMods:', groupedMods);

    if (Array.isArray(m)) return m;
    return Object.values(m).flat();
  };

  // Fetch build data from backend on mount or when id changes
  useEffect(() => {
    const fetchBuild = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3001/api/builds/${id}`,
          { withCredentials: true }
        );
        if (!data.success) throw new Error(data.message);
        setBuild(data.build);
        setMods(normalizeMods(data.mods || []));
        setGallery(data.build.galleryImages || []);
        setIsOwner(data.isOwner);
      } catch (err) {
        console.error('Failed to load build:', err);
      }
    };
    fetchBuild();
  }, [id]);

  // Group mods by category and subcategory, preserving the order from modCategories
  const groupedMods = useMemo(() => {
    const orderedCategories = Object.keys(modCategories); // Original order
    // Group mods into { [category]: { [sub]: [mods] } }
    const modsByCategory = mods.reduce((cats, mod) => {
      const cat = mod.category || 'Uncategorized';
      const sub = mod.sub_category || 'Other';
      if (!cats[cat]) cats[cat] = {};
      if (!cats[cat][sub]) cats[cat][sub] = [];
      cats[cat][sub].push(mod);
      return cats;
    }, {});

    // Only include categories with mods, in the original order
    const sortedCategories = orderedCategories.reduce((sorted, category) => {
      if (modsByCategory[category]) {
        sorted[category] = modsByCategory[category];
      }
      return sorted;
    }, {});

    return sortedCategories;
  }, [mods]);

  // Settings for the cover image slider
  const sliderSettings = { dots:true, infinite:true, speed:400, slidesToShow:1, adaptiveHeight:true };

  // Show loading state if build data hasn't loaded yet
  if (!build) return <div>Loading build…</div>;

  return (
    <div className="car-build-page">
      <header className="car-header">
        <h1 className="car-title">{build.car_name}</h1>
        {/* Show body style if available */}
        {build.body_style && <p className="body-style">{build.body_style}</p>}
        {/* Show edit button if user is the owner */}
        {isOwner && (
          <button className="edit-button" onClick={() => navigate(`/edit-build/${build.id}`)}>
            Edit Build
          </button>
        )}
      </header>

      {/* Cover images slider (always shows two images if available) */}
      <Slider {...sliderSettings} className="car-image-slider">
        {[
          build.cover_image,
          build.cover_image2 ?? build.cover_image // fallback to first if second missing
        ].map((rawSrc, idx) => {
          // rawSrc may be null or a string; resolveImageUrl will give default if null
          const src = resolveImageUrl(rawSrc);
          return (
            <div key={idx} className="slider-item">
              <img
                src={src}
                alt={`Cover ${idx + 1}`}
                className="car-image"
              />
            </div>
          );
        })}
      </Slider>

      {/* Description section */}
      <section className="description-section">
        <h2 className="section-title">Description</h2>
        <p className="car-description">
          {build.description || 'No description provided.'}
        </p>
      </section>

      {/* Modifications section: only shows categories with mods, in correct order */}
      <section className="modifications">
        <h2 className="section-title">Modifications</h2>
        {mods.length === 0 && <p>No modifications added.</p>}
        {Object.entries(groupedMods).map(([category, subs]) => (
          <div key={category} className="category-block">
            <h3 className="category-title">{category}</h3>
            {Object.entries(subs).map(([sub, items]) => (
              <div key={sub} className="sub-category-block">
                <h4 className="sub-title">{sub}</h4>
                <div className="mods-container">
                  {items.map(mod => (
                    <div key={mod.id} className="mod-item">
                      {/* Show mod image if available */}
                      {mod.image_url && (
                        <img
                          src={resolveImageUrl(mod.image_url, 'build')}
                          alt={mod.mod_name}
                          className="mod-image"
                        />
                      )}
                      <div className="mod-info">
                        <strong className="mod-name">{mod.mod_name}</strong>
                        {mod.mod_note && <p className="mod-note">{mod.mod_note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Gallery section: shows up to 10 gallery images */}
      <section className="gallery-section">
        <h2 className="section-title">Gallery</h2>
        {gallery.length === 0 ? (
          <p>No gallery images uploaded.</p>
        ) : (
          <div className="gallery-grid">
            {gallery.slice(0, 10).map((rawUrl, idx) => {
              const src = resolveImageUrl(rawUrl);
              return (
                <img
                  key={idx}
                  src={src}
                  alt={`Gallery ${idx + 1}`}
                  className="gallery-image"
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Back button to return to profile */}
      <button className="username-button" onClick={() => navigate(-1)}>
        Back to Profile
      </button>
    </div>
  );
};

export default CarBuild;