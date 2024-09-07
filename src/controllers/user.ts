import { RequestHandler, Request,Response,NextFunction} from "express";
import {User} from "../entities/user"
import {Post} from "../entities/post"
import { validationResult } from "express-validator";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require('bcrypt')
const catchAsync = require('express-async-handler')
require("dotenv").config();

//-------------------------------------------------------------------- get all users
export const getAllUsers:RequestHandler = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const allUsers = await User.find()
    res.status(200).json({
        allUsers
    })
} )
//-------------------------------------------------------------------- get me
export const getMe:RequestHandler = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const userId:any = res.locals.user.id
    const user = await User.findOne({where:{
        id:userId

    },relations: ['posts']})
    res.status(200).json({
        user
    })
} )
//-------------------------------------------------------------------- sign up
export const signUp : RequestHandler = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const errors = validationResult(req)
    //console.log(errors)
    if(!errors.isEmpty()){
        res.status(500).json({
            message:"There are some validation errors",
            errors: errors
        })
    }else{
        const {name , email , password , phone } = req.body
        const emailExist = await User.findOne({
            where:{email:email}
        })
        if(emailExist){
            return res.status(500).json({
                message:"email is already exist!"
            })
        }
        const hashedPassword = await bcrypt.hash(password,parseInt(process.env.PASS_SALT!))
        const newUser = await User.save({
            name,
            email,
            password:hashedPassword,
            phone
        })
        //---------------------------------
        const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const HashedActivationCode = crypto
        .createHash("sha256")
        .update(activationCode)
        .digest("hex");
        newUser.hashedActivationCode = HashedActivationCode
        await User.update({id:newUser.id},{hashedActivationCode : HashedActivationCode})

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: newUser.email,
            subject: "Activate the account",
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cool OTP Display</title>
        <style>
            body {
                color: var(--text-color);
                font-family: 'Arial', sans-serif;
                text-align: center;
                padding: 50px;
                margin: 0;
                background-color: var(--background-color);
            }

            h1 {
                color: #0445f8;
                display: inline-block;
            }

            .logo {
                vertical-align: middle;
                margin-left: 10px;
                width: 50px; /* Adjust width as needed */
                height: auto;
            }

            .otp-container {
                border: 2px solid #0445f8;
                padding: 20px;
                border-radius: 10px;
                background-color: rgba(30, 30, 30, 0.7); /* Adding opacity for better readability */
                margin-top: 20px;
                display: inline-block;
            }

            .otp-number {
                font-size: 24px;
                letter-spacing: 8px;
                margin: 10px 0;
                color: #2510ca; /* Change the color to black-purple */
            }

            .otp-validity, .reset-message {
                font-size: 18px;
                color: var(--text-color);
                margin-top: 20px;
            }

            p {
                font-size: 18px;
            }

            /* Define colors for light mode */
            @media (prefers-color-scheme: light) {
                :root {
                    --text-color: #000000; /* Black text */
                    --background-color: #ffffff; /* White background */
                }
            }

            /* Define colors for dark mode */
            @media (prefers-color-scheme: dark) {
                :root {
                    --text-color: #ffffff; /* White text */
                    --background-color: #282c35; /* Dark background */
                }
            }
        </style>
    </head>
    <body>

        <h1>Baianat app</h1>

        <p class="reset-message">Hi ${newUser.name},<br>
        We received a request to activate your baianat account.</p>

        <div class="otp-container">
            <p>Your code :</p>
            <div class="otp-number">${activationCode}</div>
        </div>

        <p class="reset-message">Enter this code to complete the reset. <br>
        Thanks for helping us keep your account secure. <br>
        Baianat Team</p>

    </body>
    </html>
        `,
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch (err) {
            await User.update({id:newUser.id},{hashedActivationCode : ""})
            //newUser.passwordResetExpires = "";
            // user.passwordResetVerified = undefined;
            return res.status(500).json({
                message : "error in send verification code",
                error:err
            });
        }
        //---------------------------------
        res.status(200).json({
            message:"Successfully signed up, check your email to verify the account. ",
            newUser
        })
    }
})
//-------------------------------------------------------------------- Confirm OTP - signup
export const confirmOTP_signup : RequestHandler = catchAsync(
    async (req:Request,res:Response,next:NextFunction)=>{
        const enteredCode =req.body.code
        const userId:any = req.params.id
        const hashedCode = crypto
        .createHash("sha256")
        .update(enteredCode)
        .digest("hex");
    
        const user =await User.findOne({
            where:{
                hashedActivationCode : hashedCode,
                id:userId
            }
        })
        if(!user){
            return res.status(500).json({
                message:"Incorrect code!!"
            })
        }else{
            await User.update({id:userId},{activedAccount : true,hashedActivationCode : ""})
            res.status(200).json({
                message:"Your account activated successfully .."
            })
        }
    }  
)
//-------------------------------------------------------------------- login
export const login: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
    
        if (!email || !password) {
            return res.status(400).json({
            message: "Please enter your email and password!",
            });
        }
    
        const user = await User.findOne({
            where: {
            email: email,
            },
        });
    
        if (!user) {
            return res.status(401).json({
            message: "Your email is not valid!",
            });
        }
    
        if (!user.password) {
            return res.status(500).json({
            message: "Password field is missing in the user data!",
            });
        }
    
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
        if (!isPasswordCorrect) {
            return res.status(401).json({
            message: "Your password is not valid!",
            });
        }
    
        const token = jwt.sign({ id: user.id }, process.env.JWT_SALT!, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        const cookieOptions = {
            expires: new Date(
            Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE_IN!) * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };

        res.cookie("jwt", token, cookieOptions);

        return res.status(200).json({
            message: "Login successful!",
            token,
            user,
        });
        }
);
//-------------------------------------------------------------------- protect_first
export const protect_first: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next();
        }
        try {
            const accessToken = jwt.verify(token, process.env.JWT_SALT!)

            const freshUser = await User.findOne({
                where: { id: accessToken.id },
            });

            if (!freshUser) {
                return res.status(401).json({
                    message: "The user belonging to this token no longer exists.",
                });
            }
            res.locals.user = freshUser;
        } catch (error) {
            console.log("JWT Error:", error);
        }
        next();
    }
);

//-------------------------------------------------------------------- protect_second
export const protect_second: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

    if (!res.locals.user) {
        return res.status(500).json({
            message:"You are not loggedin , login first ."
        })
    }
    next();
    }
);
//-------------------------------------------------------------------- reset password - send otp
export const resetPassword_sendOtp = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const userId:any = req.params.id
    const user =await User.findOne({
        where:{
            id:userId
        }
    })
    if(!user){
        return res.json({
            message :"No user with this ID"
        })
    }else{
            //---------------------------------
            const resetPasswordCode = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedResetPasswordCode = crypto
            .createHash("sha256")
            .update(resetPasswordCode)
            .digest("hex");
            user.hashedResetPasswordCode = hashedResetPasswordCode
            await User.update({id:user.id},{hashedResetPasswordCode : hashedResetPasswordCode})
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
                },
            });
            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: "Activate the account",
                html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cool OTP Display</title>
            <style>
                body {
                    color: var(--text-color);
                    font-family: 'Arial', sans-serif;
                    text-align: center;
                    padding: 50px;
                    margin: 0;
                    background-color: var(--background-color);
                }
    
                h1 {
                    color: #0445f8;
                    display: inline-block;
                }
    
                .logo {
                    vertical-align: middle;
                    margin-left: 10px;
                    width: 50px; /* Adjust width as needed */
                    height: auto;
                }
    
                .otp-container {
                    border: 2px solid #0445f8;
                    padding: 20px;
                    border-radius: 10px;
                    background-color: rgba(30, 30, 30, 0.7); /* Adding opacity for better readability */
                    margin-top: 20px;
                    display: inline-block;
                }
    
                .otp-number {
                    font-size: 24px;
                    letter-spacing: 8px;
                    margin: 10px 0;
                    color: #2510ca; /* Change the color to black-purple */
                }
    
                .otp-validity, .reset-message {
                    font-size: 18px;
                    color: var(--text-color);
                    margin-top: 20px;
                }
    
                p {
                    font-size: 18px;
                }
    
                /* Define colors for light mode */
                @media (prefers-color-scheme: light) {
                    :root {
                        --text-color: #000000; /* Black text */
                        --background-color: #ffffff; /* White background */
                    }
                }
    
                /* Define colors for dark mode */
                @media (prefers-color-scheme: dark) {
                    :root {
                        --text-color: #ffffff; /* White text */
                        --background-color: #282c35; /* Dark background */
                    }
                }
            </style>
        </head>
        <body>
    
            <h1>Baianat app</h1>
    
            <p class="reset-message">Hi ${user.name},<br>
            We received a request to reset the password on your Baianat Account.</p>
    
            <div class="otp-container">
                <p>Your code :</p>
                <div class="otp-number">${resetPasswordCode}</div>
            </div>
    
            <p class="reset-message">Enter this code to complete the reset. <br>
            Thanks for helping us keep your account secure. <br>
            Baianat Team</p>
    
        </body>
        </html>
            `,
            };
            try {
                await transporter.sendMail(mailOptions);
            } catch (err) {
                await User.update({id:user.id},{hashedResetPasswordCode : ""})
                //newUser.passwordResetExpires = "";
                // user.passwordResetVerified = undefined;
                return res.status(500).json({
                    message : "error in send verification code",
                    error:err
                });
            }
            //---------------------------------
        res.status(200).json({
            message:"check your email and enter the code .. ",
        })
    }
    
})
//-------------------------------------------------------------------- reset password - confirm otp
export const resetPassword_confirmOTP : RequestHandler = catchAsync(
    async (req:Request,res:Response,next:NextFunction)=>{
        const enteredCode =req.body.code
        const userId:any = req.params.id
        const hashedCode = crypto
        .createHash("sha256")
        .update(enteredCode)
        .digest("hex");
    
        const user =await User.findOne({
            where:{
                hashedResetPasswordCode : hashedCode,
                id:userId
            }
        })
        if(!user){
            return res.status(500).json({
                message:"Incorrect code!!"
            })
        }else{
            await User.update({id:userId},{hashedResetPasswordCode : ""})
            res.status(200).json({
                message:" ok, please enter your new password .."
            })
        }
    }  
)
//-------------------------------------------------------------------- reset password - old password
export const resetPassword_oldPassword : RequestHandler = catchAsync(
    async (req:Request,res:Response,next:NextFunction)=>{
        const userId:any = req.params.id
        const oldPassword = req.body.oldPassword

        const user =await User.findOne({
            where:{
                id:userId
            }
        })
        if(!user){
            return res.status(500).json({
                message:"Incorrect ID!!"
            })
        }else{
            const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

            if (!isPasswordCorrect) {
                return res.status(401).json({
                message: "Your old password is not correct.",
                });
            }else{
                res.status(200).json({
                    message:" ok, please enter your new password .."
                })
            }
        }
    }  
)
//-------------------------------------------------------------------- new password
export const newPassword : RequestHandler = catchAsync(
    async (req:Request,res:Response,next:NextFunction)=>{
        const userId:any = req.params.id
        const newPassword = req.body.newPassword
        const confirmNewPassword = req.body.confirmNewPassword
        if(newPassword !== confirmNewPassword ){
            return res.status(500).json({
                message:"Password and confirm password don't match"
            })
        }else{
            if(!newPassword || newPassword.trim() === "" || newPassword.length < 8 ){
                return res.status(500).json({
                    message:"Enter the password correctly"
                })
            }else{
                const user =await User.findOne({
                    where:{
                        id:userId
                    }
                })
                if(!user){
                    return res.status(500).json({
                        message:"invalid ID!!"
                    })
                }else{
                    const hashedPassword = await bcrypt.hash(newPassword,parseInt(process.env.PASS_SALT!))
                    await User.update({id:userId},{password:hashedPassword})
                    res.status(200).json({
                        message:"Password updated successfully"
                    })
                }
            }
        }  
        }
)
//-------------------------------------------------------------------- change Email - send otp
let newEmail: any
export const changeEmail_sendOtp = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const userId:any = res.locals.user.id
    newEmail = req.body.newEmail
    const user =await User.findOne({
        where:{
            id:userId
        }
    })
    if(!user){
        return res.json({
            message :"No user with this ID"
        })
    }else{
            //---------------------------------
            const changeEmailCode = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedChangeEmailCode = crypto
            .createHash("sha256")
            .update(changeEmailCode)
            .digest("hex");
            await User.update({id:user.id},{hashedChangeEmailCode : hashedChangeEmailCode})
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
                },
            });
            const mailOptions = {
                from: process.env.EMAIL,
                to: newEmail,
                subject: "Changing your email address",
                html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cool OTP Display</title>
            <style>
                body {
                    color: var(--text-color);
                    font-family: 'Arial', sans-serif;
                    text-align: center;
                    padding: 50px;
                    margin: 0;
                    background-color: var(--background-color);
                }
    
                h1 {
                    color: #0445f8;
                    display: inline-block;
                }
    
                .logo {
                    vertical-align: middle;
                    margin-left: 10px;
                    width: 50px; /* Adjust width as needed */
                    height: auto;
                }
    
                .otp-container {
                    border: 2px solid #0445f8;
                    padding: 20px;
                    border-radius: 10px;
                    background-color: rgba(30, 30, 30, 0.7); /* Adding opacity for better readability */
                    margin-top: 20px;
                    display: inline-block;
                }
    
                .otp-number {
                    font-size: 24px;
                    letter-spacing: 8px;
                    margin: 10px 0;
                    color: #2510ca; /* Change the color to black-purple */
                }
    
                .otp-validity, .reset-message {
                    font-size: 18px;
                    color: var(--text-color);
                    margin-top: 20px;
                }
    
                p {
                    font-size: 18px;
                }
    
                /* Define colors for light mode */
                @media (prefers-color-scheme: light) {
                    :root {
                        --text-color: #000000; /* Black text */
                        --background-color: #ffffff; /* White background */
                    }
                }
    
                /* Define colors for dark mode */
                @media (prefers-color-scheme: dark) {
                    :root {
                        --text-color: #ffffff; /* White text */
                        --background-color: #282c35; /* Dark background */
                    }
                }
            </style>
        </head>
        <body>
    
            <h1>Baianat app</h1>
    
            <p class="reset-message">Hi ${user.name},<br>
            We received a request to change the email address on your Baianat Account.</p>
    
            <div class="otp-container">
                <p>Your code :</p>
                <div class="otp-number">${changeEmailCode}</div>
            </div>
    
            <p class="reset-message">Enter this code to complete the reset. <br>
            Thanks for helping us keep your account secure. <br>
            Baianat Team</p>
    
        </body>
        </html>
            `,
            };
            try {
                await transporter.sendMail(mailOptions);
            } catch (err) {
                await User.update({id:user.id},{hashedChangeEmailCode : ""})
                //newUser.passwordResetExpires = "";
                // user.passwordResetVerified = undefined;
                return res.status(500).json({
                    message : "error in send verification code",
                    error:err
                });
            }
            //---------------------------------
        res.status(200).json({
            message:"check your email and enter the code .. ",
        })
    }
    
})
//-------------------------------------------------------------------- change Email  - confirm otp
export const changeEmail_confirmOTP : RequestHandler = catchAsync(
    async (req:Request,res:Response,next:NextFunction)=>{
        const enteredCode =req.body.code
        const userId:any = res.locals.user.id
        const hashedCode = crypto
        .createHash("sha256")
        .update(enteredCode)
        .digest("hex");
    
        const user =await User.findOne({
            where:{
                hashedChangeEmailCode : hashedCode,
                id:userId
            }
        })
        if(!user){
            return res.status(500).json({
                message:"Incorrect code!!"
            })
        }else{
            await User.update({id:userId},{hashedChangeEmailCode : "" , email:newEmail})
            res.status(200).json({
                message:"Email Address changed successfully .."
            })
        }
    }  
)






