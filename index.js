require('dotenv').config();
require('./utils.js')
const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');
const app = express();

const port = process.env.PORT || 3000;

const bcrypt = require('bcrypt');

const saltRounds = 12;

const Joi = require('joi');

let ejs = require('ejs');

app.set('view engine', 'ejs');

// cookie expire time is one hour
const expireTime = 1000 * 60 * 60;


// Secret information section
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
// End of secret information section

var {database} = include('databaseConnection')

const gamesModel = database.db(mongodb_database).collection('games')
const usersModel = database.db(mongodb_database).collection('users')

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`,
  crypto: {
    secret: mongodb_session_secret
  },
});

app.use(session({
  secret: node_session_secret,
  store: mongoStore,
  saveUninitialized: false,
  resave: false
}));

function isValidSession(req) {
  if (req.session.authenticated) {
      return true;
  }
  return false;
}

function sessionValidation(req,res,next) {
  if (isValidSession(req)) {
      next();
  }
  else {
      res.redirect('/login');
  }
}


function isAdmin(req) {
  if (req.session.user_type == 'admin') {
      return true;
  }
  return false;
}

function adminAuthorization(req, res, next) {
  if (!isAdmin(req)) {
      res.status(403);
      res.render("errorMessage.ejs", {error: "Not Authorized For You"});
      return;
  }
  else {
      next();
  }
}

// Alex's code



// End of Alex's code

// Marco's code



// End of Marco's code

// Aaron's Code
app.use(express.static('public'));
app.get('/', (req, res) => {
  if (isValidSession(req)){
    res.render('index.ejs', {
      "loggedIn": true,
      "name": req.session.username,
    })
  }
  else{
    res.render('index.ejs', {
      "loggedIn": false
    })
  }
})

// End of Aaron's code

// Derek's code
app.get('/login', (req, res) => { // code from Derek Tran's COMP 2537 Assignment 2, modified to check if user is already logged in
  var invalidLogin = req.query.invalidLogin
  if (req.session.authenticated){
    res.render('login.ejs', {"loggedIn": true}, )
  }
  else{
    res.render('login.ejs', {"loggedIn": false, "invalidLogin": invalidLogin}, )
}
})

app.post('/loginSubmit', async (req, res) => { // code from Derek Tran's COMP 2537 Assignment 2  var email = req.body.email
  var password = req.body.password
  const emailValidation = Joi.string().email().validate(email)
  const passwordValidation = Joi.string().max(20).validate(password)
  if (emailValidation.error != null || passwordValidation.error != null) {
      res.redirect("/login?invalidLogin=true")
      return
  }
  
  var user = await usersModel.findOne({ email: email })
  if (user != null) {
      const isMatch = bcrypt.compareSync(password, user.password)
      if (!isMatch) { res.redirect(`/login?invalidLogin=true`) }
      else {
          req.session.authenticated = true
          req.session.username = user.username
          req.session.cookie.maxAge = 60 * 60 * 1000;
          res.redirect('/login')
      }
  }
  else { res.redirect(`/login?invalidLogin=true`) }
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.get("/gameInformation", async (req, res) => {
  gameTitle = "Undertale"
  const result = await gamesModel.findOne({title: gameTitle})
  res.render("gameinfo.ejs", {"game": result})
})

// End of Derek's code

app.get("*", (req, res) => {
    res.status(404).render("404.ejs");
  });
  
app.listen(port, () => {
    console.log("Listening on port " + port + "!");
  });