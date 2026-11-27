import { Server } from "socket.io";
import { Room } from "../models/roomModel.js";
import { PrivateChat } from "../models/privateChatModel.js";

export const initialServer = (httpserver) => {
  const io = new Server(httpserver, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {

 console.log("connected: ", socket.id);
 socket.on('join-room', ({roomId})=>{
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    socket.currentRoomId = roomId;
    socket.join(roomId);
    console.log(socket.id + " joined " + roomId);
 });

 socket.on('send-message', async ({message, username})=>{
    const currentRoomId = socket.currentRoomId;
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






 socket.on('join-chat', ({uniqueId})=>{
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    socket.currentChatId = uniqueId;
    socket.join(uniqueId);
    console.log(socket.id + " joined " + uniqueId);
 });

 socket.on('send-message', async ({message, username})=>{
    const currentChatId = socket.currentChatId;
    console.log("send-message: ",message);
    console.log("send-message  username: ", username);
    console.log("send-message currentRoomId: ",currentChatId);

    const socketId = socket.id;
    
    io.to(currentChatId).emit("receive-message", {message, socketId, username});

    const newChatMessage = await PrivateChat.findOneAndUpdate({ uniqueId: currentChatId }, {
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
