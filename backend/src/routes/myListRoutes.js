import express from "express";
import { addToMyList, getMyList, removeFromMyList } from "../controllers/myListController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addToMyList);
router.get("/", getMyList);
router.delete("/:movieId", removeFromMyList);

export default router;
