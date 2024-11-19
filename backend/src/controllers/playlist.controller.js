import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/Playlist.model.js";
import { Video } from "../models/Video.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const authorizedOwner = (userId, req) => {
  console.log({ userId });

  return userId.toString() === req.user._id.toString();
};

const createPlaylist = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return next(new ApiError(400, "name and description are required fields"));
  }

  // create playlist in DB

  const createdPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!createPlaylist) {
    return next(
      new ApiError(500, "Something went wrong while creating playlist")
    );
  }

  res
    .status(201)
    .json(
      new ApiResponse(200, createdPlaylist, "playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ApiError(400, "user Id is missing"));
  }

  if (!isValidObjectId(userId)) {
    return next(new ApiError(400, "Invalid user Id"));
  }

  if (!authorizedOwner(userId, req)) {
    return next(
      new ApiError(401, "unauthorized access, you don't own this user")
    );
  }

  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $unwind: "$videos", // Unwind the videos array
    },
    {
      $lookup: {
        from: "videos", // Lookup details for each video
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails", // Flatten the videoDetails array
    },
    {
      $group: {
        _id: "$_id", // Rebuild each playlist
        name: { $first: "$name" },
        description: { $first: "$description" },
        owner: { $first: "$owner" },
        videos: {
          $push: "$videoDetails", // Rebuild the videos array in the original order
        },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        updatedAt: 1,
      },
    },
  ];

  const userPlaylists = await Playlist.aggregate(pipeline);

  console.log(userPlaylists);

  res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylists, "user playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    return next(new ApiError(400, "Playlist Id is missing"));
  }

  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid playlist Id"));
  }

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $unwind: "$videos", // Unwind the videos array to process each video separately
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails", // Unwind the resulting array from the $lookup
    },
    {
      $lookup: {
        from: "users",
        localField: "videoDetails.owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $addFields: {
        "videoDetails.owner": {
          $arrayElemAt: ["$ownerDetails", 0], // Add the first ownerDetails element to the video
        },
      },
    },
    {
      $group: {
        _id: "$_id", // Reconstruct the original playlist structure
        name: { $first: "$name" },
        description: { $first: "$description" },
        owner: { $first: "$owner" },
        videos: {
          $push: "$videoDetails", // Rebuild the videos array in the original order
        },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        videos: 1,
        updatedAt: 1,
      },
    },
  ];

  const playlist = await Playlist.aggregate(pipeline);

  // console.log(playlist);

  if (!playlist) {
    return next(new ApiError(400, "Playlist doesn't exist in DB"));
  }

  if (!authorizedOwner(playlist[0].owner, req)) {
    return next(
      new ApiError(401, "unauthorized request, you don't own this playlist")
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
  const { videoId, playlistId } = req.params;

  if (!videoId || !playlistId) {
    return next(new ApiError(400, "video id or playlist id is not provided"));
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid video id or playlist id"));
  }

  // console.log("189 ", videoId, playlistId);

  // find playlist and if found add the video id in the videos array
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return next(new ApiError(400, "Playlist does not exist in DB"));
  }

  if (!authorizedOwner(playlist.owner, req)) {
    return next(new ApiError(401, "unauthorized access"));
  }

  if (playlist.videos.includes(videoId)) {
    // check if the video is already part of the playlist
    return next(new ApiError(400, "Video is already part of this playlist"));
  }

  // check if the video is published: true or not
  const video = await Video.findOne({ _id: videoId });

  if (!video) {
    return next(new ApiError(400, "Video doesn't exist in DB"));
  }

  // console.log("214 ", video);

  if (!video.isPublished) {
    return next(
      new ApiError(
        400,
        "Please publish the video first and then add to this playlist"
      )
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  // console.log("233 ", updatedPlaylist);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "video added to the playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
  const { videoId, playlistId } = req.params;

  if (!videoId || !playlistId) {
    return next(new ApiError(400, "video id or playlist id is not provided"));
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid video id or playlist id"));
  }

  // find playlist and if found add the video id in the videos array
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return next(new ApiError(400, "Playlist does not exist in DB"));
  }

  if (!authorizedOwner(playlist.owner, req)) {
    return next(new ApiError(401, "unauthorized access"));
  }

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $addFields: {
        isVideoPresent: {
          $cond: {
            if: {
              $in: [new mongoose.Types.ObjectId(videoId), "$videos"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        isVideoPresent: 1,
      },
    },
  ];

  // check if the video is present in the playlist's videos array
  const isVideoInPlaylist = await Playlist.aggregate(pipeline);
  // console.log(isVideoInPlaylist);

  if (!isVideoInPlaylist[0].isVideoPresent) {
    return next(new ApiError(400, "This video is not part of this playlist"));
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId, // $pull deletes the field from the document unlike $unset that makes the field empty but doesn't remove it
      },
    },
    { new: true }
  );

  // console.log(updatedPlaylist);

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "testing in progress"));
});

const updatePlaylist = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId) {
    return next(new ApiError(400, "Playlist Id is missing"));
  }

  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid playlist Id"));
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return next(new ApiError(400, "Playlist doesn't exist in DB"));
  }

  if (!authorizedOwner(playlist.owner, req)) {
    return next(new ApiError(401, "unauthorized access"));
  }

  if (!(name || description)) {
    return next(
      new ApiError(400, "Please provide at least one field to update")
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    return next(
      new ApiError(500, "Something went wrong while updating playlist")
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "playlist details updated successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    return next(new ApiError(400, "Playlist Id is missing"));
  }

  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid playlist Id"));
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return next(new ApiError(400, "Playlist doesn't exist in DB"));
  }

  if (!authorizedOwner(playlist.owner, req)) {
    return next(new ApiError(401, "unauthorized access"));
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    return next(
      new ApiError(500, "Something went wrong while deleting playlist")
    );
  }

  console.log(deletedPlaylist);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const fetchPlaylistsWithVideoFlag = asyncHandler(async (req, res, next) => {
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
        owner: new mongoose.Types.ObjectId(req.user._id), // Match playlists owned by this user
      },
    },
    {
      $project: {
        name: 1, // Include playlist name
        containsVideo: {
          $in: [new mongoose.Types.ObjectId(videoId), "$videos"], // Check if video exists in the videos array
        },
      },
    },
  ];

  const playlists = await Playlist.aggregate(pipeline);
  console.log(playlists);

  res.status(200).json(new ApiResponse(200, playlists, "playlists fetched"));
});

export {
  createPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  fetchPlaylistsWithVideoFlag,
};
