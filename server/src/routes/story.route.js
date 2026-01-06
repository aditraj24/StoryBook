import { Router } from "express";
import {
  getStories, // public feed
  getMyStories, // logged-in user's stories
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
} from "../controllers/story.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/* -------- Public Routes -------- */

// 🌍 All stories (public feed)
router.route("/").get(verifyJWT,getStories);

/* -------- User-specific Routes -------- */

// 👤 Logged-in user's stories
router.route("/me").get(verifyJWT, getMyStories);

// 📖 View single story (public)
router.route("/:id").get(getStoryById);
/* -------- Protected Routes -------- */

// ✍️ Create story
router.route("/").post(
  verifyJWT,
  upload.array("media", 15), // images + videos + audio
  createStory
);

// ✏️ Update story (owner only)
router.route("/:id").patch(verifyJWT, upload.array("media", 15), updateStory);

// 🗑️ Delete story (owner only)
router.route("/:id").delete(verifyJWT, deleteStory);

export default router;
