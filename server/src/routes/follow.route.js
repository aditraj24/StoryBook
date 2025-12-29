import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  followUser,
  unfollowUser,
  getMyFollowers,
  getMyFollowing,
  removeFollower,
} from "../controllers/follow.controller.js";

const router = Router();

router.post("/:id", verifyJWT, followUser);            // ✅ FOLLOW
router.post("/unfollow/:id", verifyJWT, unfollowUser);
router.post("/remove-follower/:id", verifyJWT, removeFollower);

router.get("/followers/me", verifyJWT, getMyFollowers);
router.get("/following/me", verifyJWT, getMyFollowing);

export default router;
