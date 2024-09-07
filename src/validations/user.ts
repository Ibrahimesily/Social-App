import {check} from 'express-validator'

export const checkUserValidations = ()=>{
    return [
        check("name").exists().withMessage("The name is required").isLength({min:3,max:20}).withMessage("Your name should be between 3 and 20 characters long."),
        check("email").exists().withMessage("The email is required").isEmail().withMessage("The email is incorrect"),
        check("password").exists().withMessage("The password is required").isLength({min:8,max:30}).withMessage("Your password should be between 8 and 30 characters long."),
        check("phone").isNumeric().withMessage("The phone is should by Number")
    ]
}