# API Documentation - RankMyList

Most endpoints (except for authentication and public movie data) require a **JWT Bearer Token** in the `Authorization` header.

## 🔑 Authentication (`/api/auth`)

### 1. Register User
- **URL**: `POST /register`
- **Body**: `{ username, email, password }`
- **Response**: `201 Successfully registered` + User Object.

### 2. Login User
- **URL**: `POST /login`
- **Body**: `{ email, password }`
- **Response**: `200` + `{ token, user }`.

---

## 🎬 Movies (`/api/movies`)

### 1. Get Movie/TV Details
- **URL**: `GET /:id?type=movie|tv`
- **Description**: Returns TMDB details + community `localRating` and `reviewCount`.

### 2. Search Media
- **URL**: `GET /search?query=...`
- **Description**: Multi-search (Movie + TV).

### 3. Trending
- **URL**: `GET /trending`
- **Description**: Returns top 20 trending movies of the week.

### 4. Category Details
- **URL**: `GET /category?category=...&genreId=...&page=...`
- **Description**: Discover movies by segment with pagination support.

---

## ✍️ Reviews (`/api/reviews`)

### 1. Get Movie Reviews
- **URL**: `GET /:movieId`
- **Response**: `{ reviews, averageRating }`.

### 2. Post Review (Protected)
- **URL**: `POST /`
- **Body**: `{ movieId, rating, comment }`
- **Constraint**: One review per user/movie.

### 3. Update Review (Protected)
- **URL**: `PUT /:reviewId`
- **Body**: `{ rating, comment }`.

### 4. Delete Review (Protected)
- **URL**: `DELETE /:reviewId`.

---

## 📊 Tier List (`/api/tierlist`)

### 1. Get Tier List (Protected)
- **URL**: `GET /`
- **Description**: returns the user's primary ranking board (tiers + pool).

### 2. Save Tier List (Protected)
- **URL**: `POST /`
- **Body**: `{ tiers, pool }`
- **Description**: Upserts the user's persistent hierarchy.

---

## 📚 My Library (`/api/mylist`)

### 1. Get List (Protected)
- **URL**: `GET /`
- **Response**: Full list of user's movies.

### 2. Update/Add to List (Protected)
- **URL**: `POST /`
- **Body**: `{ movieId, title, posterPath, status }`
- **Constraint**: Unique per user/movie.

---

## 🛡️ Admin (`/api/admin`)

### 1. Get All Users (Admin Only)
- **URL**: `GET /users`.

### 2. Delete User (Admin Only)
- **URL**: `DELETE /users/:userId`.
