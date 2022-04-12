import { TwitterApi } from "twitter-api-v2";
import { ConsulateZone } from "./types";

export const postTweet = (consulateZone: ConsulateZone, text: string) => {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    accessToken: consulateZone.twitterOauthToken,
    accessSecret: consulateZone.twitterOauthTokenSecret,
  });
  return client.v1.tweet(text);
};
