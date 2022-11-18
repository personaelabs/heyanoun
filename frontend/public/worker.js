importScripts("./snarkjs.min.js");
self.addEventListener("message", async (evt) => {
  console.log("web worker recieved message");
  const [input, zkeyFastFile] = evt.data;
  const result = await snarkjs.groth16.fullProve(
    input,
    "/setMembership.wasm",
    zkeyFastFile
  );
  postMessage(result);
});
