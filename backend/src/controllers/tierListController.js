import TierList from "../models/TierList.js";

// Create or Update Tier List (Single list per user for now)
export const saveTierList = async (req, res) => {
    const { name, tiers, pool } = req.body;
    const userId = req.user.userId;

    try {
        // Find existing list or create new one (upsert)
        const tierList = await TierList.findOneAndUpdate(
            { user: userId }, // Filter
            { 
                name: name || "My Movie Ranking", 
                tiers, 
                pool, 
                updatedAt: Date.now() 
            }, // Update
            { 
                new: true, 
                upsert: true, 
                setDefaultsOnInsert: true 
            } // Options
        );

        res.status(200).json(tierList);
    } catch (error) {
        console.error("Save TierList Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get User's Tier Lists
export const getUserTierLists = async (req, res) => {
    const userId = req.user.userId;

    try {
        const lists = await TierList.find({ user: userId }).sort({ createdAt: -1 });
        res.json(lists);
    } catch (error) {
        console.error("Get TierLists Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Single Tier List
export const getTierListById = async (req, res) => {
    const { id } = req.params;

    try {
        const list = await TierList.findById(id);
        if (!list) return res.status(404).json({ message: "Tier List not found" });
        res.json(list);
    } catch (error) {
        console.error("Get TierList Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update existing Tier List
export const updateTierList = async (req, res) => {
    const { id } = req.params;
    const { tiers } = req.body;
    const userId = req.user.userId;

    try {
        const list = await TierList.findOne({ _id: id, user: userId });
        if (!list) return res.status(404).json({ message: "Not found or unauthorized" });

        list.tiers = tiers;
        await list.save();
        res.json(list);
    } catch (error) {
        console.error("Update TierList Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
