import { Server } from "socket.io";
import { Room } from "../models/roomModel.js";

export const initialServer = (httpserver) => {
  const io = new Server(httpserver, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {

 console.log("connected: ", socket.id);

 let currentRoomId;
 socket.on('join-room', ({roomId})=>{
    socket.join(roomId);
    currentRoomId = roomId
    console.log(socket.id + " joined " + roomId);
 });

 socket.on('send-message', async ({message, username})=>{
  await Room.findByIdAndUpdate(currentRoomId, {
});
    console.log("send-message: ",message);
    console.log("send-message  username: ", username);
    console.log("send-message currentRoomId: ",currentRoomId);

    const socketId = socket.id;
    
    io.to(currentRoomId).emit("receive-message", {message, socketId, username});

    const newChatMessage = await Room.findByIdAndUpdate(currentRoomId, {
        $push:{
            chats:{
            sendername: username,
            message: message,
        }
        }
    })
    console.log("newChatMessage: " + username + " sent " + message);
    
 })
 


  });

  return io;
};
