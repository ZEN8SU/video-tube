import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const match = { isPublished: true };
  if (query) {
    match.title({ $regex: query, $options: "i" });
  }
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user Id");
    }
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const videos = await Video.aggregate([
    // Stage 1: Filter Videos
    {
      $match: match,
    },

    // Stage 2: Sorting
    {
      $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
    },

    // Stage 3: Owner Ki Details Join Karo ($lookup)
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },

    // Stage 4: Owner details array se pehla object nikalna
    {
      $addFields: {
        owner: { $first: "$ownerDetails" },
      },
    },

    // Stage 5: Pagination (Skip and Limit)
    {
      $skip: Number(skip),
    },
    {
      $limit: Number(limit),
    },

    // Stage 6: Project required fields (Clean Response)
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  // 4. Response return karo
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (
    !title ||
    !description ||
    title.trim() === "" ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "something missing like titile / description");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video file is missing");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, " thumbnail file is missing ");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video?.url) {
    throw new ApiError(400, "error while uploading video");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail?.url) {
    throw new ApiError(400, "error while uploading thumbnail");
  }

  const upload = await Video.create({
    title: title.trim(),
    description: description.trim(),
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration, // cloudinary always give duration himself
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, upload, "video publish successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.aggregate([
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
        as: "ownerDetails",
      },
    },
    {
      $addFields: {
        ownerdetails: {
          $first: "$ownerDetails",
        },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
      },
    },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        ownerDetails: { _id: 1, username: 1, fullName: 1, avatar: 1 },
        subscriberCount: 1,
      },
    },
  ]);
  if (!video.length) {
    throw new ApiError(404, "Video not found");
  }
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const { title, description } = req.body;
  if (
    !title ||
    !description ||
    title.trim() === "" ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "something missing like titile / description");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video not found");
  }
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "unauthorized");
  }
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is missing");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail?.url) {
    throw new ApiError(400, "error while uploading thumbnail");
  }
  const update = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, update, "thumbnail is updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "unauthorized");
  }
  await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deletion successful"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Access denied");
  }

  if (video.isPublished == true) {
    await Video.findByIdAndUpdate(
      videoId,
      {
        $set: { isPublished: false },
      },
      { new: true }
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, { isPublished: true }, "video is now unpublished")
      );
  }

  const notPublished = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { isPublished: true },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, { isPublished: true }, "Video is published "));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
