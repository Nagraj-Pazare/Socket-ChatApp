import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { generateAccessToken } from "../controllers/token.controller.js";

export const authToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    // console.log("accessToken: " + accessToken);
    if(!accessToken){
        throw new jwt.TokenExpiredError("Access Token not Found");
    }
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_KEY,
    );
    // console.log("authToken Decoded: ", decoded);
    req.user = decoded;
    return next();
  } catch (error) {
    console.log("AuthToken error:", error.message);

    if (error instanceof jwt.TokenExpiredError) {
      try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res.render("login", {
            message: "Refresh Token Expired",
          });
        }

        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET_KEY,
        );
        // console.log("Refresh Token decoded: ", decoded);

        const user = await User.findOne({ _id: decoded.userId }, { password: 0 });

        if(!user){
            return res.render('login', {
                message: "User Not Found",
            })
        }

        const newAccessToken = generateAccessToken(user);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
        });
        req.user = {
            userId: user._id,
            email: user.email,
            username: user.username
        };
        return next();
      } catch (error) {
            console.log("Refresh Token Error: ", error.message);
            return res.redirect('/login');
            
      }
    }
    return res.status(401).redirect("/login");
  }
};



