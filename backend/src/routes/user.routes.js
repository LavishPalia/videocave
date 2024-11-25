import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserPassword,
  updateAccountDetails,
  updateUserAvatarImage,
  updateUserCoverImage,
  getLoggedInUser,
  getUserChannelDetails,
  getWatchHistory,
  clearWatchHistory,
  deleteVideoFromWatchHistory,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  checkEmailVerificationStatus,
  finishAccountCreation,
} from "../controllers/user.controller.js";
import { check, checkSchema } from "express-validator";

const router = express.Router();

router.route("/register/initial").post(
  [
    check("email", "Please enter a valid email address").trim().isEmail(),
    check("fullName", "Full name must be between 3 to 50 characters long")
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage(
        "Full name must contain only alphabetical characters and spaces"
      ),
    check(
      "password",
      "Password must contain one uppercase, one lowercase, one special character, one digit and minimum 8 characters long"
    )
      .trim()
      .isStrongPassword(),
  ],
  registerUser
);

router.route("/register/complete").post(
  verifyToken,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  [
    // Validate userName
    check(
      "userName",
      "Username should not be empty and can only contain letters, numbers, and underscores"
    )
      .trim()
      .matches(/^[a-zA-Z0-9_]+$/),
    // Validate avatar and coverImage
    checkSchema({
      avatar: {
        custom: {
          options: (_value, { req, path }) => {
            if (req.files && req.files[path]) {
              const file = req.files[path][0];
              const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
              return allowedMimeTypes.includes(file.mimetype);
            }
            return false; // Avatar is required, so no file means validation fails
          },
          errorMessage:
            "Avatar must be a valid image file (JPEG, PNG, GIF) and is required",
        },
      },
      coverImage: {
        optional: true, // This makes the field validation optional
        custom: {
          options: (_value, { req, path }) => {
            if (req.files && req.files[path]) {
              const file = req.files[path][0];
              const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
              return allowedMimeTypes.includes(file.mimetype);
            }
            return true; // If no file is provided, validation passes
          },
          errorMessage:
            "Cover image must be a valid image file (JPEG, PNG, GIF)",
        },
      },
    }),
  ],
  finishAccountCreation
);

router.route("/verify-email/:token").post(verifyEmail);
router.route("/resend-verification-email").post(resendEmailVerification);

router.route("/login").post(
  [
    check(
      "userName",
      "Username should not be empty and can only contain letters, numbers, and underscores"
    )
      .trim()
      .matches(/^[a-zA-Z0-9_]+$/)
      .optional(),
    check("email", "Please enter a valid email address").trim().isEmail(),
    check("password", "please provide your password").trim().notEmpty(),
  ],
  loginUser
);

router
  .route("/check-email-verification-status")
  .get(verifyToken, checkEmailVerificationStatus);

router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

router
  .route("/change-password")
  .post(
    verifyToken,
    [
      check("oldPassword", "Please provide your old password.")
        .trim()
        .notEmpty()
        .isString(),
      check("newPassword", "Please provide your new password.")
        .trim()
        .notEmpty()
        .isString(),
      check("confirmNewPassword", "Please enter your new password again")
        .trim()
        .notEmpty()
        .isString(),
    ],
    updateUserPassword
  );

router
  .route("/update-account")
  .patch(
    verifyToken,
    [
      check("email", "Please enter a valid email address")
        .trim()
        .isEmail()
        .optional(),
      check(
        "fullName",
        "Full Name must be atleast 3 characters and atmost 50 characters"
      )
        .trim()
        .isLength({ min: 3, max: 50 })
        .optional(),
    ],
    updateAccountDetails
  );

router
  .route("/avatar")
  .patch(verifyToken, upload.single("avatar"), updateUserAvatarImage);

router
  .route("/cover-image")
  .patch(verifyToken, upload.single("coverImage"), updateUserCoverImage);

router.route("/current-user").get(verifyToken, getLoggedInUser);
router.route("/c/:userName").get(
  verifyToken,
  check(
    "userName",
    "Username should not be empty and can only contain letters, numbers, and underscore"
  )
    .trim()
    .matches(/^[a-zA-Z0-9_]+$/),
  getUserChannelDetails
);
router.route("/history").get(verifyToken, getWatchHistory);
router
  .route("/history/clear/:videoId")
  .patch(verifyToken, deleteVideoFromWatchHistory);
router.route("/history/clear-history").patch(verifyToken, clearWatchHistory);

export default router;
