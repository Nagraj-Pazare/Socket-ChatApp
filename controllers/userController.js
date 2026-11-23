import { Room } from "../models/roomModel.js";
import { User } from "../models/userModel.js"

export const registerController = async (req, res) => {
   
    const {username, email, password } = req.body;

    

    try {
   const userExist = await User.findOne({username, email, password});
   console.log("user Exist: ", userExist);
   

    if(userExist){
        return res.redirect('/login')
    }

    if(!username || !email || !password){
        return res.render('register',{
            message: "enter proper details"
        })
    }

    const newUser = new User({
        username,
        email,
        password
    })
    
    const user = await newUser.save();
    console.log("register:",user);
    

    return res.status(200).render('room-list',{
        user
    });
    } catch (error) {
        console.log(error);

        return res.status(400).render('register',{
            error,
        })
        
    }
}

export const loginRouteController = async (req, res) => {
    return res.render('login');
}

export const loginController = async (req, res) => {
    const { email, password } = req.body;
    

    try {
        if(!email || !password){
        return res.render('login',{
            message: "Enter Proper Details",
        });
    }

    const user = await User.findOne({email, password});

    if(!user){
        return res.render('register', {
            message: "user doe not exist",
        })
    }

    return res.status(200).render('room-list',{
        user
    });
    } catch (error) {
        console.log(error);
        return res.status(400).render("login",{
            message: "Db error",
            error,
        })
    }
}


export const allRoomsController = async (req, res) => {

    try {
        const chats = await Room.find();
        
        if(!chats || chats==[]){
            return res.status(404).render('room-list',{
                message: "No Chats found",
            });
        }
        return res.status(200).render('room-list', {
            chats
        });
    } catch (error) {
        console.log(error);
        return res.status(400).redirect('/login');
        
    }


}

export const createRoomRoute = async (req, res) => {
    try {
    const { userId } = req.body;
    const user = await User.findOne({_id: userId});
    if(!user){
        return res.status(404).render('room-list',{
            message: "User not found",
        })
    }
    return res.status(200).render('create-room',{
        user,
    });
    } catch (error) {
        console.log(error);
        return res.status(400).render('room-list',{
            message: "Some error occur",
        })
        
    }
}

export const createRoomController = async (req, res) => {
    try {
        
        const { roomname, members, chats } = req.body;
        
        const newRoom = new Room({
            roomname,
            members,
            chats
        });

        await newRoom.save();
        
        return res.status(200).json({
            success: true,
        });
        
    } catch (error) {
        console.log(error);
        return res.end()
        
    }
}
