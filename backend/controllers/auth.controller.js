import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

import {redis} from '../lib/redis.js'

const generateTokens = (userId) =>{
    const accessToken = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET ,{
        expiresIn:"15m",
    })
    const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET ,{
        expiresIn:"7d",
    })

    return {accessToken, refreshToken}
}

const storeRefreshToken = async (userId,refreshToken) => {
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60)
}

const setCookies = (res,accessToken,refreshToken) => {
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:'strict',
        maxAge:15 * 60 * 1000, // 15 Mins
    })
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:'strict',
        maxAge:7 * 24 * 60 * 60 * 1000, // 7 days
    })
}

export const signup = async (req,res) => {
    const {email,password,name} = req.body

    try {
        const userExists = await User.findOne({email})

        if(userExists) {
            return res.status(400).json({message:"User already exists"})
        }
    
        const user = await User.create({name,email,password})

        const {accessToken, refreshToken} = generateTokens(user._id)
        await storeRefreshToken(user._id,refreshToken)
        setCookies(res,accessToken,refreshToken);

        res.status(201).json({user:{
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
        },message:"User created Successfully"})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const login = async (req, res) => {
    try {
        // Validate request body
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("Login error:", error); 
        res.status(500).json({ message: "An internal server error occurred." });
    }
};

export const logout = async (req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({message:"Logout Successfull"});
    } catch (error) {
        res.status(500).json({message:'Server error', error:error.message})
    }
}

export const refreshToken = async (req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({message:"No refresh token"})
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`)

        if (storedToken !== refreshToken) {
            return res.status(401).json({message:"Invalid refresh token"})
        }

        const accessToken = jwt.sign({userId:decoded.userId},process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15m"})

        res.cookie("accessToken",accessToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:true,
            maxAge:15 * 60 * 1000,
        })
    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
        res.status(500).json({message:"Server error :", error: error.message});
    }   
}

export const getprofile = async (req,res) => {
    try {
        res.json(req.user)
        console.log(req.user)
    } catch (error) {
        res.status(500).json({message:"Server error", error:error.message})
    }
}