//jshint esversion:6
require('dotenv').config()
const express = require("express")
const app = express();
const bodyParser = require("body-parser")
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/SecretDB")
    .then(() => {
        console.log("DB connected")
    })

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})




const User = mongoose.model("User", userSchema);



app.get("/", (req, res) => {
    res.render("home")
})

app.get("/register", (req, res) => {
    res.render("register")
})
app.post("/register", (req, res) => {
    const newUsername = req.body.username;
    const newPassword = req.body.password;
    const hashedPass = bcrypt.hashSync(newPassword, saltRounds);

    User.findOne({ username: newUsername })
        .then((foundUser) => {
            if (!foundUser) {
                const newUser = new User({
                    username: newUsername,
                    password: hashedPass
                })
                newUser.save()
                res.render("secrets")
            }
            else{
                console.log("User already exists");
                res.redirect("/")
            }
        })
})


app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login" , (req , res)=>{
    const userName = req.body.username;
    const userPass = req.body.password;
    User.findOne({username : userName})
        .then((foundUser)=>{
            if(foundUser)
            {

                if(bcrypt.compareSync(userPass, foundUser.password))
                {
                    res.render("secrets")
                }
                else{
                    console.log("pasword do not match")
                }
            }
            else{
                console.log("user not found , please registr")
            }
        })
})

app.get("/submit" , (req , res)=>{
    res.render("submit")
})

app.listen(3000, () => {
    console.log("connected at post 3000")
})

