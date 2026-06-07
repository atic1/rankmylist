import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from './StarRating';

const ReviewSection = ({ movieId, onReviewChange }) => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Decode token to get current user ID
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                setCurrentUserId(decoded.id);
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/${movieId}`);
            setReviews(res.data.reviews);
            setAverageRating(res.data.averageRating);
            setLoading(false);
            if (onReviewChange) onReviewChange();
        } catch (error) {
            console.error("Error fetching reviews", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [movieId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a rating");

        const token = localStorage.getItem('token');
        if (!token) return alert("Please login to review");

        try {
            if (editingReviewId) {
                // Update
                await axios.put(`${import.meta.env.VITE_API_URL}/reviews/${editingReviewId}`, {
                    rating,
                    comment: newReview
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEditingReviewId(null);
                alert("Review updated!");
            } else {
                // Create
                await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
                    movieId,
                    comment: newReview,
                    rating
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setNewReview('');
            setRating(0);
            fetchReviews(); // Refresh
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to submit review";
            alert(msg);
        }
    };

    const handleEdit = (review) => {
        setEditingReviewId(review._id);
        setNewReview(review.comment);
        setRating(review.rating);
        window.scrollTo({ top: document.getElementById('review-form').offsetTop - 100, behavior: 'smooth' });
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review? Your star rating will be kept in your library.")) return;
        
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReviews();
        } catch (error) {
            alert("Failed to delete review");
        }
    };

    // Check if user already reviewed
    const userReview = reviews.find(r => String(r.user) === String(currentUserId));

    return (
        <div className="bg-gray-100 p-6 rounded-lg mt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl text-gray-900 font-bold">User Reviews</h3>
                {averageRating > 0 && (
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-300">
                        <span className="text-gray-600 text-sm">Community Avg:</span>
                        <div className="flex items-center gap-1 text-yellow-600 font-bold text-lg">
                            <StarRating rating={Math.round(averageRating)} readOnly />
                            <span className="ml-1 text-gray-900">{averageRating}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Review Form (Only show if not reviewed OR currently editing) */}
            {(!userReview || editingReviewId) ? (
                <form id="review-form" onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded-lg border border-gray-300">
                    <h4 className="text-gray-900 mb-2 font-bold flex items-center gap-2">
                        {editingReviewId ? "✏️ Edit Your Review" : "✍️ Write a Review"}
                    </h4>
                    <div className="mb-4">
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <textarea
                        className="w-full bg-gray-50 text-gray-900 p-3 rounded border border-gray-300 focus:outline-none focus:border-indigo-500 transition"
                        placeholder="Share your thoughts..."
                        rows="3"
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                    />
                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition">
                            {editingReviewId ? "Update Review" : "Post Review"}
                        </button>
                        {editingReviewId && (
                            <button 
                                type="button" 
                                onClick={() => { setEditingReviewId(null); setNewReview(''); setRating(0); }}
                                className="bg-gray-300 text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                <div className="mb-8 bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-center">
                    <p className="text-indigo-800">You've already reviewed this movie. You can edit or delete your review below.</p>
                </div>
            )}

            {/* Review List */}
            <div className="space-y-4">
                {loading ? <p className="text-gray-500">Loading reviews...</p> :
                    reviews.length === 0 ? <p className="text-gray-500">No reviews yet. Be the first!</p> :
                        reviews.map((review) => (
                            <div key={review._id} className={`pb-4 border-b border-gray-300 ${String(review.user) === String(currentUserId) ? 'bg-indigo-50 -mx-6 px-6 pt-4 border-indigo-200' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold text-indigo-600">
                                            {review.userName || "User"}
                                            {String(review.user) === String(currentUserId) && <span className="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                        </span>
                                        <span className="text-gray-500 text-xs ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StarRating rating={review.rating} readOnly />
                                        {String(review.user) === String(currentUserId) && (
                                            <div className="flex gap-3 text-xs">
                                                <button onClick={() => handleEdit(review)} className="text-indigo-600 hover:text-indigo-700 font-bold uppercase transition">Edit</button>
                                                <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:text-red-700 font-bold uppercase transition">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed italic">"{review.comment}"</p>
                            </div>
                        ))
                }
            </div>
        </div>
    );
};

export default ReviewSection;
