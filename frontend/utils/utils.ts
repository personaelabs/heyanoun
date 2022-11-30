import { _TypedDataEncoder } from "ethers/lib/utils";
import { GroupPayload, LeafPayload } from "../types/api";
import { REGISTERS } from "./config";
import { buildGroupPayload, createMerkleTree } from "./merkleTree";

import { Leaf } from "@prisma/client";

const addHexPrefix = (str: string) => `0x${str}`;

export const splitToRegisters = (value: any) => {
  const registers = [];

  if (!value) {
    return [0n, 0n, 0n, 0n];
  }

  const hex = value.toString(16).padStart(64, "0");
  for (let k = 0; k < REGISTERS; k++) {
    // 64bit = 16 chars in hex
    const val = hex.slice(k * 16, (k + 1) * 16);

    registers.unshift(BigInt(addHexPrefix(val)));
  }

  return registers.map((el) => el.toString());
};

export const registersToHex = (registers: any) => {
  return registers
    .map((el: any) => BigInt(el).toString(16).padStart(16, "0"))
    .join("");
};

export const prepareMerkleRootProof = (
  pathElements: any[],
  pathIndices: number[],
  pathRoot: any
) => {
  //@ts-ignore
  const strPathElements = pathElements.map((el: Element) => el.toString());
  //@ts-ignore
  const strPathIndices = pathIndices.map((el: Element) => el.toString());
  const strRoot = pathRoot.toString();
  return {
    pathElements: strPathElements,
    pathIndices: strPathIndices,
    root: strRoot,
  };
};

export function JSONStringifyCustom(val: any) {
  return JSON.stringify(
    val,
    (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
  );
}

// EIP-712 types for typed signature
// Not ideal that we have to define it twice but types of libraries are annoying
const DOMAIN = {
  name: "heyanoun-prop-150",
  version: "1",
  chainId: 1,
  verifyingContract: "0x0000000000000000000000000000000000000000",
};

const TYPES = {
  NounSignature: [
    { name: "propId", type: "string" },
    { name: "groupType", type: "string" },
    { name: "msgHash", type: "string" },
  ],
};

export type EIP712Value = {
  propId: string;
  groupType: string;
  msgHash: string;
};

export function eip712MsgHash(value: EIP712Value) {
  //@ts-ignore
  return _TypedDataEncoder.hash(DOMAIN, TYPES, value);
}

export function leafDataToAddress(data: string): string {
  return "0x" + BigInt(data).toString(16).padStart(40, "0");
}

// NOTE: `getOwners` from nounders DAO 0x2573C60a6D127755aA2DC85e342F7da2378a0Cc5
export const nounderAddresses = [
  "0x6223bc5fd16a19bcfae2281dde47861cfe1023ee",
  "0xe8ce6c8e37c61b6b77419eebd661112c21a3aff8",
  "0xfc9e8db5e255439f430e058462360dd52b87cb4f",
  "0x83fcfe8ba2fece9578f0bbafed4ebf5e915045b9",
  "0x87757c7fd54d892176e9ecec6767bc16e04a06a8",
  "0x88f9e324801320a3fc22c8d045a98ad32a490d8e",
  "0xb1c41c71d36cedea7ddcd5f8d5c5c32ba8f3cbfc",
  "0xe26d78c6bff297bbc2da3f80fea9a42028a4260f",
];

export async function buildNoundersGroupPayload(): Promise<GroupPayload> {
  return await buildGroupPayload(nounderAddresses, "nounders");
}
