import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse } from "../../../types/api";
import { prisma } from "../../../utils/prisma";

const request = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | ErrorResponse>
) => {
  try {
    const propId = req.query.propId ? parseInt(`${req.query.propId}`) : -1;
    const count = parseInt(`${req.query.count}`);
    const offset = req.query.offset ? parseInt(`${req.query.offset}`) : 0;

    if (!count) {
      res.status(404).json({ err: "Missing count" });
    } else if (!offset && offset !== 0) {
      res.status(404).json({ err: "Missing offset" });
    } else {
      const prop = await prisma.prop.findFirst({
        where: {
          num: propId,
        },
        select: {
          Comments: true,
        },
      });
      const firstId = offset;
      //enforce hard limit of 100 comments per request to avoid response payload bloating
      const secondId = firstId + Math.min(count, 100);
      if (!prop) {
        res
          .status(404)
          .json({ err: `Could not fetch prop with id: ${propId}` });
      } else {
        if (firstId > prop.Comments.length) {
          res.status(200).json({ comments: [] });
        } else if (secondId > prop.Comments.length) {
          res.status(200).json({ comments: prop.Comments.slice(firstId) });
        } else {
          res
            .status(200)
            .json({ comments: prop.Comments.slice(firstId, secondId) });
        }
      }
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
};

export default request;
