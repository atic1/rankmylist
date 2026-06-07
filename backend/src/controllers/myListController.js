import MyList from "../models/MyList.js";

// Add to My List or Update existing entry
export const addToMyList = async (req, res) => {
    console.log("👉 addToMyList called. Body:", req.body);
    const { movieId, title, posterPath, status, personalRating } = req.body;
    const userId = req.user.userId;
    console.log("👉 User ID from token:", userId);

    try {
        let entry = await MyList.findOne({ user: userId, movieId });

        if (entry) {
            console.log("👉 Existing entry found. Updating...");
            entry.status = status;
            entry.personalRating = personalRating;
            entry.title = title;
            entry.posterPath = posterPath;
            entry.updatedAt = Date.now();
            await entry.save();
            console.log("✅ Entry updated successfully:", entry);
            return res.json({ message: "List updated", entry });
        }

        console.log("👉 No existing entry. Creating new...");
        entry = new MyList({
            user: userId,
            movieId,
            title,
            posterPath,
            status,
            personalRating,
        });
        await entry.save();
        console.log("✅ New entry saved successfully:", entry);
        res.status(201).json({ message: "Added to list", entry });
    } catch (error) {
        console.error("Add MyList Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get User's List
export const getMyList = async (req, res) => {
    const userId = req.user.userId;
    const { status } = req.query; // optional filter ?status=watched

    try {
        const query = { user: userId };
        if (status) query.status = status;

        const list = await MyList.find(query).sort({ updatedAt: -1 });
        res.json(list);
    } catch (error) {
        console.error("Get MyList Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Remove from List
export const removeFromMyList = async (req, res) => {
    const userId = req.user.userId;
    const { movieId } = req.params;

    try {
        await MyList.findOneAndDelete({ user: userId, movieId });
        res.json({ message: "Removed from list" });
    } catch (error) {
        console.error("Remove MyList Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
