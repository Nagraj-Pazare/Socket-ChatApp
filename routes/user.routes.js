import express from 'express';
import { allRoomsController, createRoomController, createRoomRoute, loginController, loginRouteController, registerController, joinRoomController, myRoomsRoute, joinChatController, logoutController, searchedRoomController, getHomeController, searchFriendsRoute, addFriendController, registerRouteController, searchFriendByName, getChat } from '../controllers/user.controller.js';
import { authToken } from '../middleware/authToken.js';

export const userRoutes = express.Router();

userRoutes.get('/', (req, res)=>{
    if(req.cookies.accessToken){
        return res.redirect("/home");
    }
    return res.render('login');
});
userRoutes.get('/register', registerRouteController);
userRoutes.get('/login', loginRouteController);
userRoutes.get('/logout', logoutController)
userRoutes.get('/all-rooms', authToken, allRoomsController);
userRoutes.get('/create-room', authToken, createRoomRoute);
userRoutes.get('/searched-room', authToken, searchedRoomController)
userRoutes.get('/my-rooms', authToken, myRoomsRoute);
userRoutes.get('/home',authToken, getHomeController)
userRoutes.get('/search-friends', authToken, searchFriendsRoute)
userRoutes.post('/join-room', authToken, joinRoomController)
userRoutes.post('/register', registerController);
userRoutes.post('/login', loginController);
userRoutes.post('/create-room', authToken, createRoomController);
userRoutes.post('/join-chat', authToken, joinChatController);
userRoutes.post('/search-friends', authToken, searchFriendByName)
userRoutes.post('/add-friend', authToken, addFriendController);
userRoutes.post('/get-chat', authToken, getChat);



