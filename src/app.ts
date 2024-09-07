import './database/db'
const express = require('express')
const cookieParser = require("cookie-parser")
import UserRouters from './routers/user'
import postRouters from './routers/post'
import commentRouters from './routers/comment'
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use('/users',UserRouters)
app.use('/posts',postRouters)
app.use('/comments',commentRouters)

app.listen(3000,()=>{
    console.log("Server is running 💙💙💙 ")
})