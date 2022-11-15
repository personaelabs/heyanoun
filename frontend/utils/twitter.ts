import got from "got";
import crypto from "crypto";
import OAuth from "oauth-1.0a";

const manageTweetsURL = "https://api.twitter.com/2/tweets";

type TwitResponse = {
  statusCode: number;
  body: {
    data: {
      id: string;
    };
  };
};

export function getAuthHeader() {
  const oauth = new OAuth({
    consumer: {
      key: process.env.TWITTER_CONSUMER_KEY!,
      secret: process.env.TWITTER_CONSUMER_SECRET!,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) =>
      crypto.createHmac("sha1", key).update(baseString).digest("base64"),
  });

  return oauth.toHeader(
    oauth.authorize(
      {
        url: manageTweetsURL,
        method: "POST",
      },
      {
        key: process.env.TWITTER_ACCESS_TOKEN_KEY!,
        secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
      }
    )
  );
}

// TODO: args based on how we want to format the tweet
export async function postTweet(message: string) {
  const authHeader = getAuthHeader();

  const json: any = { text: message };
  const resp = await got.post(manageTweetsURL, {
    json,
    responseType: "json",
    headers: {
      Authorization: authHeader["Authorization"],
      "content-type": "application/json",
      accept: "application/json",
    },
  });

  if (resp.statusCode !== 201) {
    throw new Error("error posting tweet");
  } else {
    // const tweetID = resp.body.data.id;
    // const tweetURL = `https://twitter.com/${credential.twitter_account}/status/${tweetID}`;
    // return tweetURL;
    return "posted tweet!";
  }
}
