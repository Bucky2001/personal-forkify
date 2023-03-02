import { async } from 'regenerator-runtime';
import * as config from './config.js';
import { AJAX } from './helper.js';
// import { getJSON, sendJSON } from './helper.js';
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: config.defaultPage,
    resultsPerPage: config.RES_PER_PAGE,
  },
  bookmark: [],
};

const createRecipeObject = function (data) {
  // console.log(data);
  const { recipe } = data.data;
  // console.log(recipe);
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};
export const loadRecipe = async function (id) {
  // 1)) loading reciepe
  try {
    const data = await AJAX(`${config.API_URL}${id}?key=${config.KEY}`);

    state.recipe = createRecipeObject(data);
    // console.log(state.recipe);
    if (!state.recipe) return;

    if (state.bookmark.some(bookmarke => bookmarke.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    // alert(err);
    throw err;
  }
};

export const loadSearchResult = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(
      `${config.API_URL}?search=${query}&key=${config.KEY}`
    );
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
    // console.log(recipes);
    // console.log(state.search);
  } catch (err) {
    throw err;
  }
};

export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //9;

  return state.search.results.slice(start, end);
};

export const updateServing = function (newServing = state.recipe.servings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServing) / state.recipe.servings;
  });

  // console.log(newServing);
  state.recipe.servings = newServing;
};

const presistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmark));
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmark.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  presistBookmark();
};

export const deleteBookmark = function (id) {
  const index = state.bookmark.findIndex(el => el.id === id);
  // console.log(index);
  // if (!index) return;
  state.bookmark.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;
  presistBookmark();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  // console.log(storage);
  if (storage) {
    state.bookmark = JSON.parse(storage);
    // console.log(state.bookmark);
  }
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim());

        if (ingArr.length !== 3) throw new Error('wrong ingredient formate');
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    // console.log(config.KEY);
    const data = await AJAX(`${config.API_URL}?key=${config.KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
