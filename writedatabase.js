require('dotenv').config({});
const papa = require('papaparse');
const fs = require('fs');
const mongoose = require('mongoose');
main().catch(err => console.log(err));

const gameSchema = new mongoose.Schema({
    title: String,
    releaseDate: String,
    team: Array,
    rating: String,
    times_listed: String,
    number_of_reviews: String,
    genres: Array,
    summary: String,
    reviews: Array,
    plays: String,
    playing: String,
    backlogs: String,
    wishlist: String,
});

const gameModel = mongoose.model('games', gameSchema);

async function main() {
    await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`);
    console.log('Connected to MongoDB');
}

// const writeToMongodb = async () => {
//     fs.readFile('./datasets/games.csv', 'utf8', async function (err, data) { // code taken from chatgpt May 09, 2023 Sprint #3 by Derek
//         if (err) throw err;
//         const { data: dataArray } = papa.parse(data, { header: true });
//         for (const game of dataArray) {
//             if (await gameModel.findOne({ summary: game.Summary }) === null) {
//                 await gameModel.create({
//                     title: game.Title,
//                     releaseDate: game.Release_Date,
//                     team: game.Team.slice(1, -1).split(", ").map((element) => element.replace(/^'/, "").replace(/'$/, "").replace(/'/g, "\\'")), // slice, split, and map method code taken from chatgpt May 10, 2023 Sprint #3 by Derek
//                     rating: game.Rating,
//                     times_listed: game.Times_Listed,
//                     number_of_reviews: game.Number_of_Reviews,
//                     genres: game.Genres.slice(1, -1).split(", ").map((element) => element.replace(/^'/, "").replace(/'$/, "").replace(/'/g, "\\'")), // slice, split, and map method code taken from chatgpt May 10, 2023 Sprint #3 by Derek
//                     summary: game.Summary,
//                     reviews: game.Reviews.slice(1, -1).split(", ").map((element) => element.replace(/^'/, "").replace(/'$/, "").replace(/'/g, "\\'")), 
//                     plays: game.Plays,
//                     playing: game.Playing,
//                     backlogs: game.Backlogs,
//                     wishlist: game.Wishlist,
//                 }).then(() => console.log(`Added ${game.Title} to MongoDB`)).catch(err => console.log(err))
//             }
//         }
//     })
// }

// writeToMongodb()
