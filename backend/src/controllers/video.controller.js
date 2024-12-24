import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/upload.cloudinary.js";
import { Video } from "../models/Video.model.js";
import { User } from "../models/User.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { pipeline } from "stream";
import { create } from "domain";

const publishVideo = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    return next(new ApiError(400, "title or description cannot be empty"));
  }

  //   console.log(req.files);
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    return next(
      new ApiError(400, "Please select a video and a thumbnail image to upload")
    );
  }

  const videoLocalPath = req?.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video) {
    return next(
      new ApiError(500, "something went wrong while uploading video")
    );
  }

  // console.log("data returned after video upload \n", video);

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    return next(
      new ApiError(500, "something went wrong while uploading thumbnail")
    );
  }

  // create a Video document and save in DB
  const videoDoc = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    owner: req.user._id,
  });

  if (!videoDoc) {
    return next(
      new ApiError(500, "something went wrong while saving video in database")
    );
  }

  res
    .status(201)
    .json(new ApiResponse(200, videoDoc, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  let video = await Video.updateOne(
    { _id: new mongoose.Types.ObjectId(videoId) },
    { $inc: { views: 1 } }
  );

  if (!video) {
    return next(new ApiError(500, `video with id ${videoId} does not exist`));
  }

  // pipeline
  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner._id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        likes: {
          $size: "$likes",
        },
        subscribers: {
          $size: "$subscribers",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.user._id, "$likes.likedBy"],
            },
            then: true,
            else: false,
          },
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
  ];

  video = await Video.aggregate(pipeline);
  // console.log(video);

  // TODO: write a pipeline to fetch details like owner, subscriber count, isSubscribed, like count etc

  // check if the videoId already exists in the watchHistory of the user
  const currentWatchHistory = req.user.watchHistory;
  // console.log({ currentWatchHistory });

  const index = currentWatchHistory?.findIndex(
    (history) => history.toString() === videoId
  );
  if (index > -1) {
    currentWatchHistory?.splice(index, 1);
  }

  currentWatchHistory?.unshift(videoId);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        watchHistory: currentWatchHistory,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(
      new ApiError(
        500,
        "something went wrong while updating users watch history"
      )
    );
  }

  // console.log("watch history updated user: \n", updatedUser.watchHistory);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `video with id ${videoId} fetched successfully`
      )
    );
});

const getPublishedVideosByChannel = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { sortBy } = req.query;

  if (!userId) {
    return next(new ApiError(400, "user id is missing"));
  }

  if (!isValidObjectId(userId)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $match: {
        isPublished: true,
      },
    },
  ];

  // Dynamically add the $sort stage based on sortBy
  if (sortBy === "latest") {
    pipeline.push({
      $sort: { createdAt: -1 }, // Sort by newest first
    });
  } else if (sortBy === "oldest") {
    pipeline.push({
      $sort: { createdAt: 1 }, // Sort by oldest first
    });
  } else if (sortBy === "popular") {
    pipeline.push({
      $sort: { views: -1 }, // Sort by highest views
    });
  } else {
    throw new Error(`Invalid sortBy value: ${sortBy}`);
  }

  // Add the $project stage
  pipeline.push({
    $project: {
      thumbnail: 1,
      title: 1,
      duration: 1,
      views: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const videos = await Video.aggregate(pipeline);

  console.log("videos", videos);

  if (!videos) {
    return next(new ApiError("user does not exist in the DB"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        "all the published videos of the channel fetched successfully"
      )
    );
});

const getVideosDataByChannel = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ApiError(400, "user id is missing"));
  }

  if (!isValidObjectId(userId)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $sort: {
        isPublished: 1,
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
        comments: {
          $size: "$comments",
        },
      },
    },
    {
      $project: {
        thumbnail: 1,
        title: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        likes: 1,
        comments: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const videos = await Video.aggregate(pipeline);

  console.log("videos", videos);

  if (!videos) {
    return next(new ApiError("user does not exist in the DB"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        "all the videos of the channel fetched successfully"
      )
    );
});

const updateVideo = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const { title, description } = req.body;
  console.log("199 ", title, description);

  // get local path of thumbnail, get old thumbnail public id for deletion
  let thumbnailLocalPath, newThumbnail, oldThumbnail;

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $project: {
        _id: 0,
        thumbnail: 1,
      },
    },
  ];

  oldThumbnail = await Video.aggregate(pipeline);

  if (req.file) {
    thumbnailLocalPath = req.file?.path;
    console.log("222 ", thumbnailLocalPath);
    newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!newThumbnail) {
      return next(
        new ApiError(500, "something went wrong while uploading thumbnail")
      );
    }

    // delete old thumbnail from cloudinary
    console.log("232", oldThumbnail[0].thumbnail);
    await deleteFromCloudinary(oldThumbnail[0].thumbnail);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: newThumbnail?.url,
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    return next(new ApiError(500, `video with id ${videoId} does not exist`));
  }

  console.log(updatedVideo);

  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  // if the video with provided id is deleted then retuen error
  let video = await Video.findById(videoId);

  if (!video) {
    return next(
      new ApiError(400, `video with id ${videoId} is already deleted`)
    );
  }

  // console.log(req.user._id.toString() === video.owner.toString());

  // check if the user has the authority to delete the video
  if (req.user._id.toString() !== video.owner.toString()) {
    return next(
      new ApiError(
        401,
        "You do not have permission to perform this action on this resource"
      )
    );
  }
  // delete video and thumbnail from cloudinary before deleting the document from DB
  const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
  const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];

  await deleteFromCloudinary(videoPublicId);
  await deleteFromCloudinary(thumbnailPublicId);

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    return next(new ApiError(500, `video with id ${videoId} does not exist`));
  }

  // console.log("Deleted video data: \n", deletedVideo);

  res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"));
});

const searchVideosAndChannels = asyncHandler(async (req, res, next) => {
  const { query, page = 1, limit = 10 } = req.query;

  // Channel search pipeline
  const channelPipeline = [
    {
      $match: {
        $or: [
          { userName: { $regex: new RegExp(query, "i") } },
          { fullName: { $regex: new RegExp(query, "i") } },
        ],
      },
    },
    {
      $lookup: {
        from: "videos",
        let: { ownerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$owner", "$$ownerId"],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 10,
          },
        ],
        as: "videos",
      },
    },
    { $match: { "videos.0": { $exists: true } } }, // Ensure the channel has videos
    {
      $lookup: {
        from: "subscriptions",
        let: { channelId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$channel", "$$channelId"],
              },
            },
          },
        ],
        as: "subscriptions",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscriptions" }, // Count total subscribers
        isSubscribedByCurrentUser: {
          $in: [
            req.user._id,
            {
              $map: {
                input: "$subscriptions",
                as: "sub",
                in: "$$sub.subscriber",
              },
            },
          ],
        }, // Check if current user is subscribed
      },
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        avatar: 1,
        userName: 1,
        videoCount: { $size: "$videos" },
        latestVideos: { $slice: ["$videos", 10] },
        subscriberCount: 1,
        isSubscribedByCurrentUser: 1,
      },
    },
    { $limit: 1 },
  ];

  // Video search pipeline
  const videoPipeline = [
    { $match: { $text: { $search: query } } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $addFields: { owner: { $arrayElemAt: ["$owner", 0] } } },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ];

  const [matchingChannel] = await User.aggregate(channelPipeline);
  const videos = await Video.aggregate(videoPipeline);
  const totalVideos = await Video.countDocuments({ $text: { $search: query } });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        channel: matchingChannel || null,
        videos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / parseInt(limit)),
        totalVideos,
      },
      "Search results fetched successfully"
    )
  );
});

const getAllVideos = asyncHandler(async (req, res, next) => {
  const {
    sortBy = "createdAt",
    limit = 100,
    page = 1,
    sortType = -1,
  } = req.query;
  // console.table([page, limit, query, sortBy, sortType, userId]);

  const pipeline = [
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              fullName: 1,
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$ownerDetails", 0] },
      },
    },
    {
      $sort: {
        [sortBy]: parseInt(sortType),
      },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ].filter(Boolean);

  const videos = await Video.aggregate(pipeline);

  const totalVideos = await Video.countDocuments({ isPublished: true });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / parseInt(limit)),
        totalVideos,
      },
      "Videos fetched successfully"
    )
  );

  // res.status(200).json(
  //   new ApiResponse(
  //     200,
  //     {
  //       count: response.docs.length,
  //       currentPage: response.page,
  //       nextPage: response.nextPage,
  //       prevPage: response.prevPage,
  //       totalPages: response.totalPages,
  //       hasNextPage: response.hasNextPage,
  //       hasPrevPage: response.hasPrevPage,
  //       totaldocs: response.totalDocs,
  //       pagingCounter: response.pagingCounter,
  //       searchedVideos: response.docs,
  //     },
  //     "All videos fetched successfully"
  //   )
  // );
});

const togglePublishStatus = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const video = await Video.findById(videoId);

  if (!video) {
    return next(
      new ApiError(400, `video with id ${videoId} doesn't exist in DB.`)
    );
  }

  video.isPublished = !video.isPublished;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video publish status updated!"));
});

export {
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  getAllVideos,
  togglePublishStatus,
  getPublishedVideosByChannel,
  getVideosDataByChannel,
  searchVideosAndChannels,
};
