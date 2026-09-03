import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }
  const existingsubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });
  if (existingsubscribed) {
    await Subscription.findByIdAndDelete(existingsubscribed._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { isSubscribed: false }, "unsubscribed"));
  }

  const newSubscribe = await Subscription.create({
    channel: channelId,
    subscriber: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { isSubscribed: true }, "subscribed"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { limit = "10", skip = "0" } = req.query;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel id");
  }

  const channelsubscribers = await Subscription.find({ channel: channelId })
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelsubscribers,
        "channel subscriber fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const { limit = "10", skip = "0" } = req.query;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id ");
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  })
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "subscribed Channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
