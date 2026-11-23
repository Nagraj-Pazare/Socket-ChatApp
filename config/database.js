import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ChatApp');
    console.log("Connected to Database...");
    
  } catch (error) {
    console.log(error);
    console.log("Unable to connect to DB");  
  }    
}