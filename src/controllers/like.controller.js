import mongoose, { isValidObjectId } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const existingliked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (existingliked) {
    await Like.findByIdAndDelete(existingliked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { isliked: false }, "unliked successfully "));
  }

  const newlike = await Like.create({
    likedBy: req.user?._id,
    video: videoId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { isliked: true }, "liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const existingLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (existingLiked) {
    await Like.findByIdAndDelete(existingLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { isliked: false }, "unliked successfully"));
  }
  const newLike = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { isliked: true }, "liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const existingLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  if (existingLiked) {
    await Like.findByIdAndDelete(existingLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { isliked: false }, "unliked successfully"));
  }
  const newLike = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { isliked: true }, "liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { limit = "10", skip = "0" } = req.query;
  if (!userId) {
    throw new ApiError(400, "Invalid user id");
  }
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: userId,
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
      },
    },
    {
      $addFields: {
        likedVideo: {
          $first: "$likedVideo",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedVideo.owner",
        foreignField: "_id",
        as: "likedVideo.ownerDetails",
      },
    },
    {
      $addFields: {
        "likedVideo.owner": {
          $first: "$likedVideo.ownerDetails",
        },
      },
    },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        likedVideo: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          isPublished: 1,
          owner: {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
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
    .json(
      new ApiResponse(200, likedVideos, "Liked Videos Fetched Successfully")
    );
});
export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
