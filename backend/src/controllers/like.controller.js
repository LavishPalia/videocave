import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/Like.model.js";
import { Video } from "../models/Video.model.js";
import { Comment } from "../models/Comment.model.js";
import { Tweet } from "../models/Tweet.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ApiError(500, `video with id ${videoId} does not exist`));
  }
  //   console.log(req.user);

  // check if the video is already liked
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  if (alreadyLiked) {
    // remove like
    await Like.deleteOne(alreadyLiked);

    return res.status(200).json(new ApiResponse(200, {}, "video like removed"));
  }

  const likeDoc = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, likeDoc, "video like added"));
});

const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  if (!commentId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(commentId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(
      new ApiError(500, `comment with id ${commentId} does not exist`)
    );
  }
  //   console.log(req.user);

  // check if the comment is already liked
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });

  if (alreadyLiked) {
    // remove like
    await Like.deleteOne(alreadyLiked);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment like removed"));
  }

  const likeDoc = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, likeDoc, "comment like added"));
});

const toggleTweetLike = asyncHandler(async (req, res, next) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    return next(new ApiError(400, "tweet id is missing."));
  }

  if (!isValidObjectId(tweetId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    return next(new ApiError(500, `tweet with id ${tweetId} does not exist`));
  }
  //   console.log(req.user);

  // check if the video is already liked
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  if (alreadyLiked) {
    // remove like
    await Like.deleteOne(alreadyLiked);

    return res.status(200).json(new ApiResponse(200, {}, "Tweet like removed"));
  }

  const likeDoc = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, likeDoc, "tweet like added"));
});

const getLikedVideos = asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.user._id)) {
    return next(new ApiError(400, "Invalid User Id"));
  }

  const pipeline = [
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $match: {
        video: {
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
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
                    fullName: 1,
                    userName: 1,
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
            $project: {
              thumbnail: 1,
              duration: 1,
              views: 1,
              title: 1,
              createdAt: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
    {
      $group: {
        _id: null,
        video: {
          $push: "$video",
        },
      },
    },
    {
      $project: {
        video: 1,
        _id: 0,
      },
    },
  ];

  const likedVideos = await Like.aggregate(pipeline);

  if (!likedVideos) {
    return next(new ApiError(404, "No Likes Found!"));
  }
  // console.log("Videos liked by the user", likedVideos);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideos[0]?.video.reverse() || [],
        "liked videos fetched successfully"
      )
    );
});

const getVideoLikeCount = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "totalLikes",
      },
    },
    {
      $addFields: {
        totalLikeCount: {
          $size: "$totalLikes",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalLikeCount: 1,
      },
    },
  ];

  const video = await Video.aggregate(pipeline);
  // console.log(video);

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videoLikes: video[0].totalLikeCount },
        "video likes count fetched successfully"
      )
    );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getVideoLikeCount,
};
