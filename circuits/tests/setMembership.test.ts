import BN from "bn.js";
import { groth16 } from "snarkjs";
import * as fs from "fs";
import * as path from "path";
import { SECP256K1_N } from "../utils/config";
import { getPointPreComputes } from "../utils/point-cache";
import {
  JSONStringifyCustom,
  prepareMerkleRootProof,
  splitToRegisters,
} from "../utils/utils";
import { createMerkleTree } from "../utils/merkleTree";
import { ethers } from "ethers";
const { hashPersonalMessage, ecsign } = require("@ethereumjs/util");
const elliptic = require("elliptic");
const ec = new elliptic.ec("secp256k1");

const POINT_CACHE_FILE = "savedPointCache.json";
const SIGNATURE_CACHE_FILE = "savedSignature.json";

const privKey = BigInt(
  "0xf5b552f608f5b552f608f5b552f6082ff5b552f608f5b552f608f5b552f6082f"
);

const ZKEY_PATH = "build/setMembership/setMembership_final.zkey";
const WASM_PATH = "build/setMembership/setMembership_js/setMembership.wasm";

describe("test membership", () => {
  beforeAll(() => {
    const isCircuitBuilt = fs.existsSync(
      path.join(__dirname, `../build/setMembership`)
    );

    if (!isCircuitBuilt) {
      throw new Error(
        "Uh oh, it looks like you haven't built your circuit yet, please run: npm run build"
      );
    }
  });
  //general setup before tests
  const msgHash = hashPersonalMessage(Buffer.from("hello world"));

  const pubKey = ec.keyFromPrivate(privKey.toString(16)).getPublic();

  let s: any;
  let Ux: any;
  let Uy: any;
  let TPreComputes: any[][][];
  const existsCachedSignature = fs.existsSync(
    path.join(__dirname, `./data/${SIGNATURE_CACHE_FILE}`)
  );

  const existsCachedPoints = fs.existsSync(
    path.join(__dirname, `./data/${POINT_CACHE_FILE}`)
  );
  // re-use the same signature so we don't have to keep re-computing the point cache
  // which takes a long time
  if (existsCachedSignature && existsCachedPoints) {
    const signatureData = JSON.parse(
      fs
        .readFileSync(path.join(__dirname, `./data/${SIGNATURE_CACHE_FILE}`))
        .toString()
    );

    s = signatureData.s;
    Ux = signatureData.Ux;
    Uy = signatureData.Uy;

    TPreComputes = JSON.parse(
      fs
        .readFileSync(path.join(__dirname, `./data/${POINT_CACHE_FILE}`))
        .toString()
    );
  } else {
    const { v, r, s: sNew } = ecsign(msgHash, privKey);

    s = sNew;

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
    const signatureData: Record<string, string | string[] | bigint[]> = {
      v: v.toString(),
      r: splitToRegisters(r.toString("hex")),
      s: splitToRegisters(s.toString("hex")),
      Ux: splitToRegisters(U.x),
      Uy: splitToRegisters(U.y),
    };

    Ux = signatureData.Ux;
    Uy = signatureData.Uy;

    fs.writeFileSync(
      path.join(__dirname, `./data/${SIGNATURE_CACHE_FILE}`),
      JSON.stringify(signatureData)
    );

    console.log("Calculating point cache...");
    TPreComputes = getPointPreComputes(T);

    // this will re-write point computes file
    fs.writeFileSync(
      path.join(__dirname, `./data/${POINT_CACHE_FILE}`),
      JSONStringifyCustom(TPreComputes)
    );
    console.log("Done with Point cache calculation");
  }
  test("simple proof generation", async () => {
    const merkleLeaves = [
      //recall public keys are 04 || uncompressed public key
      ethers.utils.computeAddress("0x" + pubKey.encode("hex")),
      "0x199D5ED7F45F4eE35960cF22EAde2076e95B253F",
    ];

    // Construct merkle tree
    const { pathElements, pathIndices, pathRoot } = await createMerkleTree(
      merkleLeaves[0],
      merkleLeaves
    );

    const treeArtifacts = prepareMerkleRootProof(
      pathElements,
      pathIndices,
      pathRoot
    );

    const input = {
      TPreComputes,
      U: [Ux, Uy],
      s: s,
      ...treeArtifacts,
    };

    console.log("Proving...");
    await groth16.fullProve(input, WASM_PATH, ZKEY_PATH);
    console.log("Successfully generated proof");

    // if we get to here the circuit successfully passed the test
    expect(true).toBe(true);
  });

  test("invalid merkle tree", async () => {
    //merkle tree doesn't contain the address from our public key
    const merkleLeaves = [
      //recall public keys are 04 || uncompressed public key
      "0x388C818CA8B9251b393131C08a736A67ccB19297",
      "0x199D5ED7F45F4eE35960cF22EAde2076e95B253F",
    ];

    // Construct merkle tree
    const { pathElements, pathIndices, pathRoot } = await createMerkleTree(
      merkleLeaves[0],
      merkleLeaves
    );

    const treeArtifacts = prepareMerkleRootProof(
      pathElements,
      pathIndices,
      pathRoot
    );

    const input = {
      TPreComputes,
      U: [Ux, Uy],
      s: s,
      ...treeArtifacts,
    };
    await expect(
      groth16.fullProve(input, WASM_PATH, ZKEY_PATH)
    ).rejects.toThrow();
  });
});
