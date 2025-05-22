// src/components/BusinessDetail.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/BusinessDetail.css";

// main component for displaying individual business page
const BusinessDetail = () => {
  const { name: businessName } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  //const [comments, setComments] = useState([]);
  //const [image, setImage] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const currentUserId = localStorage.getItem("userId") ? parseInt(localStorage.getItem("userId")) : null;

  const navigate = useNavigate();

  const fetchBusinessDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/businesses/${encodeURIComponent(businessName)}`);
      const data = await response.json();
      if (data.success) {
        setBusiness(data.business);
        fetchReviews(data.business.id);
      } else {
        setError(data.message || "Business not found.");
      }
    } catch (err) {
      console.error("Fetch business error:", err);
      setError("Failed to load business details.");
    } finally {
      setIsLoading(false);
    }
  }, [businessName]);

  const fetchReviews = async (businessId) => {
    if (!businessId) return;
    try {
      const response = await fetch(`http://localhost:3001/api/businesses/${businessId}/reviews`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error("Failed to fetch reviews:", data.message);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    fetchBusinessDetails();
  }, [fetchBusinessDetails]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("You must be logged in to submit a review.");
      return;
    }
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    const reviewData = {
      userId: currentUserId,
      rating,
      comment,
    };

    const url = editingReview
      ? `http://localhost:3001/api/reviews/${editingReview.id}`
      : `http://localhost:3001/api/businesses/${business.id}/reviews`;
    const method = editingReview ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
      const data = await response.json();

      if (data.success) {
        if (editingReview) {
          setReviews(reviews.map(r => r.id === data.review.id ? data.review : r));
        } else {
          setReviews([data.review, ...reviews]);
        }
        // Reset form
        setComment("");
        setRating(0);
        setHover(0);
        setEditingReview(null);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Review submission/update error:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleEditClick = (reviewToEdit) => {
    setEditingReview(reviewToEdit);
    setRating(reviewToEdit.rating);
    setComment(reviewToEdit.comment || "");
    const reviewForm = document.getElementById('review-form-section');
    if (reviewForm) {
        reviewForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setRating(0);
    setComment("");
    setHover(0);
  };

  const userHasReviewed = reviews.some(review => review.user_id === currentUserId);
  const canSubmitReview = currentUserId && (!userHasReviewed || editingReview);
  
  // if business not found, display message 
  if (!business) {
    return <h2>Business not found</h2>;
  }

    // calculate average rating based on submitted reviews
    const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

    if (isLoading) return <div className="loading">Loading business details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!business) return <div className="error-message">Business not found.</div>;


  return (
    <div className="business-detail-container">
      <div className="back-button-wrapper">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      </div>
      <img
        src={business.image_url || "/banners/default.jpg"}
        alt={`${business.name} banner`}
        className="business-banner"
      />

      <div className="business-info"> 
        <h1>{business.name}</h1>
        <p><strong>Category:</strong> {business.category}</p>
        <p><strong>Address:</strong> {business.address}</p>
        {business.description && <p className="business-description">{business.description}</p>}
      </div>

      <div className="services-list">
        <h3>Services Offered</h3>
        {business.services && business.services.trim() !== "" ? (
          <ul>
            {business.services.split(',').map((service, idx) => (
              <li key={idx}>{service.trim()}</li>
            ))}
          </ul>
        ) : (
          <p>No services listed.</p>
        )}
      </div>

      <div id="review-form-section" className="review-section">
        <h3>{editingReview ? "Edit Your Review" : "Leave a Review"}</h3>
        {currentUserId ? (
          canSubmitReview ? (
            <>
              <div className="star-rating">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <button
                      key={index}
                      className={starValue <= (hover || rating) ? "on" : "off"}
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHover(starValue)}
                      onMouseLeave={() => setHover(0)}
                    > ★ </button>
                  );
                })}
              </div>
              <form onSubmit={handleReviewSubmit}>
                <textarea
                  placeholder="Write a comment (optional)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <button type="submit">
                  {editingReview ? "Update Review" : "Submit Review"}
                </button>
                {editingReview && (
                  <button type="button" onClick={handleCancelEdit} className="cancel-edit-btn">
                    Cancel Edit
                  </button>
                )}
              </form>
            </>
          ) : (
            <p>You have already reviewed this business. You can edit your existing review below.</p>
          )
        ) : (
          <p>Please <a href="/login">log in</a> to leave a review.</p>
        )}
      </div>

      <div className="comments-section"> 
        <h3>Reviews ({reviews.length})</h3>
        <div className="reviews-summary">
          <div className="average-rating">
            <h1>{averageRating} <span>out of 5</span></h1>
            <p>{reviews.length} Rating{reviews.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                  <div className="review-meta">
                    <span className="review-username">{review.username || "Anonymous"}</span>
                    <span className="review-date">{new Date(review.create_time).toLocaleDateString()}</span>
                    {review.created_at !== review.updated_at && <span className="review-edited">(edited)</span>}
                  </div>
                </div>
                {review.comment && <p className="review-text">{review.comment}</p>}
                {currentUserId === review.user_id && !editingReview && (
                  <button onClick={() => handleEditClick(review)} className="edit-review-btn">
                    Edit Your Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDetail;