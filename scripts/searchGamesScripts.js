////////////////////////////////
// Filter code
////////////////////////////////

// Pulls filters currently checked on page
const filterGenresSelected = () => {
  const selectedTypes = [];
  $('.typeCheckbox:checked').each(function () {
    selectedTypes.push($(this).val());
  });
  return selectedTypes;
};

function filterGenres() {
  selectedFilters = filterGenresSelected(); // Pulls filters currently checked on page stored as an array
  const filteredGames = []; // Array to store games that match the selected filters
  $('#gameCards').empty(); // Clear the game cards div

// Iterate over the games array
  for (let i = 0; i < gameResponse.length; i++) {
    const genres = gameResponse[i].genres;
    console.log(genres)

    // Check if both target names exist in the genres of the current game
    const matches = selectedFilters.every((selectedFilters) =>
      genres.some((genre) => genre.name === selectedFilters)
    );
    console.log(matches)

    // If both target names are found, set found to true and break the loop
    if (matches) {
      filteredGames.push(gameResponse[i]);
    }
  }

  for (let i = (currentPage - 1)*PAGE_SIZE; i < currentPage * PAGE_SIZE; i++) {
    $('#gameCards').append(`
      <div class="card" id = gameCard>
        <div class="row g-0">
            <div class="col-sm row-">
                <img src="${filteredGames[i].cover} " class="img-fluid rounded-start gameImage" alt="Tears of the Kingdom">
            </div>
            <div class="col-sm row-">
                <div class="card-body">
                    <h5 class="card-title">${filteredGames[i].name}</h5>
                    <p class="card-text">${filteredGames[i].summary}</p>
                    <p class="card-text">${filteredGames[i].id}</p>
                    <form method="post" action="/gameInformation">
                        <input type="hidden" name="mongoGameID" value="">
                        <input type="hidden" name="apiGameID" value="${filteredGames[i].id}">
                        <input type ="hidden" name="gameImage" value="${filteredGames[i].cover}">
                        <button type="submit" class="btn btn-primary">See more information</button>
                    </form>
                </div>
            </div>
        </div>
      </div>
    `);
  };

  // updatePaginationDiv(currentPage, Math.ceil(filteredGames.length / PAGE_SIZE));
}

// Loops through all games pulled and checks if they match the selected filters
// function createFilteredGames(databaseGames, selectedFilters) {
//   const filteredGames = databaseGames.filter(game => selectedFilters.every(filter => game.genres.includes(filter)));
//   return filteredGames;
// }

// Update numbered page buttons
function updatePaginationDiv(currentPage, numPages) {
  $('#pagination').empty();

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(numPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons active" value="${i}">${i}</button>
    `);}
    else {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
    }
  }

  const prevButton = `<button class="btn btn-primary ml-1 prevButton" ${currentPage === 1 ? 'style="display: none;"' : ''}>
  <
  </button>`;

  const nextButton = `
    <button class="btn btn-primary ml-1 nextButton" ${currentPage === numPages ? 'style="display: none;"' : ''}>
    >
    </button>`;

  $('#pagination').prepend(prevButton);
  $('#pagination').append(nextButton);
}

// Update displayed games
async function paginateGames(currentPage, PAGE_SIZE, pulledGames){
  const paginatedGames = [];
  $('#gameCards').empty();
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

  // Add event listener to numbered page buttons
  $('body').on('click', '.numberedButtons', function () {
    currentPage = parseInt($(this).val());
    filterGenres();
  });

  // Add event listener to previous page button
  $('body').on('click', '.prevButton', function () {
    currentPage--;
    filterGenres();
  });

  // Add event listener to next page button
  $('body').on('click', '.nextButton', function () {
    currentPage++;
    filterGenres();
  });
  
  // console.log(currentPage)
  // console.log(databaseGames)
}

$(document).ready(setup);