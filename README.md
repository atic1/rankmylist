# RankMyList - The Ultimate Movie Experience 🎬

RankMyList is a full-stack web application designed for cinema enthusiasts to discover, curate, and rank their favorite movies and TV shows. With a persistent drag-and-drop tier list system and personalized discovery pages, it's the perfect companion for managing your film library.

---

## 🌟 Key Features

### 1. Persistent Tier Lists (Ranking)
- **Drag & Drop**: Effortlessly rank movies using a professional S-to-D tier board (powered by `dnd-kit`).
- **Persistence**: Your rankings are automatically saved to the database and reloaded on your next visit.
- **Candidate Pool**: Search and add any movie from the TMDB database to your ranking pool.

### 2. Personalized "For You" Page
- **Smart Recommendations**: Custom categories like "🔥 Popular Today", "💎 Hidden Gems", and "🏆 Award Winners".
- **Dynamic Content**: Powered by the TMDB API with real-time popularity and rating data.

### 3. Movie Discovery & Search
- **Category Browsing**: Explore movies by genre (Action, Horror, Anime, etc.).
- **Global Search**: Find details for over 500,000+ movies and TV shows.
- **Detailed Pages**: View cast, similar movie recommendations, and community ratings.

### 4. Personal Library ("My List")
- **Watched & Plan to Watch**: track your movie history and future watchlist.
- **Direct Integration**: Reviews and ratings automatically sync with your personal library.

### 5. Community Reviews
- **Ratings**: Give 1-10 star ratings to any movie.
- **Comments**: Share your thoughts with the community.
- **Constraints**: One review per user per movie (editable and deletable).

---

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication.
- **External API**: Integration with [The Movie Database (TMDB)](https://www.themoviedb.org/).

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas (or local instance)
- TMDB API Key (Free)

### 1. Clone the repository
```bash
git clone <your-repo-link>
cd rank_my_list
```

### 2. Configure Backend
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
```

### 3. Configure Frontend
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Locally
**Terminal 1 (Backend)**:
```bash
cd backend
npm install
npm run server
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Project Structure

```bash
rank_my_list/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Business logic (auth, movies, reviews)
│   │   ├── models/        # Mongoose schemas (User, Review, MyList, TierList)
│   │   ├── routes/        # API endpoint definitions
│   │   └── middleware/    # Auth and security logic
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Navbar, ReviewSection, etc.)
│   │   ├── pages/         # Full page views (Home, TierList, MovieDetails)
│   │   └── App.jsx        # Routing and global state
│   └── index.css          # Design system and Tailwind configuration
```

For more technical details, refer to the [ER Diagram](file:///c:/Users/ankit/Music/rank_my_list/er_diagram.md) or the [API Documentation](file:///c:/Users/ankit/Music/rank_my_list/docs/API.md).
