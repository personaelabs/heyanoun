importScripts("./snarkjs.min.js");
self.addEventListener("message", async (evt) => {
  console.log("web worker recieved message");
  const input = evt.data[0];
  console.log("recieved: ", input);
  const result = await snarkjs.groth16.fullProve(
    input,
    "/setMembership.wasm",
    "setMembership_final.zkey"
  );
  postMessage(result);
});
