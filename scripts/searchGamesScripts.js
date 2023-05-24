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
  const selectedFilters = filterGenresSelected(); // Pulls filters currently checked on page stored as an array
  const filteredGames = databaseGames.filter((game) =>
    selectedFilters.every((selectedFilter) => game.genres.includes(selectedFilter))
  ); // Loops through all games pulled and checks if they match the selected filters
  // databaseGames.forEach((game) => {
  //   if (game.genres.includes(selectedFilters)) {
  //     // console.log(game);
  //   }
  // });
  // console.log(filteredGames)
  const paginatedGames = paginateGames(currentPage, PAGE_SIZE, filteredGames);
  
  // Update the displayed games on the page with the filtered and paginated data
  // You can update the game cards or any other elements that show the games

  // You can also update the pagination buttons if needed
  filteredGames.forEach((game, index) => {
    $('#gameCards').append(`
      <div class="card" id = gameCard>
        <div class="row g-0">
            <div class="col-sm row-">
                <img src="${gameResponse[index].cover} " class="img-fluid rounded-start gameImage" alt="Tears of the Kingdom">
            </div>
            <div class="col-sm row-">
                <div class="card-body">
                    <h5 class="card-title">${gameResponse[index].title}</h5>
                    <p class="card-text">${gameResponse[index].summary}</p>
                    <p class="card-text">${gameResponse[index]._id}</p>
                    <form method="post" action="/gameInformation">
                        <input type="hidden" name="mongoGameID" value="${gameResponse[index]._id}">
                        <input type="hidden" name="apiGameID" value="${gameResponse[index].apiID}">
                        <input type ="hidden" name="gameImage" value="${gameResponse[index].cover.url.replace("t_thumb", "t_cover_big")}">
                        <button type="submit" class="btn btn-primary">See more information</button>
                    </form>
                </div>
            </div>
        </div>
      </div>
    `);
  });

  // filteredGames.forEach((game, index) => {
  //   console.log(game)
  //   console.log(index)
  // });
  updatePaginationDiv(currentPage, Math.ceil(filteredGames.length / PAGE_SIZE));
}

// Loops through all games pulled and checks if they match the selected filters
// function createFilteredGames(databaseGames, selectedFilters) {
//   const filteredGames = databaseGames.filter(game => selectedFilters.every(filter => game.genres.includes(filter)));
//   console.log('these are filtered games')
//   console.log(filteredGames);
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
// console.log(gameResponse)
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