const clientId = '7a536f43424e4e1fad43dd3777470cad';
const clientSecret = '333def59ecae428797f341d934b304fd';
var accessToken = '';

const authString = `${clientId}:${clientSecret}`;
const base64AuthString = btoa(authString);

fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${base64AuthString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  .then(response => response.json())
  .then(data => {
    accessToken = data.access_token;
  })
  .catch(error => {
    console.log(error);
  });


import { searchArtist } from './artists.js';


const body = document.querySelector('body');
const musicBoxes = document.querySelectorAll('.musicBox');
const searchBox = document.querySelector('#search-box');
const albumSearchButton = document.querySelector('#search-button');
const albumSearchSection = document.querySelector('#album-search');
const artistSearchButton = document.querySelector('#artist-search-button');
const heroScrollIcon = document.querySelector('#heroScrollIcon');

function musicPage(album) {
  fetch(`https://api.spotify.com/v1/albums/${album}`, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      populateAlbumDisplay(data);

      //display an option to learn more about the artist
      const artistSide = document.querySelector('#artist-side');
      while (artistSide.firstChild) {
        artistSide.removeChild(artistSide.firstChild);
      }
      const expandArtist = document.createElement('div');
      expandArtist.textContent = 'Learn more about this artist!';
      expandArtist.id = 'expand-artist';
      expandArtist.addEventListener('click', () => {
        populateArtistDisplay(data.artists[0].id);
      })
      artistSide.appendChild(expandArtist);
    })
    .catch(error => {
      console.log(error);
    })

}

function populateAlbumDisplay(data) {
  const albumSide = document.querySelector('#album-side');

  //clear the album side
  while (albumSide.firstChild) {
    albumSide.removeChild(albumSide.firstChild);
  }

  const albumArt = document.createElement('img');
  albumArt.id = 'album-art';

  const albumTitle = document.createElement('h1');
  const albumArtist = document.createElement('p');
  const albumYear = document.createElement('p');
  const albumTracks = document.createElement('ol');
  albumTracks.id = 'album-tracks';

  const albumInfo = document.createElement('div');
  const albumText = document.createElement('div');
  albumText.id = 'album-text-info';

  albumArt.src = data.images[0].url;

  albumArt.addEventListener('mouseover', () => {
    body.style.transition = `all ease 1s`;
    body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${albumArt.getAttribute("src")}`;
  })

  albumTitle.innerHTML = data.name;
  albumArtist.innerHTML = data.artists[0].name;
  albumYear.innerHTML = data.release_date.slice(0, 4);

  albumText.appendChild(albumTitle);
  albumText.appendChild(albumArtist);
  albumText.appendChild(albumYear);

  while (albumTracks.firstChild) {
    albumTracks.removeChild(albumTracks.firstChild);
  }

  data.tracks.items.forEach(track => {
    const trackDiv = document.createElement('li');
    trackDiv.classList.add('track');

    const trackNumber = document.createElement('div');
    trackNumber.innerHTML = track.track_number + '. ';
    const trackName = document.createElement('div');
    trackName.classList.add('track-name');
    trackName.innerHTML = track.name;

    trackDiv.appendChild(trackNumber);
    trackDiv.appendChild(trackName);
    albumTracks.appendChild(trackDiv);
  })

  albumInfo.appendChild(albumArt);
  albumInfo.appendChild(albumText);

  albumSide.appendChild(albumInfo);
  albumSide.appendChild(albumTracks);
}

function populateArtistDisplay(artistId) {
  fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      const artistSide = document.querySelector('#artist-side');
      while (artistSide.firstChild) {
        artistSide.removeChild(artistSide.firstChild);
      }

      const artistArt = document.createElement('img');
      artistArt.id = 'artist-art';

      const artistText = document.createElement('div');

      const artistName = document.createElement('h1');
      const artistFollowers = document.createElement('p');
      const artistPopularity = document.createElement('p');
      const artistGenres = document.createElement('p');

      artistText.id = 'artist-text-info';

      artistText.appendChild(artistName);
      artistText.appendChild(artistFollowers);
      artistText.appendChild(artistPopularity);
      artistText.appendChild(artistGenres);

      artistArt.src = data.images[0].url;
      artistName.innerHTML = data.name;
      artistFollowers.innerHTML = data.followers.total.toLocaleString('en-US') + ' Spotify followers';
      artistPopularity.innerHTML = data.popularity + ' popularity';
      artistGenres.innerHTML = data.genres.join(', ');

      artistSide.appendChild(artistArt);
      artistSide.appendChild(artistText);

    })

}

function searchAlbum() {

  //if there are search results, remove them
  if (document.querySelector('#search-results')) {
    const searchResults = document.querySelector('#search-results');
    albumSearchSection.removeChild(searchResults);
  }

  const albumInput = document.querySelector('#album-input');

  //if either input is empty, display a popup
  if (albumInput.value === '') {
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.innerHTML = 'Enter an album name!';
    albumSearchSection.appendChild(popup);
    setTimeout(() => {
      albumSearchSection.removeChild(popup);
    }, 3000);
    return;
  }

  fetch(`https://api.spotify.com/v1/search?q=album:${albumInput.value}&type=album`, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then(response => response.json())
    .then(data => {
      const searchResults = document.createElement('ul');
      searchResults.id = 'search-results';

      if (data.albums.items.length === 0) {
        const noResults = document.createElement('li');
        noResults.classList.add('search-result');
        noResults.innerHTML = 'No results found!';
        searchResults.appendChild(noResults);
      } else {
        const topResults = data.albums.items.slice(0, 5);
        topResults.forEach(album => {
          const result = document.createElement('li');
          result.classList.add('search-result');
          result.innerHTML = album.name + ' - ' + album.artists[0].name + ' (' + album.release_date.slice(0, 4) + ')';
          result.dataset.albumId = album.id;
          result.addEventListener('click', () => {
            musicPage(result.dataset.albumId);
            albumSearchSection.removeChild(searchResults);
            document.getElementById("album-display").scrollIntoView()
          })
          searchResults.appendChild(result);
        })
      }
      albumSearchSection.appendChild(searchResults);
    })
    .catch(error => {
      console.log(error);
    });
}

heroScrollIcon.addEventListener('click', () => {
  document.getElementById("currentlyListening").scrollIntoView()
})

musicBoxes.forEach(box => {

  box.addEventListener('mouseover', () => {
    body.style.transition = `all ease 1s`;
    body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${box.firstChild.getAttribute("src")}`;
  })

  box.addEventListener('click', () => {
    musicPage(box.dataset.albumId);
    document.getElementById("album-display").scrollIntoView()

  })
});

albumSearchButton.addEventListener('click', () => {
  searchAlbum();
})

artistSearchButton.addEventListener('click', () => {
  //go to the artists.html page
  window.onload = function() {
    searchArtist();
  };
  window.location.href = 'artists.html';
})

export {
  accessToken
};