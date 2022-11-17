pragma circom 2.0.6;


include "./packages/efficient-zk-sig/circuits/ecdsa_verify_pubkey_to_addr.circom";
include "./merkle.circom";

template SetMembership(n, k, d) {
  assert(k >= 2);
  assert(k <= 100);

  signal input root;
  signal input propId;
  signal input groupType;
  signal input pathElements[d];
  signal input pathIndices[d];

  signal input s[k];
  signal input TPreComputes[32][256][2][4]; // T = r^-1 * R
  signal input U[2][k]; // -(m * r^-1 * G)

  var stride = 8;
  var num_strides = div_ceil(n * k, stride);


  //Step 1: Verify ECDSA signature and get address associated with it
  component ecdsa = ECDSAVerifyPubKeyToAddr(n, k);

  for (var i = 0; i < num_strides; i++) {
      for (var j = 0; j < 2 ** stride; j++) {
          for (var l = 0; l < k; l++) {
              ecdsa.TPreComputes[i][j][0][l] <== TPreComputes[i][j][0][l];
              ecdsa.TPreComputes[i][j][1][l] <== TPreComputes[i][j][1][l];
          }
      }
  }

  for (var i = 0; i < k; i++) {
      ecdsa.s[i] <== s[i];
  }

  for (var i = 0; i < k; i++) { 
      ecdsa.U[0][i] <== U[0][i];
      ecdsa.U[1][i] <== U[1][i];
  }

  signal address;
  address <== ecdsa.addr;

  // Step 2: verify address is in group with merkle tree proof
  //check set membership of address in merkle root
  component verifyMerkleProof = MerkleTreeChecker(d);
  verifyMerkleProof.leaf <== address;
  verifyMerkleProof.root <== root;
  for (var i = 0; i < d; i++) {
      verifyMerkleProof.pathElements[i] <== pathElements[i];
      verifyMerkleProof.pathIndices[i] <== pathIndices[i];
  }

}

component main { public [root, propId, groupType, TPreComputes, U] } = SetMembership(64, 4, 30);
