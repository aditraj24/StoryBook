import { Router } from "express";
import {
  getStories,        // all stories (public)
  getMyStories,      // only logged-in user's stories
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
router.route("/").get(getStories);

/* -------- User-specific Routes -------- */

// 👤 Logged-in user's stories
router.route("/me").get(verifyJWT, getMyStories);

/* -------- Public Single Story -------- */

// 📖 View single story (public)
router.route("/:id").get(getStoryById);

/* -------- Protected Routes -------- */

// ✍️ Create story
router.route("/").post(
  verifyJWT,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  createStory
);

// ✏️ Update / 🗑️ Delete (owner only)
router
  .route("/:id")
  .patch(
    verifyJWT,
    upload.fields([
      { name: "photos", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ]),
    updateStory
  )
  .delete(verifyJWT, deleteStory);

export default router;
