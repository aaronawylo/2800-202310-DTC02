(async () => {
    var client_id = 'culgms7hbkoyqwn37h25ocnd1mwa1c';
  
    async function getTwitchData() {
      const response = await fetch('https://id.twitch.tv/oauth2/token?client_id=culgms7hbkoyqwn37h25ocnd1mwa1c&client_secret=4h5nsk1q8gco3ltiiwoparvr217bmg&grant_type=client_credentials', {
        method: 'POST',
        headers: {
          'Client-ID': client_id,
          'Client-Secret': '4h5nsk1q8gco3ltiiwoparvr217bmg'
        }
      });
      const my_info = await response.json();
      return my_info;
    }
  
    const twitchData = await getTwitchData();
    var gameNames = [];
  
    require('dotenv').config({});
    const axios = require('axios');
    const mongoose = require('mongoose');
  
    const gameSchema = new mongoose.Schema({
      title: String,
      releaseDate: String,
      team: Array,
      rating: String,
      times_listed: String,
      number_of_reviews: String,
      genres: Array,
      summary: String,
      platforms: Array,
    });
  
    const gameModel = mongoose.model('gamesV2', gameSchema);
  
    async function main() {
      await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`);
      console.log('Connected to MongoDB');
      
      const existingGameCount = await gameModel.countDocuments({});
      console.log(`Number of existing games: ${existingGameCount}`);
    
      let offset = existingGameCount;
      const batchSize = 500;
      let gamesData = await fetchDataFromIGDB(offset, batchSize);
  
      while (gamesData.length > 0) {
        await populateDatabase(gamesData); // Populate MongoDB with game data
        offset += batchSize;
        gamesData = await fetchDataFromIGDB(offset, batchSize);
      }
  
      console.log('Database population completed');
      mongoose.disconnect();
    }
  
    async function fetchDataFromIGDB(offset, limit) {
      const apiKey = twitchData.access_token; // Use the access token from Twitch API response
      const apiUrl = 'https://api.igdb.com/v4/games';
      const headers = {
        'Client-ID': client_id,
        'Authorization': 'Bearer ' + twitchData.access_token,
      };
      const requestBody = `fields name, first_release_date, involved_companies, rating, genres, summary, platforms; offset ${offset}; limit ${limit};`; // Customize the fields, offset, and limit as per your requirements
  
      try {
        const response = await axios.post(apiUrl, requestBody, { headers });
        return response.data;
      } catch (error) {
        console.log('Error fetching data from IGDB API:', error);
        return [];
      }
    }
  
    async function populateDatabase(gamesData) {
        for (const game of gamesData) {
          if (await gameModel.findOne({ summary: game.summary }) === null) {
            const team = game.involved_companies ? game.involved_companies.map((element) => element.name) : [];
            const genres = game.genres ? game.genres.map((element) => element.name) : [];
            const platforms = game.platforms ? game.platforms.map((element) => element.name) : [];      
      
            await gameModel.create({
              title: game.name,
              releaseDate: game.first_release_date,
              team: game.involved_companies,
              rating: game.rating,
              genres: game.genres,
              summary: game.summary,
              platforms: game.platforms,
            }).then(() => console.log(`Added ${game.name} to MongoDB`)).catch(err => console.log(err));
          }
        }
      }
      
  
    main().catch(err => console.log(err));
  
  })();
  