import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
/* ----------------------------------------
   GET MY FOLLOWERS
---------------------------------------- */
export const getMyFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "followers",
    "fullName userName avatar"
  );

  return res.status(200).json({
    success: true,
    data: user.followers,
  });
});

/* ----------------------------------------
   GET MY FOLLOWING
---------------------------------------- */
export const getMyFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "following",
    "fullName userName avatar"
  );

  return res.status(200).json({
    success: true,
    data: user.following,
  });
});

/*follow user*/
export const followUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  if (targetUserId.toString() === currentUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser) throw new ApiError(404, "User not found");

  const alreadyFollowing = currentUser.following.includes(targetUserId);
  if (alreadyFollowing) {
    throw new ApiError(400, "Already following this user");
  }

  currentUser.following.push(targetUserId);
  targetUser.followers.push(currentUserId);

  await currentUser.save();
  await targetUser.save();

  res.status(200).json(
    new ApiResponse(200, null, "User followed successfully")
  );
});

/* ----------------------------------------
   UNFOLLOW USER
---------------------------------------- */
export const unfollowUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.id;

  if (currentUserId.toString() === targetUserId) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // remove from following
  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUserId
  );

  // remove from followers
  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== currentUserId.toString()
  );

  await currentUser.save();
  await targetUser.save();

  return res.status(200).json({
    success: true,
    message: "User unfollowed successfully",
  });
});

/* ----------------------------------------
   REMOVE FOLLOWER
---------------------------------------- */
export const removeFollower = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const followerId = req.params.id;

  if (currentUserId.toString() === followerId) {
    throw new ApiError(400, "Invalid request");
  }

  const currentUser = await User.findById(currentUserId);
  const followerUser = await User.findById(followerId);

  if (!followerUser) {
    throw new ApiError(404, "User not found");
  }

  // remove follower from me
  currentUser.followers = currentUser.followers.filter(
    (id) => id.toString() !== followerId
  );

  // remove me from follower's following
  followerUser.following = followerUser.following.filter(
    (id) => id.toString() !== currentUserId.toString()
  );

  await currentUser.save();
  await followerUser.save();

  return res.status(200).json({
    success: true,
    message: "Follower removed successfully",
  });
});
