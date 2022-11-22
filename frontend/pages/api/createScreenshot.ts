import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropsPayload } from "../../types/api";

const puppeteer = require("puppeteer"); // Require Puppeteer module

const constructURL = (comment: string) => {
  const encodedComment = encodeURI(comment);
  return `http://localhost:3000/screenshot?text=${encodedComment}`;
};

const Screenshot = async (userComment: string) => {
  const browser = await puppeteer.launch(); // Launch a "browser"
  const page = await browser.newPage(); // Open a new page
  await page.goto(constructURL(userComment)); // Go to the website

  // There's currently a reace condition in the code that causes the page to
  // be screenshotted before it's fully loaded. This is a workaround.
  setTimeout(async () => {
    await page.screenshot({
      path: "./twitter-screenshot.jpeg", // Save the screenshot in current directory
      type: "jpeg",
      quality: 100, // Set the quality of the screenshot
      width: 600,
      height: 600,
    });

    await page.close(); // Close the website

    await browser.close(); // Close the browser
  }, 1000);
};

const text = `Presumably whatever code changes are required for private voting
to be possible on the core nouns contracts can instead be
implemented on an intermediate contract “above”? Presumably
whatever code changes are required for private voting to be
possible on the core nouns contracts can instead be implemented on
an intermediate contract “above”? Hey theree!.`;

const request = async (
  _req: NextApiRequest,
  res: NextApiResponse<{} | ErrorResponse>
) => {
  try {
    await Screenshot(text);
    res.status(200).json({ data: text });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
};

export default request;
