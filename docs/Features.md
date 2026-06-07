# Features & System Mechanics - RankMyList

This document explains the deeper technical implementation of the key features in the RankMyList application.

## 📊 Persistent Tier Lists

### 1. Drag & Drop Architecture
The tier list uses the `@dnd-kit/core` and `@dnd-kit/sortable` libraries to provide a smooth, accessible drag-and-drop experience. 
- **Context**: The `TierListPage` wraps the `TierBoard` in a `DndContext`.
- **Containers**: Tiers (S, A, B, C, D) and the Movie Pool are treated as distinct sortable containers.
- **Data Structure**: We store full movie objects (`{ id, title, poster_path, ... }`) rather than just IDs to ensure high performance (zero TMDB lookups needed when loading the board).

### 2. Database Persistence
- **Upsert Strategy**: Saving the tier list uses a `findOneAndUpdate` with `upsert: true`. This ensures each user has exactly one persistent state that follows them across sessions.
- **Syncing**: When a movie is moved, the local state is updated immediately, and the "Save Rankings" button triggers a batch update to MongoDB.

---

## 🔍 Recommendation Engine ("For You")

The "For You" page uses various TMDB discovery criteria to simulate a personalized experience:
- **🔥 Popular Today**: Fetches current `trending/movie/week`.
- **💎 Hidden Gems**: Uses TMDB's `discover` endpoint with `vote_average.gte=7.5` and `vote_count.lte=1000`.
- **🏆 Award Winners**: filters for high-rated, popular classics.
- **Fallback Logic**: If specific filters yield no results, the system always falls back to the top 20 trending movies to ensure the UI is never empty.

---

## ✍️ Community Review System

### 1. Integrity Constraints
- **One-per-user**: The system identifies the user via JWT and prevents duplicate reviews for the same `movieId`.
- **Ownership Verification**: Frontend uses a custom JWT decoder to compare the logged-in user's ID with the review's `user` field, dynamically enabling "Edit" and "Delete" buttons.

### 2. Rating Synchronization
- **Consistency**: When a user reviews a movie, their star rating (1-10) is automatically synced with their "Watched" list in `MyList`.
- **Deletion Logic**: Deleting a review removes the public comment and the "Community Average" contribution, but preserves the user's private rating in their library (as requested).

---

## 📚 Personal Library Management

- **Status Tracking**: Movies are categorized into `watched` or `plan_to_watch`.
- **Uniqueness**: A unique compound index on `{ user, movieId }` prevents duplicate entries in the user's library.
- **Real-time Updates**: Navigation between "Search", "Details", and "My Library" reflect state changes immediately thanks to centralized state management in the parent components.
