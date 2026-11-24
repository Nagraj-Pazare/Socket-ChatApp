import jwt from 'jsonwebtoken';

export const generateAccessToken = (user)=>{
    return jwt.sign({ userId: user._id, email: user.email }, '', { expiresIn: '5m'});
}

export const generateRefreshToken = (user)=>{
    return jwt.sign({ userId: user._id }, '', { expiresIn: '1d' });
}