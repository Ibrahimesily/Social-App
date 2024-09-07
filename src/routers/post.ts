const express = require('express')
const router = express.Router()
import {addPost,getPublicPosts,getPrivatePosts} from '../controllers/post'
import{protect_first,protect_second} from "../controllers/user"
import {checkPostValidations} from '../validations/post'

router.post('/addPost',protect_first,protect_second,checkPostValidations(),addPost)
router.get('/getPublicPosts',getPublicPosts)
router.get('/getPrivatePosts',protect_first,protect_second,getPrivatePosts)

export default router