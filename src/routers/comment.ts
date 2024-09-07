const express = require('express')
const router = express.Router()
import {addComment} from '../controllers/comment'
import {checkCommentValidations} from '../validations/comment'
import {protect_first} from '../controllers/user'

router.post('/addComment/:id',checkCommentValidations(),protect_first,addComment)

export default router