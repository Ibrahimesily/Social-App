import { RequestHandler, Request,Response,NextFunction} from "express";
import {User} from "../entities/user"
import {Post} from "../entities/post"
import { validationResult } from "express-validator";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const catchAsync = require('express-async-handler')
require("dotenv").config();

//-------------------------------------------------------------------- add post
export const addPost:RequestHandler = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(500).json({
            message:"There are some validation errors",
            errors: errors
        })
    }else{
        const userId:any = res.locals.user.id
        const user:any = await User.findOne({where:{
            id:userId
        }})
        if(!user.activedAccount){
            return res.json({
                message:"Your account is not activated to add posts"
            })
        }else{
            const postTitle = req.body.title
            const postContent = req.body.content
            const isPublic = req.body.isPublic
            const newPost = await Post.save({
                title:postTitle,
                content:postContent,
                user:user,
                isPublic:isPublic
            })
            return res.json({
                message:"Post added successfully",
                newPost
            })
        }
    }
})
//-------------------------------------------------------------------- get public posts
export const getPublicPosts :RequestHandler = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const publicPosts = await Post.find({where:{
        isPublic:true
    }})
    return res.status(200).json({
        publicPosts
    })
})
//-------------------------------------------------------------------- get private posts
export const getPrivatePosts :RequestHandler = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    //const userId:any = req.params.id
    const privatePosts = await Post.find({where:{
        userId:res.locals.user.id
    }})
    return res.status(200).json({
        privatePosts
    })
})

