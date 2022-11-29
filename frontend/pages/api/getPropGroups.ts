import { NextApiRequest, NextApiResponse } from "next/types";
import {
  ErrorResponse,
  GroupPayload,
  PropGroupsPayload,
} from "../../types/api";
import { prisma } from "../../utils/prisma";

function leafDataToAddress(data: string): string {
  return "0x" + BigInt(data).toString(16).padStart(40, "0");
}

export default async function getPropGroups(
  req: NextApiRequest,
  res: NextApiResponse<PropGroupsPayload | ErrorResponse>
) {
  try {
    const propId = `${req.query.propId}`;
    if (!propId) {
      res.status(404).json({ err: "Missing prop ID or group ID" });
    } else {
      const groups = await prisma.group.findMany({
        where: {
          propId: parseInt(propId),
        },
        // TODO: add group type?
        select: {
          leaves: true,
          id: true,
          root: true,
        },
      });
      if (groups.length === 0) {
        res
          .status(404)
          .json({ err: `Could not find any groups for prop id: ${propId}` });
      } else {
        res.status(200).json(
          groups.map((g: any) => {
            return { root: g.root, leaves: g.leaves };
          })
        );
      }
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}
