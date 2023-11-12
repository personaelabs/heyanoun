import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import {
  fetchTransaction,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
  readContract
} from "@wagmi/core";
import { PointPreComputes } from "../types/zk";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";

import {
  leafDataToAddress,
  splitToRegisters,
  EIP712Value,
  POST_CHAR_LIMIT,
  addHexPrefix,
  prepareMerkleRootProof
} from "../utils/utils";
import AnonPill, { NounSet, nounSetToDbType } from "./anonPill";
import { ethers } from "ethers";
import { getSigPublicSignals } from "../utils/wasmPrecompute/wasmPrecompute.web";
import { PublicSignatureData } from "../utils/wasmPrecompute/wasmPrecompute.common";
import { fetchBonsaiProof } from "../utils/bonsai";
import { downloadZKey } from "../utils/zkp";
import localforage from "localforage";
import axios from "axios";
import { Textarea } from "./textarea";
import { TextInput } from "./textinput";
import { toUtf8Bytes } from "ethers/lib/utils";
import Spinner from "../components/spinner";

import { LeafPayload, PropGroupsPayload } from "../types/api";
import { useQuery } from "@tanstack/react-query";
import { anonAbuseAbi } from "../abis/AnonAbuse";
import { createMerkleTree } from "../utils/merkleTree";

import toast from "react-hot-toast";

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
  name: "anon-abuse-report",
  version: "1",
  chainId: 1,
  verifyingContract: "0x0000000000000000000000000000000000000000",
} as const;

const types = {
  Report: [
    { name: "msgHash", type: "string" },
  ],
} as const;

const anonAbuseContract = process.env.ANON_ABUSE_CONTRACT;

const CommentWriter: React.FC<CommentWriterProps> = () => {
  const propId = -1;
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [isTimedSuccess, setTimedSucess] = useState(false);

  useEffect(() => {
    if (isTimedSuccess) {
      const timeout = setTimeout(() => {
        setTimedSucess(false);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [isTimedSuccess]);

  const merkleTreeProofData = React.useRef<MerkleTreeProofData>();
  const [txHash, setTxHash] = React.useState<`0x${string}`>("0x");
  const [commentMsg, setCommentMsg] = React.useState<string>("");
  const [loadingText, setLoadingText] = React.useState<string | undefined>(
    undefined
  );

  const [successProofGen, setSuccessProofGen] = React.useState<
    boolean | undefined
  >(undefined);

  const { data, error, isLoading, signTypedData } = useSignTypedData({
    domain,
    types,
    value: {
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
    onError(error) {
      setLoadingText(undefined);
      toast.error("Error signing message");
    },
  });

  const generateProof = React.useCallback(
    async (
      artifacts: SignaturePostProcessingContents,
      publicSigData: PublicSignatureData
    ) => {
      if (!merkleTreeProofData.current || !merkleTreeProofData.current.root) {
        toast.error("Error occurred generating proof, please try again", {
          position: "bottom-right",
        });
        setLoadingText(undefined);
        console.error("Missing merkle tree data");
        return;
      } else if (commentMsg.length > POST_CHAR_LIMIT) {
        toast.error(
          "Comment is too long, please keep less than 600 characters!",
          {
            position: "bottom-right",
          }
        );
        setLoadingText(undefined);
        return;
      }
      //TODO: add loading state or progress bar first time it downloads zkey
      await downloadZKey();

      const proofInputs = {
        ...artifacts,
        ...merkleTreeProofData.current,
        propId: "",
        groupType: "",
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
        console.log("PUBLIC SIGNALS: ", publicSignals);

        if (!merkleTreeProofData.current) {
          throw new Error("Missing merkle tree data");
        } else {
          axios.post(
            "/api/submit",
            {
              proof,
              publicSignatureData: publicSigData,
              root: merkleTreeProofData.current.root,
              commentMsg,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          toast.success("Proof submitted successfully!", {
            position: "bottom-right",
          });
          setSuccessProofGen(true);
          // TODO add toast showing success and link to proof
          setTimedSucess(true);
          setCommentMsg("");
          setLoadingText(undefined);
        }
      };
    },
    [commentMsg, propId]
  );

  const prepareProof = React.useCallback(async () => {
    if (commentMsg.length <= 2) {
      toast.error("Your comment is too short.", {
        position: "bottom-right",
      });
      return;
    }

    if (loadingText) {
      return;
    }

    try {
      setLoadingText("Fetching the transaction metadata...");
      const txResponse = await fetchTransaction({ hash: txHash });

      const victim = txResponse.from!;
      const attacker = txResponse.to!;

      const preFetchResult = await readContract({
        address: anonAbuseContract,
        abi: anonAbuseAbi,
        functionName: "getLeavesFromAttackerAddress",
        args: [addHexPrefix(attacker)]
      });
 
      setLoadingText("Generating bonsai proof for merkle tree extension...");
      const bonsaiProof = await fetchBonsaiProof(txResponse);
      console.log(bonsaiProof);

      setLoadingText("Adding to victim list...");
      // TODO: send bonsai proof.
      const config = await prepareWriteContract({
        address: anonAbuseContract,
        abi: anonAbuseAbi,
        functionName: "entryPoint",
        args: ["0x00", addHexPrefix(attacker), addHexPrefix(victim)]
      });

      const { hash: entryPointTxHash } = await writeContract(config);

      setLoadingText('Waiting for transaction to complete...')
      const receipt = await waitForTransaction({ hash: entryPointTxHash });
      console.log(receipt);

      const result = await readContract({
        address: anonAbuseContract,
        abi: anonAbuseAbi,
        functionName: "getLeavesFromAttackerAddress",
        args: [addHexPrefix(attacker)]
      });
      setLoadingText("Generating inclusion proof...");

      if (!address) {
        toast.error("Please connect your wallet before trying to post!", {
          position: "bottom-right",
        });
        openConnectModal?.();
        setLoadingText(undefined);
        return;
      }

      const { pathElements, pathIndices, pathRoot } = await createMerkleTree(
        address, result.map((el: string) => (el.substring(2))));
      merkleTreeProofData.current = prepareMerkleRootProof(
        pathElements, pathIndices, pathRoot);

      // triggers callback which will call generateProof when it's done
      signTypedData();
    } catch (ex: unknown) {
      setLoadingText(undefined);
      console.error(ex);
      toast.error("Unexpected error occurred, please try again", {
        position: "bottom-right",
      });
    }
  }, [address, signTypedData]);

  return (
    <div className="mx-auto rounded-md">
      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-clip">
          {/* Sucessful Post Overlay */}
          <AnimatePresence>
            {isTimedSuccess && (
              <motion.div
                exit={{ opacity: 0 }}
                className="bg-gray-100 rounded-lg absolute w-full h-full z-10 flex flex-col justify-center items-center"
              >
                <motion.div
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  exit={{ y: 12, opacity: 0 }}
                  className="text-4xl mb-2"
                >
                  🎉
                </motion.div>
                <motion.div
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="font-semibold text-base text-gray-800 max-w-[15rem] text-center"
                >
                  Your comment has been successfully posted.
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="py-2 px-0">
            <TextInput
              value={txHash}
              placeholder="Transaction Hash"
              onChangeHandler={(newVal) => setTxHash(addHexPrefix(newVal))}
            />
          </div>
          <div className="bg-gray-50 border-t border-gray-100 flex justify-end items-center p-3 space-x-2">
          </div>

          <div className="py-2 px-0">
            <Textarea
              value={commentMsg}
              placeholder="Add your comment..."
              onChangeHandler={(newVal) => setCommentMsg(newVal)}
            />
          </div>

          <div className="bg-gray-50 border-t border-gray-100 flex justify-end items-center p-3 space-x-2">
          </div>
          <div></div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={prepareProof}
            className="bg-black transition-all hover:bg-slate-900 hover:scale-105 active:scale-100 text-white font-semibold rounded-md px-4 py-2 mt-4"
          >
            {loadingText ? (
              <div className="mx-16 py-1">
                <Spinner />
              </div>
            ) : (
              `Post Anonymously`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentWriter;
