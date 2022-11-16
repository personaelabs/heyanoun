import { Button } from "./button";
import { Textarea } from "./textarea";
import * as React from "react";
import axios from "axios";
import { useSignMessage, useSignTypedData } from "wagmi";
import { ethers } from "ethers";
import { SECP256K1_N } from "../utils/config";
import BN from "bn.js";
import { getPointPreComputes } from "../utils/wasmPrecompute";
import { PointPreComputes } from "../types/zk";
import { prepareMerkleRootProof, splitToRegisters } from "../utils/utils";
import { createMerkleTree } from "../utils/merkleTree";
import { downloadZKey } from "../utils/zkp";
import localforage from "localforage";
import { GroupPayload } from "../types/api";
const elliptic = require("elliptic");
const ec = new elliptic.ec("secp256k1");

interface Props {
  address: string;
  //maybe need id too
  propNumber: number;
  propId: number;
}

interface SignaturePostProcessingContents {
  TPreComputes: PointPreComputes;
  s: bigint[];
  U: bigint[][];
}

interface MerkleTreeProofData {
  groupId: number;
  root: string;
  pathElements: string[];
  pathIndices: string[];
}

// EIP-712 types for typed signature
const domain = {
  name: "heyanoun-prop-150",
  version: "1",
  chainId: 1,
  verifyingContract: "0x0000000000000000000000000000000000000000",
} as const;

const types = {
  NounSignature: [
    { name: "groupId", type: "string" },
    { name: "msgHash", type: "string" },
  ],
} as const;

export const ProofComment = ({ address, propNumber, propId }: Props) => {
  const merkleTreeProofData = React.useRef<MerkleTreeProofData>();
  const [commentMsg, setCommentMsg] = React.useState<string>("");
  const [loadingText, setLoadingText] = React.useState<string | undefined>(
    undefined
  );
  const [successProofGen, setSuccessProofGen] = React.useState<
    boolean | undefined
  >(undefined);

  // TODO: set from request
  const [groupType, setgroupType] = React.useState<number>(1);

  const { data, error, isLoading, signTypedData } = useSignTypedData({
    domain,
    types,
    value: {
      groupId: `${
        merkleTreeProofData.current ? merkleTreeProofData.current.groupId : -1
      }`,
      msgHash: ethers.utils.hashMessage(commentMsg),
    } as const,
    async onSuccess(data, _variables) {
      // Verify signature when sign message succeeds
      const { v, r, s } = ethers.utils.splitSignature(data);
      const isYOdd = (BigInt(v) - BigInt(27)) % BigInt(2);
      const rPoint = ec.keyFromPublic(
        ec.curve.pointFromX(new BN(r.substring(2), 16), isYOdd).encode("hex"),
        "hex"
      );
      // Get the group element: -(m * r^−1 * G)
      const rInv = new BN(r.substring(2), 16).invm(SECP256K1_N);

      // w = -(r^-1 * msg)
      const w = rInv
        .mul(new BN(data.substring(2), 16))
        .neg()
        .umod(SECP256K1_N);
      // U = -(w * G) = -(r^-1 * msg * G)
      const U = ec.curve.g.mul(w);

      // T = r^-1 * R
      const T = rPoint.getPublic().mul(rInv);

      const TPreComputes = await getPointPreComputes(T.encode("hex"));
      const signatureArtifacts: SignaturePostProcessingContents = {
        TPreComputes,
        s: splitToRegisters(s.substring(2)) as bigint[],
        U: [
          splitToRegisters(U.x) as bigint[],
          splitToRegisters(U.y) as bigint[],
        ],
      };
      await generateProof(signatureArtifacts);
    },
  });

  const generateProof = React.useCallback(
    async (artifacts: SignaturePostProcessingContents) => {
      if (!merkleTreeProofData.current) {
        throw new Error("Missing merkle tree data");
      }
      //TODO: add loading state or progress bar first time it downloads zkey
      await downloadZKey();

      const proofInputs = { ...artifacts, ...merkleTreeProofData.current };
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
        console.log("PROOF SUCCESSFULLY GENERATED: ", proof, publicSignals);
        // TODO: post to IPFS or store in our db
        setSuccessProofGen(true);
        // TODO: add toast showing success
        setLoadingText(undefined);
      };
    },
    []
  );

  const prepareProof = React.useCallback(async () => {
    try {
      const merkleTreeData = (
        await axios.get<GroupPayload>("/api/getPropGroup", {
          params: {
            propId: propId,
            groupType: groupType,
          },
        })
      ).data;
      const leafData = merkleTreeData.leaves.find((el) => el.data === address);
      if (!leafData) {
        throw new Error("Could not find user address in selected group");
      }

      merkleTreeProofData.current = {
        groupId: merkleTreeData.groupId,
        root: merkleTreeData.root,
        pathElements: leafData.path,
        pathIndices: leafData.indices,
      };

      // TODO: REMOVE THIS AFTER TESTING, generating dummy merkle tree to test proof generation works
      //       if you want to test non-noun holding addresses
      // const { pathElements, pathIndices, pathRoot } = await createMerkleTree(
      //   "0x926B47C42Ce6BC92242c080CF8fAFEd34a164017",
      //   [
      //     "0x926B47C42Ce6BC92242c080CF8fAFEd34a164017",
      //     "0x199D5ED7F45F4eE35960cF22EAde2076e95B253F",
      //   ]
      // );

      // const merkleTreeData = prepareMerkleRootProof(
      //   pathElements,
      //   pathIndices,
      //   pathRoot
      // );

      // merkleTreeProofData.current = {
      //   root: merkleTreeData.root,
      //   pathElements: merkleTreeData.pathElements,
      //   pathIndices: merkleTreeData.pathIndices,
      //   groupId: 123,
      // };

      // triggers callback which will call generateProof when it's done
      signTypedData();
    } catch (ex: unknown) {
      // TODO: cleaner error handling
      throw ex;
    }
  }, [address, groupType, propId, signTypedData]);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="rounded-md transition-all  w-full shadow-sm bg-white flex flex-col items-center justify-between border border-gray-200">
        <div className="w-full p-5 bg-white">
          <Textarea
            value={commentMsg}
            placeholder="Add your comment"
            onChangeHandler={(newVal) => setCommentMsg(newVal)}
          />
        </div>
        <div className="w-full flex bg-gray-100 p-5 items-center justify-center">
          <div className="grow 1"></div>
          <p>Post as</p>
          <div className="px-1">Nounder</div>
          <div className="px-1">Noun holder</div>
          <div className="px-1">2 or more</div>
        </div>
      </div>
      <div className="py-2"></div>
      <div className="flex flex-row w-full justify-end">
        <Button
          onClickHandler={prepareProof}
          color={"white"}
          backgroundColor={"black"}
        >
          Post Anonymously{" "}
        </Button>
      </div>
    </div>
  );
};
