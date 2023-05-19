require('dotenv').config();
require('./utils.js')
const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');
const app = express();

const port = process.env.PORT || 3000;

const bcrypt = require('bcrypt');

const { Configuration, OpenAIApi } = require("openai"); require('dotenv').config()

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, }); const openai = new OpenAIApi(configuration);

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
const gamesModel = database.db(mongodb_database).collection('gamesv2')

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
app.get('/', async (req, res) => {
  if (isValidSession(req)) {
    var current_user = await usersModel.findOne({ username: req.session.username })
    // reccomendation code
    async function generateRecommendations(userProfile) {
      const preferredGenres = userProfile.questionnaireInfo.genres.join(", ");
      const playerExperience = "Hardcore";
      const playedGames = userProfile.playedGames.join(", ");
      // const playedGames = playedGames.join(", ");
      // const playedGames = ["Civilization VI", "Humankind", "Civilization V", "Settlers of Catan", "Minecraft", "The Long Dark"].join(", ");
      const prompt = `Based on my experience as a ${playerExperience} gamer and my preferences for ${preferredGenres} and the games I have played in the past such as ${playedGames}, recommend 9 games I haven't played for me to play next in javascript array format using double quotes and full titles.`;

      // Generate a response using ChatGPT
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 1000
      });
      // Extract the recommendations from the response
      const recommendations = completion.data.choices[0].text;

      return recommendations;
    }
    let recommendedGames = await generateRecommendations(current_user)
    recommendedGames = JSON.parse(recommendedGames);
    console.log(recommendedGames);
    var trending_games = await gamesModel.find().limit(3).toArray()
    var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c'
    async function getTwitchData() {
      const response = await fetch('https://id.twitch.tv/oauth2/token?client_id=culgms7hbkoyqwn37h25ocnd1mwa1c&client_secret=4h5nsk1q8gco3ltiiwoparvr217bmg&grant_type=client_credentials', {
        method: 'POST',
        headers: {
          'Client-ID': client_id,
          'Client-Secret': '4h5nsk1q8gco3ltiiwoparvr217bmg'
        }
      })
      const my_info = await response.json()
      return my_info
    }
    const twitchData = await getTwitchData()
    var gameNames = []
    for (var i = 0; i < trending_games.length; i++) {
      gameNames.push(trending_games[i].title)
    }

    async function getAllGames(gameNames) {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': client_id,
          'Authorization': 'Bearer ' + twitchData.access_token,
        },
        body: `fields name,summary,cover.url; 
      sort release_dates.date desc;
      where release_dates.date != null;
      where name = ("${gameNames[0]}", "${gameNames[1]}", "${gameNames[2]}", "${gameNames[3]}", "${gameNames[4]}", "${gameNames[5]}");`
      })
      const my_info = await response.json()
      return my_info
    }
    const gameResponse = await getAllGames(gameNames)
    // console.log(gameResponse)
    for (var i = 0; i < trending_games.length; i++) {
      for (var j = 0; j < gameResponse.length; j++) {
        if (trending_games[i].title == gameResponse[j].name) {
          if (gameResponse[j].cover == undefined) {
            trending_games[i].cover = "no-cover.png"
          } else {
            gameResponse[j].cover.url = gameResponse[j].cover.url.replace("t_thumb", "t_cover_big")
            trending_games[i].cover = gameResponse[j].cover.url
          }
        }
      }
    }
    const recGameResponse = await getAllGames(recommendedGames)
    for (var i = 0; i < recGameResponse.length; i++) {
      recGameResponse[i].cover.url = recGameResponse[i].cover.url.replace("t_thumb", "t_cover_big")
    }
    console.log(recGameResponse)
    res.render('index.ejs', {
      "loggedIn": true,
      "name": req.session.username,
      "trending_games": trending_games,
      "recommended_games": recGameResponse.slice(0, 3)
    })
  }
  else {
    res.render('index.ejs', {
      "loggedIn": false,
      "name": req.session.username,
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
  var trending_games = await gamesModel.find().limit(9).toArray()
  var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c'
  async function getTwitchData() {
  const response = await fetch('https://id.twitch.tv/oauth2/token?client_id=culgms7hbkoyqwn37h25ocnd1mwa1c&client_secret=4h5nsk1q8gco3ltiiwoparvr217bmg&grant_type=client_credentials', {
    method: 'POST',
    headers: {
    'Client-ID': client_id,
    'Client-Secret': '4h5nsk1q8gco3ltiiwoparvr217bmg'
    }
  })
  const my_info = await response.json()
  return my_info
  }
  const twitchData = await getTwitchData()
  var gameNames = []
 for (var i = 0; i < trending_games.length; i++) {
    gameNames.push(trending_games[i].title)
  }

  async function getAllGames(gameNames) {
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': client_id,
        'Authorization': 'Bearer ' + twitchData.access_token,
      },
      body: `fields name,cover.url; 
      sort release_dates.date desc;
      where release_dates.date != null;
      where name = ("${gameNames[0]}", "${gameNames[1]}", "${gameNames[2]}", "${gameNames[3]}", "${gameNames[4]}", "${gameNames[5]}", "${gameNames[6]}", "${gameNames[7]}", "${gameNames[8]}", "${gameNames[9]}");`
    })
    const my_info = await response.json()
    return my_info
  }
  const gameResponse = await getAllGames(gameNames)
  // console.log(gameResponse)
  for (var i = 0; i < trending_games.length; i++) {
    for (var j = 0; j < gameResponse.length; j++) {
      if (trending_games[i].title == gameResponse[j].name) {
        if (gameResponse[j].cover == undefined) {
          trending_games[i].cover = "no-cover.png"
        } else {
          gameResponse[j].cover.url = gameResponse[j].cover.url.replace("t_thumb", "t_cover_big")
          trending_games[i].cover = gameResponse[j].cover.url
          trending_games[i].apiID = gameResponse[j].id
        }
      }
    }
  }
  console.log(trending_games)
  res.render('trending_page.ejs', {
    "loggedIn": true,
    "name": req.session.username,
    "trending_games": trending_games
  },)
})

app.get('/recommended', async (req, res) => {
  if (req.session.authenticated) {
    var current_user = await usersModel.findOne({ username: req.session.username })
    // reccomendation code
    async function generateRecommendations(userProfile) {
      const preferredGenres = userProfile.questionnaireInfo.genres.join(", ");
      const playerExperience = "Hardcore";
      const playedGames = userProfile.playedGames.join(", ");
      const prompt = `Based on my experience as a ${playerExperience} gamer and my preferences for ${preferredGenres} and the games I have played in the past such as ${playedGames}, recommend 20 games I haven't played for me to play next in javascript array format using double quotes and full titles.`;

      // Generate a response using ChatGPT
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 1000
      });

      // Extract the recommendations from the response
      const recommendations = completion.data.choices[0].text;

      return recommendations;
    }
    let recommendedGames = await generateRecommendations(current_user)
    recommendedGames = JSON.parse(recommendedGames);
    console.log(recommendedGames)
    // const arr = ['Hades', 'Elden Ring', 'Risk of Rain 2', 'The Binding of Isaac: Rebirth', 'Dead Cells', 'Enter the Gungeon', 'Slay the Spire', 'Hollow Knight', 'Darkest Dungeon']
    // const arr = ['Fortnite', 'Total War: Three Kingdoms', 'Civilization 6','Crusader Kings 3','Starcraft 2','XCOM 2','Diablo 3','Dota 2']

    var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c'
    async function getTwitchData() {
      const response = await fetch('https://id.twitch.tv/oauth2/token?client_id=culgms7hbkoyqwn37h25ocnd1mwa1c&client_secret=4h5nsk1q8gco3ltiiwoparvr217bmg&grant_type=client_credentials', {
        method: 'POST',
        headers: {
          'Client-ID': client_id,
          'Client-Secret': '4h5nsk1q8gco3ltiiwoparvr217bmg'
        }
      })
      const my_info = await response.json()
      return my_info
    }
    const twitchData = await getTwitchData()

    async function getAllGames(gameNames) {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': client_id,
          'Authorization': 'Bearer ' + twitchData.access_token,
        },
        body: `fields name,involved_companies.company.name,summary,cover.url; 
      sort release_dates.date desc;
      where release_dates.date != null;
      where name = ("${gameNames[0]}", "${gameNames[1]}", "${gameNames[2]}", "${gameNames[3]}", "${gameNames[4]}", "${gameNames[5]}", "${gameNames[6]}", "${gameNames[7]}", "${gameNames[8]}", "${gameNames[9]}", "${gameNames[10]}", "${gameNames[11]}", "${gameNames[12]}", "${gameNames[13]}", "${gameNames[14]}", "${gameNames[15]}", "${gameNames[16]}", "${gameNames[17]}", "${gameNames[18]}", "${gameNames[19]}", "${gameNames[20]}");`
      })
      const my_info = await response.json()
      return my_info
    }
    const gameResponse = await getAllGames(recommendedGames)
    for (var i = 0; i < gameResponse.length; i++) {
      gameResponse[i].cover.url = gameResponse[i].cover.url.replace("t_thumb", "t_cover_big")
    }
    console.log(gameResponse)


  




    res.render('recommended_page.ejs', {
      "loggedIn": true,
      "name": req.session.username,
      "recommended_games": gameResponse
    })
  }

  else {
    res.redirect('/login');
  }
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

    if (current_user.playedGames == undefined) {
      playedGames = []
    } else {
      playedGames = current_user.playedGames
    }
    res.render('User_Profile.ejs', {
      "loggedIn": true,
      "name": current_user.username,
      "email": current_user.email,
      "experience": current_user.experience,
      "games": games,
      "genres": genres,
      "all_games": all_games,
      "playedGames": playedGames
    })
  }

  else {
    res.redirect('/login');
  }
})
// End of Alex's code

// Marco's code

// Search Games GET request
app.get('/searchGames', async (req, res) => {  // get reqeust for /searchGames
  var databaseGames = await gamesModel.find().limit(270).toArray() // pull games from mongodb
  var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c'

  async function getTwitchData() { // Twitch authentication for IGDB api
  const response = await fetch('https://id.twitch.tv/oauth2/token?client_id=culgms7hbkoyqwn37h25ocnd1mwa1c&client_secret=4h5nsk1q8gco3ltiiwoparvr217bmg&grant_type=client_credentials', {
    method: 'POST',
    headers: {
    'Client-ID': client_id,
    'Client-Secret': '4h5nsk1q8gco3ltiiwoparvr217bmg'
    }
  })
  const my_info = await response.json()
  return my_info
  }
  const twitchData = await getTwitchData()

  const PAGE_SIZE = 9
  let currentPage = parseInt(req.query.page) || 1;
  var searchGameNames = []
  var searchGameData = []
  // For loop to get game names of specific page from mongo database
  for (var i = (currentPage - 1) * PAGE_SIZE; i < (currentPage * PAGE_SIZE); i++) {
    searchGameNames.push(databaseGames[i].title)
    searchGameData.push(databaseGames[i])
  }

  // Function to find games matching names in searchGameNames from IGDB API 
  async function getAllGames(searchGameNames) {
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': client_id,
        'Authorization': 'Bearer ' + twitchData.access_token,
      },
      body: `fields name,cover.url,genres;
      sort release_dates.date desc;
      where release_dates.date != null;
      where name = ("${searchGameNames[0]}", "${searchGameNames[1]}", "${searchGameNames[2]}", "${searchGameNames[3]}", "${searchGameNames[4]}", "${searchGameNames[5]}", "${searchGameNames[6]}", "${searchGameNames[7]}", "${searchGameNames[8]}", "${searchGameNames[9]}");`
    })
    const my_info = await response.json()
    return my_info
  }

  const gameResponse = await getAllGames(searchGameNames) // Games from IGDB API with matching names from mongo database

  for (var i = 0; i < databaseGames.length; i++) { // Loop through games pulled from mongo database (9 times)
    for (var j = 0; j < gameResponse.length; j++) { // Loop through each game pulled from IGDB api
      if (databaseGames[i].title == gameResponse[j].name) { // If game name from mongo database matches game name from IGDB api
        if (gameResponse[j].cover == undefined) { // If game has no cover image
          databaseGames[i].cover = "no-cover.png" // Set cover image to no-cover.png
        } else { // If game has cover image
          gameResponse[j].cover.url = gameResponse[j].cover.url.replace("t_thumb", "t_cover_big") // Replace t_thumb with t_cover_big in url
          databaseGames[i].cover = gameResponse[j].cover.url // Set cover image to url from IGDB api
        }
      }
    }
  }

  res.render('searchGames.ejs', {
    "loggedIn": true,
    "name": req.session.username,
    "databaseGames": searchGameData,
    "currentPage": currentPage,
    "numPages": Math.ceil(databaseGames.length / PAGE_SIZE),
  })
})

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  const startPage = 1;
  const endPage = numPages;
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
    `)
  }

}


// End of Marco's code

// Aaron's Code

app.get('/questionnaire', sessionValidation, async (req, res) => {
  // Code to get all genres from database
  const gameList = await gamesModel.find().toArray()
  const genres = [];

  gameList.forEach(game => {
    const gameGenres = game.genres
    
    gameGenres.forEach(genre => {
      if (!genres.includes(genre) && genre != "") {
        genres.push(genre)
      }
    })
  });
  
  // Code for platform options
  const platforms = ["PC", "Playstation", "Xbox", "Nintendo", "Mobile", "Other"]

  // Code for number of players options
  const playerNum = ["Single Player", "Multiplayer VS", "Co-op"]

  // Code for hours per week options
  const hoursPlay = ["1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31+"]

  // Render questionnaire page
  res.render('questionnaire.ejs', {
    "genres": genres,
    "name": req.session.username,
    "platforms": platforms,
    "playerNum": playerNum,
    "hoursPlay": hoursPlay
  })
})

app.post('/questionnaireSubmit', sessionValidation, async (req, res) => {
  // Code to get all genres from database
  const gameList = await gamesModel.find().toArray()
  const genres = [];

  gameList.forEach(game => {
    const gameGenres = game.genres
    
    gameGenres.forEach(genre => {
      if (!genres.includes(genre) && genre != "") {
        genres.push(genre)
      }
    })
  });

  // create an array of all the genres the user selected
  var userGenres = []
  for (var i = 0; i < genres.length; i++) {
    if (req.body[genres[i]] == "true") {
      userGenres.push(genres[i])
    }
  }

  const platforms = ["PC", "Playstation", "Xbox", "Nintendo", "Mobile", "Other"]
  // create an array of all the platforms the user selected
  var userPlatforms = []
  for (var k = 0; k < platforms.length; k++) {
    if (req.body[platforms[k]] == "true") {
      userPlatforms.push(platforms[k])
    }
  }

  const playerNum = ["Single Player", "Multiplayer VS", "Co-op"]
  var userPlayerNum = []
  for (var j = 0; j < playerNum.length; j++) {
    if (req.body[playerNum[j]] == "true") {
      userPlayerNum.push(playerNum[j])
    }
  }

  var questionnaireInfo = {
    "minRating": req.body.minRating,
    "genres": userGenres,
    "gameFeature": req.body.gameFeature,
    "maxPrice": req.body.maxPrice,
    "platforms": userPlatforms,
    "playerNum": userPlayerNum,
    "hoursPlay": req.body.hoursPlay
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

app.get('/easterEgg', (req, res) => {
  res.render('easterEgg.ejs', { "name": req.session.username, "loggedIn": req.session.authenticated })
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
  const similarGames = await getSimilarGames(gameID)
  const gameImage = await getGameImage(gameID)
  const game = await gamesModel.findOne({ "_id": new ObjectId(gameID) })
  const saved = await usersModel.findOne({
    $and: [
      { username: req.session.username },
      { "savedGames": { $in: [{"name": game.title, "_id": new ObjectId(gameID)}] } }
    ]
  }
  )
  const isSaved = saved != null
  const history = await usersModel.findOne({
    $and: [
      { username: req.session.username },
      { "playedGames": { $in: [{"name": game.title, "_id": new ObjectId(gameID)}] } }
    ]
  }
  )
  const isInHistory = history != null
  if (req.session.authenticated) {
    res.render("gameinfo.ejs", { "game": game, "gameImage": gameImage, "similarGames": similarGames, "saved": isSaved, "name": req.session.username, "loggedIn": true , "inHistory": isInHistory})
  }
  else {
    res.render("gameinfo.ejs", { "game": game,"gameImage": gameImage, "similarGames": similarGames, "saved": isSaved, "loggedIn": false, "inHistory": isInHistory})
  }

})


app.post('/saveGame', async (req, res) => { // save games to saved games list from game info page
  if (req.session.authenticated) {
    const gameID = req.body.game
    const gameImage = await getGameImage(gameID)
    const purpose = req.body.purpose
    const similarGames = await getSimilarGames(gameID)
    const game = await gamesModel.findOne({"_id": new ObjectId(gameID) })
    const history = await usersModel.findOne({ // check if game is in history
      $and: [
        { username: req.session.username },
        { "playedGames": { $in: [{"name": game.title, "_id": new ObjectId(gameID)}] } }
      ]})
    const isInHistory = history != null
    if (purpose == "save") {
      await usersModel.updateOne({ username: req.session.username }, { $push: { 
        savedGames: {"name": game.title, "_id": new ObjectId(gameID)}
      } })
      res.render("gameinfo.ejs", { "game": game, "gameImage": gameImage, "similarGames": similarGames, "saved": true, "name": req.session.username, "loggedIn": true , "inHistory": isInHistory})
    }
    else {
      await usersModel.updateOne({ username: req.session.username }, { $pull: { 
        savedGames: {"name": game.title, "_id": new ObjectId(gameID)}
       } })
      res.render("gameinfo.ejs", { "game": game, "gameImage": gameImage, "similarGames": similarGames, "saved": false, "name": req.session.username, "loggedIn": true , "inHistory": isInHistory})
    }
  }
  else {
    res.redirect('/login')
  }
})


app.post('/saveToPlayed', async (req, res) => { // save games to played games list from game info page
  if (req.session.authenticated) {
    const gameID = req.body.game
    const gameImage = await getGameImage(gameID)
    const purpose = req.body.purpose
    const similarGames = await getSimilarGames(gameID)
    const game = await gamesModel.findOne({ "_id": new ObjectId(gameID) })
    const saved = await usersModel.findOne({ // looks for the game in the user's saved games
      $and: [
        { username: req.session.username },
        { "savedGames": { $in: [{"name": game.title, "_id": new ObjectId(gameID)}] } }
      ]
    }
    )
    const isSaved = saved != null 
    if (purpose == "mark") {
      await usersModel.updateOne({ username: req.session.username }, { $push: { playedGames: {"name": game.title, "_id": new ObjectId(gameID)}} })
      res.render("gameinfo.ejs", { "game": game,"gameImage": gameImage,  "similarGames": similarGames, "saved": isSaved, "name": req.session.username, "loggedIn": true, "inHistory": true })
    }
    else {
      await usersModel.updateOne({ username: req.session.username }, { $pull: { playedGames: {"name": game.title, "_id": new ObjectId(gameID)} } })
      res.render("gameinfo.ejs", { "game": game,"gameImage": gameImage,  "similarGames": similarGames,"saved": isSaved, "name": req.session.username, "loggedIn": true, "inHistory": false })
    }
  }
  else {
    res.redirect('/login')
  }
})

app.post("/removeSaved" , async (req, res) => { // remove game from saved games list from profile page
  const gameID = req.body.gameID
  const game = await gamesModel.findOne({ "_id": new ObjectId(gameID)})
  await usersModel.updateOne({ username: req.session.username }, { $pull: { savedGames: {"name": game.title, "_id": new ObjectId(gameID)} } })
  res.redirect("/profile")
})

app.post("/removePlayed" , async (req, res) => { // remove game from played games list from profile page
  const gameID = req.body.gameID
  const game = await gamesModel.findOne({ "_id": new ObjectId(gameID) })
  await usersModel.updateOne({ username: req.session.username }, { $pull: { playedGames: {"name": game.title, "_id": new ObjectId(gameID)} } })
  res.redirect("/profile")
})

async function getTwitchData() {
  var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c'
  const response = await fetch('https://id.twitch.tv/oauth2/token?client_id=culgms7hbkoyqwn37h25ocnd1mwa1c&client_secret=4h5nsk1q8gco3ltiiwoparvr217bmg&grant_type=client_credentials', {
    method: 'POST',
    headers: {
    'Client-ID': client_id,
    'Client-Secret': '4h5nsk1q8gco3ltiiwoparvr217bmg'
    }
  })
  const my_info = await response.json()
  return my_info
  }

const getGameImage = async (gameID) => {
    const game = await gamesModel.findOne({ "_id": new ObjectId(gameID) })
    const twitchData = await getTwitchData()
    async function getAllGames() {
      var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c'
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': client_id,
          'Authorization': 'Bearer ' + twitchData.access_token,
        },
        body: `fields name,cover.url; 
        sort release_dates.date desc;
        where release_dates.date != null;
        where name = ("${game.title}");`
      })
      const my_info = await response.json()
      return my_info
    }
    const gameImageArray = await getAllGames()
    console.log(gameImageArray)
    if (gameImageArray[0].cover == undefined){
      return "no-cover.png"
    }
    else {
     return gameImageArray[0].cover.url.replace("t_thumb", "t_cover_big")
    }
  }

const getSimilarGames = async (gameID) => {
  const game = await gamesModel.findOne({ "_id": new ObjectId(gameID) })
  const gameGenres = game.genres
  const similarGames = await gamesModel.find({
    "_id": { $ne: new ObjectId(gameID) },
     "genres": { $all: gameGenres } }).limit(8).toArray()
  const twitchData = await getTwitchData()
  var gameNames = []
 for (var i = 0; i < similarGames.length; i++) {
    gameNames.push(similarGames[i].title)
  }

  async function getAllGames(gameNames) {
    var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c'
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': client_id,
        'Authorization': 'Bearer ' + twitchData.access_token,
      },
      body: `fields name,cover.url; 
      sort release_dates.date desc;
      where release_dates.date != null;
      where name = ("${gameNames[0]}", "${gameNames[1]}", "${gameNames[2]}", "${gameNames[3]}", "${gameNames[4]}", "${gameNames[5]}", "${gameNames[6]}", "${gameNames[7]}", "${gameNames[8]}");
      limit 50;`
    })
    const my_info = await response.json()
    return my_info
  }
  const gameResponse = await getAllGames(gameNames)
  for (const similarGame of similarGames) {
    for (const game of gameResponse) {
      if (similarGame.title == game.name) {
        if (game.cover===undefined) {
          similarGame.cover = "no-cover.png"
        } else {
          game.cover.url = game.cover.url.replace("t_thumb", "t_cover_big")
          similarGame.cover = game.cover.url
        }
      }
    }
  }
  return similarGames
}
// End of Derek's code

app.get("*", (req, res) => {

  res.status(404).render("404.ejs", {
  "loggedIn": req.session.authenticated,
  "name": req.session.username,
  });
});

app.listen(port, () => {
  console.log("Listening on port " + port + "!");
});