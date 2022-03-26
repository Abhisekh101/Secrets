import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
const app = express();
// cookie
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
// cookie libary ends here
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
import "dotenv/config";
// here the session code goes
app.use(
  session({
    secret: "IT is fucking true.",
    resave: false,
    saveUninitialized: false,
  })
);
// using the passport
app.use(passport.initialize());
// telling the passport to use the session
app.use(passport.session());
mongoose.connect(process.env.uri, (result) => {
  if (!result) {
    console.log(`The connection to database has been sucessfully established.`);
  } else {
    console.log(
      `The connection to database has been failed to establish. The Error Details : ${result}`
    );
  }
});

// Database schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});
// initializing the passport-mongoose-local :)
UserSchema.plugin(passportLocalMongoose);
// creating the entry
const User = mongoose.model("User", UserSchema);
// configuring the passport-local
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// !finish here
// route
app.get("/", (request, response) => {
  response.render("home");
});
app.get("/login", (request, response) => {
  response.render("login");
});
app.get("/register", (request, response) => {
  response.render("register");
});
app.get("/secrets", (request, response) => {
  if (request.isAuthenticated()) {
    response.render("secrets");
  } else {
    response.redirect("/login");
  }
});
// handling the post requests
app.post("/register", (request, response) => {
  User.register(
    { username: request.body.username },
    request.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        response.redirect("/register");
      } else {
        passport.authenticate("local")(request, response, () => {
          response.redirect("/secrets");
        });
      }
    }
  );
});
// login
app.post("/login", (request, response) => {});
// Starting out the server here
const PORT = 1337 || 3000;
app.listen(PORT, () => console.log(`Sucessfully Started at ${PORT}`));
