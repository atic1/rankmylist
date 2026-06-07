import mongoose from "mongoose";

const tierListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    default: "My Movie Ranking",
    trim: true,
  },
  tiers: {
    S: [mongoose.Schema.Types.Mixed], // Store full movie objects { id, title, poster_path, etc }
    A: [mongoose.Schema.Types.Mixed],
    B: [mongoose.Schema.Types.Mixed],
    C: [mongoose.Schema.Types.Mixed],
    D: [mongoose.Schema.Types.Mixed],
  },
  pool: [mongoose.Schema.Types.Mixed], // Store movies in the candidate pool
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("TierList", tierListSchema);
