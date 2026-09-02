import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "comment is missing");
  }
  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(500, "Something went wrong while adding the comment");
  }

  return res.status(201).json(new ApiResponse(201, comment, "you commented"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment id");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "comment is missing");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  const update = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content: content.trim() } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, update, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(new ApiResponse(200, {}, " comment is deleted"));
});

const getVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { limit = '10', skip = '0' } = req.query;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const comment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },{
      $project: {
        content: 1,
        createdAt: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: Number(skip),
    },
    {
      $limit: Number(limit),
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comments are fetched "));
});
export {updateComment , deleteComment , getVideoComment , addComment};