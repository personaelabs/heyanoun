import { PointPreComputes } from "../types/zk";
import initWasm from "./getPreComputes";
import { compute_powers } from "./getPrecomputesHelpers";

export const getPointPreComputes = async (
  pointHex: string
): Promise<PointPreComputes> => {
  await initWasm();

  const result = compute_powers(pointHex);
  const preComputes: PointPreComputes = JSON.parse(result).powers.map(
    (limbs: any) =>
      limbs.map((coordinates: any) =>
        coordinates.map((registers: any) =>
          registers.map((register: any) => BigInt(register))
        )
      )
  );

  return preComputes;
};
