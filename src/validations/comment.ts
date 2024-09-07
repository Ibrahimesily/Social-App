import {check} from 'express-validator'

export const checkCommentValidations = ()=>{
    return [
        check("content").exists().withMessage("Write the content please!").isLength({min:1,max:100}).withMessage("The comment is too short !!"),
    ]
}