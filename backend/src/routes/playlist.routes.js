import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
  fetchPlaylistsWithVideoFlag,
  getUserPlaylistNames,
} from "../controllers/playlist.controller.js";

const router = express.Router();

router.use(verifyToken);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/user/:userId/playlistNames").get(getUserPlaylistNames);
router.route("/user/:userId").get(getUserPlaylists);
router.route("/contains-video/:videoId").get(fetchPlaylistsWithVideoFlag);

router.route("/").post(createPlaylist);

export default router;
