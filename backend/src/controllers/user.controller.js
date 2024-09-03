import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/upload.cloudinary.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { isValidObjectId } from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    next(
      new ApiError(
        500,
        "Something went wrong while generating access and refresh tokens"
      )
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError(422, errors.array()));
  }

  const { userName, email, password, fullName } = req.body;

  // console.log(userName, email, password, fullName);

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    return next(new ApiError(400, "Email or username is taken"));
  }
  // avatar will definitely be present at this point courtsey express validator
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    return next(new ApiError(400, "Avatar file is required"));
  }

  // console.time("avatar upload");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.timeEnd("avatar upload");

  if (!avatar) {
    return next(
      new ApiError(500, "Something went wrong while uploading avatar image")
    );
  }

  let coverImage;
  if (coverImageLocalPath) {
    // console.time("coverImage upload");
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // console.timeEnd("coverImage upload");

    if (!coverImage) {
      return next(
        new ApiError(500, "Something went wrong while uploading cover image")
      );
    }
  }

  const user = await User.create({
    userName,
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return next(
      new ApiError(500, "something went wrong while registering the user")
    );
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  /*
    get data from frontend - email, password
    perform data validation and sanity
    find user in DB
    if found, cross check the provided password against existing users in database
    generate access and refresh token and send to frontend in cookies
    send success response
  */

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(422, "Please enter all the required fields", errors.array())
    );
  }

  const { userName, email, password } = req.body;
  // console.log(userName, email, password);

  if (!email && !userName) {
    return next(new ApiError(400, "Email or username is missing"));
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    return next(
      new ApiError(400, "User does not eixst, please create your account.")
    );
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ApiError(400, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -createdAt -updatedAt -coverImage -watchHistory -__v"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None", // Allow cross-origin cookies
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully..."
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out Successfully..."));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new ApiError(401, "unauthorized request"));
  }

  const decodedUser = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedUser._id);

  if (!user) {
    return next(new ApiError(401, "Invalid refresh token"));
  }

  if (incomingRefreshToken !== user.refreshToken) {
    return next(new ApiError(401, "Invalid or expired refresh token"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "access token refreshed successfully!"
      )
    );
});

const updateUserPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(422, "Please enter all the required fields", errors.array())
    );
  }

  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (!(oldPassword && newPassword && confirmNewPassword)) {
    return next(new ApiError(400, "Please provide all fields"));
  }

  const user = await User.findById(req.user._id);

  const isPasswordMatch = await user.comparePassword(oldPassword);

  if (!isPasswordMatch) {
    return next(new ApiError(400, "Old password is incorrect!"));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new ApiError(400, "Passwords do not match!"));
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getLoggedInUser = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "current logged in user fetched successfully"
      )
    );
});

const updateAccountDetails = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(422, "Please enter all the required fields", errors.array())
    );
  }

  const { email, fullName } = req.body;

  if (!(email || fullName)) {
    return next(new ApiError(400, "Email or Full Name field cannot be empty"));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email,
        fullName,
      },
    },
    { new: true }
  ).select("-password");

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

const updateUserAvatarImage = asyncHandler(async (req, res, next) => {
  const loggedInUser = req.user;

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    return next(new ApiError(400, "Avatar file is missing"));
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar || !avatar.url) {
    return next(
      new ApiError(500, "something went wrong while uploading the avatar file")
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    loggedInUser._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  // remove/delete old image after successfull update of new avatar
  const imagePublicId = loggedInUser.avatar.split("/").pop().split(".")[0];
  await deleteFromCloudinary(imagePublicId);

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "avatar image updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res, next) => {
  const loggedInUser = req.user;

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    return next(new ApiError(400, "Cover Image is missing"));
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage || !coverImage.url) {
    return next(
      new ApiError(
        500,
        "something went wrong while uploading the cover Image file"
      )
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    loggedInUser._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  // remove/delete old image after successfull update of new cover image
  const imagePublicId = loggedInUser.coverImage.split("/").pop().split(".")[0];
  await deleteFromCloudinary(imagePublicId);

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover Image updated successfully")
    );
});

const getUserChannelDetails = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(422, "Please enter all the required fields", errors.array())
    );
  }

  const { userName } = req.params;

  if (!userName) {
    return next(new ApiError(400, "username is missing"));
  }

  const pipeline = [
    {
      $match: {
        userName,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        userName: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        email: 1,
        isSubscribed: 1,
      },
    },
  ];

  const channelDetails = await User.aggregate(pipeline);
  // console.log("Channel details pipeline output \n", channelDetails);

  if (!channelDetails.length) {
    return next(
      new ApiError(400, `Channel with the name ${userName} does not exist`)
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelDetails,
        "Channel details fetched successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res, next) => {
  const pipeline = [
    {
      $match: {
        _id: req.user._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        watchHistory: 1,
      },
    },
  ];

  const user = await User.aggregate(pipeline);
  // console.log(user)

  if (!user) {
    return next(new ApiError(401, "unauthorized access"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    );
});

const deleteVideoFromWatchHistory = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "No Video ID provided"));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "Invalid Video ID"));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        watchHistory: videoId,
      },
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.watchHistory,
        "Video deleted from Watch History"
      )
    );
});

const clearWatchHistory = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        watchHistory: 1,
      },
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(404, "User not found in DB"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.watchHistory,
        "watch history cleared successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserPassword,
  getLoggedInUser,
  updateAccountDetails,
  updateUserAvatarImage,
  updateUserCoverImage,
  getUserChannelDetails,
  getWatchHistory,
  deleteVideoFromWatchHistory,
  clearWatchHistory,
};
