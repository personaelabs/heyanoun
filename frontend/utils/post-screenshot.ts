import { EUploadMimeType } from "twitter-api-v2";
import { clientFactory } from "./twitter";

const constructURL = (comment: string) => {
  const encodedComment = encodeURI(comment);

  if (process.env.NODE_ENV === "development") {
    return `https://nouns150-krarq7uwa-personaelabs.vercel.app/screenshot?text=${encodedComment}`;
  } else {
    return `https://${process.env.VERCEL_URL}/screenshot?text=${encodedComment}`;
  }
};

export const postScreenshot = async (
  text = `This is a comment with a randomly generated number: ${Math.floor(
    Math.random() * 10000000 + 1
  )}`
) => {
  console.log(`requesting screenshot for ${text}`);
  const screenshotURL = `https://screenshot-coral.vercel.app/api?url=${constructURL(
    text
  )}&width=1280&height=720`;
  const response = await fetch(screenshotURL);

  console.log("\n");
  console.log(screenshotURL);
  console.log("\n");

  const client = clientFactory();
  const arrayBuffer = await response.arrayBuffer();
  const pngBuffer = Buffer.from(arrayBuffer);

  const mediaId = await client.v1.uploadMedia(pngBuffer, {
    mimeType: EUploadMimeType.Png,
  });

  await client.v2.tweet(``, {
    media: { media_ids: [mediaId] },
  });
};
