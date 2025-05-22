import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AddBusiness.css';

const AddBusiness = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        address: '',
        description: '',
        image_url: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const DEFAULT_IMAGE_URL = '/banners/default.jpg'; //for later change: use a default image from server or internet

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        setSuccess(false);

        const submissionData = {
        ...formData,
        image_url: formData.image_url || DEFAULT_IMAGE_URL,
        };

        try {
        const response = await fetch("https://formspree.io/f/mnndgpoo", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            _subject: `New Business Submission: ${submissionData.name}`,
            ...submissionData
            }),
        });

        if (response.ok) {
            setSuccess(true);
            setFormData({ name: '', category: '', address: '', description: '', image_url: '' });
        } else {
            const responseData = await response.json();
            setError(`Submission failed: ${responseData.error || 'Unknown error'}`);
        }
        } catch (err) {
            console.error("Submission error:", err);
            setError("There was a problem submitting the form. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="add-business-container">
        <h2>Add a New Business</h2>
        <p>Submit a business to be featured on GearGrid.</p>

        {success && <div className="success-message">Business submitted successfully! Thank you.</div>}
        {error && <div className="error-message">{error}</div>}

        {!success && (
            <form onSubmit={handleSubmit} className="add-business-form">
            <div className="form-group">
                <label htmlFor="name">Business Name *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="form-input"
                >
                    <option value="">Select a category</option>
                    <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                    <option value="Cosmetic & Detailing">Cosmetic & Detailing</option>
                    <option value="Upgrades & Customization">Upgrades & Customization</option>
                    <option value="Emergency & Support Services">Emergency & Support Services</option>
                    <option value="Motorcycle Services">Motorcycle Services</option>
                    <option value="Truck & Off-Road Services">Truck & Off-Road Services</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label htmlFor="image_url">Image URL</label>
                <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="form-input"
                />
                <small>If left blank, a default image will be used.</small>
            </div>
            <div className='form-actions'>
                <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Business'}
            </button>
            <button type='button' className='cancel-btn' onClick={() => navigate(-1)}
            >Cancel</button>
            </div>
            </form>
        )}
        </div>
    );
};

export default AddBusiness;