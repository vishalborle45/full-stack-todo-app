const mongoose = require('mongoose')


const Schema=  mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const user = new Schema({
    email: {type: String , unique: true},
    password: String,
    username: String,
})

const todo = new Schema({
    title: String,
    userId: ObjectId,
})



const userModel = mongoose.model('users',user)
const todoModel = mongoose.model('todos',todo)

module.exports = {
    userModel : userModel,
    todoModel : todoModel
}
