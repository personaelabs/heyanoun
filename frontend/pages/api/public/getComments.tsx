import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse } from "../../../types/api";
import { prisma } from "../../../utils/prisma";

const request = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | ErrorResponse>
) => {
  try {
    const propId = `${req.query.propId}`;
    const count = Number.parseInt(`${req.query.count}`);
    const offset = Number.parseInt(`${req.query.offset}`);

    console.log(propId, count, offset);
    if (!propId) {
      res.status(404).json({ err: "Missing prop ID or group ID" });
    } else if (!count) {
      res.status(404).json({ err: "Missing count" });
    } else if (!offset && offset !== 0) {
      res.status(404).json({ err: "Missing offset" });
    } else {
      const prop = await prisma.prop.findFirst({
        where: {
          num: parseInt(propId),
        },
        select: {
          Comments: true,
        },
      });
      const firstId = offset;
      const secondId = firstId + count;
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
