import { Element } from "fixed-merkle-tree";
import { REGISTERS } from "./config";

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
  pathElements: Element[],
  pathIndices: number[],
  pathRoot: Element
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
