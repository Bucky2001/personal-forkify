import * as modal from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODEL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function () {
  try {
    const id = window.location?.hash.slice(1);

    // console.log(query);
    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(modal.getSearchResultPage());

    //3 updating bookmark
    bookmarksView.update(modal.state.bookmark);

    // 1)) loading reciepe
    await modal.loadRecipe(id);

    // 2)) rendering recipe

    recipeView.render(modal.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError(err);
  }
};

// searchButton.addEventListener('click', controlRecipe);

const controlSearchResults = async function () {
  try {
    // 1) Get search Queary
    const query = searchView.getQuery();
    if (!query) return;
    // 2) Load search results
    resultsView.renderSpinner();
    await modal.loadSearchResult(query);

    // 3) Render Search results
    // resultsView.render(modal.state.search.results);
    // modal.state.search.page = 1;
    resultsView.render(modal.getSearchResultPage());

    paginationView.render(modal.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (num = 1) {
  resultsView.render(modal.getSearchResultPage(num));
  paginationView.render(modal.state.search);
};

const controlServing = function (newServing) {
  // update the recipe serving
  modal.updateServing(newServing);

  // update the recipe view
  // recipeView.render(modal.state.recipe);
  recipeView.update(modal.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!modal.state.recipe.bookmarked) modal.addBookmark(modal.state.recipe);
  else modal.deleteBookmark(modal.state.recipe.id);

  // 3)update recipe view
  recipeView.update(modal.state.recipe);

  // 3) render bookmarks
  bookmarksView.render(modal.state.bookmark);
};

const controlBookmarks = function () {
  bookmarksView.render(modal.state.bookmark);
};

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    // SHow render spinner
    addRecipeView.renderSpinner();

    // uPLOAD A NEW REcipe data
    await modal.uploadRecipe(newRecipe);
    console.log(modal.state.recipe);

    // Render Recipe
    recipeView.render(modal.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render Bookmark View
    bookmarksView.render(modal.state.bookmark);

    // Change ID in URL
    window.history.pushState(null, '', `#${modal.state.recipe.id}`);

    // Close from window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServing(controlServing);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
