import express from "express";
import { saveTierList, getUserTierLists, getTierListById, updateTierList } from "../controllers/tierListController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Assuming I will create this if it doesn't exist

const router = express.Router();

router.use(authMiddleware); // Protect all routes

router.post("/", saveTierList);
router.get("/", getUserTierLists);
router.get("/:id", getTierListById);
router.put("/:id", updateTierList);

export default router;
