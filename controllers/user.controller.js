import { Room } from "../models/roomModel.js";
import { User } from "../models/userModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./token.controller.js";
import bcrypt from "bcrypt";

export const registerController = async (req, res) => {
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
    return res.status(400).render("login", {
      message: "User Already Exist!",
    });
  }
};

export const loginRouteController = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.render("login");
};

export const loginController = async (req, res) => {
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
      return res.status(200).redirect("/all-rooms");
    }

    return res.render("login", {
      message: "Incorrect Password!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).render("login", {
      message: "Db error",
      error,
    });
  }
};

export const logoutController = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.redirect("login");
};

export const getHomeController = async (req, res) => {
  return res.render('home')
}

export const allRoomsController = async (req, res) => {
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
    return res.status(400).redirect("/login");
  }
};

export const searchedRoomController = async (req, res) => {
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
    return res.end();
  }
};

export const myRoomsRoute = async (req, res) => {
  const { userId, username } = req.user;

  try {
    let rooms = await Room.find({ "members.userId": userId });

    return res.render("my-rooms", {
      rooms,
      username,
    });
  } catch (error) {
    console.log("My Room Route: ", error);
    return res.end();
  }
};

export const createRoomRoute = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).redirect("all-rooms");
    }
    return res.status(200).render("create-room");
  } catch (error) {
    console.log(error);
    return res.status(400).render("room-list", {
      message: "Some error occur",
    });
  }
};

export const createRoomController = async (req, res) => {
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
    console.log(error);
    return res.end();
  }
};

export const joinRoomController = async (req, res) => {
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
    return res.end();
  }
};

export const joinChatController = async (req, res) => {
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
    return res.end();
  }
};

export const searchFriendsRoute = async (req, res) => {
  return res.render('search-friends',{
    
  })
}
