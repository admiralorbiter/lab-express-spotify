require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));




// Our routes go here:
app.use(express.static('public')) // 'public' should be the name of your directory containing static files

app.get('/', (req, res) =>{
  res.redirect('/playlist-container');
})

app.get('/playlist-container', (req, res) =>{
  console.log("Getting playlist container")
  spotifyApi
  .getUserPlaylists('admiralorbiter')
  .then(data => {
    console.log('The received data from the API: ', data.body);
    // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
    res.render('playlist-results', {playlists: data.body.items});
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
})



app.get('/artist-search', (req, res) =>{
  
  const artistName = req.query.artist_name;

  spotifyApi
  .searchArtists(artistName)
  .then(data => {
    console.log('The received data from the API: ', data.body);
    // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
    res.render('artist-search-results', {artists: data.body.artists.items});
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
})



app.get('/albums/:artistId', (req, res, next) =>{

    spotifyApi.getArtistAlbums(req.params.artistId)
    .then (data => {
        const albums = data.body.items;
        console.log(albums);
        res.render('albums', {albums});
    })
    .catch(err =>{
      console.log('Error', err);
      next(err);
    })
})

app.get('/playlist/:id', (req, res) =>{
  console.log("Getting playlist ", req.params.id);
  spotifyApi
  .getPlaylist(req.params.id)
  .then(data => {
    const tracks = data.body.tracks.items;
    console.log('The received data from the API: ', tracks);
    res.render('playlist', {tracks});
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
})



app.get('/tracks/:id', (req, res, next) =>{
  const albumId = req.params.id;

  spotifyApi
  .getAlbumTracks(albumId)
  .then((data) =>{
      const albumTracks = data.body.items;
      console.log(albumTracks);
      res.render('tracks', { albumTracks });
  })
  .catch((err) => {
      console.log('Error:', err);
      next(err);
  })
})



app.listen(3001, () => console.log('My Spotify project running on port 3001 🎧 🥁 🎸 🔊'));
