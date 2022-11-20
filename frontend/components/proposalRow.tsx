import { useState } from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

import Modal from "./Modal/modal";
import { DisplayProp } from "../pages/index";

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

  const openModal = () => {
    setIsOpen(true);
  };

  let timeRemaining;
  let timeRemainingEN;
  let isPast;
  if (currentBlockNumber) {
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
        className="rounded-md transition-all shadow-sm bg-white p-5 flex items-center justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer"
      >
        <div className="flex items-center text-gray-800">
          <div className="text-lg font-semibold">{prop.id}</div>
          <h4 className="text-xl font-semibold ml-4">{prop.title}</h4>
        </div>
        <div className="space-x-2">
          {!isPast && currentBlockNumber !== undefined && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
              {timeRemainingEN}
            </span>
          )}
          {prop.status === "PENDING" && (
            <span className="inline-flex items-center rounded-md bg-orange-100 px-2.5 py-0.5 text-sm font-medium text-orange-800">
              Pending
            </span>
          )}
          {prop.status === "ACTIVE" && (
            <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
              Active
            </span>
          )}
          {prop.status === "EXECUTED" && (
            <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
              Executed
            </span>
          )}
          {prop.status === "DEFEATED" && (
            <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800">
              Defeated
            </span>
          )}
          {prop.status === "CANCELLED" && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
              Cancelled
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default ProposalRow;
