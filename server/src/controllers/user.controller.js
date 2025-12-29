import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, userName } = req.body;

  if ([fullName, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check email
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  /* ------------------------------------
     USERNAME HANDLING
  ------------------------------------ */
  let finalUserName;

  if (userName) {
    // username provided
    const exists = await User.findOne({ userName: userName.toLowerCase() });
    if (exists) {
      throw new ApiError(409, "Username already taken");
    }
    finalUserName = userName.toLowerCase();
  } else {
    // auto-generate username
    const baseUserName = fullName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    let uniqueUserName = baseUserName;
    let counter = 1;

    while (await User.findOne({ userName: uniqueUserName })) {
      uniqueUserName = `${baseUserName}${counter}`;
      counter++;
    }

    finalUserName = uniqueUserName;
  }

  /* ------------------------------------
     FILE UPLOADS
  ------------------------------------ */
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  let avatar;
  let coverImage;

  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }

  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  /* ------------------------------------
     CREATE USER
  ------------------------------------ */
  const user = await User.create({
    fullName,
    userName: finalUserName,
    email,
    password,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  // 🔍 find user by email OR username
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { userName: identifier.toLowerCase() },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  // save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const editProfile = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    userName,
    oldPassword,
    newPassword,
  } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  /* ---------------- TEXT FIELDS ---------------- */

  if (fullName) {
    user.fullName = fullName.trim();
  }

  if (email) {
    const emailExists = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user._id },
    });

    if (emailExists) {
      throw new ApiError(409, "Email already in use");
    }

    user.email = email.toLowerCase();
  }

  if (userName) {
    const normalizedUserName = userName
      .toLowerCase()
      .replace(/\s+/g, "");

    const userNameExists = await User.findOne({
      userName: normalizedUserName,
      _id: { $ne: user._id },
    });

    if (userNameExists) {
      throw new ApiError(409, "Username already taken");
    }

    user.userName = normalizedUserName;
  }

  /* ---------------- PASSWORD UPDATE ---------------- */

  if (oldPassword || newPassword) {
    if (!oldPassword || !newPassword) {
      throw new ApiError(
        400,
        "Both oldPassword and newPassword are required to change password"
      );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword; // hashed by pre-save hook
  }

  /* ---------------- FILE UPLOADS ---------------- */

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
      throw new ApiError(400, "Error while uploading avatar");
    }
    user.avatar = avatar.url;
  }

  if (coverImageLocalPath) {
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage?.url) {
      throw new ApiError(400, "Error while uploading cover image");
    }
    user.coverImage = coverImage.url;
  }

  /* ---------------- SAVE USER ---------------- */

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Profile updated successfully")
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  // 🔑 IMPORTANT: rotate refresh token
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: req.user._id,
        fullName: req.user.fullName,
        userName: req.user.userName,
        email: req.user.email,
        avatar: req.user.avatar,
        coverImage: req.user.coverImage,
        followers: req.user.followers,
        following: req.user.following,
        followersCount: req.user.followers?.length || 0,
        followingCount: req.user.following?.length || 0,
        createdAt: req.user.createdAt,
      },
      "User fetched successfully"
    )
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const viewerId = req.user?._id; // may be undefined for public access

  const user = await User.findById(id)
    .select("-password -refreshToken")
    .populate("friends", "fullName avatar email");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // 🔍 check if viewer follows this user
  const isFollowing =
    viewerId &&
    user.followers?.some(
      (followerId) => followerId.toString() === viewerId.toString()
    );

  return res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar,
      coverImage: user.coverImage,

      friends: user.friends || [],

      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,

      isFollowing: Boolean(isFollowing),

      createdAt: user.createdAt,
    },
  });
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  editProfile,
  getCurrentUser,
  getUserById
};
