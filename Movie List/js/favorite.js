'use strict';

const BASE_URL = 'https://movie-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/movies/';
const POSTER_URL = BASE_URL + '/posters/';

const movies = JSON.parse(localStorage.getItem('favoriteMovies'));
console.log(movies);

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');

function renderMovieList(data) {
  let rawHTML = '';

  data.forEach((item) => {
    //titles and images
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top"
            alt="Movie Poster"
          />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button
              class="btn btn-primary btn-show-movie"
              data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id="${item.id}"
            >
              More
            </button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${
              item.id
            }">X</button>
          </div>
        </div>
      </div>
    </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title');
  const modalImage = document.querySelector('#movie-modal-image');
  const modalDate = document.querySelector('#movie-modal-data');
  const modalDescription = document.querySelector('#movie-modal-description');

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = 'Release date: ' + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img
    src="${POSTER_URL + data.image}"
    alt="Movie Poster"
    class="img-fluid"
  />`;
  });
}

function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  movies.splice(movieIndex, 1);

  localStorage.setItem('favoriteMovies', JSON.stringify(movies));
  renderMovieList(movies);
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

renderMovieList(movies);
//UNDERSTAND localStorage
//localStorage.setItem('default_language', 'english');
// console.log(localStorage.getItem('default_language'));
// localStorage.removeItem('default_language');
// console.log(localStorage.getItem('default_language'));