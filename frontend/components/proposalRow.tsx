import { useState } from "react";
import Modal from "./Modal/modal";

import { DisplayProp } from "../pages/index";

interface IProposalRowProps {
  title?: string;
  endTime?: string;
  finalized?: `active` | `queued` | `executed` | `canceled`;
  prop: DisplayProp;
}

const ProposalRow: React.FC<IProposalRowProps> = ({
  endTime = "2021-08-01T00:00:00.000Z",
  finalized = "active",
  prop,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <Modal
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
          {/* <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
            Ends in 5 hours
          </span> */}
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
