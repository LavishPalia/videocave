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

const publishVideo = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    return next(new ApiError(400, "title or description cannot be empty"));
  }

  //   console.log(req.files);
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    return next(
      new ApiError(400, "Please select a video and a thubnail image to upload")
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
  console.log(video);

  // TODO: write a pipeline to fetch details like owner, subscriber count, isSubscribed, like count etc

  // check if the videoId already exists in the watchHistory of the user
  const currentWatchHistory = req.user.watchHistory;

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

const getVideosByUserId = asyncHandler(async (req, res, next) => {
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
      $group: {
        _id: "owner",
        videos: {
          $push: "$_id",
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "allVideos",
      },
    },
    {
      $project: {
        allVideos: 1,
      },
    },
  ];

  const videos = await Video.aggregate(pipeline);

  if (!videos) {
    return next(new ApiError("user does not exist in the DB"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos: videos[0]?.allVideos },
        "all the videos for the user fetched successfully"
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

const getAllVideos = asyncHandler(async (req, res, next) => {
  const {
    sortBy = "createdAt",
    limit = 30,
    query = "Basics",
    page = 1,
    sortType = -1,
  } = req.query;
  // console.table([page, limit, query, sortBy, sortType, userId]);

  const pipeline = [
    {
      $match: {
        $text: {
          $search: query,
          $language: "en",
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
              _id: 1,
              fullName: 1,
              avatar: 1,
              userName: 1,
            },
          },
        ],
      },
    },
  ];

  // do not use await here because we need to pass the filter created in this step to aggregatePaginate()
  const searchedVideos = Video.aggregate(pipeline);
  // console.log("videos returned by aggreagtion pipeline \n", searchedVideos);

  const options = {
    page,
    limit,
    sort: sortBy,
    pagination: true,
  };

  if (searchedVideos.length === 0) {
    return next(new ApiError(400, "No videos present in the DB"));
  }
  const response = await Video.aggregatePaginate(searchedVideos, options);

  // if (response.docs.length === 0) {
  //   return next(new ApiError(400, "No videos present in the DB"));
  // }

  if (parseInt(sortType) === -1) {
    response.docs = response.docs.reverse();
  }

  // console.log("pagination results \n: ", response);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: response.docs.length,
        currentPage: response.page,
        nextPage: response.nextPage,
        prevPage: response.prevPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
        totaldocs: response.totalDocs,
        pagingCounter: response.pagingCounter,
        searchedVideos: response.docs,
      },
      "All videos fetched successfully"
    )
  );
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
  getVideosByUserId,
};
