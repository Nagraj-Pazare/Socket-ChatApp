import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends: [
    {
      friendId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
      },
      friendName: {
        type: String,
        required: true,
      },
    },
  ],
});

export const User = mongoose.model("users", userSchema);
