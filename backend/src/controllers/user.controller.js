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
import { transporter } from "../utils/nodemailer.js";

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // check if user exits in th db.
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return next(new ApiError(404, "User not found."));
  }

  const payload = {
    userId: existingUser._id,
  };

  // generate a token for the user containing users id.
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });

  // send the token to the users email

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const clientUrl =
    process.env.NODE_ENV === "development"
      ? "localhost:5173"
      : "videocave.vercel.app";

  // Email configuration
  const mailOptions = {
    from: "lavishgarg1199@gmail.com",
    to: email,
    subject: "VideoCave | Reset password request",
    html: `
      <h3>Hi ${existingUser.fullName}</h3>
      <p>You recently requested to reset the password for your videocave account.</p>
      <p>Use 
      <a href="${protocol}://${clientUrl}/reset-password/${token}">this link to reset your password</a>
      </p>
      <p>If you did not request to reset your password, please ignore this mail 
      or reply to let us know. This password reset link is only valid for the next 10 minutes.</p>
      <p>Thank you</p>
      <p>VideoCave Support</p>
    `,
  };

  // send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }
    console.log("(parameter) info: SMTPTransport.SentMessageInfo", info);

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset email sent."));
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  // console.log(token);
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  // console.log(decodedToken);

  if (!decodedToken) {
    return next(new ApiError(401, "Invalid token"));
  }

  // find the user in the db with the id from the token
  const user = await User.findOne({ _id: decodedToken.userId });
  // console.log(user);

  if (!user) {
    return next(new ApiError(401, "no user found."));
  }

  user.password = newPassword;
  await user.save();

  res
    .status(201)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

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

  const { email, password, fullName } = req.body;
  console.log({ email, password, fullName });

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ApiError(400, `A user with email ${email} already exists`));
  }

  const defaultAvatarPath =
    "/public/images/avatars/no-profile-picture-icon.png";

  const user = await User.create({
    email,
    password,
    fullName,
    avatar: defaultAvatarPath,
    userName: `user_${Date.now()}`,
  });

  if (!user) {
    return next(
      new ApiError(500, "something went wrong while registering the user")
    );
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -watchHistory -coverImage -avatar"
  );

  const payload = {
    userId: createdUser._id,
  };

  // user email verification
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });

  createdUser.emailVerificationToken = token;
  await createdUser.save();

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const clientUrl =
    process.env.NODE_ENV === "development"
      ? "localhost:5173"
      : "videocave.vercel.app";

  const mailOptions = {
    from: "lavishgarg1199@gmail.com",
    to: createdUser.email,
    subject: `${createdUser.fullName}, verify your email address for VideoCave`,
    html: `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4a4a4a;">Welcome to VideoCave, ${createdUser.fullName}!</h2>
          <p>We're excited to have you on board. To get started, please verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${protocol}://${clientUrl}/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-size: 16px;">Verify Your Email</a>
          </div>
          <p>This verification link will expire in 60 minutes for security reasons.</p>
          <p>If you didn't create an account on VideoCave, you can safely ignore this email.</p>
          <p>Thank you for joining our community!</p>
          <p>Best regards,<br>The VideoCave Team</p>
        </div>
      </body>
      </html>
    `,
  };

  // send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }
    console.log("(parameter) info: SMTPTransport.SentMessageInfo", info);
  });

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const finishAccountCreation = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  // console.log("214", errors.array());

  if (!errors.isEmpty()) {
    return next(new ApiError(422, errors.array()));
  }

  const { userName } = req.body;

  console.log({ userName });
  console.log(req.user._id);

  // console.log(userName, email, password, fullName);

  const existingUser = await User.findOne({ userName });

  if (existingUser) {
    return next(new ApiError(400, `Username ${userName} is already taken`));
  }
  // avatar will definitely be present at this point courtesy express validator
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

  console.log({ avatar, coverImage });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      userName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    },
    {
      new: true,
    }
  ).select("userName fullName email coverImage avatar isEmailVerified");

  console.log({ updatedUser });

  res
    .status(201)
    .json(new ApiResponse(200, updatedUser, "User profile creation completed"));
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  if (!token) {
    return next(new ApiError(400, "Invalid token"));
  }

  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!payload) {
    return next(new ApiError(400, "Invalid token"));
  }

  const user = await User.findById(payload.userId).select(
    "avatar email fullName isEmailVerified userName _id"
  );
  if (!user) {
    return next(new ApiError(400, "User not found"));
  }

  if (user.isEmailVerified) {
    return next(new ApiError(400, "Email is already verified"));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined; // remove field from user doc
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, "Email verified successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  console.log(req.body);

  if (!email) {
    return next(new ApiError(400, "Invalid email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(400, "User not found"));
  }

  const payload = {
    userId: user._id,
  };

  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });

  user.emailVerificationToken = token;
  await user.save();

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const clientUrl =
    process.env.NODE_ENV === "development"
      ? "localhost:5173"
      : "videocave.vercel.app";

  const mailOptions = {
    from: "lavishgarg1199@gmail.com",
    to: user.email,
    subject: `${user.fullName}, verify your email address for VideoCave`,
    html: `
  <html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4a4a4a;">Hello ${user.fullName},</h2>
      <p>We noticed that you haven't verified your email address for your VideoCave account yet.</p>
      <p>To ensure full access to all features, please verify your email by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${protocol}://${clientUrl}/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-size: 16px;">Verify Your Email</a>
      </div>
      <p>This verification link will expire in 60 minutes for security reasons.</p>
      <p>If you didn't request this verification email, please contact our support team immediately.</p>
      <p>Thank you for being part of the VideoCave community!</p>
      <p>Best regards,<br>The VideoCave Team</p>
    </div>
  </body>
  </html>
  `,
  };

  // resend the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }
    console.log("(parameter) info: SMTPTransport.SentMessageInfo", info);

    res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Email verification link sent successfully")
      );
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  /*
    get data from frontend - email, password
    perform data validation and sanity
    find user in DB
    if found, cross check the provided password against existing users in database

    if password matches, check email verification status
    generate access and refresh token and send to frontend in cookies
    send success response
  */

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError(422, errors.array()));
  }

  const { userName, email, password } = req.body;

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    return next(
      new ApiError(400, "User does not eixst, please create an account.")
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

const checkEmailVerificationStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "isEmailVerified email fullName"
  );

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: user.isEmailVerified,
        email: user.email,
        fullName: user.fullName,
      },
      "Email verification status fetched successfully"
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

  const user = await User.findById(decodedUser._id).select(
    "-password -createdAt -updatedAt -coverImage -watchHistory -emailVerificationToken -__v"
  );

  if (!user) {
    return next(new ApiError(401, "Invalid refresh token"));
  }

  if (incomingRefreshToken !== user.refreshToken) {
    return next(new ApiError(401, "Invalid or expired refresh token"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  user.refreshToken = undefined;

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
        { user, accessToken, refreshToken },
        "access token refreshed successfully!"
      )
    );
});

const updateUserPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError(422, errors.array()));
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
    return next(new ApiError(422, errors.array()));
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

  // remove/delete old image after successful update of new cover image
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
    return next(new ApiError(422, errors.array()));
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
        channelDetails[0],
        "Channel details fetched successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res, next) => {
  const newPipeline = [
    {
      $match: {
        _id: req.user._id,
      },
    },
    {
      $project: {
        _id: 0,
        watchHistory: {
          $ifNull: ["$watchHistory", []],
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        let: { watchHistoryIds: "$watchHistory" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$watchHistoryIds"],
              },
            },
          },
          {
            $addFields: {
              customOrder: {
                $indexOfArray: ["$$watchHistoryIds", "$_id"],
              },
            },
          },
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
          {
            $sort: {
              customOrder: 1, // Sort by the custom index to preserve the order
            },
          },
        ],
        as: "watchHistory",
      },
    },
  ];

  const user = await User.aggregate(newPipeline);
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
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  checkEmailVerificationStatus,
  finishAccountCreation,
};
