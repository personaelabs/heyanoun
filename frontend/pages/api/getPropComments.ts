import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropCommentsPayload } from "../../types/api";
import { prisma } from "../../utils/prisma";

export default async function getPropComments(
  req: NextApiRequest,
  res: NextApiResponse<PropCommentsPayload | ErrorResponse>
) {
  try {
    const propId = `${req.query.propId}`;
    if (!propId) {
      res.status(404).json({ err: "Missing prop ID or group ID" });
    } else {
      const prop = await prisma.prop.findFirst({
        where: {
          id: parseInt(propId),
        },
        select: {
          Comments: true,
        },
      });
      if (!prop) {
        res
          .status(404)
          .json({ err: `Could not fetch prop with id: ${propId}` });
      } else {
        res.status(200).json({ comments: prop.Comments });
      }
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}
