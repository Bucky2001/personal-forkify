import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';
import View from './view.js';

class BookmarkView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = `No bookmarks yet. Find a nice recipe and bookmark it :)`;

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _gentrateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}
export default new BookmarkView();

//preview__link--active
// <div class="preview__user-generated">
//   <svg>
//     <use href="${icons}#icon-user"></use>
//   </svg>
// </div>
