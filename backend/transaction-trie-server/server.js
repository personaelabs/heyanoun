const express = require('express');
const ethers = require("ethers");
const { promisify } = require('util');
const { toBuffer, bufferToHex } = require('ethereumjs-util');
const { Trie } = require('@ethereumjs/trie');
const { RLP } = require('@ethereumjs/rlp');
const { Common } = require('@ethereumjs/common')
const { tx, FeeMarketEIP1559Transaction, LegacyTransaction } = require('@ethereumjs/tx');

// import {FeeMarketEIP1559Transaction} from '@ethereumjs/tx';

// const { bytesToUtf8, utf8ToBytes } from '@ethereumjs/util'

// forgive me for i have cobbled together javascript

const app = express();
let provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/0ff5be6b14cc428f840236cacc7bec71');

app.get('/transactionProof/:txHash', async (req, res) => {
    try {
        const txHash = req.params.txHash;
        const receipt = await provider.getTransactionReceipt(txHash);
        const fullBlock = await provider.send(
          'eth_getBlockByNumber',
          [ethers.utils.hexValue(receipt.blockNumber), true]
      )
      console.log("TXROOT")
      console.log(fullBlock.transactionsRoot)
      console.log("")
      //console.log(ethers.utils.arrayify(fullBlock.transactionsRoot));

        const block = await provider.getBlock(receipt.blockNumber);

        const proof = await getMerkleProof(txHash, block);

        res.json({ proof });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the proof.');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function getMerkleProof(txHash, block) {
  // Create a new trie
  const trie = new Trie();

  console.log("EMPTY TRIE ROOT")
  console.log(ethers.utils.hexlify(trie.root()));
  console.log("")

  const transactionIndex = block.transactions.findIndex((tx) => bufferToHex(tx) === txHash);
  if (transactionIndex === -1) {
    throw new Error('Transaction not found in the block');
  }

  // For each transaction in the block, add it to the trie
  for (let i = 0; i < block.transactions.length; i++) {
    // RLP encode the transaction index (key) and serialize the transaction (value)
    const key = RLP.encode(i);

    console.log("KEY")
    console.log(key)
    console.log("")

    const transction_body = await provider.getTransaction(block.transactions[i]);
    const value = getRawTransaction(transction_body);

    console.log("VALUE")
    console.log(ethers.utils.hexlify(value))
    console.log("")

    // Put the key-value pair into the trie
    await trie.put(key, value);

    console.log("NEW TRIE ROOT")
    console.log(ethers.utils.hexlify(trie.root()));
    console.log("")
  }

  const indexToProve = RLP.encode(transactionIndex);

  // Use the trie to create a proof
  const proof = await trie.createProof(indexToProve);

  await verifyMerklePatriciaProof(trie.root, indexToProve, proof.value, proof.proof);

  // Convert the proof to an array of hex strings
  const hexProof = proof.map((p) => bufferToHex(p));

  return hexProof;
}

const getRawTransaction = (txn) => {
  const addKey = (accum, key) => {
    if (key in txn) {
      accum[key] = txn[key];
    }
    return accum;
  };

  // const common = new Common({ chain:, hardfork:  })

  let transaction;

  if (txn.maxPriorityFeePerGas == null) {
    const txData = {
      data: txn.data,
      gasLimit: txn.gasLimit.toHexString(),
      gasPrice: txn.gasPrice.toHexString(),
      nonce: txn.nonce,
      to: txn.to,
      value: txn.value.toHexString(),
      v: txn.v,
      r: txn.r,
      s: txn.s,
      chainId: txn.chainId,
      accessList: [],
      type: txn.type,
    }

    transaction = LegacyTransaction.fromTxData(txData);

  } else {
    const txData = {
      data: txn.data,
      gasLimit: txn.gasLimit.toHexString(),
      maxPriorityFeePerGas: txn.maxPriorityFeePerGas.toHexString(),
      maxFeePerGas: txn.maxFeePerGas.toHexString(),
      nonce: txn.nonce,
      to: txn.to,
      value: txn.value.toHexString(),
      v: txn.v,
      r: txn.r,
      s: txn.s,
      chainId: txn.chainId,
      accessList: [],
      type: txn.type,
    }

    transaction = FeeMarketEIP1559Transaction.fromTxData(txData);

  }



  console.log(ethers.utils.keccak256(transaction.serialize()));

  if (txn.hash != ethers.utils.keccak256(transaction.serialize())) {
    console.log("HASHES DONT MATCH")
    console.log(txn.hash)
    console.log(ethers.utils.keccak256(txData))
  }

  return transaction.serialize();
};

async function verifyMerklePatriciaProof(rootHash, key, value, proofNodes) {
  // Convert inputs to Buffers
  rootHash = toBuffer(rootHash);
  key = toBuffer(key);
  value = toBuffer(value);
  proofNodes = proofNodes.map((node) => toBuffer(node));

  try {
    // Verify the proof using the merkle-patricia-tree library's static method
    const verifiedValue = await Trie.verifyProof(rootHash, key, proofNodes);

    // Compare the verified value with the expected value
    // Note: verifiedValue will be 'null' if the key does not exist in the trie
    if (verifiedValue && verifiedValue.equals(value)) {
      // The proof is verified and the value matches
      return true;
    } else if (!verifiedValue && value.equals(Buffer.from(''))) {
      // The proof is verified and it proves the key does not exist in the trie
      return true;
    }
    // The key was found, but the value does not match
    return false;
  } catch (error) {
    // There was an error during proof verification which means the proof is invalid
    return false;
  }
}
