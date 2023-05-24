

// // Secret information section
// const mongodb_host = process.env.MONGODB_HOST;
// const mongodb_user = process.env.MONGODB_USER;
// const mongodb_password = process.env.MONGODB_PASSWORD;
// const mongodb_database = process.env.MONGODB_DATABASE;
// const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
// const node_session_secret = process.env.NODE_SESSION_SECRET;
// const twitch_client_secret = process.env.TWITCH_CLIENT_SECRET;
// const twitch_client_id = process.env.TWITCH_CLIENT_ID;
// // End of secret information section


// var { database } = include('databaseConnection')

// const usersModel = database.db(mongodb_database).collection('users')
// const gamesModel = database.db(mongodb_database).collection('games')

// const { ObjectId } = require('mongodb')

// async function getTwitchData() { // Twitch authentication for IGDB api
//   const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${twitch_client_id}&client_secret=${twitch_client_secret}&grant_type=client_credentials`, {
//     method: 'POST',
//     headers: {
//       'Client-ID': twitch_client_id,
//       'Client-Secret': twitch_client_secret
//     }
//   })
//   const my_info = await response.json()
//   return my_info
// }
// const twitchData = getTwitchData()
// var databaseGames = gamesModel.find().limit(270).toArray() // pull games from mongodb
// console.log(databaseGames[0])

////////////////////////////////
// Filter code
////////////////////////////////

// Pulls filters currently checked on page
const filterGenresSelected = () => {
    selectedTypes = [];
    $('.typeCheckbox:checked').each(function () {
      selectedTypes.push($(this).val());
    });
    // console.log(selectedTypes)
    return selectedTypes;
  };

// Loops through all games pulled and checks if they match the selected filters
function createFilteredGames(allGamesPulled, selectedFilters) {
  const filteredGames = [];
  allGamesPulled.forEach((obj, index) => {
    filteredGames[index] = obj;
  });
  console.log(filteredGames)
  return filteredGames;
}

// Update numbered page buttons
function updatePaginationDiv(currentPage, numPages) {

}

// Update displayed games
async function paginateGames(currentPage, PAGE_SIZE, pulledGames){
  const paginatedGames = [];
  for (let i = 0; i < PAGE_SIZE; i++) {
    const game = pulledGames[(currentPage - 1) * PAGE_SIZE + i];
    if (game) {
      paginatedGames.push(game);
    }
  }
  return paginatedGames;
}

const setup = async () => {
  // Add event listener to type checkboxes
  $('body').on('change', '.typeCheckbox', function () {
    currentPage = 1;
    filterGenres();
  });

  console.log(data-pulled-games)

  console.log('Printing pulled games')
  // console.log(pulledGames);
  console.log(pulledGames);

}

$(document).ready(setup);