import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse } from "../../types/api";
import { clientFactory } from "../../utils/twitter";
import { EUploadMimeType } from "twitter-api-v2";

const constructURL = (comment: string) => {
  const encodedComment = encodeURI(comment);

  console.log({
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (process.env.NODE_ENV === "development") {
    return `https://nouns150-krarq7uwa-personaelabs.vercel.app/screenshot?text=${encodedComment}`;
  } else {
    return `https://${process.env.VERCEL_URL}/screenshot?text=${encodedComment}`;
  }
};

const text = `Hello, world. How are you doing? ${Math.floor(
  Math.random() * 10000000 + 1
)}`;

const request = async (
  _req: NextApiRequest,
  res: NextApiResponse<{} | ErrorResponse>
) => {
  try {
    console.log(`requesting screenshot for ${text}`);
    const response = await fetch(
      `https://screenshot-coral.vercel.app/api?url=${constructURL(
        text
      )}&width=1280&height=720`
    );

    const client = clientFactory();
    const arrayBuffer = await response.arrayBuffer();
    const pngBuffer = Buffer.from(arrayBuffer);

    const mediaId = await client.v1.uploadMedia(pngBuffer, {
      mimeType: EUploadMimeType.Png,
    });

    await client.v2.tweet("", {
      media: { media_ids: [mediaId] },
    });

    return res
      .status(200)
      .json({ status: `Screenshot was generated and posted to twitter!` });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
};

export default request;
