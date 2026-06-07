# Algorithms Used in Rank My List

This document details the step-by-step algorithms used throughout the Rank My List system. These can be used directly in your project documentation, reports, or presentations.

---

## 1. User Registration Algorithm (Password Hashing)
**Purpose:** To securely register a new user without storing their password in plain text.

**Algorithm:**
1. **START**
2. **Input:** `username`, `email`, `password` from the user.
3. Check database for existing user with the same `email`.
4. **IF** `email` already exists:
    * Return Error "Email already exists".
    * **END**.
5. **ELSE**:
    * Generate a salt with 10 cryptographic rounds.
    * Hash the `password` using the **Bcrypt** algorithm combined with the generated salt (`hashedPassword`).
6. Create a new `User` record in the database with `username`, `email`, `hashedPassword`, and `role = "user"`.
7. Return Success message and user ID.
8. **END**

---

## 2. User Authentication Algorithm (JWT Generation)
**Purpose:** To verify user credentials and issue a secure session token.

**Algorithm:**
1. **START**
2. **Input:** `email` and `password` from the login form.
3. Search database for `User` by `email`.
4. **IF** `User` is not found:
    * Return Error "User not found".
    * **END**.
5. Fetch `hashedPassword` from the database.
6. Compare raw `password` against `hashedPassword` using Bcrypt compare.
7. **IF** passwords do NOT match:
    * Return Error "Invalid credentials".
    * **END**.
8. **ELSE**:
    * Generate a JSON Web Token (JWT) using HMAC-SHA256 algorithm.
    * Embed `user._id`, `username`, and `role` inside the token payload.
    * Set token expiration to "1 day".
9. Return the newly generated JWT token to the client.
10. **END**

---

## 3. Personalized Recommendation Algorithm
**Purpose:** To generate a unique, personalized list of suggested movies based on what the user has previously watched and rated highly.

**Algorithm:**
1. **START**
2. **Input:** `userId`.
3. **IF** `userId` is empty/null (Guest User):
    * Fetch "Trending Movies" from external API.
    * Return Trending Data.
    * **END**.
4. Retrieve the user's `MyList` records from the database where `status = "watched"` AND `personalRating` is not null.
5. Sort the retrieved list descending based on `personalRating` (Highest ratings first).
6. Limit the sorted list to the top 3 highest-rated movies.
7. **IF** user has 0 rated movies:
    * Fetch "Trending Movies" from external API.
    * Return Trending Data.
    * **END**.
8. Generate a random index `R` between 0 and (Length of Top Movies List - 1).
9. Select `TargetMovie = TopMoviesList[R]`.
10. Send API Request to TMDB for movies similar to `TargetMovie.id`.
11. **IF** similar movies array is empty:
    * Send fallback API Request for recommendations based on `TargetMovie.id`.
12. Append title of `TargetMovie` to the response payload to explain *why* these movies were recommended.
13. Return the personalized movie array to the frontend.
14. **END**

---

## 4. Local Community Rating Calculation Algorithm
**Purpose:** To calculate an average score for a movie based on user reviews specific to this application.

**Algorithm:**
1. **START**
2. **Input:** `movieId`.
3. Query database to find all `Review` records matching `movieId`.
4. Initialize `totalSum = 0` and `reviewCount = 0`.
5. **IF** list of `Reviews` is empty:
    * Return `localRating = null`.
    * **END**.
6. **FOR EACH** `review` in `Reviews`:
    * `totalSum = totalSum + review.rating`
    * `reviewCount = reviewCount + 1`
7. Compute `averageRating = totalSum / reviewCount`.
8. Format `averageRating` to 1 decimal place (`localRating`).
9. Return both `localRating` and `reviewCount` to the display component.
10. **END**

---

## 5. Tier List Repositioning Algorithm (Drag and Drop)
**Purpose:** To update the rank/tier of a movie when a user drags it across the screen.

**Algorithm:**
1. **START**
2. **Input:** `movingItemId`, `sourceTier`, `destinationTier`, `destinationIndex`.
3. Find the exact object of `movingItem` within the `sourceTier` array.
4. Remove `movingItem` from the `sourceTier` array.
5. **IF** `sourceTier` is equal to `destinationTier`:
    * Re-insert `movingItem` into the `sourceTier` array at the new `destinationIndex`.
6. **ELSE**:
    * Insert `movingItem` into the `destinationTier` array at the target `destinationIndex`.
7. Update the overarching React UI State.
8. Send an async request with the new full Tier configuration to the backend to persist changes in the database.
9. **END**
