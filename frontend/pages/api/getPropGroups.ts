import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropGroupsPayload } from "../../types/api";
import { noundersGroupPayload } from "../../utils/nounders";
// import { noundersGroupPayload } from "../../utils/nounders";
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
      const dbGroups = await prisma.group.findMany({
        where: {
          propId: parseInt(propId),
        },
        select: {
          leaves: true,
          id: true,
          root: true,
          type: true,
        },
      });
      if (dbGroups.length === 0) {
        res
          .status(404)
          .json({ err: `Could not find any groups for prop id: ${propId}` });
      } else {
        const groups = dbGroups.map((g: any) => {
          return { root: g.root, leaves: g.leaves, type: g.type.name };
        });
        groups.push(noundersGroupPayload);

        res.status(200).json({
          groups,
        });
      }
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}
