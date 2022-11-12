import { Button } from "./button";
import { Textarea } from "./textarea";
import * as React from "react";
import axios from "axios";
import { useSignMessage } from "wagmi";
import { ethers } from "ethers";
import { SECP256K1_N } from "../utils/config";
import BN from "bn.js";
import { getPointPreComputes } from "../utils/wasmPrecompute";
import { PointPreComputes } from "../types/zk";
import { splitToRegisters } from "../utils/utils";
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
  s: string;
  Ux: string[] | bigint[];
  Uy: string[] | bigint[];
}

export const ProofComment = ({ address, propNumber, propId }: Props) => {
  const signaturePostProcessData =
    React.useRef<SignaturePostProcessingContents>();

  const { data, error, isLoading, signMessage } = useSignMessage({
    async onSuccess(data, variables) {
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
        .mul(
          new BN(ethers.utils.hashMessage(variables.message).substring(2), 16)
        )
        .neg()
        .umod(SECP256K1_N);
      // U = -(w * G) = -(r^-1 * msg * G)
      const U = ec.curve.g.mul(w);

      // T = r^-1 * R
      const T = rPoint.getPublic().mul(rInv);

      const TPreComputes = await getPointPreComputes(T.encode("hex"));
      signaturePostProcessData.current = {
        TPreComputes,
        s,
        Ux: splitToRegisters(U.x),
        Uy: splitToRegisters(U.y),
      };
    },
  });

  const [commentMsg, setCommentMsg] = React.useState<string>("");
  const [loadingText, setLoadingText] = React.useState<string | undefined>(
    undefined
  );
  const [successProofGen, setSuccessProofGen] = React.useState<
    boolean | undefined
  >(undefined);

  const [groupId, setGroupId] = React.useState<number>(1);

  const generateProof = React.useCallback(async () => {
    let updateLoading: NodeJS.Timer | undefined = undefined;
    try {
      // const merkleTreeData = await axios.get("/api/getPropGroup", {
      //   params: {
      //     userAddr: address,
      //     propId: propId,
      //     groupId: groupId,
      //   },
      // });

      // console.log("success merkle data: ", merkleTreeData);

      const groupMessage =
        groupId === 1
          ? "I own one Noun"
          : groupId === 2
          ? "I own two or more Nouns"
          : "I am a Nounder";
      const data = signMessage({
        message: `As of Prop ${propId}, I attest that ${groupMessage} and the hash (keccak) of the message I'm posting is ${ethers.utils.hashMessage(
          commentMsg
        )}`,
      });
    } catch (ex: unknown) {
      throw ex;
    }
  }, [commentMsg, groupId, propId, signMessage]);

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
          onClickHandler={generateProof}
          color={"white"}
          backgroundColor={"black"}
        >
          Post Anonymously{" "}
        </Button>
      </div>
    </div>
  );
};
