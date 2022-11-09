import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropsPayload } from "../../types/api";
import { prisma } from "../../utils/prisma";

export default async function getProps(
  _req: NextApiRequest,
  res: NextApiResponse<PropsPayload | ErrorResponse>
) {
  try {
    const props = await prisma.prop.findMany();
    res.status(200).json({ props });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}
