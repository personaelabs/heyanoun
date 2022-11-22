import * as React from "react";
import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { PointPreComputes } from "../types/zk";
import {
  splitToRegisters,
  EIP712Value,
  prepareMerkleRootProof,
} from "../utils/utils";
import AnonPill, { NounSet } from "./anonPill";
import { ethers } from "ethers";
import { SECP256K1_N } from "../utils/config";
import BN from "bn.js";
import { getSigPublicSignals } from "../utils/wasmPrecompute/wasmPrecompute.web";
import { PublicSignatureData } from "../utils/wasmPrecompute/wasmPrecompute.common";
import { downloadZKey } from "../utils/zkp";
import localforage from "localforage";
import axios from "axios";
import { Textarea } from "./textarea";
import { toUtf8Bytes } from "ethers/lib/utils";
import { createMerkleTree } from "../utils/merkleTree";
import vkey from "../utils/verification_key.json";

const elliptic = require("elliptic");
const ec = new elliptic.ec("secp256k1");

interface CommentWriterProps {
  propId: number;
}

interface SignaturePostProcessingContents {
  TPreComputes: PointPreComputes;
  s: bigint[];
  U: bigint[][];
}

interface MerkleTreeProofData {
  root: string;
  pathElements: string[];
  pathIndices: string[];
}

const domain = {
  name: "heyanoun-prop-150",
  version: "1",
  chainId: 1,
  verifyingContract: "0x0000000000000000000000000000000000000000",
} as const;

const types = {
  NounSignature: [
    { name: "propId", type: "string" },
    { name: "groupType", type: "string" },
    { name: "msgHash", type: "string" },
  ],
} as const;

const CommentWriter: React.FC<CommentWriterProps> = ({ propId }) => {
  const { address, connector, isConnected } = useAccount();

  const merkleTreeProofData = React.useRef<MerkleTreeProofData>();
  const [commentMsg, setCommentMsg] = React.useState<string>("");
  const [loadingText, setLoadingText] = React.useState<string | undefined>(
    undefined
  );
  const [successProofGen, setSuccessProofGen] = React.useState<
    boolean | undefined
  >(undefined);

  const [activeNounSet, setActiveNounSet] = useState<NounSet>(
    NounSet.SingleNoun
  );

  const { data, error, isLoading, signTypedData } = useSignTypedData({
    domain,
    types,
    value: {
      propId: `${propId}`,
      groupType: `${activeNounSet}`,
      msgHash: ethers.utils.keccak256(toUtf8Bytes(commentMsg)),
    } as const,
    async onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      const { v, r, s } = ethers.utils.splitSignature(data);
      const isRYOdd = Number((BigInt(v) - BigInt(27)) % BigInt(2));

      const publicSigData = {
        r,
        isRYOdd,
        eip712Value: variables.value as EIP712Value,
      };
      const { TPreComputes, U } = await getSigPublicSignals(publicSigData);

      const signatureArtifacts: SignaturePostProcessingContents = {
        // @ts-ignore
        TPreComputes,
        U,
        s: splitToRegisters(s.substring(2)) as bigint[],
      };
      await generateProof(signatureArtifacts, publicSigData);
    },
  });

  async function submitProof(
    proof: any,
    publicSignatureData: PublicSignatureData,
    root: string
  ) {
    axios.post(
      "/api/submit",
      { proof, publicSignatureData, root },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const generateProof = React.useCallback(
    async (
      artifacts: SignaturePostProcessingContents,
      publicSigData: PublicSignatureData
    ) => {
      if (!merkleTreeProofData.current || !merkleTreeProofData.current.root) {
        throw new Error("Missing merkle tree data");
      }
      //TODO: add loading state or progress bar first time it downloads zkey
      await downloadZKey();

      const proofInputs = {
        ...artifacts,
        ...merkleTreeProofData.current,
        propId: propId.toString(),
        groupType: activeNounSet.toString(),
      };

      const zkeyDb = await localforage.getItem("setMembership_final.zkey");

      if (!zkeyDb) {
        throw new Error("zkey was not found in the database");
      }

      // @ts-ignore
      const zkeyRawData = new Uint8Array(zkeyDb);

      const zkeyFastFile = { type: "mem", data: zkeyRawData };
      const worker = new Worker("./worker.js");
      worker.postMessage([proofInputs, zkeyFastFile]);
      worker.onmessage = async function (e) {
        const { proof, publicSignals } = e.data;
        console.log("PROOF SUCCESSFULLY GENERATED: ", proof);
        console.log("Proof public signals: ", JSON.stringify(publicSignals));
        if (!merkleTreeProofData.current) {
          throw new Error("Missing merkle tree data");
        } else {
          await submitProof(
            proof,
            publicSigData,
            merkleTreeProofData.current.root
          );
          // TODO: post to IPFS or store in our db
          setSuccessProofGen(true);
          // TODO: add toast showing success
          setLoadingText(undefined);
        }
      };
    },
    []
  );

  const prepareProof = React.useCallback(async () => {
    try {
      // const merkleTreeData = (
      //   await axios.get<GroupPayload>("/api/getPropGroup", {
      //     params: {
      //       propId: propId,
      //       groupType: activeNounSet,
      //     },
      //   })
      // ).data;
      // const leafData = merkleTreeData.leaves.find((el) => el.data === address);
      // if (!leafData) {
      //   throw new Error("Could not find user address in selected group");
      // }

      // merkleTreeProofData.current = {
      //   root: merkleTreeData.root,
      //   pathElements: leafData.path,
      //   pathIndices: leafData.indices,
      // };

      // TODO: REMOVE THIS AFTER TESTING, generating dummy merkle tree to test proof generation works
      //       if you want to test non-noun holding addresses
      const { pathElements, pathIndices, pathRoot } = await createMerkleTree(
        "0x926B47C42Ce6BC92242c080CF8fAFEd34a164017",
        [
          "0x926B47C42Ce6BC92242c080CF8fAFEd34a164017",
          "0x199D5ED7F45F4eE35960cF22EAde2076e95B253F",
        ]
      );

      const merkleTreeData = prepareMerkleRootProof(
        pathElements,
        pathIndices,
        pathRoot
      );

      merkleTreeProofData.current = {
        root: merkleTreeData.root,
        pathElements: merkleTreeData.pathElements,
        pathIndices: merkleTreeData.pathIndices,
      };

      // triggers callback which will call generateProof when it's done
      signTypedData();
    } catch (ex: unknown) {
      // TODO: cleaner error handling
      throw ex;
    }
  }, [signTypedData]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip">
        <div className="py-2 px-0">
          <Textarea
            value={commentMsg}
            placeholder="Add your comment..."
            onChangeHandler={(newVal) => setCommentMsg(newVal)}
          />
        </div>
        <div className="bg-gray-50 border-t border-gray-100 flex justify-end items-center p-3 space-x-2">
          <span className="text-base text-gray-800 font-semibold mr-2">
            Post As
          </span>
          <div
            onClick={() => {
              setActiveNounSet(NounSet.Nounder);
            }}
          >
            <AnonPill
              nounSet={NounSet.Nounder}
              isActive={activeNounSet === NounSet.Nounder}
            />
          </div>
          <div
            onClick={() => {
              setActiveNounSet(NounSet.SingleNoun);
            }}
          >
            <AnonPill
              nounSet={NounSet.SingleNoun}
              isActive={activeNounSet === NounSet.SingleNoun}
            />
          </div>
          <div
            onClick={() => {
              setActiveNounSet(NounSet.ManyNouns);
            }}
          >
            <AnonPill
              nounSet={NounSet.ManyNouns}
              isActive={activeNounSet === NounSet.ManyNouns}
            />
          </div>
        </div>
        <div></div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={prepareProof}
          className="bg-black transition-all hover:bg-slate-900 hover:scale-105 active:scale-100 text-white font-semibold rounded-md px-4 py-2 mt-4"
        >
          Post Anonymously
        </button>
      </div>
    </div>
  );
};

export default CommentWriter;
