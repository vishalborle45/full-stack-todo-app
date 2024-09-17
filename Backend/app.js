const express = require('express')
require('dotenv').config()
const cors = require('cors')
const {z} = require('zod')
const bcrypt = require('bcrypt')
const { userModel, todoModel } = require('./db')
const jwt = require('jsonwebtoken')
const jwt_key = process.env.JWT_KEY
const { default: mongoose } = require('mongoose')
const app  = express()

const url = process.env.URL

mongoose.connect(url)
app.use(cors())
app.use(express.json())



app.post('/signup',async(req,res)=>{

    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        username: z.string(),
        password: z.string().min(8).max(100)
    })

    const safeParsedata = requiredBody.safeParse(req.body)

    if(!safeParsedata.success){
        res.json({
            error : safeParsedata.error,
            message : "incorrect format"
        })
        return
    }
    
    const email = req.body.email
    const password = req.body.password
    const username = req.body.username
    //save to database
    try{

        const hashpassword = await bcrypt.hash(password, 5)
        console.log(hashpassword)
        const response = await userModel.create({
            email,
            password: hashpassword,  // Store as password
            username
        });
        
        res.json({
            response,
            message: "successful sign up"
        })
    }catch(err){
        res.status(404).json({
            err,
            msg : " fail to sign up"
        })
    }
})

app.post('/signin',async(req,res)=>{
    const email = req.body.email
    const password = req.body.password


    //save to database
    try{
        

        const user = await userModel.findOne({
            email,
        })
        const passwordMatch = await bcrypt.compare(password,user.password)

        if(user && passwordMatch){
            const token = jwt.sign({
                id : user._id
            },jwt_key)
    
            res.json({
                user,
                message: "successful sign in",
                token
            })

        }
    }catch(err){
        res.status(404).json({
            err,
            msg : " fail to sign up"
        })
    }
})


async function auth(req, res , next){
    const token = req.headers.token
    try{
        const decodedData = await jwt.verify(token,jwt_key)
    
        if(decodedData){
            req.userId = decodedData.id
            next()
        }
        
    }catch(err){
        res.status(500).json({
            err,
            msg: "incorrect token"
        })
    }


}

app.use(auth)


app.post('/createtodo',async(req,res)=>{
    const title = req.body.title
    const status = req.body.status
    const userId = req.userId

    console.log(userId)

    //insert in database
    try{
        const response = await todoModel.create({
            title,
            userId : userId,
        })
        res.json({
            response,
            msg : "todo created"
        })
    }catch(err){
        res.status(500).json({
            err,
            msg : " fail to add todo"
        })
    }
})

app.post('/updatetodo',async(req,res)=>{
    const title = req.body.title
    const _id = req.body._id

    //insert in database
    try{

        const isUpdated = await todoModel.findByIdAndUpdate(
            _id,
            {
                title
            }
        )

        if(isUpdated){
            res.json({
                isUpdated,
                msg : "todo created"
            })
        }
    }catch(err){
        res.status(500).json({
            err,
            msg : " fail to update todo"
        })
    }
})




app.post('/deletetodo',async(req,res)=>{
    const todoId = req.body.todoId
    const userId = req.userId
    

    //insert in database
    try{
        console.log(userId)
        console.log(todoId)
        const isDeleted = await todoModel.findOneAndDelete(todoId)
        if(isDeleted){
            res.json({
                isDeleted,
                msg : "todo deleted"
            })
        }
    }catch(err){
        res.status(500).json({
            err,
            msg : " fail to delete todo"
        })
    }
})


app.get('/todos',async(req,res)=>{
    const userId = req.userId
    

    //get from database
    try{
        const todos = await todoModel.find({userId})
        if(todos){
            res.json({
                todos,
                msg : "todos sent"
            })
        }
    }catch(err){
        res.status(500).json({
            err,
            msg : " fail to get todo"
        })
    }
})


app.listen(3000,()=>{
    console.log("the app is runnnung at 3 port 3000")
})