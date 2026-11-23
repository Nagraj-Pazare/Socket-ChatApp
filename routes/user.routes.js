import express from 'express';
import { allRoomsController, createRoomController, createRoomRoute, loginController, loginRouteController, registerController } from '../controllers/userController.js';

export const userRoutes = express.Router();

userRoutes.get('/', (req, res)=>{
    return res.render('register');
});
userRoutes.get('/login', loginRouteController);
userRoutes.get('/all-rooms', allRoomsController);
userRoutes.get('/create-room', createRoomRoute);
userRoutes.post('/register', registerController);
userRoutes.post('/login', loginController);
userRoutes.post('/create-room', createRoomController);
