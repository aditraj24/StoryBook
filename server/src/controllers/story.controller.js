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
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 9;
  const { sortBy = "newest" } = req.query;

  const totalStories = await Story.countDocuments({
    owner: req.user._id,
  });

  let stories = [];

  if (sortBy === "random") {
    // ✅ TRUE RANDOM (no pagination)
    stories = await Story.aggregate([
      { $match: { owner: req.user._id } },
      { $sample: { size: limit } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $project: {
          "owner.password": 0,
          "owner.refreshToken": 0,
        },
      },
    ]);
  } else {
    const skip = (page - 1) * limit;

    const sortCriteria =
      sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    stories = await Story.find({ owner: req.user._id })
      .populate("owner", "fullName avatar")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stories,
        pagination: {
          page,
          limit,
          totalStories,
          totalPages: Math.ceil(totalStories / limit),
          random: sortBy === "random",
        },
      },
      "My stories fetched successfully"
    )
  );
});

export const getStories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const { sortBy = "newest" } = req.query;

  const currentUserId = req.user._id; // 🔑 logged-in user

  let stories = [];

  // count ONLY stories not owned by current user
  const totalStories = await Story.countDocuments({
    owner: { $ne: currentUserId },
  });

  if (sortBy === "random") {
    // ✅ TRUE RANDOM (excluding own stories)
    stories = await Story.aggregate([
      {
        $match: {
          owner: { $ne: currentUserId },
        },
      },
      { $sample: { size: limit } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $project: {
          "owner.password": 0,
          "owner.refreshToken": 0,
        },
      },
    ]);
  } else {
    // Normal pagination sorting (excluding own stories)
    const skip = (page - 1) * limit;

    const sortCriteria =
      sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    stories = await Story.find({
      owner: { $ne: currentUserId },
    })
      .populate("owner", "fullName avatar")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stories,
        pagination: {
          page,
          limit,
          totalStories,
          totalPages: Math.ceil(totalStories / limit),
        },
      },
      "Stories fetched successfully"
    )
  );
});


export const getStoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(id).populate("owner", "fullName avatar");

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, story, "Story fetched successfully"));
});

export const createStory = asyncHandler(async (req, res) => {
  const { title, date, place, description, text } = req.body;

  // convert string → Date
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
  }

  // Basic validation
  if (!title || !date || !place || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const media = [];

  /* ---------- Handle Uploaded Files ---------- */
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      let mediaType;

      if (file.mimetype.startsWith("image/")) {
        mediaType = "image";
      } else if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
      } else if (file.mimetype.startsWith("audio/")) {
        mediaType = "audio";
      } else {
        continue;
      }

      const uploaded = await uploadOnCloudinary(file.path, mediaType);

      if (uploaded?.secure_url) {
        media.push({
          type: mediaType,
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
        });
      }
    }
  }

  /* ---------- Handle Text Content ---------- */
  if (text) {
    media.push({
      type: "text",
      content: text,
    });
  }

  /* ---------- Create Story ---------- */
  const story = await Story.create({
    title,
    date: parsedDate,
    place,
    description,
    media,
    owner: req.user._id,
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

  // 🔐 Ownership check
  if (story.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this story");
  }

  const { title, date, place, description, text } = req.body;

  /* ---------- Update Basic Fields ---------- */
  if (title) story.title = title;
  if (date) story.date = date;
  if (place) story.place = place;
  if (description) story.description = description;

  /* ---------- Handle New Uploaded Media ---------- */
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      let mediaType;

      if (file.mimetype.startsWith("image/")) {
        mediaType = "image";
      } else if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
      } else if (file.mimetype.startsWith("audio/")) {
        mediaType = "audio";
      } else {
        continue;
      }

      const uploaded = await uploadOnCloudinary(file.path, mediaType);

      if (uploaded?.secure_url) {
        story.media.push({
          type: mediaType,
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
        });
      }
    }
  }

  /* ---------- Handle New Text Block ---------- */
  if (text) {
    story.media.push({
      type: "text",
      content: text,
    });
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

  // 🔐 Ownership check
  if (story.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this story");
  }

  /* ---------- Delete media from Cloudinary ---------- */
  if (story.media && story.media.length > 0) {
    for (const item of story.media) {
      // Only file-based media have publicId
      if (["image", "video", "audio"].includes(item.type) && item.publicId) {
        await deleteFromCloudinary(item.publicId, item.type);
      }
    }
  }

  /* ---------- Delete story ---------- */
  await story.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Story deleted successfully"));
});
