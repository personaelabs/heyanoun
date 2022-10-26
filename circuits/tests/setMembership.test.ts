import BN from "bn.js";
import { groth16 } from "snarkjs";
import { SECP256K1_N } from "../utils/config";
import { getPointPreComputes } from "../utils/point-cache";
import { prepareMerkleRootProof, splitToRegisters } from "../utils/utils";
import { createMerkleTree } from "../utils/merkleTree";
const {
  hashPersonalMessage,
  ecsign,
  pubToAddress,
} = require("@ethereumjs/util");
const elliptic = require("elliptic");
const ec = new elliptic.ec("secp256k1");

const privKey = BigInt(
  "0xf5b552f608f5b552f608f5b552f6082ff5b552f608f5b552f608f5b552f6082f"
);

//TODO: optimize so we don't have to recalculate on a per test
describe("", () => {
  let poseidon: any;

  test("simple proof generation", async () => {
    const msgHash = hashPersonalMessage(Buffer.from("hello world"));

    const pubKey = ec.keyFromPrivate(privKey.toString(16)).getPublic();

    const merkleLeaves = [
      pubToAddress(pubKey).toString(),
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

    console.log("Calculating point cache...");
    console.time("Point cache calculation");
    const TPreComputes = getPointPreComputes(T);
    console.timeEnd("Point cache calculation");

    const input = {
      TPreComputes,
      U: [splitToRegisters(U.x), splitToRegisters(U.y)],
      s: [splitToRegisters(s.toString("hex"))],
      ...treeArtifacts,
    };

    const { publicSignals, proof } = await groth16.fullProve(
      input,
      "build/ecdsa_verify/build_ecdsa_verify_js/build_ecdsa_verify.wasm",
      ZKEY_PATH
    );
    expect(true).toBe(true);
  });
});
