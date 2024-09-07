const express = require('express')
const router = express.Router()
import {getAllUsers,signUp,confirmOTP_signup,resetPassword_sendOtp,resetPassword_confirmOTP,resetPassword_oldPassword,newPassword,changeEmail_sendOtp,changeEmail_confirmOTP,getMe,login} from '../controllers/user'
import {checkUserValidations} from '../validations/user'
import{protect_first,protect_second} from "../controllers/user"

router.get('/allUsers',getAllUsers)
router.get('/me',protect_first,protect_second,getMe)

router.post('/signup',checkUserValidations(),signUp)
router.post('/confirmOtp-signup/:id',confirmOTP_signup)

router.post('/login',login)

router.get('/resetPass-sendOtp/:id',resetPassword_sendOtp)
router.post('/resetPassword-confirmOtp/:id',resetPassword_confirmOTP)
router.post('/resetPassword-oldPassword/:id',resetPassword_oldPassword)
router.post('/newPassword/:id',newPassword)

router.post('/changeEmail-sendOtp',protect_first,protect_second,changeEmail_sendOtp)
router.post('/changeEmail-confirmOtp',protect_first,protect_second,changeEmail_confirmOTP)

export default router