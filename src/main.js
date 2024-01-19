import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from "axios";

const apiKey = "41764159-4dbb46db2acf8e3f55eb7fe99";

const formEl = document.querySelector("form");
const searchInputEl = document.getElementById("search-input");
const searchResultsEl = document.querySelector(".search-results");
const loadMoreButtonEl = document.getElementById("load-more-button");
const loaderEl = document.getElementById("loader");

let inputData = "";
let page = 1;
let lightbox;
let totalHits = 0;

function showLoader() {
  loaderEl.style.display = "block";
}

function hideLoader() {
  loaderEl.style.display = "none";
}

function showLoadMoreButton() {
  loadMoreButtonEl.style.display = "block";
}

function hideLoadMoreButton() {
  loadMoreButtonEl.style.display = "none";
}

function clearGallery() {
  searchResultsEl.innerHTML = "";
}

function createImageCard(imageData) {
  const imageWrapper = document.createElement("a");
  imageWrapper.href = imageData.largeImageURL;
  imageWrapper.classList.add("search-result");

  const image = document.createElement("img");
  image.src = imageData.webformatURL;
  image.alt = imageData.tags;

  const likes = document.createElement("p");
  likes.textContent = `Likes: ${imageData.likes}`;

  const views = document.createElement("p");
  views.textContent = `Views: ${imageData.views}`;

  const comments = document.createElement("p");
  comments.textContent = `Comments: ${imageData.comments}`;

  const downloads = document.createElement("p");
  downloads.textContent = `Downloads: ${imageData.downloads}`;

  imageWrapper.appendChild(image);
  imageWrapper.appendChild(likes);
  imageWrapper.appendChild(views);
  imageWrapper.appendChild(comments);
  imageWrapper.appendChild(downloads);

  return imageWrapper;
}


function getGalleryCardHeight() {
  const galleryCard = document.querySelector(".search-result");
  const cardRect = galleryCard.getBoundingClientRect();
  return cardRect.height;
}

// Плавна прокрутка сторінки
function smoothScrollBy(cardHeight) {
  const scrollAmount = cardHeight * 2; 
  window.scrollBy({
    top: scrollAmount,
    left: 0,
    behavior: "smooth",
  });
}

async function searchImages() {
  showLoader();
  inputData = searchInputEl.value;
  clearGallery();

  const url = `https://pixabay.com/api/?key=${apiKey}&q=${inputData}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        title: "",
        message: "Sorry, there are no images matching your search query. Please try again!",
      });
      hideLoadMoreButton();
      return;
    }

    appendImagesToGallery(data.hits);
    showLoadMoreButton();
    checkEndOfCollection();
  } catch (error) {
    console.error("Error processing request:", error.message);
  } finally {
    hideLoader();
  }
}

function appendImagesToGallery(results) {
  results.forEach((result) => {
    const imageCard = createImageCard(result);
    searchResultsEl.appendChild(imageCard);
  });

  if (!lightbox) {
    lightbox = new SimpleLightbox(".search-results a", {});
  } else {
    lightbox.refresh();
  }
}

async function loadMoreImages() {
  showLoader();
  page++;

  const url = `https://pixabay.com/api/?key=${apiKey}&q=${inputData}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.hits.length === 0) {
      iziToast.info({
        title: "",
        message: "No more images available.",
      });
      hideLoadMoreButton();
      return;
    }

    appendImagesToGallery(data.hits);
    checkEndOfCollection();

    
    const cardHeight = getGalleryCardHeight();
    smoothScrollBy(cardHeight);
  } catch (error) {
    console.error("Error loading more images:", error.message);
  } finally {
    hideLoader();
  }
}

function checkEndOfCollection() {
  if (page * 40 >= totalHits) {
    hideLoadMoreButton();
    iziToast.info({
      title: "",
      message: "We're sorry, but you've reached the end of search results.",
    });
  }
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  page = 1;
  inputData = searchInputEl.value;
  clearGallery();
  searchImages();
});

loadMoreButtonEl.addEventListener("click", loadMoreImages);
