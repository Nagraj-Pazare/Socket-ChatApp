import jwt from 'jsonwebtoken';

export const generateAccessToken = (user)=>{
    
    return jwt.sign({ userId: user._id, email: user.email, username: user.username, friends: user.friends }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1m'});
}

export const generateRefreshToken = (user)=>{
    return jwt.sign({ userId: user._id },  process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '1d' });
}