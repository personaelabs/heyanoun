import { useState } from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

import Modal from "./Modal/modal";
import { DisplayProp } from "../pages/index";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import ProposalStatusPill from "./proposalStatusPill";
import TimeLeftPill from "./timeLeftPill";
import CommentCount from "./commentCount";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-us");

interface IProposalRowProps {
  currentBlockNumber: number | undefined;
  prop: DisplayProp;
}

const calcTimeUntilFutureBlock = (
  mostRecentBlockHeight: number,
  futureBlockHeight: number
) => {
  const avg = 12.07;
  const timeRemainingInSeconds =
    (futureBlockHeight - mostRecentBlockHeight) * avg;
  const timeInFuture = Date.now() + timeRemainingInSeconds * 1000;
  return timeInFuture;
};

const ProposalRow: React.FC<IProposalRowProps> = ({
  prop,
  currentBlockNumber,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();

  const openModal = () => {
    if (!address) {
      toast.error("Please connect your wallet before trying to post!", {
        position: "bottom-right",
      });
    }
    setIsOpen(true);
  };

  let timeRemainingEN;
  let isPast;
  let isDefeated = false;
  if (currentBlockNumber) {
    // The graphQL query returns a DEFEATED props as ACTIVE, so have to do
    // this check here to derive the defaeted state.
    if (currentBlockNumber > prop.endBlock && prop.status === "ACTIVE") {
      isDefeated = true;
    }

    const timeRemaining = calcTimeUntilFutureBlock(
      currentBlockNumber,
      prop.endBlock
    );
    timeRemainingEN = timeAgo.format(timeRemaining);
    isPast = new Date(timeRemaining).getTime() < Date.now();
  }
  return (
    <>
      <Modal
        description={prop.description}
        propId={prop.id}
        isOpen={isOpen}
        handleClose={(e) => {
          setIsOpen(false);
        }}
      />
      <div
        onClick={openModal}
        className="rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 flex flex-col gap-4 justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer"
      >

        <div className="text-lg md:text-xl font-bold self-start line-clamp-2">
          {prop.id}: <span className="text-black tracking-tight font-normal">{prop.title}</span>
        </div>


        <div className="flex justify-between">
          <div className="flex gap-2">
            <ProposalStatusPill status={prop.status} isDefeated={isDefeated} />

            {!isPast && currentBlockNumber !== undefined && <TimeLeftPill timeLeft={timeRemainingEN} />}
          </div>

          <CommentCount count={14} />
        </div>
      </div>
    </>
  );
};

export default ProposalRow;
