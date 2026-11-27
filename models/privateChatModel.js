import mongoose from "mongoose";

const PrivateChatSchema = new mongoose.Schema({
  members: [
   {
     userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
}
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

export const PrivateChat = mongoose.model("private-chat", PrivateChatSchema);
