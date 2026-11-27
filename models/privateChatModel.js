import mongoose from "mongoose";

const PrivateChatSchema = new mongoose.Schema({
uniqueId:{
 type: String,
 required: true,
 unique: true,
},
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
},
{ timestamps: true },
);

export const PrivateChat = mongoose.model("private-chat", PrivateChatSchema);
