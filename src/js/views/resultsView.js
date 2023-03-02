import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';
import View from './view.js';

class ResultView extends View {
  _parentElement = document.querySelector('.results');

  _gentrateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join('');
  }
}
export default new ResultView();

//preview__link--active
// <div class="preview__user-generated">
//   <svg>
//     <use href="${icons}#icon-user"></use>
//   </svg>
// </div>
