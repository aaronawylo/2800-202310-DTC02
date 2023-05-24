// Filter code
const filterGenres = () => {
    selectedTypes = [];
    $('.typeCheckbox:checked').each(function () {
      selectedTypes.push($(this).val());
    });
    paginate(currentPage, PAGE_SIZE, pokemons);
    updatePaginationDiv(currentPage, Math.ceil(pokemons.length / PAGE_SIZE));
  };

  const setup = async () => {
    filterGenres();

  }