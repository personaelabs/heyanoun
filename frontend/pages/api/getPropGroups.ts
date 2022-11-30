import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropGroupsPayload } from "../../types/api";
import { prisma } from "../../utils/prisma";
import { buildNoundersGroupPayload } from "../../utils/utils";

function leafDataToAddress(data: string): string {
  return "0x" + BigInt(data).toString(16).padStart(40, "0");
}

// TODO: add nounders!
export default async function getPropGroups(
  req: NextApiRequest,
  res: NextApiResponse<PropGroupsPayload | ErrorResponse>
) {
  try {
    const propId = `${req.query.propId}`;
    if (!propId) {
      res.status(404).json({ err: "Missing prop ID or group ID" });
    } else {
      console.log(propId);
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
        console.log("empty");
        res
          .status(404)
          .json({ err: `Could not find any groups for prop id: ${propId}` });
      } else {
        const groups = dbGroups.map((g: any) => {
          return { root: g.root, leaves: g.leaves, type: g.type.name };
        });

        groups.push(await buildNoundersGroupPayload());

        console.log(groups);

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
