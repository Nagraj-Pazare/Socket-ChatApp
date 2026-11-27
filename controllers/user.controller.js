import mongoose from "mongoose";
import { PrivateChat } from "../models/privateChatModel.js";
import { Room } from "../models/roomModel.js";
import { User } from "../models/userModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./token.controller.js";
import bcrypt from "bcrypt";

export const registerController = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const userExist = await User.findOne({ username, email, password });
    console.log("user Exist: ", userExist);

    if (userExist) {
      return res.render("login", {
        message: "User Already Exist.",
      });
    }

    if (!username || !email || !password) {
      return res.render("register", {
        message: "enter proper details",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashPass,
    });

    const user = await newUser.save();
    console.log("register:", user);

    return res.status(200).redirect("/login");
  } catch (error) {
    console.log(error);
    next(error)
  }
};

export const loginRouteController = async (req, res, next) => {
  try {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.render("login");
  } catch (error) {
    next(error);
  }
};

export const registerRouteController = async (req, res, next) => {
  try {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.render("register");
  } catch (error) {
    next(error);
  }
}

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.render("login", {
        message: "Enter Proper Details",
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render("register", {
        message: "user doe not exist",
      });
    }

    const isPassMatch = await bcrypt.compare(password, user.password);

    if (isPassMatch) {
      console.log("Login Controller: ", user);
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
      });
      req.user = user;
      return res.status(200).redirect("/home");
    }

    return res.render("login", {
      message: "Incorrect Password!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
 try {
   res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.redirect("login");
 } catch (error) {
  next(error)
 }
};

export const getHomeController = async (req, res, next) => { 
  try {
    const user = await User.findById(req.user.userId);
    return res.render('home',{
      user,
    })
  } catch (error) {
    next(error)
    
  }
}

export const allRoomsController = async (req, res, next) => {
  try {
    const { username } = req.user;
    const rooms = await Room.find({
      "members.username": { $ne: username },
    }).lean();

    if (!rooms || rooms == []) {
      return res.status(404).render("room-list", {
        message: "No Chats found",
      });
    }
    return res.status(200).render("room-list", {
      rooms: rooms,
      user:req.user,
      error: req.query.error || null,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const searchedRoomController = async (req, res, next) => {
  try {
    const { userId, username } = req.user;
    
    let { searchData } = req.query;

    console.log("searchData: ", searchData);
    

    const rooms = await Room.find({
       roomname: { $regex: searchData, $options: "i" },
       "members.userId": { $ne : userId },
    });

    console.log(rooms);
    

    return res.render("room-list", {
      rooms,
      searchData,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    next(error)
  }
};

export const myRoomsRoute = async (req, res, next) => {
  const { userId, username } = req.user;

  try {
    let rooms = await Room.find({ "members.userId": userId });

    return res.render("my-rooms", {
      rooms,
      username,
    });
  } catch (error) {
    console.log("My Room Route: ", error);
    next(error)
  }
};

export const createRoomRoute = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).redirect("all-rooms");
    }
    return res.status(200).render("create-room");
  } catch (error) {
    console.log(error);
    next(error)
  }
};

export const createRoomController = async (req, res, next) => {
  try {
    const { roomname, passkey } = req.body;
    const { userId, username } = req.user;

    const passKey = passkey && passkey.trim() !== "" ? passkey : null;

    const newRoom = new Room({
      roomname,
      passkey,
      members: {
        userId,
        username,
        isRoomAdmin: true,
      },
    });

    await newRoom.save();

    return res.status(200).redirect("/all-rooms");
  } catch (error) {
   next(error);
  }
};

export const joinRoomController = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const passkey = req.body.passkey?.trim() || null;
    console.log(passkey);

    const { userId, username } = req.user;
    let room;

    let existingMember = await Room.findOne({
      _id: roomId,
      "members.userId": userId,
    });
    if (existingMember) {
      return res.redirect("/my-rooms");
    }

    if (!existingMember) {
      room = await Room.findOneAndUpdate(
        {
          _id: roomId,
          $or: [{ passkey: { $in: [null, ""] } }, { passkey: passkey }],
        },
        {
          $push: {
            members: {
              userId,
              username,
            },
          },
        },
        { returnDocument: "after" },
      );
    }

    if (room) {
      return res.redirect("/my-rooms");
    }

    return res.status(401).redirect(`/all-rooms?error=Invalid`);
    // console.log("getSingleRoomController: ", room);
  } catch (error) {
    console.log("getSingleRoomController: ", error);
    next(error);
  }
};

export const joinChatController = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const { userId } = req.user;
    let joinedRooms = await Room.find({ "members.userId": userId });
    const room = await Room.findOne({ _id: roomId });
    return res.render("single-room", {
      room,
      joinedRooms,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getChat = async (req, res, next) => {
  try {
    const { myId, friendId, friendName } = req.body;
    console.log("FriendName: ", friendName);
    
    const uniqueChatId = (myId+friendId).split('').sort().join('');
    
    const user = await User.findById(req.user.userId);
    const existingChat = await PrivateChat.findOne({ uniqueId: uniqueChatId });

    console.log("Get Chat User: ", user.username);
    if(existingChat){
      return res.render('home',{
        chats:existingChat.chats,
        chatId: existingChat.uniqueId,
        user,
        friendName
      })
    }

    const newChat = await PrivateChat({
      uniqueId:uniqueChatId
    });

    await newChat.save();
    
    
    
    return res.render('home', {
      chats:newChat.chats,
      chatId: uniqueChatId,
      user,
      friendName
    });
    
  } catch (error) {
    console.log(error);
    next(error);
    
  }
}

export const searchFriendsRoute = async (req, res, next) => {

  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    const friends = user.friends;
    const friendIds = friends.map(friend => friend.friendId);
    
    const peoples = await User.find({ _id: { $nin: [...friendIds, user._id] }}).lean();

    // console.log("Peoples: ", peoples);
    
  

  return res.render('search-friends',{
    peoples,
    user,
  })
  } catch (error) {
    console.log(error);
    next(error);
  }
 
}

export const searchFriendByName = async (req, res, next) => {
  try {
    const { searchData } = req.body;
    
    const { userId } = req.user;
    const user = await User.findById(userId);
    const friends = user.friends;
    const friendIds = friends.map(friend => friend.friendId);
    
    const peoples = await User.find({
      username: { $regex: searchData, $options: "i" },
      _id: { $ne : userId },
     }).lean();


    return res.render('search-friends',{
      peoples,
      user,
      searchData
    })
    
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const addFriendController = async (req, res, next) => {
   
let session;
try {
  const { userId, username } = req.user;
   const { friendName, friendId } = req.body;
   if(!friendId || !friendName){
    return res.status(404).redirect('/search-friends');
   }

   session = await mongoose.startSession();

   await session.withTransaction(async ()=>{
     const user = await User.findOneAndUpdate(
    {
      _id:userId,
      "friends.friendId": { $ne: friendId }
    }, {
     $push: { 
        friends: { friendId, friendName } 
      } 
   }, {session, returnDocument: 'after'});

   const friend = await User.findOneAndUpdate(
    {
      _id: friendId,
      'friends.friendId': { $ne: userId }
    }, {
       $push: { 
        friends: { friendId: userId, friendName: username } 
      } 
    }
   )
   }, {session, returnDocument: 'after'})

   console.log(username + " added " + friendName);
   
   return res.redirect('/search-friends');
} catch (error) {
  console.log(error);
  next(error);
} finally{
  if(session){
    await session.endSession();
  }
}
}
