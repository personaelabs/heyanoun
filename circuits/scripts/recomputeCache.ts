import BN from "bn.js";
import { groth16 } from "snarkjs";
import * as fs from "fs";
import * as path from "path";
import { SECP256K1_N } from "../utils/config";
import { getPointPreComputes } from "../utils/point-cache";
import { prepareMerkleRootProof, splitToRegisters } from "../utils/utils";
import { createMerkleTree } from "../utils/merkleTree";
import { ethers } from "ethers";
const { hashPersonalMessage, ecsign } = require("@ethereumjs/util");
const elliptic = require("elliptic");
const ec = new elliptic.ec("secp256k1");

const privKey = BigInt(
  "0xf5b552f608f5b552f608f5b552f6082ff5b552f608f5b552f608f5b552f6082f"
);

async function main() {
  const msgHash = hashPersonalMessage(Buffer.from("hello world"));

  const { v, r, s } = ecsign(msgHash, privKey);

  const isYOdd = (v - BigInt(27)) % BigInt(2);
  const rPoint = ec.keyFromPublic(
    ec.curve.pointFromX(new BN(r), isYOdd).encode("hex"),
    "hex"
  );
  // Get the group element: -(m * r^−1 * G)
  const rInv = new BN(r).invm(SECP256K1_N);

  // w = -(r^-1 * msg)
  const w = rInv.mul(new BN(msgHash)).neg().umod(SECP256K1_N);
  // U = -(w * G) = -(r^-1 * msg * G)
  const U = ec.curve.g.mul(w);

  // T = r^-1 * R
  const T = rPoint.getPublic().mul(rInv);

  // re-write our signature and curve points
  const signatureData: Record<string, string> = {
    v: v.toString(),
    r: r.toString(),
    s: s.toString(),
    Ux: U.x.toString(),
    Uy: U.y.toString(),
  };

  fs.writeFileSync(path.joi);

  console.log("Calculating point cache...");
  // this will re-write point computes file
  TPreComputes = getPointPreComputes(T);
  console.log("Done with Point cache calculation");
}

main();
