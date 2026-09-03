import mongoose from "express";
import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || content.trim() === "") {
    throw new ApiError(400, "content is empty");
  }
  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user?._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Something went wrong while adding the tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "your tweet is successfully uploaded "));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "tweet is missing");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }
  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized ");
  }
  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content.trim(),
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "your tweet is updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }
  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  await Tweet.findByIdAndDelete(tweetId);

  return res.status(200).json(new ApiResponse(200 , {} ,"tweet deleted Succesfully"))
});

const getUserTweet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const {limit = "10" , skip = "0"} = req.query;
  if(!userId){
    throw new ApiError(400 , "User not found")
  }
  const tweet = await Tweet.find({owner : userId} ,).sort({createdAt : -1}).skip(Number(skip)).limit(Number(limit));
  
  return res.status(200).json(new ApiResponse(200 , tweet , "tweet fetched successfully"))

})

export {deleteTweet , updateTweet , getUserTweet , createTweet};