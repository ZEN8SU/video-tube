import { Router } from "express";
import {
  updateComment,
  deleteComment,
  getVideoComment,
  addComment,
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(verifyJwt);
router.route("/:videoId").get(getVideoComment).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
