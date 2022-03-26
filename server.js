import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
const app = express();
import encryption from "mongoose-encryption";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
// getting the md5
import md5 from "md5";
// using env variables
import "dotenv/config";
// this is how you get the encryption data
// console.log(process.env.encryption_key);
// connecting to the mongoDB
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
// encrypting the database using mongoose encrypt plug-in
// UserSchema.plugin(encryption, {
//   //here using the data from env to make the code secure
//   secret: process.env.encryption_key,
//   encryptedFields: ["password"],
// });
// creating the entry
const User = mongoose.model("User", UserSchema);
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

// handling the post requests
app.post("/register", (request, response) => {
  let userEmail = request.body.username;
  // let userPassword = request.body.password; simple password
  let userPassword = md5(request.body.password); //complex password with hash in it.

  const newUser = new User({
    email: userEmail,
    password: userPassword,
  });
  newUser.save((err) => {
    if (!err) {
      response.render("secrets");
    } else {
      response.render("home");
    }
  });
});
// login
app.post("/login", (request, response) => {
  let userEmail = request.body.username;
  let userPassword = md5(request.body.password);
  User.findOne({ email: userEmail }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user) {
        if (user.password === userPassword) {
          response.render("secrets");
        }
      }
    }
  });
});
// Starting out the server here
const PORT = 1337 || 3000;
app.listen(PORT, () => console.log(`Sucessfully Started at ${PORT}`));

console.log(typeof process.env.uri);
