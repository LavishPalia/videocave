import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username field cannot be empty"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      default: null,
    },
    email: {
      type: String,
      required: [true, "Email field cannot be empty"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Please enter your full name"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: [true, "Please select an avatar image for your profile"],
      default: null,
    },
    coverImage: { type: String },
    password: {
      type: String,
      required: [true, "Password field cannot be empty."],
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: undefined,
    },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // run pre hook only if password field is modified
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    //console.time("this.password");
    this.password = await bcrypt.hash(this.password, salt);
    //console.timeEnd("this.password");

    next();
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "Something went wrong while hashing password")
    );
  }
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  const payload = {
    _id: this._id,
    email: this.email,
    userName: this.userName,
    fullName: this.fullName,
  };
  try {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
  } catch (err) {
    // TODO: check if need to send failure response or not how the flow will work?
    console.log("Error generating access token:", err.message);
    return null;
  }
};

userSchema.methods.generateRefreshToken = async function () {
  const payload = {
    _id: this._id,
  };
  try {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
  } catch (err) {
    // TODO: check if need to send failure response or not how the flow will work?
    console.log("Error generating refresh token:", err.message);
    return null;
  }
};

export const User = mongoose.model("User", userSchema);
