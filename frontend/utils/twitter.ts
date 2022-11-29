import { TwitterApi } from "twitter-api-v2";

const {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_SECRET,
} = process.env;

export const clientFactory = () => {
  if (TWITTER_CONSUMER_KEY === undefined) {
    throw new Error("TWITTER_CONSUMER_KEY is undefined");
  }
  if (TWITTER_CONSUMER_SECRET === undefined) {
    throw new Error("TWITTER_CONSUMER_SECRET is undefined");
  }
  if (TWITTER_ACCESS_TOKEN === undefined) {
    throw new Error("TWITTER_ACCESS_TOKEN is undefined");
  }
  if (TWITTER_ACCESS_SECRET === undefined) {
    throw new Error("TWITTER_ACCESS_SECRET is undefined");
  }

  return new TwitterApi({
    appKey: TWITTER_CONSUMER_KEY,
    appSecret: TWITTER_CONSUMER_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN, // oauth token from previous step (link generation)
    accessSecret: TWITTER_ACCESS_SECRET, // oauth token secret from previous step (link generation)
  });
};
