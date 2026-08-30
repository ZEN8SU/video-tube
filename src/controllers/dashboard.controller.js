import { asyncHandler } from "../utils/asyncHandler";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getChannelStats = asyncHandler(async (req, res) => {
  //  get user id
  //  fetched number of subsribers
  //  total videos , views and likes etc
  //  response send

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User not found");
  }

  const totalSubscriber = await Subscription.countDocuments({
    channel: userId,
  });

  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: userId,
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
        likesCount: {
          $size: { $ifNull: ["$likes", []] },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "views" },
        totalLikes: { $sum: "$likesCount" },
      },
    },
  ]);

  const stats = videoStats[0] || {
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
  };
  const channelStats = {
    totalSubscriber,
    totalLikes: stats.totalLikes,
    totalVideos: stats.totalVideos,
    totalViews: stats.totalViews,
  };
  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
});
