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


const body = document.querySelector('body');
const musicBoxes = document.querySelectorAll('.musicBox');

const heroScrollIcon = document.querySelector('#heroScrollIcon');

body.style.backgroundSize = 'cover';

function musicPage(album) {

  const albumDisplay = document.querySelector('#album-display');
  const albumArt = document.querySelector('#album-art');
  const albumTitle = document.querySelector('#album-title');
  const albumArtist = document.querySelector('#album-artist');
  const albumYear = document.querySelector('#album-year');
  const albumTracks = document.querySelector('#album-tracks');

  var albumData = {};
  fetch(`https://api.spotify.com/v1/albums/${album}`, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      albumData = data;
      albumArt.src = albumData.images[0].url;
      albumTitle.innerHTML = albumData.name;
      albumArtist.innerHTML = albumData.artists[0].name;
      albumYear.innerHTML = albumData.release_date.slice(0, 4);

      while(albumTracks.firstChild) {
        albumTracks.removeChild(albumTracks.firstChild);
      }

      albumData.tracks.items.forEach(track => {
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

      console.log(data);
    })
    .catch(error => {
      console.log(error);
    })

  

}

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

heroScrollIcon.addEventListener('click', () => {
  document.getElementById("currentlyListening").scrollIntoView()
})