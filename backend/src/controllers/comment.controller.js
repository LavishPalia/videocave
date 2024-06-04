import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/Comment.model.js";
import { Video } from "../models/Video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

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

  const pipeline = [
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [
          {
            $project: {
              _id: 0,
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ];

  // do not use await here because we need to pass the filter created in this step to aggregatePaginate()
  const comments = Comment.aggregate(pipeline);

  if (!comments) {
    return next(new ApiError(404, "no comments found fot this video"));
  }
  // console.log(comments);

  const options = {
    page,
    limit,
    pagination: true,
  };

  const response = await Comment.aggregatePaginate(comments, options);

  // console.log("\n pagination output: \n", response);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totaldocs: response.totalDocs,
        count: response.docs?.length,
        totalPages: response.totalPages,
        currentPage: response.page,
        nextPage: response.nextPage,
        prevPage: response.prevPage,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
        pagingCounter: response.pagingCounter,
        videoComments: response.docs.reverse(),
      },
      "video comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  const { comment } = req.body;

  console.log(videoId, comment);

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

  if (!comment) {
    return next(new ApiError(400, "comment body is empty!"));
  }

  // add comment document in DB
  const createdCommentDoc = await Comment.create({
    content: comment,
    owner: req.user._id,
    video: videoId,
  });

  console.log(createdCommentDoc);

  res
    .status(201)
    .json(
      new ApiResponse(200, createdCommentDoc, "comment added successfully")
    );
});

const updateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { updatedComment } = req.body;

  if (!commentId) {
    return next(new ApiError(400, "comment id is missing."));
  }

  if (!isValidObjectId(commentId)) {
    return next(new ApiError(400, "invalid comment id"));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(
      new ApiError(500, `comment with id ${commentId} does not exist`)
    );
  }

  if (!updatedComment) {
    return next(new ApiError(400, "comment body is empty"));
  }

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(commentId),
      },
    },
    {
      $addFields: {
        isCommentOwner: {
          $cond: {
            if: {
              $eq: ["$owner", new mongoose.Types.ObjectId(req.user._id)],
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
        isCommentOwner: 1,
      },
    },
  ];

  // check if the user is the owner of the comment under updation
  const isOwner = await Comment.aggregate(pipeline);
  //   console.log(isOwner[0].isCommentOwner);

  if (!isOwner[0].isCommentOwner) {
    return next(
      new ApiError(403, "you are not authorized to update this comment")
    );
  }

  const updatedCommentDoc = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: updatedComment,
      },
    },
    { new: true }
  );

  //   console.log(updatedCommentDoc);

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedCommentDoc, "comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  if (!commentId) {
    return next(new ApiError(400, "comment id is missing."));
  }

  if (!isValidObjectId(commentId)) {
    return next(new ApiError(400, "invalid comment id"));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(
      new ApiError(500, `comment with id ${commentId} does not exist`)
    );
  }

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(commentId),
      },
    },
    {
      $addFields: {
        isCommentOwner: {
          $cond: {
            if: {
              $eq: ["$owner", new mongoose.Types.ObjectId(req.user._id)],
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
        isCommentOwner: 1,
      },
    },
  ];

  // check if the user is the owner of the comment under deletion
  const isOwner = await Comment.aggregate(pipeline);
  //   console.log(isOwner[0].isCommentOwner);

  if (!isOwner[0].isCommentOwner) {
    return next(
      new ApiError(403, "you are not authorized to delete this comment")
    );
  }

  const deletedCommentDoc = await Comment.findByIdAndDelete(commentId);
  console.log(deletedCommentDoc);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export { addComment, updateComment, deleteComment, getVideoComments };
