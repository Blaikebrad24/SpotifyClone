import NextAuth from "next-auth/next";
import SpotifyProvider from "next-auth/providers/spotify";
import { refreshAccessToken } from "spotify-web-api-node/src/server-methods";
import { LOGIN_URL } from "../../../lib/spotify";
import spotifyAPI, {LOGIN_URL} from '../../../lib/spotify';

async function refreshAccessToken(token)
{
    try{
      // set accessToken and refresh token
      spotifyAPI.setAccessToken(token.accessToken);
      spotifyAPI.setRefreshToken(token.refreshToken);

      //deconstruct the response
      const { body: refreshedToken } = await spotifyAPI.refreshAccessToken();

    }catch(error)
    {
      console.log(error)
      return {
        ...token, 
        error: "RefreshAccessTokenError"
      }
    }
}


export default NextAuth ({
    providers: [
        SpotifyProvider({
          clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
          clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
          authorization: LOGIN_URL,
        })
      ],

    secret: process.env.JWT_SECRET,
    pages: {
      signIn: '/login'
    },
    callbacks: {
      async jwt({token, account, user}){
        // check conditions
        // initial sign in return this token
        if(account && user){
          return {
            ...token, 
            accessToken: account.access.token,
            refreshToken: account.refresh_token,
            username: account.providerAccountId,
            accessTokenExpires: account.expires_at * 1000,
          }
        }
        //refresh token
        // Return previous token if access token has not expired yet
        if(Date.now() < token.accessTokenExpires)
        {
          console.log("EXISTING ACCESS TOKEN IS VALID");
          return token;
        }

        //Access token has expired, so we need to update
        console.log("ACCESS TOKEN HAS EXPIRED, REFRESHING...");
        return await refreshAccessToken(token)
      },
    }
});

