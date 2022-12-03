import { NextApiRequest, NextApiResponse } from "next/types";
import { NounSet } from "../../components/anonPill";
import { ErrorResponse } from "../../types/api";
import { postScreenshot } from "../../utils/post-screenshot";

const request = async (
  _req: NextApiRequest,
  res: NextApiResponse<{} | ErrorResponse>
) => {
  try {
    await postScreenshot({
      text: `Testing a new comment with randomly generated number: ${Math.floor(
        Math.random() * 10000000 + 1
      )}`,
      nounSet: NounSet.ManyNouns,
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
