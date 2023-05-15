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

var { database } = include('databaseConnection')

const usersModel = database.db(mongodb_database).collection('users')
const gamesModel = database.db(mongodb_database).collection('games')

const { ObjectId } = require('mongodb')

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

function sessionValidation(req, res, next) {
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
    res.render("errorMessage.ejs", { error: "Not Authorized For You" });
    return;
  }
  else {
    next();
  }
}


// Testing route
app.get('/test', (req, res) => {
  res.render('questionnaireSubmit.ejs')
})

// End Test route

app.use(express.static('public'));
app.get('/', (req, res) => {
  if (isValidSession(req)) {
    res.render('index.ejs', {
      "loggedIn": true,
      "name": req.session.username,
    })
  }
  else {
    res.render('index.ejs', {
      "loggedIn": false
    })
  }
})


// Alex's code
// Render the sign up form
app.get('/signup', (req, res) => {
  res.render('signup.ejs');
});

// Handle sign up form submission
app.post('/signup', async (req, res) => {
  const {
    email,
    username,
    password,
    experience,
  } = req.body;

  // Validate input
  const schema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    experience: Joi.string().required(),
  });
  const validationResult = schema.validate({
    email,
    username,
    password,
    experience,
  });
  if (validationResult.error) {
    console.log(validationResult.error);
    // res.status(400).send(`Invalid username or password characters or email format. <a href="/">Go back to home</a>`);
    res.status(400).send(`${validationResult.error.message}. <a href="/">Go back to home</a>`);
    return;
  }

  // Check if username already exists
  const existingUser = await usersModel.findOne({
    username: username
  });
  if (existingUser) {
    res.status(409).send(`Username already exists. <a href="/">Go back to home</a>`);
    return;
  }
  // Check if email already exists
  const existingEmail = await usersModel.findOne({
    email: email
  });
  if (existingEmail) {
    res.status(409).send(`Email already exists. <a href="/">Go back to home</a>`);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Hash email
  const hashedEmail = await bcrypt.hash(email, saltRounds);

  // Create new user
  const newUser = {
    email: email,
    username: username,
    password: hashedPassword,
    experience: experience,
    admin: false
  };
  await usersModel.insertOne(newUser);

  // Log in user
  req.session.authenticated = true
  req.session.username = req.body.username
  req.session.cookie.maxAge = 1 * 60 * 60 * 1000;

  // Redirect to members area
  res.redirect('/');
});

app.get('/trending', async (req, res) => {
  // var trending_games = await gamesModel.find({}, { title: 1, _id: 0 }).sort({ rating: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(9).toArray()
  var trending_games = await gamesModel.find().limit(9).toArray()
  res.render('trending_page.ejs', {
    "loggedIn": true,
    "name": req.session.username,
    "trending_games": trending_games
  },)
})

app.get('/profile', async (req, res) => {
  if (req.session.authenticated) {
    // console.log(req.session)
    // console.log(req)
    var current_user = await usersModel.findOne({ username: req.session.username })
    var all_games = await gamesModel.find().toArray()
    if (current_user.questionnaireInfo == undefined) {
      genres = []
    } else {
      genres = current_user.questionnaireInfo.genres
    }
    if (current_user.savedGames == undefined) {
      games = []
    } else {
      games = current_user.savedGames
    }
    res.render('User_Profile.ejs', {
      "loggedIn": true,
      "name": current_user.username,
      "email": current_user.email,
      "experience": current_user.experience,
      "games": games,
      "genres": genres,
      "all_games": all_games
    })
  }

  else {
    res.redirect('/login');
  }
})
// End of Alex's code

// Marco's code



// End of Marco's code

// Aaron's Code

app.get('/questionnaire', sessionValidation, (req, res) => {
  var genres = [
    "Adventure",
    "Arcade",
    "Brawler",
    "Card & Board Game",
    "Fighting",
    "Indie",
    "MOBA",
    "Music",
    "Pinball",
    "Platform",
    "Point-and-Click",
    "Puzzle",
    "Quiz/Trivia",
    "RPG",
    "Racing",
    "Real Time Strategy",
    "Shooter",
    "Simulator",
    "Sport",
    "Strategy",
    "Tactical",
    "Turn Based Strategy",
    "Visual Novel"
  ]
  res.render('questionnaire.ejs', {
    "genres": genres,
    "name": req.session.username,
  })
})

app.post('/questionnaireSubmit', sessionValidation, (req, res) => {
  var genres = [
    "Adventure",
    "Arcade",
    "Brawler",
    "Card & Board Game",
    "Fighting",
    "Indie",
    "MOBA",
    "Music",
    "Pinball",
    "Platform",
    "Point-and-Click",
    "Puzzle",
    "Quiz/Trivia",
    "RPG",
    "Racing",
    "Real Time Strategy",
    "Shooter",
    "Simulator",
    "Sport",
    "Strategy",
    "Tactical",
    "Turn Based Strategy",
    "Visual Novel"
  ]
  // create an array of all of the info from the questionnaire.ejs form
  var userGenres = []
  for (var i = 0; i < genres.length; i++) {
    if (req.body[genres[i]] == "true") {
      userGenres.push(genres[i])
    }
  }
  var questionnaireInfo = {
    "minRating": req.body.minRating,
    "genres": userGenres,
  }
  // push the questionnaireInfo array to the database
  username = req.session.username
  usersModel.updateOne({ "username": username }, { $set: { "questionnaireInfo": questionnaireInfo } })
  res.render('questionnaireSubmit.ejs', { "name": req.session.username })
})

// find a random game in the entire usersModel database and save the gameID as a POST request
app.get('/randomGame', async (req, res) => {
  var randomGame = await gamesModel.aggregate([{ $sample: { size: 1 } }]).toArray()
  var gameID = randomGame[0]._id
  
  res.render('randomGame.ejs', { "name": req.session.username, "gameID": gameID, "loggedIn": req.session.authenticated })
})




// End of Aaron's code

// Derek's code
app.get('/login', (req, res) => {
  var invalidLogin = req.query.invalidLogin
  if (req.session.authenticated) {
    res.redirect('/')
  }
  else {
    res.render('login.ejs', { "invalidLogin": invalidLogin })
  }
})

app.post('/loginSubmit', async (req, res) => {
  var email = req.body.email
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
      res.redirect('/')
    }
  }
  else { res.redirect(`/login?invalidLogin=true`) }
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.get('/resetPassword', (req, res) => {
  var invalidEmail = req.query.invalidEmail
  res.render('resetPassword.ejs', { "invalidEmail": invalidEmail })
})

app.post('/resetPasswordSubmit', async (req, res) => {
  var email = req.body.email
  var password = req.body.password
  var user = await usersModel.findOne({ email: email })
  if (user != null) {
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    await usersModel.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } })
    req.session.authenticated = true
    req.session.username = user.username
    req.session.cookie.maxAge = 60 * 60 * 1000;
    res.redirect('/')
  }

  else { res.redirect(`/resetPassword?invalidEmail=true`) }
})

app.post("/gameInformation", async (req, res) => {
  const gameID = req.body.gameID
  const saved = await usersModel.findOne({
    $and: [
      { username: req.session.username },
      { "savedGames": { $in: [(new ObjectId(gameID))] } }
    ]
  }
  )
  const isSaved = saved != null
  console.log(isSaved)
  const game = await gamesModel.findOne({ "_id": new ObjectId(gameID) })
  if (req.session.authenticated) {
    res.render("gameinfo.ejs", { "game": game, "saved": isSaved, "name": req.session.username, "loggedIn": true })
  }
  else {
    res.render("gameinfo.ejs", { "game": game, "saved": isSaved, "loggedIn": false })
  }

})


app.post('/saveGame', async (req, res) => {
  if (req.session.authenticated) {
    const gameTitle = req.body.game
    const purpose = req.body.purpose
    const game = await gamesModel.findOne({ "_id": new ObjectId(gameTitle) })
    if (purpose == "save") {
      await usersModel.updateOne({ username: req.session.username }, { $push: { savedGames: new ObjectId(gameTitle) } })
      res.render("gameinfo.ejs", { "game": game, "saved": true, "name": req.session.username, "loggedIn": true })
    }
    else {
      await usersModel.updateOne({ username: req.session.username }, { $pull: { savedGames: new ObjectId(gameTitle) } })
      res.render("gameinfo.ejs", { "game": game, "saved": false, "name": req.session.username, "loggedIn": true })
    }
  }
  else {
    res.redirect('/login')
  }
})


// End of Derek's code

app.get("*", (req, res) => {
  res.status(404).render("404.ejs");
});

app.listen(port, () => {
  console.log("Listening on port " + port + "!");
});