const BN = require("bn.js");

const STRIDE = BigInt(8);
const NUM_STRIDES = BigInt(256) / STRIDE; // = 32
const REGISTERS = BigInt(4);

const SECP256K1_N = new BN(
  "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
  16
);

export { STRIDE, NUM_STRIDES, REGISTERS, SECP256K1_N };
