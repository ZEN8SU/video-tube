import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (
    !name ||
    !description ||
    name.trim() === "" ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "Something is missing like name/description");
  }
  const create = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user?._id,
    videos: [],
  });
  if (!create) {
    throw new ApiError(
      400,
      "something went wrong while creating your playlist"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, create, "your playlist is created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = "10", skip = "0" } = req.query;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }
  const userVideo = await Playlist.find({ owner: userId })
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));
  if (!userVideo) {
    throw new ApiError(404, "user video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userVideo, "playlist of user fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { limit = "10", skip = "0" } = req.query;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const playlistById = await Playlist.findById(playlistId)
    .populate("videos")
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));

  if (!playlistById) {
    throw new ApiError(404, "playlist video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlistById,
        "playlist of user fetched successfully"
      )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id like video id  / playlist id");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "access denied");
  }

  const add = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, add, "video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id like video id  / playlist id");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "access denied");
  }
  const remove = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
);
  return res
    .status(200)
    .json(new ApiResponse(200, remove, "video remove successfully"));

});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  await Playlist.findByIdAndDelete(playlistId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist delete successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  if (
    !name ||
    !description ||
    name.trim() === "" ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "Something is missing like name/description");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "access denied");
  }
  const update = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name.trim(),
        description: description.trim(),
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, update, "your playlist is updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
