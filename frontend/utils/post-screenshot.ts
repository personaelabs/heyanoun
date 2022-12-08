import { EUploadMimeType } from "twitter-api-v2";
import { NounSet } from "../components/anonPill";
import { clientFactory } from "./twitter";

const constructURL = (comment: string, nounSetStr: string) => {
  const encodedComment = encodeURI(comment);

  if (process.env.NODE_ENV === "development") {
    return `https://nouns150-74q3wuvrk-personaelabs.vercel.app/screenshot?text=${encodedComment}&nounSet=${nounSetStr}`;
  } else {
    return `https://${process.env.VERCEL_URL}/screenshot?text=${encodedComment}&nounSet=${nounSetStr}`;
  }
};

interface IScreeshotParams {
  text: string;
  nounSet: NounSet;
}

export const postScreenshot = async (
  { text, nounSet }: IScreeshotParams,
  proofIPFS: string,
  propId: number
) => {
  const nounSetStr = NounSet[nounSet];
  console.log(constructURL(text, nounSetStr));

  console.log(`requesting screenshot for ${text}`);
  const screenshotURL = `https://screenshot-coral.vercel.app/api?url=${constructURL(
    text,
    nounSetStr
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

  await client.v2.tweet(`prop: ${propId}\nproof: ${proofIPFS}`, {
    media: { media_ids: [mediaId] },
  });
};
