import SpotifyWebApi from "spotify-web-api-node";
import { URLSearchParams } from "url";

const scopes = [
    "user-read-email",
    "plalist-read-private",
    "playlist-read-collaborative",
    "user-read-email",
    "streaming",
    "user-read-private",
    "user-library-read",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-follow-read",
].join(','); // joins the array into one string csv

const params = {
    scope: scopes,
};
 //programmatic way of building the api string

 const queryParamString = new URLSearchParams(params);
 const LOGIN_URL = `https://accounts.spotify.com/authorize?${queryParamString.toString()}`;
 const spotifyAPI = new SpotifyWebApi({
     clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
     clientSecret: NEXT_PUBLIC_CLIENT_SECRET,
     
 })
export default spotifyAPI;
export { LOGIN_URL };