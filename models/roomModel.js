import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomname: {
    type: String,
    required: true,
  },
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      username: {
        type: String,
      },
    },
  ],
  chats: [
    {
      sendername: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
});

export const Room = mongoose.model("rooms", roomSchema);
