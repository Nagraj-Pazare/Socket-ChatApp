import { Room } from "../models/roomModel.js";
import { User } from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "./token.controller.js";
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

    return res.status(200).redirect('/login');
  } catch (error) {
    console.log(error);
    return res.status(400).render("login", {
      message: "User Already Exist!",
    });
  }
};

export const loginRouteController = async (req, res) => {
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
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      req.session.user = user;
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

export const allRoomsController = async (req, res) => {
  try {
    const rooms = await Room.find();
    if (!rooms || rooms == []) {
      return res.status(404).render("room-list", {
        message: "No Chats found",
      });
    }
    return res.status(200).render("room-list", {
      rooms,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).redirect("/login");
  }
};

export const createRoomRoute = async (req, res) => {
  try {
    console.log("CreateRoomRoute session: ", req.session.user);

    const { _id } = req.session.user;
    const user = await User.findById(_id);
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
    const { roomname } = req.body;
    console.log(req.session.user);

    const { _id, username } = req.session.user;

    const newRoom = new Room({
      roomname,
      members: {
        userId: _id,
        username,
      },
    });

    await newRoom.save();

    return res.status(200).redirect("/all-rooms");
  } catch (error) {
    console.log(error);
    return res.end();
  }
};

export const getSingleRoomController = async (req, res) => {
  try {
    const { roomId, userId, username } = req.body;
    // console.log("getSingleRoomController roomId: ", roomId);
    
    

    let room = await Room.findOne({ _id: roomId, "members.userId": userId });
    if (!room) {
      room = await Room.findByIdAndUpdate(roomId, {
        $push: {
          members: {
            userId,
            username,
          },
        },
      },
      { returnDocument: "after" }
    );
    }
    // console.log("getSingleRoomController: ", room);

    return res.render("single-room", {
      room,
    });
  } catch (error) {
    console.log("getSingleRoomController: ", error);

    return res.end();
  }
};
