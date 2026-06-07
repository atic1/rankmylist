import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  overview: {
    type: String,
    default: "",
  },
  posterPath: {
    type: String,
    default: null, // Should store full URL or just path
  },
  releaseDate: {
    type: Date,
    default: null,
  },
  genres: [{
    type: String,
  }],
  voteAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  customAddedByAdmin: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);
