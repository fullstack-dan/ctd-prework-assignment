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

const artistSearchSection = document.querySelector('#artist-search');
const artistSearchButton = document.querySelector('#artist-search-button');

function searchArtist() {

    //if there are search results, remove them
    if (document.querySelector('#search-results')) {
        const searchResults = document.querySelector('#search-results');
        artistSearchSection.removeChild(searchResults);
    }

    const artistInput = document.querySelector('#artist-input');

    //if either input is empty, display a popup
    if (artistInput.value === '') {
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.innerHTML = 'Enter an artist name!';
        artistSearchSection.appendChild(popup);
        setTimeout(() => {
            artistSearchSection.removeChild(popup);
        }, 3000);
        return;
    }

    fetch(`https://api.spotify.com/v1/search?q=artist:${artistInput.value}&type=artist`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => response.json())
        .then(data => {

            console.log(data);
            const searchResults = document.createElement('ul');
            searchResults.id = 'search-results';

            if (data.artists.items.length === 0) {
                const noResults = document.createElement('li');
                noResults.classList.add('search-result');
                noResults.innerHTML = 'No results found!';
                searchResults.appendChild(noResults);
            } else {
                const topResults = data.artists.items.slice(0, 5);
                topResults.forEach(artist => {
                    const result = document.createElement('li');
                    result.classList.add('search-result');
                    result.innerHTML = artist.name + ' (' + artist.followers.total + ' followers)';
                    result.dataset.artistId = artist.id;
                    result.addEventListener('click', () => {
                        populateArtistDisplay(result.dataset.artistId);
                        artistSearchSection.removeChild(searchResults);
                        document.getElementById("artist-display").scrollIntoView()
                    })
                    searchResults.appendChild(result);
                })
            }
            artistSearchSection.appendChild(searchResults);
        })
        .catch(error => {
            console.log(error);
        });

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
            const artistDisplay = document.querySelector('#artist-display');
            while (artistDisplay.firstChild) {
                artistDisplay.removeChild(artistDisplay.firstChild);
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

            artistDisplay.appendChild(artistArt);
            artistDisplay.appendChild(artistText);

            //display the artists most recent albums to the page using the artist-albums div
            fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=5`, {
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                })
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    const albumsDisplay = document.querySelector('#albums-display');
                    while (albumsDisplay.firstChild) {
                        albumsDisplay.removeChild(albumsDisplay.firstChild);
                    }

                    //remove the header if it exists
                    if (document.querySelector('#artist-albums-header')) {
                        document.querySelector('#artist-albums').removeChild(document.querySelector('#artist-albums-header'));
                    }

                    //add a header to the artist-albums div
                    const artistAlbumsHeader = document.createElement('h1');
                    artistAlbumsHeader.innerHTML = 'Recent Albums';
                    artistAlbumsHeader.id = 'artist-albums-header';
                    document.querySelector('#artist-albums').insertBefore(artistAlbumsHeader, document.querySelector('#artist-albums').firstChild);

                    data.items.forEach(album => {
                        //wrap the album art in a div and add an h1 element with the album name and a p element with the release year

                        const albumInfo = document.createElement('div');
                        albumInfo.classList.add('album-info');
                        const albumArt = document.createElement('img');
                        albumArt.src = album.images[0].url;
                        albumArt.classList.add('album-art');

                        albumArt.addEventListener('mouseover', () => {
                            document.body.style.transition = `all ease 1s`;
                            document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${albumArt.getAttribute("src")}`;
                        })

                        albumArt.addEventListener('click', () => {
                            
                        });

                        const albumName = document.createElement('h1');
                        albumName.innerHTML = album.name;
                        albumName.classList.add('album-name');

                        const albumReleaseDate = document.createElement('p');
                        albumReleaseDate.innerHTML = album.release_date.slice(0, 4);
                        albumReleaseDate.classList.add('album-release-date');

                        albumInfo.appendChild(albumArt);
                        albumInfo.appendChild(albumName);
                        albumInfo.appendChild(albumReleaseDate);

                        albumsDisplay.appendChild(albumInfo);
                    })
                })
                .catch(error => {
                    console.log(error);
                });

        })

}

artistSearchButton.addEventListener('click', searchArtist);

export {
    searchArtist
};