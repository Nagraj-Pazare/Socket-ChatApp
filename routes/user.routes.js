import express from 'express';
import { allRoomsController, createRoomController, createRoomRoute, loginController, loginRouteController, registerController, getSingleRoomController } from '../controllers/user.controller.js';

export const userRoutes = express.Router();

userRoutes.get('/', (req, res)=>{
    return res.render('register');
});
userRoutes.get('/login', loginRouteController);
userRoutes.get('/all-rooms', allRoomsController);
userRoutes.get('/create-room', createRoomRoute);
userRoutes.post('/join-room', getSingleRoomController)
userRoutes.post('/register', registerController);
userRoutes.post('/login', loginController);
userRoutes.post('/create-room', createRoomController);

