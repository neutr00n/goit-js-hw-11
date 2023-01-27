import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import infiniteScroll from 'infinite-scroll';
import { ImagesApiService } from './js/fetchImages';
import { createMarkupImageCard } from './js/markupGallery';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

const imagesApiService = new ImagesApiService();

refs.form.addEventListener('submit', handleFormSubmit);

refs.loadMore.addEventListener('click', handleLoadMoreBtnClick);

function handleFormSubmit(event) {
  event.preventDefault();

  const searchInput = event.currentTarget.elements.searchQuery;
  inputValue = searchInput.value.trim();

  clearMarkup();
  refs.loadMore.classList.add('is-hidden');

  if (!inputValue) {
    getMessageInfo('Write something');
    return;
  }

  imagesApiService.value = inputValue;

  imagesApiService.resetPage();
  imagesApiService.resetCountImg();
  getFetchData();

  event.currentTarget.reset();
}

function handleLoadMoreBtnClick(event) {
  imagesApiService.incrementPage();
  getFetchData();
}

async function getFetchData() {
  try {
    const { hits, totalHits } = await imagesApiService.fetchImages();
    imagesApiService.countImg += hits.length;

    if (!hits.length) {
      getMessageErr(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      return;
    }

    if (imagesApiService.page === 1) {
      getMessageInfo(`Hooray! We found ${totalHits} images.`);
    }

    if (imagesApiService.countImg === totalHits) {
      getMessageInfo(
        "We're sorry, but you've reached the end of search results."
      );
      refs.loadMore.classList.add('is-hidden');

      appendMarkupImage(hits);
      lightbox.refresh();
      return;
    }

    appendMarkupImage(hits);
    smootherScroll();
    lightbox.refresh();

    refs.loadMore.classList.remove('is-hidden');
  } catch (err) {
    getMessageErr(err.message);
  }
}

function appendMarkupImage(cards) {
  const markup = cards.map(createMarkupImageCard).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}

function getMessageErr(message) {
  Notify.failure(message);
}

function getMessageInfo(message) {
  Notify.info(message);
}

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function smootherScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 0.25,
    behavior: 'smooth',
  });
}
