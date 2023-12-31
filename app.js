//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// app use session package
app.use(
    session({
        secret: "Our little secret.",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// DB connection
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

// Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
});




userSchema.plugin(passportLocalMongoose);

// Model
const User = mongoose.model("User", userSchema);
//passport middleware
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GET REQUESTS
app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    User.find({"secret" : {$ne : null}})
        .then((foundUser)=>{
            if(foundUser)
            {
                res.render("secrets" , {userSecrets : foundUser})
            }
        })
});

app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        } else {
            res.redirect("/");
        }
    });
});

app.get("/submit", (req, res) => {
    res.render("submit")
})

// POST REQUESTS
app.post("/register", function (req, res) {
    User.register(
        { username: req.body.username },
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        }
    );
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/submit", (req, res) => {
    const submitSecret = req.body.secret;
    User.findById(req.user.id)
        .then((foundUser) => {
            if (foundUser) {
                foundUser.secret = submitSecret;
                foundUser.save()
                    .then(() => {
                        res.redirect("/secrets");
                    })
            }
        })
})


app.listen(3000, function () {
    console.log("Server started on port 3000");
});


