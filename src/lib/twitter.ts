import { TwitterApi } from "twitter-api-v2";

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY!,
  appSecret: process.env.TWITTER_CONSUMER_SECRET!,
  accessToken: process.env.TWITTER_OAUTH_TOKEN!,
  accessSecret: process.env.TWITTER_OAUTH_TOKEN_SECRET!,
});

export const postTweet = (text: string) => {
  return client.v1.tweet(text);
};
