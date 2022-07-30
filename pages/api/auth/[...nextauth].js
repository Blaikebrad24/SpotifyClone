import NextAuth from "next-auth/next";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyAPI, {LOGIN_URL} from '../../../lib/spotify';

async function refreshAccessToken(token)
{
    try{
      // set accessToken and refresh token
      spotifyAPI.setAccessToken(token.accessToken);
      spotifyAPI.setRefreshToken(token.refreshToken);

      //deconstruct the response
      //sending both accessToken and refreshToken back to spotifyAPI
      // provides a new accessToken
      const { body: refreshedToken } = await spotifyAPI.refreshAccessToken();

      console.log("REFRESHED TOKEN IS", refreshedToken)

      return {
        ...token,
        accessToken: refreshedToken.access_token,
        accessTokenExpires: Date.now + refreshedToken.expires_in * 1000, // = 1 hour as 3600 returns from 
        //spotify api
        refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        // Replace if new one came back else fall back to old refresh token
      };
    }catch(error)
    {
      console.error(error)
      return {
        ...token, 
        error: "RefreshAccessTokenError",
      };
    }
}


export default NextAuth ({
  //configure 1 or more auth providers
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
        // refresh Token Rotation -> NextAuth
        if(account && user){
          //first time signed In
          return {
            ...token, 
            accessToken: account.access.token,
            refreshToken: account.refresh_token,
            username: account.providerAccountId,
            accessTokenExpires: account.expires_at * 1000,
            //handling expire times in miliseconds 
          }
        }
        //refresh token
        // persistance page checking if token is valid
        // Return previous token if access token has not expired yet
        if(Date.now() < token.accessTokenExpires)
        {
          console.log("EXISTING ACCESS TOKEN IS VALID");
          return token;
        }

        //Access token has expired, so we need to update
        console.log("ACCESS TOKEN HAS EXPIRED, REFRESHING...");
        return await refreshAccessToken(token);
      },

      async session({session, token}){
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.username = token.username;

        //connected the token to user session
        return session;
      }
    }
});

