import { Button } from "./button";
import { Textarea } from "./textarea";
import * as React from "react";

interface Props {
  address: string;
  //maybe need id too
  propNumber: number;
}

export const ProofComment = ({ address, propNumber }: Props) => {
  const [loadingText, setLoadingText] = React.useState<string | undefined>(
    undefined
  );
  const [successProofGen, setSuccessProofGen] = React.useState<
    boolean | undefined
  >(undefined);

  const generateProof = React.useCallback(() => {
    let updateLoading: NodeJS.Timer | undefined = undefined;
    try {
    } catch (ex: unknown) {}
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="rounded-md transition-all  w-full shadow-sm bg-white flex flex-col items-center justify-between border border-gray-200">
        <div className="w-full p-5 bg-white">
          <Textarea
            placeholder="Add your comment"
            onChangeHandler={() => console.log("todo")}
            value={""}
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
          onClickHandler={() => console.log("todo")}
          color={"white"}
          backgroundColor={"black"}
        >
          Post Anonymously{" "}
        </Button>
      </div>
    </div>
  );
};
