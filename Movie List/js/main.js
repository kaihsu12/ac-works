'use strict';

const BASE_URL = 'https://movie-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/movies/';
const POSTER_URL = BASE_URL + '/posters/';
const MOVIES_PER_PAGE = 12;
let triggerlayout = 1;

const movies = [];
let filteredMovies = [];
let currentData = [];

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');
const verticalLayout = document.querySelector('.vertical-layout');
const horizontalLayout = document.querySelector('.horizontal-layout');

// Render movie card
function renderMovieList(data) {
  let rawHTML = '';
  let rawHTML2 = `<ul class="list-group col-sm-12 mb-2">`;

  data.forEach((item) => {
    //titles and images
    if (triggerlayout) {
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
            <button class="btn btn-info btn-add-favorite" data-id="${
              item.id
            }">+</button>
          </div>
        </div>
      </div>
    </div>`;
    } else {
      rawHTML2 += `<li class="list-group-item d-flex justify-content-between">
      <h5 class="card-title">${item.title}</h5>
      <div>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
          data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </li>`;
    }
  });

  rawHTML2 += '</ul>';

  console.log(currentData);
  if (triggerlayout) {
    dataPanel.innerHTML = rawHTML;
  } else {
    dataPanel.innerHTML = rawHTML2;
  }
}

// Pagination
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return;
  const page = Number(event.target.dataset.page);
  renderMovieList(getMovieByPage(page));
});

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = '';

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  // 12 movies per page
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  currentData = data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  return currentData;
}

// POPUP info
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

// Add movie to favorite page
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert('It has been added to your list');
  }

  list.push(movie);

  localStorage.setItem('favoriteMovies', JSON.stringify(list));
}

// Buttons Event
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// Search bar
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  // if (!keyword.length) {
  //   return alert('Please enter a valid string');
  // }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert('Cannot find any movies with the keyword: ' + keyword);
  }

  //UNDERSTAND for of 去寫上面filter的迴圈方式
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovie.push(movie);
  //   }
  // }

  renderPaginator(filteredMovies.length);
  renderMovieList(getMovieByPage(1));
});

// AJAX
axios.get(INDEX_URL).then((response) => {
  // ARRAY(80)
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  renderMovieList(getMovieByPage(1));
});

//layout
verticalLayout.addEventListener('click', function verticalTrigger(e) {
  e.preventDefault();
  triggerlayout = 0;
  renderMovieList(currentData);
});

horizontalLayout.addEventListener('click', function horizontalTrigger(e) {
  e.preventDefault();
  triggerlayout = 1;
  renderMovieList(currentData);
});

//UNDERSTAND localStorage
//localStorage.setItem('default_language', 'english');
// console.log(localStorage.getItem('default_language'));
// localStorage.removeItem('default_language');
// console.log(localStorage.getItem('default_language'));xs
