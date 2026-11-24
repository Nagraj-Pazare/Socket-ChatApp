import express from 'express';
import { allRoomsController, createRoomController, createRoomRoute, loginController, loginRouteController, registerController, getSingleRoomController } from '../controllers/user.controller.js';
import { authToken } from '../middleware/authToken.js';

export const userRoutes = express.Router();

userRoutes.get('/', (req, res)=>{
    if(req.cookies.accessToken){
        return res.redirect("/all-rooms");
    }
    return res.render('login');
});
userRoutes.get('/login', loginRouteController);
userRoutes.get('/all-rooms', authToken, allRoomsController);
userRoutes.get('/create-room', authToken, createRoomRoute);
userRoutes.post('/join-room', authToken, getSingleRoomController)
userRoutes.post('/register', registerController);
userRoutes.post('/login', loginController);
userRoutes.post('/create-room', authToken, createRoomController);


