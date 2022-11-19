import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, GroupPayload } from "../../types/api";
import { prisma } from "../../utils/prisma";

export default async function getPropGroup(
  req: NextApiRequest,
  res: NextApiResponse<GroupPayload | ErrorResponse>
) {
  try {
    const propId = `${req.query.propId}`;
    const groupType = `${req.query.groupType}`;
    if (!propId || !groupType) {
      res.status(404).json({ err: "Missing prop ID or group ID" });
    } else {
      const group = await prisma.group.findFirst({
        where: {
          typeId: parseInt(groupType),
          propId: parseInt(propId),
        },
        select: {
          leaves: true,
          id: true,
          root: true,
        },
      });
      if (!group) {
        res
          .status(404)
          .json({ err: `Could not fetch prop with id: ${propId}` });
      } else {
        res.status(200).json({ root: group.root, leaves: group.leaves });
      }
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}
