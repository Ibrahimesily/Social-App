import { RequestHandler, Request,Response,NextFunction} from "express";
import {User} from "../entities/user"
import {Post} from "../entities/post"
import {Comment} from '../entities/comment'
import { validationResult } from "express-validator";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const catchAsync = require('express-async-handler')
require("dotenv").config();

//-------------------------------------------------------------------- add comment
export const addComment: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(500).json({
            message: "There are some validation errors",
            errors: errors.array(),
        });
        }
    
        if (!res.locals.user) {
        const name = req.body.name;
        const email = req.body.email;
        const content = req.body.content;
    
        if (!email || !name) {
            return res.status(401).json({
            message: "You are not logged in, please enter your name and email",
            });
        }
    
        const postId: any = req.params.id;
        const post = await Post.findOne({ where: { id: postId } });
    
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
    
        const newComment = new Comment();
        newComment.content = content;
        newComment.email = email;
        newComment.name = name;
        newComment.post = post;
    
        await newComment.save();
        return res.status(200).json({ newComment });
    
        } else {
        const content = req.body.content;
        const postId: any = req.params.id;
    
        const user = await User.findOne({ where: { id: res.locals.user.id } });
        const post = await Post.findOne({ where: { id: postId } });
    
        if (!user || !post) {
            return res.status(404).json({ message: "User or Post not found" });
        }
    
        const newComment = new Comment();
        newComment.content = content;
        newComment.user = user; 
        newComment.post = post;
        newComment.name = user.name;
        newComment.email = user.email;

    
        await newComment.save();
        return res.status(200).json({ newComment });
        }
    });

