import fs from "fs";

import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse } from "../../types/api";
import { clientFactory } from "../../utils/twitter";
import edgeChromium from "chrome-aws-lambda";

// Importing Puppeteer core as default otherwise
// it won't function correctly with "launch()"
import puppeteer from "puppeteer-core";

// You may want to change this if you're developing
// on a platform different from macOS.
// See https://github.com/vercel/og-image for a more resilient
// system-agnostic options for Puppeteeer.

// Get a screenshot of the page using the API from https://screenshot-coral.vercel.app/api?url=${}&width=1280&height=720
// Fetch a screenshot from the API programmatically and save the file to the filesystem
//
// Then upload it to twitter
// Then delete the file from the filesystem
// Then return a response to the user

const LOCAL_CHROME_EXECUTABLE =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const constructURL = (comment: string) => {
  console.log("constructing URL:");
  const encodedComment = encodeURI(comment);

  console.log({
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000/screenshot?text=${encodedComment}`;
  } else {
    return `https://${process.env.VERCEL_URL}/screenshot?text=${encodedComment}`;
  }
};

const Screenshot = async (userComment: string) => {
  const executablePath =
    (await edgeChromium.executablePath) || LOCAL_CHROME_EXECUTABLE;

  const browser = await puppeteer.launch({
    executablePath,
    args: edgeChromium.args,
    headless: true,
  }); // Launch a "browser"

  const page = await browser.newPage(); // Open a new page
  await page.goto(constructURL(userComment)); // Go to the website

  // There's currently a reace condition in the code that causes the page to
  // be screenshotted before it's fully loaded. This is a workaround.
  return new Promise((resolve) => {
    setTimeout(async () => {
      await page.screenshot({
        path: "./tmp/twit.jpeg", // Save the screenshot in current directory
        type: "jpeg",
        quality: 100, // Set the quality of the screenshot
      });

      await page.close(); // Close the website

      await browser.close(); // Close the browser

      resolve(null);
    }, 1000);
  });
};

const text = `Hello, world. How are you doing? ${Math.floor(
  Math.random() * 1000000 + 1
)}`;

const request = async (
  _req: NextApiRequest,
  res: NextApiResponse<{} | ErrorResponse>
) => {
  try {
    // await Screenshot(text);

    const response = await fetch(
      `https://screenshot-coral.vercel.app/api?url=${constructURL(
        text
      )}&width=1280&height=720`
    );
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const outputFileName = `tmp/twit.png`;
    await fs.createWriteStream(outputFileName).write(buffer);

    const client = clientFactory();
    const mediaId = await client.v1.uploadMedia("./tmp/twit.png");
    await client.v2.tweet("", {
      media: { media_ids: [mediaId] },
    });

    res
      .status(200)
      .json({ status: `Screenshot was generated and posted to twitter!` });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
};

export default request;
