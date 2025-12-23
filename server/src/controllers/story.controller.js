import { Story } from "../models/story.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import mongoose from "mongoose";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/cloudinary.js";


export const getMyStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({ owner: req.user._id })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, stories, "My stories fetched successfully")
  );
});

export const getStories = asyncHandler(async (req, res) => {
  const stories = await Story.find()
    .populate("owner", "fullName avatar") // 👤 owner info
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, stories, "Stories fetched successfully"));
});


export const getStoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(id).populate(
    "owner",
    "fullName avatar"
  );

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, story, "Story fetched successfully"));
});

export const createStory = asyncHandler(async (req, res) => {
  const { title, date, place, description } = req.body;

  if (!title || !date || !place || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const photos = [];
  const videos = [];

  // 📸 upload photos
  if (req.files?.photos) {
    for (const file of req.files.photos) {
      const uploaded = await uploadOnCloudinary(file.path, "image");
      if (uploaded?.secure_url) {
        photos.push(uploaded.secure_url);
      }
    }
  }

  // 🎥 upload videos
  if (req.files?.videos) {
    for (const file of req.files.videos) {
      const uploaded = await uploadOnCloudinary(file.path, "video");
      if (uploaded?.secure_url) {
        videos.push(uploaded.secure_url);
      }
    }
  }

  const story = await Story.create({
    title,
    date,
    place,
    description,
    photos,
    videos,
    owner: req.user._id, // 🔐 owner from JWT
  });

  return res
    .status(201)
    .json(new ApiResponse(201, story, "Story created successfully"));
});

export const updateStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(id);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  // 🔐 ownership check
  if (story.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this story");
  }

  const { title, date, place, description } = req.body;

  if (title) story.title = title;
  if (date) story.date = date;
  if (place) story.place = place;
  if (description) story.description = description;

  // 📸 new photos
  if (req.files?.photos) {
    for (const file of req.files.photos) {
      const uploaded = await uploadOnCloudinary(file.path, "image");
      if (uploaded?.secure_url) {
        story.photos.push(uploaded.secure_url);
      }
    }
  }

  // 🎥 new videos
  if (req.files?.videos) {
    for (const file of req.files.videos) {
      const uploaded = await uploadOnCloudinary(file.path, "video");
      if (uploaded?.secure_url) {
        story.videos.push(uploaded.secure_url);
      }
    }
  }

  await story.save();

  return res
    .status(200)
    .json(new ApiResponse(200, story, "Story updated successfully"));
});

export const deleteStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(id);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  // 🔐 ownership check
  if (story.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this story");
  }

  // 🧹 delete photos from Cloudinary
  for (const photoUrl of story.photos) {
    const publicId = getPublicIdFromUrl(photoUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, "image");
    }
  }

  // 🧹 delete videos from Cloudinary
  for (const videoUrl of story.videos) {
    const publicId = getPublicIdFromUrl(videoUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, "video");
    }
  }

  await story.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Story deleted successfully"));
});

