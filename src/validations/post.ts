import {check} from 'express-validator'

export const checkPostValidations = ()=>{
    return [
        check("title").exists().withMessage("Write the title please!").isLength({min:10,max:100}).withMessage("The title should be between 10 and 100 characters long."),
        check("content").exists().withMessage("Write the content please!").isLength({min:10,max:200}).withMessage("The content should be between 20 and 200 characters long."),
    ]
}