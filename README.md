# heyanoun - credible pseudonymous messages for noun governance prop discussion

[Nouns Prop 150](https://nouns.wtf/vote/150)


https://user-images.githubusercontent.com/7995105/205459542-56030f3f-0e67-4d83-9630-9cd599b3b3cd.mov


### Intro

[Nouns](https://nouns.wtf/) is currently **one of the most active and interesting online communities with a powerful brand and significant resources** (at the time of writing this, a treasury of 28,942 ETH or ~ $30,000,000) that Nouns NFT holders can vote on how to allocate via [NounsDAO](https://nouns.wtf/vote). Nouners can choose to submit new proposals (justifying why a particular endeavor or project should be allocated capital to support Nouns) that Nouners can then democratically vote on. If a proposal passes a threshold of voters in support of it, it gets executed. For example, [Prop 173](https://nouns.wtf/vote/173) proposal was executed to host a Nouns sailing marketing campaign and afterparty at NFT NYC, a crypto conference that happens once a year or [Prop 150](https://nouns.wtf/vote/150) which funded building this project!

### The Problem

Sometimes all opinions on a prop aren't expressed, it's not always easy to say what's on your mind as a nouner publicly. This can mean that not everyone voices their honest opinions about different props, which deteriorates the quality of discussion around how to effectively and efficiently allocate capital in the Nouns community. **We think that the Nouns community is one of the places on the Internet where some of the most interesting discussions are happening that can be often lost/withheld from public discourse (both within the community and outside of it) because of this**. We built heyanoun to help change that.

### Thesis

We built heyanoun to allow more nouners to express what they believe while maintaining anonymity. Heyanoun allows Nouners to post credible (more on this below) pseudonymous messages at [heyanoun.xyz](https://www.heyanoun.xyz/) which can be viewed on the website or on Twitter via our [bot](https://twitter.com/heyanoun), posted in [@coinfessions](https://twitter.com/coinfessions) style. Currently, heyanoun is scoped to props, which means for a given prop, you can post as

1. a snapshotted holder of >= 1 noun
2. a snapshotted holder of >= 2 nouns
3. a nounder

Snapshotted here refers to whether you satisfy the predicate above at the time of the proposal (i.e. if you buy a Noun NFT after prop x, you will not be able to comment on props before x).




### What do we mean by credible pseudonymous messages?

**Every message posted is paired with a [zkSNARK](https://en.wikipedia.org/wiki/Non-interactive_zero-knowledge_proof) proof that, using cryptography, asserts a given message correctly satisfies the predicate we define above without revealing the identity of the poster of the message.** In other words, every anonymous message posted is paired with a proof that asserts that the original poster of this message has an Ethereum address that is indeed a snapshotted holder of {>= 1, >= 2 nouns or is a nounder} depending on the claim and that the message posted is what we claim it to be. These proofs are public and anyone can verify for themself. This is valuable because

1. it allows **any individual to trustlessly verify that a message is valid** (i.e. posted by a Nouner and was not tampered with)
2. it allows Nouners to be able to honestly voice their opinions about props because their **anonymity is guaranteed and they do not have to trust anyone** (for example the operators of this service) to not dox them

### How does this work?

To generate our zkSNARK proofs, we have a [cron job](https://github.com/personaelabs/nouns150/blob/main/backend/merkle-cron/src/cron.ts) that regularly fetches new props as they are released and creates 3 merkle trees by looking at the snapshotted history on-chain, in other words every prop is paired with 3 merkle trees whose leaves contain the addresses of >= 1 noun, >= 2 nouns, is a nounder respectively.

When users want to post a message about a particular prop, they

1. connect their wallet

![Screen Shot 2022-12-03 at 2 15 1](https://user-images.githubusercontent.com/7995105/205459920-3c8a8275-b31f-4eef-aa3a-1d89d38f7b00.png)

2. navigate to the particular prop on [heyanoun](https://www.heyanoun.xyz/) and click on it

![Screen Shot 2022-12-03 at 3 07 1](https://user-images.githubusercontent.com/7995105/205459929-3235ec1c-10e2-426b-9fc2-79267d5a4412.png)

3. scroll to the bottom of the modal, if their address satisfies any of the predicates, they will be displayed a textbox with buttons corresponding to different group types they can post their message as. Note if an address is not an owner of any Noun NFT, the textbox will not be displayed, but they will still be able to view all posted comments.

https://user-images.githubusercontent.com/7995105/205459727-301b9ce9-6a86-4e7b-a98c-41e4be527390.mp4

### zkSNARK Circuit Construction

The high-level idea of the circuit construction amounts to

```
1. given an ECDSA signature, derive the public key that signed it
2. check that the address corresponding to this public key is in a merkle tree (the exact merkle tree depends on the prop group type this message is for)
```

This functions the same (i.e. does the same high-level check) as the [circuits used in heyanon](https://github.com/personaelabs/circuits/blob/master/circuits/dizkus.circom), however in order to improve the user experience (reduce the amount of time it takes to generate a proof), heyanoun is the first production usage of new [research](https://github.com/personaelabs/efficient-zk-ecdsa) out of [Personae Labs](https://personaelabs.org/) that dramatically improves the cost ECDSA signatures. The linked repo contains more benchmarks and details about the inner workings of this new scheme for verifying ECDSA signatures, but as far as our circuit goes, some benchmarks below:

```
# of Wires: 387520
# of Constraints: 322495
# of Private Inputs: 64
# of Public Inputs: 65547
size of Zkey: ~ 210 MB
time to generate a proof in browser on an M1 Macbook Pro: ~30 seconds
```

Note that because of the design of this scheme, [verifying](https://github.com/personaelabs/nouns150/blob/main/frontend/pages/api/submit.ts#L57-L82) a proof is valid amounts to more than just checking the 3 pairing points of a regular Groth16 proof, we also have to do some out of SNARK checks (more details [here](https://ethresear.ch/t/efficient-ecdsa-signature-verification-using-circom/13629)). All of the data, both the Groth16 proof, and the artifacts needed to do these out of SNARK checks are posted to IPFS so anyone can verify for themself a proof is rigorous and valid.

All of our circuits can be found under the `circuits` directory.

To install circuit dependencies:

1. `git submodule init && git submodule update` in the root directory
2. `curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau`
	- The download link to the ptau file can also be found in https://github.com/iden3/snarkjs
3. `mv powersOfTau28_hez_final_20.ptau circuits/powersOfTau28_hez_final_20.ptau`
4. `cd circuits/circuits/packages/efficient-zk-sig && npm install && cd ../../../`
5. `npm install`

To build the circuit run `npm run build` in the `circuits` directory.

To test the circuit run `npm run test` in the `circuits` directory.

Notes regarding the phase 2 trusted setup for our production circuits can be found [here](https://github.com/personaelabs/nouns150/blob/main/circuits/setup.MD).